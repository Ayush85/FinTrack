# Android Release Signing & Build (FinTrack)

This document explains how to securely configure release signing and produce an Android App Bundle (`.aab`) ready for Google Play.

Prerequisites
- JDK and Android SDK installed and configured.
- `keytool` available on your PATH (comes with JDK).
- You have created a keystore file (e.g., `android/app/release-key.jks`).

1) Place your keystore
- Put your keystore file in `android/app/release-key.jks` (recommended). Do NOT commit this file to version control.

2) Configure passwords (recommended, secure options)
Option A (preferred, local and private): add passwords to your user Gradle properties at `%USERPROFILE%/.gradle/gradle.properties` (Windows):

```
MYAPP_UPLOAD_STORE_PASSWORD=your_store_password_here
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password_here
```

Option B (CI): set environment variables in your CI environment:
- `MYAPP_UPLOAD_STORE_PASSWORD`
- `MYAPP_UPLOAD_KEY_PASSWORD`

Do NOT add passwords to `android/gradle.properties` in the repo.

3) Confirm `android/gradle.properties` points to your keystore
- `MYAPP_UPLOAD_STORE_FILE` should be set to `android/app/release-key.jks` or an absolute path.
- `MYAPP_UPLOAD_KEY_ALIAS` should match the alias you used when generating the keystore.

4) Build the Android App Bundle (.aab)
From project root run:

```powershell
cd android
./gradlew bundleRelease
```

On Windows PowerShell, use `.\gradlew.bat bundleRelease` or depending on your shell:

```powershell
cd android
.\gradlew.bat bundleRelease
```

Output:
- `android/app/build/outputs/bundle/release/app-release.aab`

5) Upload to Play Console
- Create an app in Play Console (if not already).
- In Store Presence → Privacy policy, add privacy policy URL (host your `PRIVACY_POLICY.md` online).
- In App Content → Sensitive permissions, complete the SMS permission declaration (we prepared `SMS_PERMISSION_DECLARATION.md`).
- Upload `.aab` to an internal test track for initial verification.

6) Safety & Backups
- Back up your keystore and store passwords securely (password manager).
- Losing your keystore means you cannot update the app on Play Store.

7) Troubleshooting
- If Gradle cannot find passwords, ensure they are present in `%USERPROFILE%/.gradle/gradle.properties` or set as environment variables before running Gradle.
- If you see signing errors, verify `MYAPP_UPLOAD_KEY_ALIAS` matches the alias in the keystore.

If you want, I can create a `.env.example` and a CI snippet (GitHub Actions) to automate the build securely.
