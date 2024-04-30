"use strict";

import { bufferToBase64 } from "./utils.js";

/**
 * Convert a response to a simple object
 * @param {Response} response
 * @returns Response object
 */
const convertResponse = async (response) => {
    return {
        type: "response",
        response: {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers),
            responseURL: response.url,
            data: bufferToBase64(await response.arrayBuffer()),
        },
    };
};

/**
 * Send a request according to a config
 * @param {*} config Request config
 * @returns Response
 */
const sendRequest = async (config) => {
    try {
        const { url, ...options } = config;
        const request = new Request(url, options);

        const response = await fetch(request);

        console.info(
            `${new Date().toLocaleString()} [Browser Proxy Extension] ${
                request.method
            } ${request.url.toString()} ${response.status}`
        );

        return await convertResponse(response);
    } catch (error) {
        console.error(
            `${new Date().toLocaleString()} [Browser Proxy Extension] ${
                error.stack
            }`
        );
        return {
            type: "error",
            error: `${error.name}: ${error.message}`,
        };
    }
};

// The callback of this event must not be a async function
// Return true is needed for the callback function
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // For security raison, accepts only localhost
    let senderOrigin = new URL(sender.origin);
    if (senderOrigin.hostname !== "localhost") {
        sendResponse();
        return true;
    }

    if (message.type && message.type === "request") {
        // The sendResponse function only takes JSON-ifiable object
        // so Response is converted in the sendRequest function
        sendRequest(message.requestConfig).then(sendResponse);
    } else {
        sendResponse();
    }
    return true;
});
