# My Gallery — React Native (Expo • iOS / Android / Web)

A cross-platform gallery app where users sign in with Google, add images from the camera or library, dictate captions with voice, and view/share their personal gallery. Built with Expo SDK 54.

---

## ✨ Features

- **Google Login** with `expo-auth-session` (Web, Android, iOS)
- **Personal gallery** showing user **name + avatar** after login
- **Add photos** via **Camera** (on real devices) or **Library** (all platforms)
- **Voice captions**
  - **Web:** Web Speech API (Chrome/Edge)
  - **Native (optional):** `react-native-voice` (requires Dev Client)
- **Local data persistence**
  - **Mobile:** SQLite (via `expo-sqlite`) – `src/data/db.native.ts`
  - **Web:** AsyncStorage (IndexedDB) – `src/data/db.web.ts`  
    Images are persisted as Base64 **data URIs** to survive refresh
- **Share** image + caption (native share on mobile, web fallback)
- **Dark mode** toggle (System / Light / Dark) with instant theme switch
- **Search / filter** by caption text
- **Responsive grid** that adapts to screen width

---

## 🧱 Tech Stack

- **Runtime:** Expo SDK 54, React Native 0.74
- **Navigation:** `@react-navigation/native` + native stack
- **Auth:** `expo-auth-session`, `expo-web-browser`
- **Media:** `expo-image-picker`, `expo-file-system` (native), `expo-sharing`
- **Storage:** `expo-sqlite` (native), `@react-native-async-storage/async-storage` (web)
- **Voice:** Web Speech API (web), `react-native-voice` (native optional)
- **Utilities:** `expo-crypto`, `expo-device`

---

## 📁 Project Structure
my-gallery/
├─ App.tsx # root entry re-exporting src/App.tsx
├─ index.js # registerRootComponent(App)
├─ app.json # Expo config
├─ babel.config.js
├─ src/
│ ├─ App.tsx # Navigation + providers
│ ├─ providers/
│ │ ├─ AuthProvider.tsx # Google user context
│ │ └─ ThemeProvider.tsx # Dark mode (system/light/dark)
│ ├─ screens/
│ │ ├─ AuthScreen.tsx # Google sign-in
│ │ ├─ GalleryScreen.tsx # Grid + search + FAB
│ │ ├─ AddScreen.tsx # Camera/Library picker
│ │ └─ SettingsScreen.tsx # Appearance toggle, etc.
│ ├─ components/
│ │ ├─ ImageTile.tsx # Card with caption + share + voice bar
│ │ └─ VoiceCaptionBar.tsx # Start/Stop mic buttons
│ ├─ hooks/
│ │ └─ useSpeech.ts # Web speech / native voice wrapper
│ └─ data/
│ ├─ db.native.ts # SQLite (mobile)
│ ├─ db.web.ts # AsyncStorage (web)
│ ├─ storage.native.ts # File copy + native share
│ ├─ storage.web.ts # Base64 persistence + web share
│ └─ storage.ts # Aggregator (chooses web/native at runtime)


---

## ⚙️ Setup

### 1) Prerequisites

- Node 18+
- Expo CLI: `npx expo --version`
- (Android) Android Studio for emulator or Android phone with Expo Go
- (iOS) Xcode/iOS simulator (Mac), or iPhone with Expo Go

### 2) Install dependencies

```bash
npm install
npx expo install @react-native-async-storage/async-storage expo-auth-session expo-web-browser expo-image-picker expo-file-system expo-sharing expo-sqlite expo-crypto expo-device

3) Configure Google OAuth (all platforms)

a) OAuth consent screen

Google Cloud Console → APIs & Services → OAuth consent screen

Choose External, set app name + support email

Scopes: add userinfo.email and userinfo.profile

Add your Gmail under Test users

Keep status Testing

b) Create 3 OAuth Client IDs (Credentials → Create credentials → OAuth client ID):

Web application

Authorized JavaScript origins: use your dev web origin (see below)

Authorized redirect URIs: the exact same origin (copy from the app console)

Android

Package name = android.package in app.json (e.g., com.yourname.mygallery)

SHA-1 from debug keystore

iOS

Bundle ID = ios.bundleIdentifier in app.json (e.g., com.yourname.mygallery)

c) Add client IDs in app.json
{
  "expo": {
    "scheme": "mygallery",
    "ios": { "bundleIdentifier": "com.yourname.mygallery" },
    "android": { "package": "com.yourname.mygallery" },
    "extra": {
      "googleWebClientId": "WEB_CLIENT_ID.apps.googleusercontent.com",
      "googleAndroidClientId": "ANDROID_CLIENT_ID.apps.googleusercontent.com",
      "googleIosClientId": "IOS_CLIENT_ID.apps.googleusercontent.com"
    }
  }
}

▶️ Run the app
npx expo start
# press w  → Web (uses Metro; origin may be http://localhost:8081)
# press a  → Android emulator / device
# press i  → iOS simulator (Mac)

Web login: allow the Google popup, then you should see your name + photo at the gallery header.

Add photo: press the ＋ FAB, pick camera/library (camera opens only on physical devices), save → returns to gallery.

Voice caption: long-press a tile → Start mic, speak, Stop, Save.

Search: type in the search bar to filter by caption.

Dark mode: Settings → choose System / Light / Dark (instant theme switch).

💾 Data & Storage

Mobile (iOS/Android): SQLite database in db.native.ts, stored per-user. Images are copied via expo-file-system to the app’s documents directory for persistence.

Web: db.web.ts stores items in AsyncStorage. storage.web.ts saves images as Base64 data URIs in AsyncStorage to survive page reloads.

🎙️ Voice Captions

Web: Uses the Web Speech API. Works best in Chrome/Edge. Buttons are disabled if unsupported.

Native (optional): Install react-native-voice and build a Dev Client:
npm i react-native-voice
npx expo install expo-dev-client
npx expo prebuild
npm run android   # or: npm run ios

📷 Camera vs Library

Web: launchCameraAsync isn’t supported → opens Library with a friendly message.

iOS Simulator: no camera hardware → opens Library.

Android Emulator: enable camera in AVD settings (Front/Back = Webcam0), or test on a phone.

Physical devices: camera opens after permission; if it throws, we fallback to library.

🔗 Sharing

Mobile: native share sheet via expo-sharing (with fallback to Share API).

Web: uses navigator.share when available; otherwise opens image in a new tab.

🌓 Dark Mode

ThemeProvider persists your choice (system/light/dark) and updates Navigation theme instantly.

🔎 Search

Client-side filter on captions (case-insensitive). Clear with the ✕ button.

🧪 Scripts
npm run start       # expo start
npm run web         # open web
npm run android     # open android
npm run ios         # open ios (Mac)

🚀 Deploy (Web)

You can export a static build:

npx expo export --platform web


Host the dist/ folder on Netlify / Vercel / Cloudflare Pages.
For Google login in production, add your deployed origin and redirect URL to the Web client in Google Console.

🧯 Troubleshooting

redirect_uri_mismatch
Use the exact redirectUri logged in the web console (e.g., http://localhost:8081).
Add it under Authorized redirect URIs and add its origin under Authorized JavaScript origins in the Google Web client.

Popup blocked
Allow popups for your dev origin.

Camera opens Library
Expected on web/simulators. Use a physical device to see the camera.

SQLite WASM error on web
We avoid expo-sqlite on web by using a platform-specific db.web.ts (AsyncStorage). No WASM needed.

TypeScript can’t find ../data/storage
We ship src/data/storage.ts that selects storage.web or storage.native at runtime so TS resolves the module.