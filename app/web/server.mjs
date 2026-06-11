import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { createServer } from "node:http";
import http from "node:http";

const PORT = Number(process.env.PORT || 8090);
const API_HOST = process.env.API_HOST || "localhost";
const API_PORT = Number(process.env.API_PORT || 8080);
const WEB_ROOT = normalize(process.cwd());

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);

  if (url.pathname.startsWith("/api/")) {
    proxyApi(request, response, url);
    return;
  }

  serveStatic(response, url.pathname);
}).listen(PORT, () => {
  console.log(`Frontend local server running at http://localhost:${PORT}`);
  console.log(`Proxying /api/* to http://${API_HOST}:${API_PORT}`);
});

function serveStatic(response, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(join(WEB_ROOT, requestedPath));

  if (!safePath.startsWith(WEB_ROOT) || !existsSync(safePath) || statSync(safePath).isDirectory()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const contentType = contentTypes[extname(safePath)] || "application/octet-stream";
  response.writeHead(200, { "Content-Type": contentType });
  createReadStream(safePath).pipe(response);
}

function proxyApi(clientRequest, clientResponse, url) {
  const upstreamRequest = http.request(
    {
      host: API_HOST,
      port: API_PORT,
      path: url.pathname + url.search,
      method: clientRequest.method || "GET",
      headers: {
        "X-Forwarded-Host": clientRequest.headers.host || "",
        "X-Forwarded-Proto": "http",
        ...(clientRequest.headers["x-request-id"]
          ? { "X-Request-Id": clientRequest.headers["x-request-id"] }
          : {}),
      },
    },
    (upstreamResponse) => {
      console.log(
        `Proxy ${clientRequest.method || "GET"} ${url.pathname} -> ${upstreamResponse.statusCode || 0}`
      );
      clientResponse.writeHead(upstreamResponse.statusCode || 502, {
        "Content-Type": upstreamResponse.headers["content-type"] || "application/json; charset=utf-8",
      });

      upstreamResponse.pipe(clientResponse);
    }
  );

  upstreamRequest.on("error", (error) => {
    console.error(`API proxy error to http://${API_HOST}:${API_PORT}${url.pathname}: ${error.message}`);
    clientResponse.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
    clientResponse.end(
      JSON.stringify({
        ok: false,
        error: "api-proxy-failed",
        details: error.message,
      })
    );
  });

  clientRequest.on("error", () => {
    upstreamRequest.destroy();
  });

  clientRequest.pipe(upstreamRequest);
}
