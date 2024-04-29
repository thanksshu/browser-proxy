"use strict";
(() => {
    window.__BROWSER_PROXY__ = {
        /**
         * Fetch using Browser Proxy
         * @param {Request} request The request to be send
         */
        fetch: async (request) => {
            const messageChannel = new MessageChannel();
            
        },
    };
})();
