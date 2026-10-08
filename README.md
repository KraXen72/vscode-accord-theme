# Accord
A familiar, robust & well-thought-out theme.

![svelte with typescript](screenshots/svelte-ts.png)  

## about
- Based on VS Code's [Dark Modern](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/dark_modern.json) theme
- [Base16 IR Black](https://base16.netlify.app/previews/base16-irblack) Syntax highlighting (extended)
- Green Apple (#7CB342) accent color  
  
## support further development
  
[![Recurring donation via Liberapay](https://img.shields.io/badge/donate-liberapay-%23f6c915?logo=liberapay)](https://liberapay.com/KraXen72) [![One-time donation via ko-fi.com](https://img.shields.io/badge/donate-ko--fi-%23ff5e5b?logo=kofi)](https://ko-fi.com/kraxen72)   
Any donations are highly appreciated!  

## more screenshots
![python](screenshots/python-shira.png)  
![css](screenshots/css2.png)  
  
## contributing
Please to report any issues with syntax higlighting

## credits
- thanks to [night-owl-vscode-theme](https://github.com/sdras/night-owl-vscode-theme) for the `demos/` (i edited them further afterwards)
- thanks to [one-hunter-vscode](https://github.com/Railly/one-hunter-vscode) for syntax higlighting scope sets
- thanks to VS Code's documentation: [Syntax Highlight Guide](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide)
  
I recommend you use the theme with the **Carbon Product Icons** (used in screenshots) - [repo](https://github.com/antfu/vscode-icons-carbon), [marketplace](https://marketplace.visualstudio.com/items?itemName=antfu.icons-carbon)

## Zed

The repository also contains a native Zed extension. Install this directory with
**zed: install dev extension**, then select **Accord** in the theme selector.

To install or update from this checkout:

1. Run `pnpm install` (once, or when dependencies change), then `pnpm build:zed`.
2. In Zed, open the command palette (`Ctrl+Shift+P` on Windows/Linux) and run
   **zed: install dev extension**. Select the repository directory containing
   `extension.toml`, not the `themes` directory.
3. Select **Accord** with **theme selector: toggle** (`Ctrl+K Ctrl+T`).

The generated Zed theme is kept in sync with the VS Code source theme:

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

The `surface.background` override uses the baseline's opaque `panel.background`.
Zed 1.23.2 uses this surface for the thread sidebar, its rows' title fades, and
sticky headers; the baseline's translucent scrollbar gray makes that sidebar
unreadable.

The baseline provenance and upstream license are in
`third_party/vscode-dark-modern/`.

### Zed previews

![Accord in Zed with TypeScript](screenshots/zed-typescript.png)

![Accord in Zed with HTML](screenshots/zed-html.png)

![Accord in Zed with Markdown](screenshots/zed-markdown.png)
