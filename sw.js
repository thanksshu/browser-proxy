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
  const newRequestHeaders = new Headers(request.headers); // Create mutable headers

  newRequestHeaders.set("Origin", url.origin);
  let newRequest = new Request(url, {
    headers: newRequestHeaders,
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
    signal: request.signal,
  });

  console.log(...newRequest.headers);

  let response = await fetch(newRequest);

  const newResponseHeaders = new Headers(response.headers); // Create mutable headers
  newResponseHeaders.set("Access-Control-Allow-Origin", "*");
  newResponseHeaders.set("Vary", "Origin"); // Hint the browser to correctly cache the request
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newResponseHeaders,
  });

  return newResponse;
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

self.addEventListener("fetch", (event) => {
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
