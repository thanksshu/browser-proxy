"use strict";

self.addEventListener("install", (_) => {
  self.skipWaiting();
  console.log("[browser proxy] Installed");
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
  console.log("[browser proxy] Activated");
});

const supportMethods = new Set([
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
]);
// OPTIONS method must always be supported
supportMethods.add("OPTIONS");

/**
 * Handle HEAD, GET, POST, PUT... requests
 * @param {Request} request
 * @returns Response
 */
const handleRequest = async (request) => {
  const url = new URL(request.url);
  let targetUrl = url.searchParams.get("url");

  if (targetUrl === null) {
    return new Response(null, {
      status: 400,
      statusText: "Bad Request",
    });
  }

  request = new Request(new URL(targetUrl), request); // Create a mutable request
  request.headers.set("Origin", new URL(targetUrl).origin); // Rewrite origin

  let response = await fetch(request);

  response = new Response(response.body, response); // Create a mutable response
  response.headers.set("Access-Control-Allow-Origin", "*");
  // Hint the browser to correctly cache the request
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary
  response.headers.append("Vary", "Origin");
  return response;
};

/**
 * Handle OPTIONS requests
 * @param {Request} request
 * @returns Response
 */
const handleOptions = async (request) => {
  // Check if it's a CORS preflight
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Return the fake response
    const headers = new Headers();
    headers.append("Access-Control-Allow-Origin", "*");
    headers.append("Access-Control-Allow-Credentials", "*");
    headers.append(
      "Access-Control-Allow-Methods",
      Array.from(supportMethods).join(", ")
    );
    headers.append("Access-Control-Allow-Headers", "*");
    return new Response(null, {
      headers: headers,
    });
  } else {
    // A standard OPTIONS request
    return handleRequest(request);
  }
};

self.addEventListener("fetch", async (event) => {
  const client = await self.clients.get(event.clientId);
  // Only send the message when the client is alive
  if (client) {
    client.postMessage({
      msg: "Hey I just got a fetch from you!",
      url: event.request.url,
    });
  }

  event.respondWith(
    async (_) =>
      new Response(null, {
        status: 405,
        statusText: "Method Not Allowed",
      })
  );

  const method = event.request.method;
  if (method === "OPTIONS") {
    event.respondWith(handleOptions(event.request));
  } else if (supportMethods.has(method)) {
    event.respondWith(handleRequest(event.request));
  } else {
    event.respondWith(
      new Response(null, {
        status: 405,
        statusText: "Method Not Allowed",
      })
    );
  }
});
