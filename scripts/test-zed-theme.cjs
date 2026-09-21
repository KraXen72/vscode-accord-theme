const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const Ajv = require("ajv");

const root = path.join(__dirname, "..");
const themePath = path.join(root, "themes", "Accord-zed-theme.json");
const before = fs.readFileSync(themePath);
execFileSync(process.execPath, [path.join(__dirname, "build-zed-theme.cjs")]);
const after = fs.readFileSync(themePath);
assert.equal(
  crypto.createHash("sha256").update(after).digest("hex"),
  crypto.createHash("sha256").update(before).digest("hex"),
  "generated Zed theme is stale",
);

const theme = JSON.parse(after);
const schema = JSON.parse(fs.readFileSync(path.join(root, "schemas", "zed-theme-v0.2.0.json")));
const validate = new Ajv({ strict: false }).compile(schema);
assert.ok(validate(theme), JSON.stringify(validate.errors, null, 2));

const style = theme.themes[0].style;
const baseline = JSON.parse(fs.readFileSync(
  path.join(root, "third_party", "vscode-dark-modern", "ui-style.json"),
));
const { syntax: _syntax, ...generatedUi } = style;
assert.deepEqual(generatedUi, baseline, "generated UI must exactly match the vendored baseline");

const requiredCaptures = [
  "attribute", "attribute.builtin", "attribute.function", "attribute.jsx", "boolean", "comment",
  "comment.doc", "constant", "constant.builtin",
  "concept", "constructor", "diff.delta", "diff.delta.moved", "diff.minus", "diff.plus", "embedded",
  "emphasis", "emphasis.strong",
  "enum", "function", "function.decorator", "function.decorator.call", "function.kwargs", "function.method",
  "keyword", "keyword.control", "keyword.declaration", "keyword.import", "keyword.operator", "keyword.preproc",
  "label", "link_text", "link_uri", "markup.heading", "markup.link.url", "module", "namespace", "number",
  "operator", "preproc", "primary",
  "property", "punctuation", "punctuation.bracket", "punctuation.delimiter",
  "punctuation.bracket.jsx", "punctuation.delimiter.jsx", "punctuation.list_marker",
  "punctuation.embedded.markup", "punctuation.markup", "punctuation.special", "selector",
  "selector.pseudo", "string", "string.escape", "string.regex", "string.special", "string.special.path",
  "string.special.symbol", "tag", "tag.component.jsx", "tag.component.type.constructor", "tag.jsx",
  "tag.keyword", "tag.property", "tag.punctuation.bracket", "tag.punctuation.special", "text.literal", "title", "type",
  "type.builtin", "type.class", "type.class.builtin", "type.class.call", "type.class.definition",
  "type.class.inheritance", "type.definition", "type.interface", "type.unit",
  "variable", "variable.special", "variant",
];
for (const capture of requiredCaptures) assert.ok(style.syntax[capture], `missing syntax capture: ${capture}`);

assert.equal(style.syntax["type.class.call"].color, style.syntax.function.color,
  "Python class calls should use the normal function color");
assert.equal(style.syntax["function.kwargs"].color, style.syntax.variable.color,
  "Python keyword arguments should use the variable color");
assert.equal(style.syntax["function.decorator"].color, style.syntax["type.builtin"].color,
  "Python decorators should use Accord's annotation color");
assert.equal(style.syntax["keyword.import"].color, style.syntax.keyword.color,
  "imports and exports should use the normal keyword color");
assert.equal(style.syntax["keyword.operator"].color, style.syntax.variable.color,
  "word operators should use the normal foreground color");
assert.notEqual(style.syntax["tag.component.jsx"].color, style.syntax["tag.jsx"].color,
  "JSX components must remain distinguishable from native tags");
assert.notEqual(style.syntax["tag.component.type.constructor"].color, style.syntax.tag.color,
  "Svelte components must remain distinguishable from native tags");
assert.equal(style.syntax["tag.property"].color, style.syntax.function.color,
  "Svelte component attributes should use the function color");

const colorPattern = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;
function verifyColors(value, location = "theme") {
  if (typeof value === "string" && value.startsWith("#")) {
    assert.match(value, colorPattern, `invalid color at ${location}`);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => verifyColors(item, `${location}[${index}]`));
  } else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => verifyColors(item, `${location}.${key}`));
  }
}
verifyColors(theme);

const demos = fs.readdirSync(path.join(root, "demos"), { withFileTypes: true })
  .filter((entry) => entry.isFile() && !entry.name.startsWith("."));
assert.ok(demos.length >= 25, `expected the complete demo corpus, found ${demos.length}`);
for (const demo of demos) {
  assert.ok(fs.statSync(path.join(root, "demos", demo.name)).size > 0, `empty demo: ${demo.name}`);
}

console.log(`Validated schema, ${Object.keys(style).length} style entries, ${Object.keys(style.syntax).length} syntax captures, and ${demos.length} demo files.`);
