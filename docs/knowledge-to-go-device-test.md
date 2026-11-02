# Android offline library smoke test

This prototype still requires an Android build and an on-device test. Use a local model and keep Knowledge to Go running on the same device.

1. Download an English Wikipedia archive and an on-device model while connected.
2. Enable airplane mode and confirm `http://localhost:8085/kiwix` opens.
3. In PocketPal, send `/library water`. Check that results and a response appear, then open a local source link.
4. Send a query with no matches and confirm the app reports that rather than inventing a source.
5. Stop Knowledge to Go and confirm an unavailable-library error is displayed.
6. Select a remote model and confirm `/library` refuses to send library excerpts to it.
7. Repeat while Knowledge to Go downloads are idle and note S10+ responsiveness and memory use.

Use real device observations to record pass/fail. Do not rely on the response for medical or emergency decisions without checking the source.
