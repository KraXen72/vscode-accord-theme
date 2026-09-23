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
const red = tokenColor("invalid text");
const yellow = tokenColor("constants");
const blue = tokenColor("functions, methods & keys");
const cyan = tokenColor("complex types");
const magenta = tokenColor("keywords");
const green = tokenColor("strings");
const comments = tokenColor("comments");
const attributes = tokenColor("attributes");
const tags = tokenColor("html tags");
const selectors = scopeColor("meta.selector");
const primitives = tokenColor("primitive types, decorators & regex");

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
	constructor: { color: "#FFFFB6" },
	type: { color: cyan },
	"type.builtin": { color: primitives },
	enum: { color: cyan },
	"type.class.call": { color: blue },
	"type.class": { color: "#FFFFB6" },
	"type.class.builtin": { color: "#FFFFB6" },
	"type.class.definition": { color: "#FFFFB6" },
	"type.class.inheritance": { color: "#FFFFB6" },
	"type.definition": { color: cyan },
	"type.interface": { color: cyan },
	"type.unit": { color: yellow },
	module: { color: "#FFFFB6" },
	"attribute.builtin": { color: primitives },
	"attribute.function": { color: attributes },
	variant: { color: "#FFFFB6" },
	namespace: { color: "#FFFFB6" },
	constant: { color: yellow },
	"constant.builtin": { color: yellow },
	boolean: { color: yellow },
	number: { color: yellow },
	string: { color: green },
	"string.escape": { color: primitives },
	"string.regex": { color: primitives },
	"string.special": { color: "#CE9178" },
	"string.special.symbol": { color: green },
	comment: { color: comments, font_style: "italic" },
	"comment.doc": { color: comments, font_style: "italic" },
	punctuation: { color: "#B5B3AA" },
	"punctuation.bracket": { color: "#B5B3AA" },
	"punctuation.delimiter": { color: "#B5B3AA" },
	"punctuation.list_marker": { color: "#6796E6" },
	"punctuation.markup": { color: blue },
	"punctuation.special": { color: "#B5B3AA" },
	tag: { color: tags },
	// Exact composite captures prevent JSX/Svelte tokens from falling back to the red tag style.
	"tag.jsx": { color: tags },
	"tag.component.jsx": { color: "#FFFFB6" },
	"tag.component.type.constructor": { color: "#FFFFB6" },
	"tag.property": { color: blue },
	"tag.punctuation.bracket": { color: "#B5B3AA" },
	"tag.punctuation.special": { color: "#B5B3AA" },
	"tag.keyword": { color: foreground },
	"attribute.jsx": { color: attributes },
	"punctuation.bracket.jsx": { color: "#B5B3AA" },
	"punctuation.delimiter.jsx": { color: "#B5B3AA" },
	selector: { color: selectors },
	"selector.pseudo": { color: selectors },
	embedded: { color: foreground },
	emphasis: { font_style: "italic" },
	"emphasis.strong": { color: "#FF6C60", font_weight: 700 },
	title: { color: "#FFFFB6", font_weight: 700 },
	"text.literal": { color: "#CE9178" },
	link_text: { color: cyan },
	link_uri: { color: blue },
	"diff.plus": { color: green },
	"diff.minus": { color: "#FF6C60" },
	"diff.delta": { color: "#FF73FD" },
	"diff.delta.moved": { color: "#FF73FD" },
	"markup.heading": { color: "#FFFFB6", font_weight: 700 },
	"markup.link.url": { color: blue },
	"punctuation.embedded.markup": { color: "#00000050" },
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
