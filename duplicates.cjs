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

function setsIntersect(setA, setB) {
  for (const item of setA) {
    if (setB.has(item)) return true;
  }
  return false;
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

    // Extract all rules with metadata
    const rules = data.tokenColors.map((rule, index) => ({
      index,
      name: rule.name, // may be undefined
      scopes: normalizeScopeToArray(rule.scope),
      settings: rule.settings || {},
    }));

    // === 1. Full Duplicates (exact scope string in multiple rules) ===
    const scopeToRules = new Map();
    for (const rule of rules) {
      for (const s of rule.scopes) {
        if (!scopeToRules.has(s)) scopeToRules.set(s, new Set());
        scopeToRules.get(s).add(rule.index);
      }
    }

    const fullDuplicates = [];
    for (const [scopeStr, indicesSet] of scopeToRules) {
      const indices = Array.from(indicesSet);
      if (indices.length >= 2) {
        fullDuplicates.push({ scope: scopeStr, indices });
      }
    }

    // === 2. Shadowed Duplicates (suffix-based, intra + inter rule) ===
    const shadowedPairs = [];

    // Intra-rule
    for (const rule of rules) {
      const scopes = rule.scopes;
      for (let i = 0; i < scopes.length; i++) {
        for (let j = 0; j < scopes.length; j++) {
          if (i !== j && isSuffixScope(scopes[i], scopes[j])) {
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

    // Inter-rule
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
        if (a.ruleIndex === b.ruleIndex) continue;

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

    // === 3. Mergeable Rules (unnamed + same settings + disjoint scopes) ===
    const unnamedRules = rules.filter(rule => rule.name === undefined);

    const settingsGroups = new Map(); // key -> array of rules
    for (const rule of unnamedRules) {
      const key = JSON.stringify(rule.settings);
      if (!settingsGroups.has(key)) {
        settingsGroups.set(key, []);
      }
      settingsGroups.get(key).push(rule);
    }

    const mergeableGroups = [];
    for (const group of settingsGroups.values()) {
      if (group.length < 2) continue;

      // Convert scopes to sets for fast disjoint check
      const scopeSets = group.map(rule => new Set(rule.scopes));

      let allDisjoint = true;
      for (let i = 0; i < scopeSets.length; i++) {
        for (let j = i + 1; j < scopeSets.length; j++) {
          if (setsIntersect(scopeSets[i], scopeSets[j])) {
            allDisjoint = false;
            break;
          }
        }
        if (!allDisjoint) break;
      }

      if (allDisjoint) {
        mergeableGroups.push({
          settings: group[0].settings,
          rules: group.map(r => r.index),
          scopes: group.flatMap(r => r.scopes),
        });
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

    if (mergeableGroups.length > 0) {
      console.log('🟢 Mergeable Rule Groups (unnamed, same settings, disjoint scopes):\n');
      mergeableGroups.forEach((group, i) => {
        console.log(`Mergeable Group ${i + 1}:`);
        console.log(`  Settings: ${JSON.stringify(group.settings)}`);
        console.log(`  Rules: [${group.rules.join(', ')}]`);
        console.log(`  Combined scopes (${group.scopes.length}):`);
        console.log(`    [${group.scopes.map(s => `"${s}"`).join(', ')}]`);
        console.log('');
      });
      hasOutput = true;
    }

    if (!hasOutput) {
      console.log('✅ No issues found: no duplicates, shadows, or mergeables.');
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();