const fs = require('fs');
const path = require('path');
const { parse } = require('jsonc-parser');

const EXCLUDED_SHADOW_SUBSTRINGS = [
  'emphasis',
  'strong',
  'markup.underline',
  'markup.bold',
  'markup.italic',
  'support.type.property-name',
  'meta.fstring.python constant.character'
];

function normScopes(s) {
  return typeof s === 'string' ? [s] : Array.isArray(s) ? s : [];
}

function shouldSkipShadow(scope) {
  return EXCLUDED_SHADOW_SUBSTRINGS.some(sub => scope.includes(sub));
}

function normalizeForShadow(scope) {
  if (/^[a-z][a-z0-9_.]*\.[a-z0-9_]+$/i.test(scope)) return scope;
  const m = scope.match(/^source\.([a-z0-9_]+)(?:\s+(.*\s+))?([a-z][a-z0-9_.]*)$/i);
  if (m) {
    const lang = m[1], base = m[3];
    if (!base.endsWith('.' + lang)) return `${base}.${lang}`;
  }
  return scope;
}

function isSuffix(a, b) {
  return a !== b && a.endsWith(' ' + b);
}

function setsIntersect(a, b) {
  for (const x of a) if (b.has(x)) return true;
  return false;
}

function main() {
  const [file] = process.argv.slice(2);
  if (!file) {
    console.error('Usage: node find-scope-issues.js <theme.jsonc>');
    process.exit(1);
  }

  const data = parse(fs.readFileSync(path.resolve(file), 'utf8'));
  if (!Array.isArray(data.tokenColors)) {
    console.error('Invalid tokenColors array');
    process.exit(1);
  }

  const rules = data.tokenColors.map((r, i) => ({
    i,
    name: r.name,
    scopes: normScopes(r.scope),
    settings: r.settings || {},
    firstScope: normScopes(r.scope)[0] || ''
  }));

  // === Full duplicates
  const scopeMap = new Map();
  rules.forEach(r => r.scopes.forEach(s => {
    if (!scopeMap.has(s)) scopeMap.set(s, new Set());
    scopeMap.get(s).add(r.i);
  }));
  const fullDupes = [];
  for (const [s, idxs] of scopeMap) {
    const arr = [...idxs];
    if (arr.length > 1) fullDupes.push({ s, arr });
  }

  // === Shadowed (with normalization)
  const shadows = [];

  const normEntries = [];
  rules.forEach(r => {
    r.scopes.forEach(s => {
      if (shouldSkipShadow(s)) return;
      const norm = normalizeForShadow(s);
      normEntries.push({ orig: s, norm, i: r.i });
    });
  });

  // Intra-rule
  rules.forEach(r => {
    const filtered = r.scopes.filter(s => !shouldSkipShadow(s)).map(s => normalizeForShadow(s));
    filtered.forEach((a, ia) => {
      filtered.forEach((b, ib) => {
        if (ia !== ib && isSuffix(a, b)) {
          shadows.push({ type: 'intra', general: b, specific: a, i: r.i });
        }
      });
    });
  });

  // Inter-rule
  for (let i = 0; i < normEntries.length; i++) {
    for (let j = i + 1; j < normEntries.length; j++) {
      const a = normEntries[i], b = normEntries[j];
      if (a.i === b.i) continue;
      if (isSuffix(a.norm, b.norm)) {
        shadows.push({ type: 'inter', general: b.norm, specific: a.norm, gi: b.i, si: a.i });
      } else if (isSuffix(b.norm, a.norm)) {
        shadows.push({ type: 'inter', general: a.norm, specific: b.norm, gi: a.i, si: b.i });
      }
    }
  }

  // === Mergeables
  const unnamed = rules.filter(r => r.name === undefined);
  const groups = new Map();
  unnamed.forEach(r => {
    const key = JSON.stringify(r.settings);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  });

  const mergeables = [];
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const sets = group.map(r => new Set(r.scopes));
    let disjoint = true;
    for (let i = 0; i < sets.length && disjoint; i++)
      for (let j = i + 1; j < sets.length && disjoint; j++)
        if (setsIntersect(sets[i], sets[j])) disjoint = false;
    if (disjoint) mergeables.push(group);
  }

  // === Output
  let out = false;

  if (fullDupes.length) {
    console.log('🔴 Full duplicates:');
    fullDupes.forEach(({ s, arr }) => console.log(`  "${s}" in [${arr.join(', ')}]`));
    out = true;
  }

  if (shadows.length) {
    console.log('\n🟠 Shadowed scopes:');
    shadows.forEach(sh => {
      if (sh.type === 'intra') {
        console.log(`  [${sh.i}] "${sh.general}" ⊂ "${sh.specific}"`);
      } else {
        console.log(`  [${sh.gi}] "${sh.general}" ⊂ [${sh.si}] "${sh.specific}"`);
      }
    });
    out = true;
  }

  if (mergeables.length) {
    console.log('\n🟢 Mergeable groups:');
    mergeables.forEach(group => {
      console.log(`  Rules [${group.map(r => r.i).join(', ')}]:`);
      group.forEach(r => console.log(`    [${r.i}] "${r.firstScope}"`));
    });
    out = true;
  }

  if (!out) console.log('✅ Clean.');
}

main();