# Accord for Zed

See the [README](README.md#zed) for installation instructions.

## Development

The generated Zed theme is kept in sync with the VS Code source theme. Run
`pnpm install` once, or when dependencies change, then:

```sh
pnpm build:zed
pnpm test:zed
```

`build:zed` combines Accord syntax colors from `themes/Accord-color-theme.json`
with the vendored, MIT-licensed VSCode Dark Modern Zed UI baseline, applies
Accord's compatibility overrides, and writes
`themes/Accord-zed-theme.json`. `test:zed` checks the generated file against
Zed's v0.2.0 schema, verifies the UI baseline and compatibility overrides,
checks sidebar text contrast, verifies standard syntax capture coverage, and
checks the demo corpus.

## Compatibility

The `surface.background` override uses the baseline's opaque `panel.background`.
Zed 1.23.2 uses this surface for the thread sidebar, its rows' title fades, and
sticky headers; the baseline's translucent scrollbar gray makes that sidebar
unreadable.

Merge conflict regions use VS Code's content backgrounds: teal and blue at 20%
opacity by default. The generator uses explicit `merge.currentContentBackground`
and `merge.incomingContentBackground` overrides from the source theme when present,
otherwise the matching content colors from the baseline's legacy keys. Both
current and deprecated Zed color names receive the same fills. Zed 1.23.2
[uses one color for each side's content and marker lines](https://github.com/zed-industries/zed/blob/c0199504b9cce79bc27524950022ed701bc3ebd5/crates/git_ui/src/conflict_view.rs#L303-L332),
so a theme cannot reproduce VS Code's separately stronger header backgrounds.

The baseline provenance and upstream license are in
`third_party/vscode-dark-modern/`.

## Previews

![Accord in Zed with TypeScript](screenshots/zed-typescript.png)

![Accord in Zed with HTML](screenshots/zed-html.png)

![Accord in Zed with Markdown](screenshots/zed-markdown.png)
