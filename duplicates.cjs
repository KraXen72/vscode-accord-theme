const fs = require('fs');
const path = require('path');
const { parse } = require('jsonc-parser');

function normalizeScopeToArray(scope) {
  if (typeof scope === 'string') {
    return [scope];
  } else if (Array.isArray(scope)) {
    return scope;
  }
  return [];
}

function isSuffixScope(specific, general) {
  if (specific === general) return false;
  return specific.endsWith(' ' + general);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node find-duplicate-scopes.js <path-to-jsonc-file>');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = parse(content);

    if (!Array.isArray(data.tokenColors)) {
      console.error('The file must contain a top-level "tokenColors" array.');
      process.exit(1);
    }

    const rules = data.tokenColors.map((rule, index) => ({
      index,
      scopes: normalizeScopeToArray(rule.scope),
    }));

    // === 1. Full Duplicates (exact same scope string in >=2 rules) ===
    const scopeToRules = new Map();

    for (const rule of rules) {
      for (const scopeStr of rule.scopes) {
        if (!scopeToRules.has(scopeStr)) {
          scopeToRules.set(scopeStr, new Set());
        }
        scopeToRules.get(scopeStr).add(rule.index);
      }
    }

    const fullDuplicates = [];
    for (const [scopeStr, indicesSet] of scopeToRules) {
      const indices = Array.from(indicesSet);
      if (indices.length >= 2) {
        fullDuplicates.push({ scope: scopeStr, indices });
      }
    }

    // === 2. Shadowed Duplicates ===
    const shadowedPairs = [];

    // --- (a) Intra-rule shadowing ---
    for (const rule of rules) {
      const scopes = rule.scopes;
      for (let i = 0; i < scopes.length; i++) {
        for (let j = 0; j < scopes.length; j++) {
          if (i === j) continue;
          if (isSuffixScope(scopes[i], scopes[j])) {
            shadowedPairs.push({
              type: 'intra',
              general: scopes[j],
              specific: scopes[i],
              ruleIndex: rule.index,
            });
          }
        }
      }
    }

    // --- (b) Inter-rule shadowing ---
    const allEntries = [];
    for (const rule of rules) {
      for (const scope of rule.scopes) {
        allEntries.push({ scope, ruleIndex: rule.index });
      }
    }

    for (let i = 0; i < allEntries.length; i++) {
      for (let j = i + 1; j < allEntries.length; j++) {
        const a = allEntries[i];
        const b = allEntries[j];

        if (a.ruleIndex === b.ruleIndex) continue; // already handled above

        if (isSuffixScope(a.scope, b.scope)) {
          shadowedPairs.push({
            type: 'inter',
            general: b.scope,
            specific: a.scope,
            generalRuleIndex: b.ruleIndex,
            specificRuleIndex: a.ruleIndex,
          });
        } else if (isSuffixScope(b.scope, a.scope)) {
          shadowedPairs.push({
            type: 'inter',
            general: a.scope,
            specific: b.scope,
            generalRuleIndex: a.ruleIndex,
            specificRuleIndex: b.ruleIndex,
          });
        }
      }
    }

    // === Output ===
    let hasOutput = false;

    if (fullDuplicates.length > 0) {
      console.log('🔴 Full Duplicates (same scope string in multiple rules):\n');
      fullDuplicates.forEach((dup, i) => {
        console.log(`Full Duplicate ${i + 1}:`);
        console.log(`  Scope: "${dup.scope}"`);
        console.log(`  Rules: [${dup.indices.join(', ')}]`);
        console.log('');
      });
      hasOutput = true;
    }

    if (shadowedPairs.length > 0) {
      console.log('🟠 Shadowed Scope Pairs:\n');

      shadowedPairs.forEach((pair, i) => {
        if (pair.type === 'intra') {
          console.log(`Shadowed Pair ${i + 1} (within rule ${pair.ruleIndex}):`);
          console.log(`  General: "${pair.general}"`);
          console.log(`  Specific: "${pair.specific}"`);
          console.log('  → The general scope is redundant inside the same rule.');
        } else {
          console.log(`Shadowed Pair ${i + 1} (across rules):`);
          console.log(`  General: "${pair.general}" (rule ${pair.generalRuleIndex})`);
          console.log(`  Specific: "${pair.specific}" (rule ${pair.specificRuleIndex})`);
        }
        console.log('');
      });
      hasOutput = true;
    }

    if (!hasOutput) {
      console.log('✅ No full or shadowed scope duplicates found.');
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();