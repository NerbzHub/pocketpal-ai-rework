# Knowledge to Go search experiment

This experimental Android-first integration uses the local Kiwix server from Knowledge to Go. It has not yet been verified on an Android device. It does not index or duplicate the downloaded ZIM files.

Start Knowledge to Go, load an on-device model in PocketPal, and enter `/library drinking water` in chat. The command searches English Kiwix content at `http://127.0.0.1:8085/kiwix/search`, supplies up to three search excerpts to the model, and displays local source links. Try concise search terms. If no useful results are found or the service is unavailable, the app reports that rather than generating an ungrounded answer. Remote models are refused for this command.

This is a prototype: the server route and Kiwix XML response must be tested against the actual Knowledge to Go version; the app has not yet been built or tested on the S10+. It retrieves short search snippets rather than full articles. A small model may still misinterpret excerpts or cite incorrectly. Check the linked source before acting on the answer. The search currently covers English-language Kiwix content, not Kolibri courses or maps.
