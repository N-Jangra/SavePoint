# SavePoint requirements

## Browser preview

- Node.js 18 or newer.
- npm (the exact compatible version is not pinned in `package.json`).
- Internet access for live metadata lookups. RAWG needs a user-supplied API key; IGDB needs a Twitch Client ID and access token.

From the app root:

```sh
npm install
npm run serve
```

Open the loopback URL printed by the server. The preview server uses Node's built-in HTTP server and requires no separate database service.

## Android build

- JDK 17.
- Android SDK with platform 34 and Android platform tools/build tools installed.
- Android Gradle Plugin 8.2.1 and Gradle 8.2.1 wrapper (both configured in the project).
- Capacitor 6 Android dependencies installed by `npm install`.

After installing npm dependencies, sync the web app and native plugins, then build a debug APK:

```sh
npm run cap:sync
cd android
./gradlew assembleDebug
```

The generated APK is at `android/app/build/outputs/apk/debug/app-debug.apk`. For a release APK, use `./gradlew assembleRelease`; signing configuration must be provided for a distributable signed release. Android `minSdkVersion` is 22, `targetSdkVersion` and `compileSdkVersion` are 34. Use Android Studio (`npm run cap:open`) if you prefer IDE-managed SDK setup/builds.

Online discovery and remote details require network access. Provider credentials are configured in Settings → Metadata Sources. See [metadata](metadata.md) and [metadata analysis](metadata-analysis.md). Use the preview server rather than opening the HTML via `file://` when testing browser metadata searches.

