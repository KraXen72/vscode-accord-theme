const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("jsonc-parser");

const root = path.join(__dirname, "..");
const sourcePath = path.join(root, "themes", "Accord-color-theme.json");
const outputPath = path.join(root, "themes", "Accord-zed-theme.json");
const source = parse(fs.readFileSync(sourcePath, "utf8"));
const colors = source.colors;

/** Return a VS Code workbench color and fail when the source theme no longer defines it. */
function color(name) {
  if (!colors[name]) throw new Error(`Missing source color: ${name}`);
  return colors[name];
}

/** Return a syntax color from a named TextMate rule in the source theme. */
function tokenColor(name) {
  const rule = source.tokenColors.find((token) => token.name === name);
  if (!rule?.settings?.foreground) throw new Error(`Missing source token color: ${name}`);
  return rule.settings.foreground;
}

/** Return a syntax color from the TextMate rule that explicitly lists a scope. */
function scopeColor(scope) {
  const rule = source.tokenColors.find((token) => {
    const scopes = Array.isArray(token.scope) ? token.scope : [token.scope];
    return scopes.includes(scope);
  });
  if (!rule?.settings?.foreground) throw new Error(`Missing source scope color: ${scope}`);
  return rule.settings.foreground;
}

const transparent = "#00000000";
const editorBackground = color("editor.background");
const panelBackground = color("sideBar.background");
const surfaceBackground = color("editorWidget.background");
const foreground = color("editor.foreground");
const text = color("foreground");
const muted = color("descriptionForeground");
const border = color("sideBar.border");
const accent = color("activityBarBadge.background");
const cursor = color("editorCursor.foreground");
const red = tokenColor("invalid text");
const orange = "#ea7221";
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
const imports = tokenColor("imports, ifs & similar");

const style = {
  accents: [accent, cursor, blue, cyan, magenta, yellow, green, red],
  "background.appearance": "opaque",
  background: editorBackground,
  "surface.background": panelBackground,
  "elevated_surface.background": surfaceBackground,
  border,
  "border.variant": color("editorGroup.border"),
  "border.focused": color("focusBorder"),
  "border.selected": accent,
  "border.transparent": transparent,
  "border.disabled": color("activityBar.border"),
  "element.background": color("dropdown.background"),
  "element.hover": color("list.hoverBackground"),
  "element.active": color("inputOption.activeBackground"),
  "element.selected": color("list.inactiveSelectionBackground"),
  "element.disabled": "#1f1f1f80",
  "ghost_element.background": transparent,
  "ghost_element.hover": color("list.hoverBackground"),
  "ghost_element.active": color("inputOption.activeBackground"),
  "ghost_element.selected": color("list.inactiveSelectionBackground"),
  "ghost_element.disabled": "#ffffff0a",
  "drop_target.background": color("list.dropBackground"),
  text,
  "text.muted": muted,
  "text.placeholder": color("input.placeholderForeground"),
  "text.disabled": color("activityBar.inactiveForeground"),
  "text.accent": accent,
  icon: color("icon.foreground"),
  "icon.muted": color("activityBar.inactiveForeground"),
  "icon.placeholder": color("input.placeholderForeground"),
  "icon.disabled": "#ffffff40",
  "icon.accent": accent,
  "link_text.hover": accent,
  "status_bar.background": color("statusBar.background"),
  "title_bar.background": color("titleBar.activeBackground"),
  "title_bar.inactive_background": color("titleBar.inactiveBackground"),
  "toolbar.background": panelBackground,
  "tab_bar.background": color("editorGroupHeader.tabsBackground"),
  "tab.active_background": color("tab.activeBackground"),
  "tab.inactive_background": color("tab.inactiveBackground"),
  "panel.background": panelBackground,
  "panel.focused_border": accent,
  "panel.indent_guide": color("editorIndentGuide.background1"),
  "panel.indent_guide_hover": color("activityBar.inactiveForeground"),
  "panel.indent_guide_active": accent,
  "pane.focused_border": color("focusBorder"),
  "pane_group.border": color("editorGroup.border"),
  "scrollbar.thumb.background": color("scrollbarSlider.background"),
  "scrollbar.thumb.hover_background": color("scrollbarSlider.hoverBackground"),
  "scrollbar.thumb.border": transparent,
  "scrollbar.track.background": transparent,
  "scrollbar.track.border": transparent,
  "editor.background": editorBackground,
  "editor.foreground": foreground,
  "editor.gutter.background": editorBackground,
  "editor.subheader.background": color("editorGroupHeader.tabsBackground"),
  "editor.active_line.background": color("editor.lineHighlightBackground"),
  "editor.highlighted_line.background": color("editor.selectionHighlightBackground"),
  "editor.line_number": color("breadcrumb.foreground"),
  "editor.active_line_number": text,
  "editor.invisible": color("editorIndentGuide.background1"),
  "editor.wrap_guide": color("editorIndentGuide.background1"),
  "editor.active_wrap_guide": color("activityBar.inactiveForeground"),
  "editor.indent_guide": color("editorIndentGuide.background1"),
  "editor.indent_guide_active": color("activityBar.inactiveForeground"),
  "editor.document_highlight.read_background": color("editor.selectionHighlightBackground"),
  "editor.document_highlight.write_background": color("editor.selectionBackground"),
  "editor.document_highlight.bracket_background": color("editorBracketMatch.background"),
  "search.match_background": color("editor.findMatchHighlightBackground"),
  conflict: orange,
  "conflict.background": "#ea722120",
  "conflict.border": orange,
  created: color("editorGutter.addedBackground"),
  "created.background": color("diffEditor.insertedLineBackground"),
  "created.border": color("editorGutter.addedBackground"),
  deleted: red,
  "deleted.background": color("diffEditor.removedLineBackground"),
  "deleted.border": red,
  modified: yellow,
  "modified.background": "#E9C06218",
  "modified.border": yellow,
  renamed: blue,
  "renamed.background": "#96CBFE18",
  "renamed.border": blue,
  error: red,
  "error.background": color("inputValidation.errorBackground"),
  "error.border": red,
  warning: yellow,
  "warning.background": color("inputValidation.warningBackground"),
  "warning.border": yellow,
  info: blue,
  "info.background": color("inputValidation.infoBackground"),
  "info.border": blue,
  success: accent,
  "success.background": color("diffEditor.insertedLineBackground"),
  "success.border": accent,
  hint: cyan,
  "hint.background": editorBackground,
  "hint.border": cyan,
  ignored: muted,
  "ignored.background": editorBackground,
  "ignored.border": border,
  hidden: muted,
  "hidden.background": editorBackground,
  "hidden.border": border,
  unreachable: color("activityBar.inactiveForeground"),
  "unreachable.background": editorBackground,
  "unreachable.border": border,
  predictive: color("activityBar.inactiveForeground"),
  "predictive.background": editorBackground,
  "predictive.border": border,
  "terminal.background": editorBackground,
  "terminal.foreground": color("terminal.foreground"),
  "terminal.bright_foreground": "#ffffff",
  "terminal.dim_foreground": muted,
  "terminal.ansi.background": editorBackground,
  "terminal.ansi.black": "#4e4e4e",
  "terminal.ansi.bright_black": "#7c7c7c",
  "terminal.ansi.dim_black": "#303030",
  "terminal.ansi.red": "#FF6C60",
  "terminal.ansi.bright_red": "#FF6C60",
  "terminal.ansi.dim_red": "#a84640",
  "terminal.ansi.green": "#A8FF60",
  "terminal.ansi.bright_green": "#A8FF60",
  "terminal.ansi.dim_green": "#6ea63f",
  "terminal.ansi.yellow": "#FFFFB6",
  "terminal.ansi.bright_yellow": "#FFFFB6",
  "terminal.ansi.dim_yellow": "#a6a676",
  "terminal.ansi.blue": blue,
  "terminal.ansi.bright_blue": blue,
  "terminal.ansi.dim_blue": "#626f9f",
  "terminal.ansi.magenta": "#FF73FD",
  "terminal.ansi.bright_magenta": "#FF73FD",
  "terminal.ansi.dim_magenta": "#a64ba4",
  "terminal.ansi.cyan": "#C6C5FE",
  "terminal.ansi.bright_cyan": "#C6C5FE",
  "terminal.ansi.dim_cyan": "#8180a5",
  "terminal.ansi.white": "#EEEEEE",
  "terminal.ansi.bright_white": "#FFFFFF",
  "terminal.ansi.dim_white": "#9b9b9b",
  players: [cursor, accent, blue, cyan, magenta, yellow, green, red].map((value) => ({
    cursor: value,
    background: value,
    selection: `${value.slice(0, 7)}40`,
  })),
  syntax: {
    primary: { color: foreground },
    variable: { color: foreground },
    "variable.special": { color: magenta },
    property: { color: blue },
    attribute: { color: attributes },
    label: { color: blue },
    keyword: { color: magenta },
    "keyword.control": { color: magenta },
    "keyword.declaration": { color: magenta },
    "keyword.import": { color: imports },
    operator: { color: foreground },
    preproc: { color: blue },
    function: { color: blue },
    "function.method": { color: blue },
    constructor: { color: "#FFFFB6" },
    type: { color: cyan },
    "type.builtin": { color: primitives },
    enum: { color: cyan },
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
    hint: { color: cyan },
    predictive: { color: muted, font_style: "italic" },
  },
};

const theme = {
  $schema: "https://zed.dev/schema/themes/v0.2.0.json",
  name: "Accord",
  author: "KraXen72",
  themes: [{ name: "Accord", appearance: "dark", style }],
};

fs.writeFileSync(outputPath, `${JSON.stringify(theme, null, 2)}\n`);
console.log(`Wrote ${path.relative(root, outputPath)}`);
