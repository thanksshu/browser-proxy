import { exec } from "node:child_process";
import { promises, createReadStream } from "node:fs";
import { createServer } from "node:http";
import { extname } from "node:path";

const PORT = 8080;

const MIME_TYPES = {
    default: "application/octet-stream",
    html: "text/html; charset=UTF-8",
    js: "application/javascript",
    css: "text/css",
    png: "image/png",
    jpg: "image/jpg",
    gif: "image/gif",
    ico: "image/x-icon",
    svg: "image/svg+xml",
};

/**
 * Prepare response body
 * @param {string} path
 * @returns
 */
const route = async (path) => {
    let filePath = "";
    if (path === "/") {
        filePath = "index.html";
    }
    return promises.access(filePath).then(
        (_) => {
            const ext = extname(filePath).substring(1).toLowerCase();
            const stream = createReadStream(filePath);
            return { found: true, ext, stream };
        },
        (_) => {
            return { found: false, ext: "", stream: null };
        }
    );
};

// Run the server
createServer(async (req, res) => {
    const result = await route(req.url);
    let statusCode;
    if (result.found) {
        statusCode = 200;
        const mimeType = MIME_TYPES[result.ext] || MIME_TYPES.default;
        res.writeHead(200, { "Content-Type": mimeType });
        result.stream.pipe(res);
    } else {
        statusCode = 404;
        res.writeHead(404);
        res.end();
    }
    console.log(`${req.method} ${req.url} ${statusCode}`);
}).listen(PORT);

console.log(`Server running at http://localhost:${PORT}/`);

// exec(`start http://localhost:${PORT}/`, (error, stdout, stderr) => {
//   if (error) {
//     console.error(`exec error: ${error}`);
//     return;
//   }
//   console.log(`stdout: ${stdout}`);
//   console.error(`stderr: ${stderr}`);
// });
