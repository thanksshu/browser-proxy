# Browser Proxy Extension

## How does it work

1. Page's javascript uses `MessageChannel.postMessage()` to communicate with extension's `content.js`
1. `content.js` then send the message to extension's background `background.js`
1. `background.js` makes the real request then send back the response to `content.js`
1. `content.js` sends the response back to the page

## References

-   <https://developer.chrome.com/docs/extensions/develop/concepts/network-requests>
-   <https://developer.chrome.com/docs/extensions/develop/concepts/service-workers>
