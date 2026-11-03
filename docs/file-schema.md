# SavePoint file layout

```text
SavePoint/
├── frontend/
│   ├── index.html                 # SPA shell and script/style entry point
│   ├── app.js                     # app state, routes, persistence, interactions
│   ├── app-config.js              # SavePoint identity and game category
│   ├── pages/                      # screen renderers
│   ├── components/                 # shared UI
│   ├── backend/                    # storage bridge and metadata/search/detail/mix modules
│   └── styles/                     # shared, theme, responsive, settings, and page-specific styles
├── android/                        # Capacitor Android project and native plugins
├── docs/                           # technical documentation
├── CHANGELOG.md                    # release notes
├── plans/backend-split.md          # frontend/backend module responsibility notes
├── dev-server.js                   # local server and allowlisted source proxy
├── capacitor.config.json           # application identity and webDir
├── package.json                    # npm scripts and Capacitor dependencies
└── compile_apk.py                  # Android packaging helper
```

`capacitor.config.json` sets `frontend/` as `webDir`. JavaScript under `frontend/backend/` is maintained in place and packaged with that directory; there is no separate generated backend copy or JSX build step. Native source is under `android/app/src/main/java/com/cuemark/savepoint/`, including encrypted storage, folder storage, backup scheduling, and the HowLongToBeat consent/session plugin.

The app-root `.gitignore` excludes dependencies, generated Android assets/build output, local SDK configuration, APKs, and local environment files. See [requirements](requirements.md) for the preview/build commands and [storage](storage.md) for runtime state locations.

