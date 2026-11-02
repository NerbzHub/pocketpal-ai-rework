# PocketPal Local DB — Android beta

This Android beta connects a local PocketPal model to full-text-indexed Kiwix libraries served by Knowledge to Go on the same phone. Select **Local DB** beside **Think** to search the library before each answer. The chat shows the source article and excerpt; if the library cannot be searched or no readable result is found, the app reports that instead of generating an unsourced answer.

## Install

Download the Android APK from the release assets and open it on a 64-bit ARM Android phone running Android 7 or later. Android may ask you to permit installation from your browser or file manager. Install Knowledge to Go separately, download a searchable library, and start its local server at `http://127.0.0.1:8085/kiwix`. In PocketPal, download and load an on-device GGUF model before chatting. See the [README](https://github.com/NerbzHub/pocketpal-ai-rework/blob/codex/kiwix-offline-search/README.md) for full setup and troubleshooting.

## Important details

- This is an independent fork, not an official PocketPal or Knowledge to Go release. The release package ID `com.pocketpalai.localdb` installs separately from official PocketPal and from earlier debug builds. Models and chats do not automatically transfer between them.
- The APK contains the app, not the Knowledge to Go libraries or a language model. Downloads need internet access; local search and inference can work offline afterwards.
- Local DB only searches full-text-indexed collections and only works with an on-device model. Search can miss or select the wrong article, and models can still make mistakes. Check the displayed source.
- The beta uses a placeholder Firebase configuration; Firebase-dependent services are not configured. CPU inference is included. Device compatibility and performance vary.
- This is an early beta; the Local DB workflow was exercised on a Samsung Galaxy S10+ using Qwen3 0.6B and Knowledge to Go's local Wikipedia library. Other devices, models, and libraries need further testing.

If a `SHA256SUMS.txt` file is attached to the release, compare its hash to the downloaded APK to check for accidental corruption. A hash published alongside the APK does not independently prove who signed it.
