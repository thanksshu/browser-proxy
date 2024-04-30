"use strict";

(() => {
    window.__browserProxy__ = {
        fetch: async (input, options) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.addEventListener("message", (event) => {});
            window.postMessage({
                type: "__BROWSER_PROXY_EXTENSION_REQUEST__",
                port: messageChannel.port2,
                request,
            });
        },
    };
})();
