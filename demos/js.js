'use strict'
class Sale {
	savedObjects;

	constructor(price) {
		;[this.decoratorsList, this.price] = [[], price]
	}

	decorate(decorator) {
		if (!Sale[decorator]) throw new Error(`decorator not exist: ${decorator}`)
		this.decoratorsList.push(Sale[decorator])

		this.getPrice()
		this.savedObjects;

		Math.random()
		JSON.parse("{}")

		if (var1 > var2) {
			console.log("sigma rizz")
		}
	}

	getPrice() {
		for (let decorator of this.decoratorsList) {
			this.price = decorator(this.price)
		}
		return this.price.toFixed(2)
	}

	static quebec(price) {
		// this is a comment
		return price + price * 7.5 / 100
	}

	static fedtax(price) {
		return price + price * 5 / 100
	}
}

let sale = new Sale(100)
sale.decorate('fedtax')
sale.decorate('quebec')
console.log(sale.getPrice()) //112.88

getPrice()

//deeply nested

async function asyncCall() {
	var result = await resolveAfter2Seconds();
}

const options = {
	connections: {
		compression: false
	}
}

for (let i = 0; i < 10; i++) {
	continue;
}

if (true) { }

while (true) { }

switch (2) {
	case 2:
		break;
	default:
		break;
}

class EditFishForm extends Component {
	static propTypes = {
		updateFish: PropTypes.func,
		deleteFish: PropTypes.func,
		index: PropTypes.string,
		fish: PropTypes.shape({
			image: PropTypes.string,
			name: PropTypes.string.isRequired
		})
	}
}

// duplicates script from my repo at some point in time:

const fs = require('fs');
const path = require('path');
const { parse } = require('jsonc-parser');

// === CONFIG: scopes containing these substrings are ignored in shadow detection
const EXCLUDED_SHADOW_SUBSTRINGS = [
  'emphasis',
  'strong',
  'markup.underline',
  'markup.bold',
  'markup.italic'
];

function normScopes(s) {
  return typeof s === 'string' ? [s] : Array.isArray(s) ? s : [];
}

function isSuffix(specific, general) {
  return specific !== general && specific.endsWith(' ' + general);
}

function shouldSkipShadow(scope) {
  return EXCLUDED_SHADOW_SUBSTRINGS.some(sub => scope.includes(sub));
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
    console.error('Missing or invalid tokenColors array');
    process.exit(1);
  }

  const rules = data.tokenColors.map((r, i) => ({
    i,
    name: r.name,
    scopes: normScopes(r.scope),
    settings: r.settings || {}
  }));

  // === Full duplicates (exact scope in ≥2 rules)
  const scopeMap = new Map();
  rules.forEach(r => r.scopes.forEach(s => {
    if (!scopeMap.has(s)) scopeMap.set(s, new Set());
    scopeMap.get(s).add(r.i);
  }));

  const fullDupes = [];
  for (const [s, idxSet] of scopeMap) {
    const idxs = [...idxSet];
    if (idxs.length > 1) fullDupes.push({ s, idxs });
  }

  // === Shadowed scopes (suffix match, intra + inter)
  const shadows = [];

  // Intra
  rules.forEach(r => {
    r.scopes.forEach(a => {
      if (shouldSkipShadow(a)) return;
      r.scopes.forEach(b => {
        if (a !== b && isSuffix(a, b) && !shouldSkipShadow(b)) {
          shadows.push({ type: 'intra', general: b, specific: a, i: r.i });
        }
      });
    });
  });

  // Inter
  const entries = rules.flatMap(r => r.scopes.map(s => ({ s, i: r.i })));
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i], b = entries[j];
      if (a.i === b.i) continue;
      if (shouldSkipShadow(a.s) || shouldSkipShadow(b.s)) continue;
      if (isSuffix(a.s, b.s)) {
        shadows.push({ type: 'inter', general: b.s, specific: a.s, gi: b.i, si: a.i });
      } else if (isSuffix(b.s, a.s)) {
        shadows.push({ type: 'inter', general: a.s, specific: b.s, gi: a.i, si: b.i });
      }
    }
  }

  // === Mergeable: unnamed, same settings, disjoint scopes
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
    if (disjoint) mergeables.push({
      settings: group[0].settings,
      rules: group.map(r => r.i),
      scopes: group.flatMap(r => r.scopes)
    });
  }

  // === Output
  let out = false;

  if (fullDupes.length) {
    console.log('🔴 Full duplicates:');
    fullDupes.forEach(({ s, idxs }) =>
      console.log(`  "${s}" in rules [${idxs.join(', ')}]`));
    out = true;
  }

  if (shadows.length) {
    console.log('\n🟠 Shadowed scopes:');
    shadows.forEach((sh, i) => {
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
    mergeables.forEach((m, i) => {
      console.log(`  Rules [${m.rules.join(', ')}] → ${m.scopes.length} scopes`);
    });
    out = true;
  }

  if (!out) console.log('✅ Clean: no issues found.');
}

main();