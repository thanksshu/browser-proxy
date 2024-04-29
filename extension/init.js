"use strict";
(() => {
    window.__BROWSER_PROXY__ = {
        /**
         * Fetch using Browser Proxy
         * @param {Request} request The request to be send
         */
        fetch: async (request) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.addEventListener("message", () => {});
            window.postMessage({
                type: "__BROWSER_PROXY_EXTENSION_REQUEST__",
                port: new MessageChannel(),
                requestConfig: { url: "https://github.com/" },
            });
        },
    };
})();
