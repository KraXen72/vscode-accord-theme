const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const Ajv = require("ajv");
const { parse } = require("jsonc-parser");

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

const source = parse(fs.readFileSync(path.join(root, "themes", "Accord-color-theme.json"), "utf8"));
const style = theme.themes[0].style;
const exactMappings = {
  "editor.background": "editor.background",
  "editor.foreground": "editor.foreground",
  "editor.active_line.background": "editor.lineHighlightBackground",
  "editor.document_highlight.bracket_background": "editorBracketMatch.background",
  "status_bar.background": "statusBar.background",
  "title_bar.background": "titleBar.activeBackground",
  "tab.active_background": "tab.activeBackground",
  "tab.inactive_background": "tab.inactiveBackground",
  "panel.background": "sideBar.background",
  "scrollbar.thumb.background": "scrollbarSlider.background",
  "scrollbar.thumb.hover_background": "scrollbarSlider.hoverBackground",
  "search.match_background": "editor.findMatchHighlightBackground",
  text: "foreground",
  icon: "icon.foreground",
};
for (const [zedKey, vscodeKey] of Object.entries(exactMappings)) {
  assert.equal(style[zedKey], source.colors[vscodeKey], `${zedKey} must track ${vscodeKey}`);
}

const requiredCaptures = [
  "attribute", "boolean", "comment", "comment.doc", "constant", "constant.builtin",
  "constructor", "diff.minus", "diff.plus", "embedded", "emphasis", "emphasis.strong",
  "enum", "function", "function.method", "keyword", "keyword.control", "keyword.declaration",
  "label", "link_text", "link_uri", "namespace", "number", "operator", "preproc", "primary",
  "property", "punctuation", "punctuation.bracket", "punctuation.delimiter",
  "punctuation.list_marker", "punctuation.markup", "punctuation.special", "selector",
  "selector.pseudo", "string", "string.escape", "string.regex", "string.special",
  "string.special.symbol", "tag", "text.literal", "title", "type", "type.builtin",
  "variable", "variable.special", "variant",
];
for (const capture of requiredCaptures) assert.ok(style.syntax[capture], `missing syntax capture: ${capture}`);

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
