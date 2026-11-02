# PocketPal with Local DB

This fork of [PocketPal AI](https://github.com/a-ghorbani/pocketpal-ai) can search offline Kiwix libraries provided by **Knowledge to Go** before answering a question. PocketPal runs the language model on the phone; Knowledge to Go supplies the downloaded articles. Both apps need to be on the same Android phone.

## What you need

- An Android phone with a 64-bit ARM processor, Android 7.0 or later, and enough free storage and memory for a model and your libraries. The supplied test APK has been tested on a Samsung Galaxy S10+; other phones have not been tested.
- Knowledge to Go installed, with one or more Kiwix libraries downloaded and its local Kiwix server running at `http://127.0.0.1:8085/kiwix` on the phone. This address is fixed in this fork.
- The APK from this fork, available on the [releases page](https://github.com/NerbzHub/pocketpal-ai-rework/releases) when a release is published, or built from source using the instructions below. The official PocketPal store app does not contain this fork's Local DB feature. The APK contains the app, but not a model or Kiwix libraries.
- A locally downloaded GGUF language model in PocketPal. Qwen3 0.6B was used for the Galaxy S10+ test.

The release APK uses CPU inference and bundles the JavaScript app; it does not need a computer, USB debugging, or a Metro server to run. It uses a placeholder Firebase configuration, so Firebase-dependent online services are not configured. Its application ID is `com.pocketpalai.localdb`, so it can be installed alongside Knowledge to Go and the official PocketPal app. The older debug test build uses a different application ID and keeps its own chats and models; installing the release does not transfer them.

## Install and set up

1. Copy the APK to the phone, open it from the phone's file manager, and follow Android's installation prompts. Android may ask you to allow installations from the app that opened the file.
2. Open Knowledge to Go, download the libraries you want, and start its local Kiwix server. On the same phone, open `http://127.0.0.1:8085/kiwix` in a browser to check that it is reachable. Keep the server running while using Local DB.
3. Open PocketPal. In the menu, choose **Models**, download a model that fits the phone, and tap **Load**. Downloads require an internet connection and enough space; a downloaded model can then run offline.
4. Open a chat. Tap **Local DB** beside **Think** to select it, then ask a question. For example: `What is Lady Gaga's real name?`
5. PocketPal displays the matched article title, an excerpt, and a local source URL, then gives the source text to the local model to generate an answer. Read the source as well as the answer: small models can misunderstand or invent details even when given the right article.

**Local DB** is off by default and its setting is remembered. Tap it again to return to ordinary chat. **Think** is a separate model option; it does not turn database search on or off.

## How Local DB works and its limits

- Each message sent while Local DB is selected triggers a search of the server's full-text-indexed libraries. The app picks a matching article and provides a bounded excerpt to the model. It does not search arbitrary files directly, and collections without a full-text index are not searched.
- If no readable matching article is found, or the server cannot be reached, the app reports that and does not generate an unsourced answer for that message. Try a shorter question naming the subject, and check the library is downloaded and indexed.
- Local DB works only with an on-device model. It refuses to send the retrieved article to a remote model. Ordinary chat and other optional online features have their own settings and network behavior.
- The search can choose the wrong article or miss relevant text. Its result is not a guarantee of accuracy or completeness; check the displayed source, especially for important decisions.
- Once the model and libraries have been downloaded, the Local DB search and local model can work without internet access. Knowledge to Go's server must still be running on the same phone. `127.0.0.1` refers to that phone, not another computer or phone.

## Troubleshooting

- **Cannot search or read Knowledge to Go:** open the local server address above on the phone; start or restart the server and check that the library is downloaded. Android may stop background apps, so reopen Knowledge to Go if needed.
- **No matching article:** check that the library has a full-text index; try the article name or rephrase the question. A downloaded collection is not necessarily searchable by this feature.
- **A source appears but the answer is wrong:** read the excerpt or open the source URL. Try a more capable local model if the phone can run one.
- **Model not loaded or remote model warning:** load a downloaded, on-device model in **Models**.
- **APK will not install:** check the phone uses 64-bit ARM and Android 7 or newer, has enough free space, and allows installation from your file manager. A differently signed app with the same package name can also block installation.

## Build from source

The following is for developers. Installing the APK does not require these tools.

1. Install Git, [Android Studio and its Android SDK](https://developer.android.com/studio), the SDK build tools, NDK and CMake, Node.js matching [`.nvmrc`](.nvmrc), and Yarn Classic 1.22.22. This project requests Android SDK/build tools 37 and NDK 27.3.13750724; Gradle may request additional SDK components. Set `ANDROID_HOME` to your SDK directory and `JAVA_HOME` to a compatible JDK, such as Android Studio's bundled JDK.
2. Clone this fork and install dependencies. On Windows, run the shell commands in Git Bash; the post-install script requires Bash and downloads OpenCL headers.

   ```bash
   git clone --branch codex/kiwix-offline-search https://github.com/NerbzHub/pocketpal-ai-rework.git
   cd pocketpal-ai-rework
   yarn install
   ```

3. The Android Google Services plugin needs `android/app/google-services.json`. For a local-only test build, if you do not already have a real configuration, copy the included placeholder:

   ```bash
   cp -n android/app/google-services.example.json android/app/google-services.json
   ```

   The example contains no working credentials; Firebase-dependent features require a real project configuration. Do not overwrite an existing configuration. The real `google-services.json` is ignored by Git.

4. Build the bundled, debug-signed APK:

   ```bash
   cd android
   ./gradlew assembleProdDebug
   ```

   On Windows, `gradlew.bat assembleProdDebug` also works from PowerShell. The output is `android/app/build/outputs/apk/prod/debug/app-prod-debug.apk`. Native builds can take a long time and need substantial free disk space. A source build may include different native inference backends and architectures from the supplied test APK.

   To build a release APK, configure your own release keystore and `APP_RELEASE_STORE_PASSWORD` and `APP_RELEASE_KEY_PASSWORD`, then run `./gradlew assembleProdRelease`. Keep the keystore and passwords private and backed up: Android requires the same signing key to install future updates. The output is `android/app/build/outputs/apk/prod/release/app-prod-release.apk`. Without release credentials, the existing Gradle configuration falls back to the public debug key; do not distribute that as a signed release.

For development checks, run `yarn lint`, `yarn typecheck`, and `yarn test` from the repository root. Changes to native code require rebuilding the app. See [CONTRIBUTING.md](CONTRIBUTING.md) and [e2e/README.md](e2e/README.md) for upstream development workflows.

## Credits and license

This fork builds on [PocketPal AI](https://github.com/a-ghorbani/pocketpal-ai), [Kiwix](https://kiwix.org/), and their open-source dependencies. PocketPal AI is licensed under the [MIT License](LICENSE).
