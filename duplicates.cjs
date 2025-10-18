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

    // Extract all rules with their individual scopes
    const rules = data.tokenColors.map((rule, index) => ({
      index,
      scopes: normalizeScopeToArray(rule.scope),
    }));

    // === 1. Full Duplicates: group by identical scope string ===
    const scopeToRules = new Map(); // "scopeString" => Set of rule indices

    for (const rule of rules) {
      for (const scopeStr of rule.scopes) {
        if (!scopeToRules.has(scopeStr)) {
          scopeToRules.set(scopeStr, new Set());
        }
        scopeToRules.get(scopeStr).add(rule.index);
      }
    }

    // Build full duplicate groups (only if >=2 rules share the scope)
    const fullDuplicates = [];
    for (const [scopeStr, ruleIndicesSet] of scopeToRules) {
      const ruleIndices = Array.from(ruleIndicesSet);
      if (ruleIndices.length >= 2) {
        fullDuplicates.push({
          scope: scopeStr,
          indices: ruleIndices,
        });
      }
    }

    // === 2. Shadowed Duplicates: pairwise scope string suffix checks ===
    const shadowedPairs = [];

    // Get all unique scope strings with their source rule indices
    const allScopeEntries = [];
    for (const rule of rules) {
      for (const scopeStr of rule.scopes) {
        allScopeEntries.push({ scope: scopeStr, ruleIndex: rule.index });
      }
    }

    // Compare every pair of scope strings from different rules
    for (let i = 0; i < allScopeEntries.length; i++) {
      for (let j = i + 1; j < allScopeEntries.length; j++) {
        const a = allScopeEntries[i];
        const b = allScopeEntries[j];

        // Skip if same rule (though unlikely due to structure, but safe)
        if (a.ruleIndex === b.ruleIndex) continue;

        if (isSuffixScope(a.scope, b.scope)) {
          shadowedPairs.push({
            general: b.scope,
            specific: a.scope,
            generalRuleIndex: b.ruleIndex,
            specificRuleIndex: a.ruleIndex,
          });
        } else if (isSuffixScope(b.scope, a.scope)) {
          shadowedPairs.push({
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
      console.log('🔴 Full Duplicates (shared exact scope string):\n');
      fullDuplicates.forEach((dup, i) => {
        console.log(`Full Duplicate ${i + 1}:`);
        console.log(`  Scope: "${dup.scope}"`);
        console.log(`  Rules: [${dup.indices.join(', ')}]`);
        console.log('');
      });
      hasOutput = true;
    }

    if (shadowedPairs.length > 0) {
      console.log('🟠 Shadowed Duplicates (one scope is more specific):\n');
      shadowedPairs.forEach((pair, i) => {
        console.log(`Shadowed Pair ${i + 1}:`);
        console.log(`  General: "${pair.general}" (rule ${pair.generalRuleIndex})`);
        console.log(`  Specific: "${pair.specific}" (rule ${pair.specificRuleIndex})`);
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