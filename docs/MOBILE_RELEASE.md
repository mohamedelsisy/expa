# EXPA mobile: store release runbook (Android + iPhone)

Status: **written, not yet executed.** The app code is complete and tested (`flutter analyze` clean, 429 tests pass, see
`docs/MOBILE_SETUP.md` section 9). What follows is the ordered path from this repo to the Play Store and the App Store.
Steps marked **OWNER** need your own accounts, secrets or decisions; nothing here asks for them to be shared with the assistant.

Values for this deployment

| Item | Value |
|---|---|
| API | `https://api.expa-italy.com/api/v1` (dart-define `EXPA_API_BASE_URL`) |
| Environment | `production` (dart-define `EXPA_ENV`) |
| Web host (links in e-mails) | `expa-italy.com` (`-PexpaLinkHost=expa-italy.com`) |
| App id / bundle id | `it.expa.app` (cannot change after publishing, see MOBILE_SETUP.md section 3) |
| Flutter | project SDK: `.tools/flutter/bin/flutter` (3.47.6). The Homebrew `flutter` on the PATH is older; do not use it. |

## 0. Once per machine (done on the dev Mac on 2026-11-12)
- Android command-line tools installed in `~/Library/Android/sdk/cmdline-tools/latest`, SDK licences accepted by the owner.
- `export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"` and `export ANDROID_HOME=$HOME/Library/Android/sdk`.

## 1. Test builds (no accounts needed)
```bash
cd mobile
../.tools/flutter/bin/flutter build apk --debug \
  --dart-define=EXPA_API_BASE_URL=https://api.expa-italy.com/api/v1 --dart-define=EXPA_ENV=production
# build/app/outputs/flutter-apk/app-debug.apk : copy to an Android phone and install (allow "unknown sources")
```
Debug-signed and for testing only; it is **not** a store file. iPhone: a simulator build needs no account
(`flutter build ios --simulator ...`); a real iPhone needs the Apple Developer signing in section 4.

## 2. Accounts and assets (OWNER)
1. **Google Play Console** developer account (one-time fee, about 25 EUR). **Apple Developer Program** (99 USD per year).
2. **Privacy policy URL** and **terms URL** that counsel has approved. The privacy version is still a draft placeholder; stores reject
   an app without a public policy. Also needed: support e-mail, account-deletion URL (in-app deletion exists), age rating.
3. **Store listing**: screenshots in ar/en/it (including RTL), short and full description, Play *Data Safety* form and App Store
   *privacy labels* (data collected: account e-mail/name, profile, document metadata, AI chats, push token, optional photos/text).
4. **Brand artwork**: launcher icon and splash are placeholders (plain "E" on green). Supply the final icon (1024x1024, no transparency for iOS).
5. Decide the **Arabic app name** shown on Android (today "إكسبا").

## 3. Android release (Google Play)
1. Create the upload key **outside the repo** and keep it in a safe place with its passwords (losing it blocks updates):
   `keytool -genkey -v -keystore ~/expa-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload`
2. Create `mobile/android/key.properties` (git-ignored) with `storeFile`, `storePassword`, `keyAlias=upload`, `keyPassword`.
3. Build the bundle:
   ```bash
   cd mobile
   ../.tools/flutter/bin/flutter build appbundle --release \
     --dart-define=EXPA_ENV=production --dart-define=EXPA_API_BASE_URL=https://api.expa-italy.com/api/v1 \
     --obfuscate --split-debug-info=build/symbols -PexpaLinkHost=expa-italy.com
   ```
   Without the key, a release build is refused on purpose (it never falls back to the debug key).
4. Upload `build/app/outputs/bundle/release/app-release.aab` to an *Internal testing* track, enable Play App Signing, test on real devices
   (login, e-mail links, camera, RTL, TalkBack) before promoting. Keep `build/symbols` for crash de-obfuscation.
5. App Links: publish `https://expa-italy.com/.well-known/assetlinks.json` with package `it.expa.app` and the SHA-256 of the Play App Signing key.

## 4. iPhone release (App Store)
1. In Xcode (`mobile/ios/Runner.xcworkspace`) sign in with the Apple ID of the developer account, select the team under *Signing & Capabilities*
   (the team already in the project is the previous owner's; replace it) and confirm the bundle id `it.expa.app`.
2. Create the app record in App Store Connect with the same bundle id.
3. `cd mobile && ../.tools/flutter/bin/flutter build ipa --release --dart-define=EXPA_ENV=production --dart-define=EXPA_API_BASE_URL=https://api.expa-italy.com/api/v1 --obfuscate --split-debug-info=build/symbols`
   then upload with Xcode Organizer or Transporter, and test through TestFlight.
4. Universal Links: add the *Associated Domains* capability (`applinks:expa-italy.com`) and publish `https://expa-italy.com/.well-known/apple-app-site-association`.

## 5. Optional later (not needed for a first release)
- **Push**: needs a Firebase project, `google-services.json` / `GoogleService-Info.plist`, an APNs key, and a real FCM sender on the backend
  (today `PUSH_DRIVER=log`). Steps: MOBILE_SETUP.md section 5. The app works without it.
- **On-device OCR** for the scanner: MOBILE_SETUP.md section 13.

## 6. What still cannot be proven without a device
Push delivery, deep links, camera, TalkBack/VoiceOver, RTL on real hardware and the release (R8-minified) build behaviour: test on devices
before store submission (`DEVICE_VERIFICATION_REQUIRED` in MOBILE_SETUP.md).
