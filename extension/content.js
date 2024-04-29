"use strict";

const init = () => {
    chrome.runtime.sendMessage({ type: "init" });
};

const buildResponseForPage = (message) => {
    return;
};

const buildErrorForPage = (message) => {
    return;
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
