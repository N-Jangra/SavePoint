# SavePoint file layout

```text
SavePoint/
├── frontend/
│   ├── index.html                 # SPA shell and script/style entry point
│   ├── app.js                     # app state, routes, persistence, interactions
│   ├── app-config.js              # SavePoint identity and game category
│   ├── pages/                      # screen renderers
│   ├── components/                 # shared UI
│   ├── backend/                    # storage bridge and metadata modules
│   └── styles/                     # theme and details styles
├── android/                        # Capacitor Android project and native plugins
├── docs/                           # technical documentation
├── plans/backend-split.md          # frontend/backend module responsibility notes
├── dev-server.js                   # local server and allowlisted source proxy
├── capacitor.config.json           # application identity and webDir
├── package.json                    # npm scripts and Capacitor dependencies
└── compile_apk.py                  # Android packaging helper
```

`capacitor.config.json` sets `frontend/` as `webDir`. The JavaScript under `frontend/backend/` is maintained in place and packaged as part of that directory; there is no separate generated copy. Native source is under `android/app/src/main/java/com/cuemark/savepoint/`.

The app-root `.gitignore` excludes dependencies, generated Android assets/build output, local SDK configuration, APKs, and local environment files. See [requirements](requirements.md) for the preview/build commands and [storage](storage.md) for runtime state locations.

