# VSCode Dark Modern Zed baseline

The UI style in `ui-style.json` is copied from Kevin Camellini's MIT-licensed
[VSCode Dark Modern theme for Zed](https://github.com/kevcamel/vscode_dark_modern.zed)
at commit `7cc9f395cb766e9dbe4fe5a1b7e3272ea0dc6693`.

Only the upstream theme's non-syntax `style` properties are vendored. Accord's
generator keeps this file unchanged, supplies its own syntax highlighting, and
overrides `surface.background` with the baseline's opaque `panel.background`
for compatibility with Zed's thread sidebar. It also maps merge conflict fills
to VS Code's content backgrounds rather than its stronger header backgrounds.
