"use strict";

console.log(bufferToBase64);

/**
 * Inject the script into the document
 */
const init = () => {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("injection.js");
    document.documentElement.appendChild(script);
    script.parentNode.removeChild(script);
};

/**
 * Convert a request to request config
 * @param {Request} request
 * @returns {Object} Request Config
 */
const requestToConfig = async (request) => {
    return {
        url: request.url,
        headers: Object.entries(request.headers),
        body: request.body,
        cache: request.cache,
        credentials: request.credentials,
        integrity: request.integrity,
        keepalive: request.keepalive,
        method: request.method,
        mode: request.mode,
        redirect: request.redirect,
        referrer: request.referrer,
        referrerPolicy: request.referrerPolicy,
    };
};

/**
 * Send message received from background to page
 * @param {*} message
 * @param {MessagePort} port
 */
const handleBackgroundMessage = (message, port) => {
    if (message.type === "response") {
        port.postMessage({
            type: "__BROWSER_PROXY_EXTENSION_RESPONSE__",
            response: message.response,
        });
    } else if (message.type === "error") {
        port.postMessage(
            buildErrorForPage({
                type: "__BROWSER_PROXY_EXTENSION_ERROR__",
                error: message.error,
            })
        );
    }
};

window.addEventListener("message", (event) => {
    const messageFromPage = event.data;

    if (!Object.hasOwn(messageFromPage, "type")) {
        return;
    } else if (messageFromPage.type === "__BROWSER_PROXY_EXTENSION_REQUEST__") {
        // A port is needed for each request
        if (!Object.hasOwn(messageFromPage, "port")) {
            return;
        }

        const request = messageFromPage.request;
        const requestConfig = chrome.runtime.sendMessage(
            // Send message to background, message must be JSON-ifiable
            {
                type: "request",
                requestConfig,
            },
            // Handle message from background
            (messageFromBackground) => {
                handleBackgroundMessage(
                    messageFromBackground,
                    messageFromPage.port
                );
            }
        );
    }
});

init();

console.info(
    `${new Date().toLocaleString()} [Browser Proxy Extension] Content script loaded`
);
