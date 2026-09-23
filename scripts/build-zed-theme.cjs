const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("jsonc-parser");

const root = path.join(__dirname, "..");
const sourcePath = path.join(root, "themes", "Accord-color-theme.json");
const baselinePath = path.join(
	root,
	"third_party",
	"vscode-dark-modern",
	"ui-style.json",
);
const outputPath = path.join(root, "themes", "Accord-zed-theme.json");
const source = parse(fs.readFileSync(sourcePath, "utf8"));
const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));

/** Return a syntax color from a named TextMate rule in the source theme. */
function tokenColor(name) {
	const rule = source.tokenColors.find((token) => token.name === name);
	if (!rule?.settings?.foreground)
		throw new Error(`Missing source token color: ${name}`);
	return rule.settings.foreground;
}

/** Return a syntax color from the TextMate rule that explicitly lists a scope. */
function scopeColor(scope) {
	const rule = source.tokenColors.find((token) => {
		const scopes = Array.isArray(token.scope) ? token.scope : [token.scope];
		return scopes.includes(scope);
	});
	if (!rule?.settings?.foreground)
		throw new Error(`Missing source scope color: ${scope}`);
	return rule.settings.foreground;
}

const foreground = source.colors["editor.foreground"];
const muted = source.colors.descriptionForeground;
const yellow = tokenColor("constants");
const blue = tokenColor("functions, methods & keys");
const cyan = tokenColor("complex types");
const magenta = tokenColor("keywords");
const green = tokenColor("strings");
const comments = tokenColor("comments");
const attributes = tokenColor("attributes");
const tags = tokenColor("html tags");
const classes = tokenColor("classes");
const specialStrings = tokenColor("css colors and similar");
const inlineCode = tokenColor("markdown/markup inline code");
const selectors = scopeColor("meta.selector");
const primitives = tokenColor("primitive types, decorators & regex");
const punctuation = scopeColor("punctuation");
const listMarker = scopeColor("beginning.punctuation.definition.list.markdown");
const strong = scopeColor("markup.bold");
const heading = scopeColor("markup.heading");
const deleted = scopeColor("markup.deleted");
const changed = scopeColor("markup.changed");
const fencedMarkup = scopeColor("punctuation.definition.fenced.markdown");

const syntax = {
	primary: { color: foreground },
	variable: { color: foreground },
	"variable.special": { color: magenta },
	property: { color: blue },
	attribute: { color: attributes },
	label: { color: blue },
	keyword: { color: magenta },
	"keyword.control": { color: magenta },
	"keyword.declaration": { color: magenta },
	"keyword.import": { color: magenta },
	"keyword.operator": { color: magenta },
	"keyword.preproc": { color: blue },
	operator: { color: foreground },
	preproc: { color: blue },
	function: { color: blue },
	"function.method": { color: blue },
	"function.decorator": { color: primitives },
	"function.decorator.call": { color: primitives },
	// Zed exposes Python call-site roles that are more precise than the generic fallbacks.
	"function.kwargs": { color: foreground },
	constructor: { color: classes },
	type: { color: cyan },
	"type.builtin": { color: primitives },
	enum: { color: cyan },
	"type.class.call": { color: blue },
	"type.class": { color: classes },
	"type.class.builtin": { color: classes },
	"type.class.definition": { color: classes },
	"type.class.inheritance": { color: classes },
	"type.definition": { color: cyan },
	"type.interface": { color: cyan },
	"type.unit": { color: yellow },
	module: { color: classes },
	"attribute.builtin": { color: primitives },
	"attribute.function": { color: attributes },
	variant: { color: classes },
	namespace: { color: classes },
	constant: { color: yellow },
	"constant.builtin": { color: yellow },
	boolean: { color: yellow },
	number: { color: yellow },
	string: { color: green },
	"string.escape": { color: primitives },
	"string.regex": { color: primitives },
	"string.special": { color: specialStrings },
	"string.special.symbol": { color: green },
	comment: { color: comments, font_style: "italic" },
	"comment.doc": { color: comments, font_style: "italic" },
	punctuation: { color: punctuation },
	"punctuation.bracket": { color: punctuation },
	"punctuation.delimiter": { color: punctuation },
	"punctuation.list_marker": { color: listMarker },
	"punctuation.markup": { color: blue },
	"punctuation.special": { color: punctuation },
	tag: { color: tags },
	// Exact composite captures prevent JSX/Svelte tokens from falling back to the red tag style.
	"tag.jsx": { color: tags },
	"tag.component.jsx": { color: classes },
	"tag.component.type.constructor": { color: classes },
	"tag.property": { color: blue },
	"tag.punctuation.bracket": { color: punctuation },
	"tag.punctuation.special": { color: punctuation },
	"tag.keyword": { color: foreground },
	"attribute.jsx": { color: attributes },
	"punctuation.bracket.jsx": { color: punctuation },
	"punctuation.delimiter.jsx": { color: punctuation },
	selector: { color: selectors },
	"selector.pseudo": { color: selectors },
	embedded: { color: foreground },
	emphasis: { font_style: "italic" },
	"emphasis.strong": { color: strong, font_weight: 700 },
	title: { color: heading, font_weight: 700 },
	"text.literal": { color: inlineCode },
	link_text: { color: cyan },
	link_uri: { color: blue },
	"diff.plus": { color: green },
	"diff.minus": { color: deleted },
	"diff.delta": { color: changed },
	"diff.delta.moved": { color: changed },
	"markup.heading": { color: heading, font_weight: 700 },
	"markup.link.url": { color: blue },
	"punctuation.embedded.markup": { color: fencedMarkup },
	"string.special.path": { color: green },
	concept: { color: cyan },
	hint: { color: cyan },
	predictive: { color: muted, font_style: "italic" },
};

const theme = {
	$schema: "https://zed.dev/schema/themes/v0.2.0.json",
	name: "Accord",
	author: "KraXen72",
	themes: [
		{ name: "Accord", appearance: "dark", style: { ...baseline, syntax } },
	],
};

fs.writeFileSync(outputPath, `${JSON.stringify(theme, null, 2)}\n`);
console.log(`Wrote ${path.relative(root, outputPath)}`);
