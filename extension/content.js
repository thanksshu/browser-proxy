"use strict";

const buildResponseMessageForIndex = (id, message) => {
    return {
        type: "__BROWSER_PROXY_EXTENSION_RESPONSE__",
        id: id,
        response: message,
    };
};

const buildErrorMessageForIndex = (id, message) => {
    return {
        type: "__BROWSER_PROXY_EXTENSION_ERROR__",
        id: id,
        error: message,
    };
};

/**
 * Send message received from background to index
 * @param {*} message
 */
const handleBackgroundMessage = (message, id) => {
    if (message.type === "response") {
        window.postMessage(buildResponseMessageForIndex(id, message.response));
    } else if (message.type === "error") {
        window.postMessage(buildErrorMessageForIndex(id, message.error));
    }
};

console.info(
    `${new Date().toLocaleString()} [Browser Proxy Extension] Content script loaded`
);

window.addEventListener("message", (event) => {
    const messageFromPage = event.data;

    // An id is needed for each request
    if (!Object.hasOwn(messageFromPage, "id")) {
        window.postMessage(buildErrorMessageForIndex(null, "No id provided"));
        return;
    }

    if (messageFromPage.type === "__BROWSER_PROXY_EXTENSION_REQUEST__") {
        chrome.runtime.sendMessage(
            // Send message to background
            {
                type: "request",
                requestConfig: messageFromPage.requestConfig,
            },
            // Handle message from background
            (messageFromBackground) => {
                handleBackgroundMessage(
                    messageFromBackground,
                    messageFromPage.id
                );
            }
        );
    }
});
