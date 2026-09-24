/* ============================================================
   LOCAL PORTFOLIO SERVER
   Run:  node server.js     then open:  http://localhost:5173
   Does two jobs:
     1. Serves the website files (index.html, style.css, app.js)
     2. /api/chat : securely forwards chat requests to the AI,
        adding the secret API key here so it NEVER appears
        in the browser's code.
   ============================================================ */

/* ============================================================
   1. SERVER CONFIG  ✏️ EDIT HERE
   MODELS = failover list: if one free model is rate-limited,
   the server automatically tries the next one.
   ============================================================ */
const PORT    = 5173;
const ZEN_URL = "https://opencode.ai/zen/v1/chat/completions";
const API_KEY = "sk-t5p1mT3Ti0VBs3FCBx6fN7RwaLjw2D9a0ERIT70GFIse49dnHG9vCgbTqRuzrF0i";
const MODELS  = [
  "nemotron-3.5-lightning-free",
  "x-preview-f-free",
  "hy3-free",
  "nemotron-3-ultra-free",
  "big-pickle"
];

/* ============================================================
   2. IMPORTS + FILE TYPES
   ============================================================ */
const http = require("http");
const fs   = require("fs");
const path = require("path");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon"
};

/* ============================================================
   3. CHAT PROXY (/api/chat)
   Receives { messages } from the page, injects the system
   prompt from ai-knowledge.txt (the AI only knows what is
   written there), attaches the secret key and returns the
   answer. Rate-limited models are skipped automatically.
   ============================================================ */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function getSystemPrompt() {
  const kb = fs.readFileSync(path.join(__dirname, "ai-knowledge.txt"), "utf8");
  return kb +
    "\n\nREMINDER: the visitor's actual question is the LAST 'user' message below. " +
    "Always answer THAT question directly, using only the knowledge base above.";
}

async function handleChat(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const history = (body.messages || []).filter(m => m.role !== "system");
    // Anchor the latest question so models that blur system/user turns
    // still focus on it instead of reacting to the knowledge base text.
    if (history.length && history[history.length - 1].role === "user") {
      const last = history[history.length - 1];
      last.content = last.content +
        "\n\n(Answer this visitor question using ONLY the knowledge base above.)";
    }
    const messages = [
      { role: "system", content: getSystemPrompt() },
      ...history
    ];
    let lastErrorText = "no models configured";

    for (const model of MODELS) {
      const upstream = await fetch(ZEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + API_KEY
        },
        body: JSON.stringify({ model: model, messages: messages })
      });

      const text = await upstream.text();

      if (upstream.ok) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(text);
      }

      try {
        const errJson = JSON.parse(text);
        lastErrorText = model + ": " + ((errJson.error && (errJson.error.message || errJson.error.type)) || upstream.status);
      } catch {
        lastErrorText = model + ": HTTP " + upstream.status;
      }
    }

    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      type: "error",
      error: { type: "AllModelsRateLimited", message: "All free models are rate-limited right now. Wait a few minutes and try again. Last error -> " + lastErrorText }
    }));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      type: "error",
      error: { message: "Proxy failed: " + err.message }
    }));
  }
}

/* ============================================================
   4. STATIC FILES (index.html, style.css, app.js, ...)
   ============================================================ */
function serveStatic(req, res) {
  let filePath = path.join(__dirname, decodeURIComponent(req.url.split("?")[0]));

  if (req.url === "/" || !path.extname(filePath)) {
    filePath = path.join(__dirname, "index.html");
  }

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end();
  }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
}

/* ============================================================
   5. ROUTER + START
   ============================================================ */
const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/chat") return handleChat(req, res);
  if (req.method === "GET") return serveStatic(req, res);
  res.writeHead(405); res.end();
});

server.listen(PORT, () => {
  console.log("Portfolio running at  http://localhost:" + PORT);
  require("child_process").exec("cmd /c start http://localhost:" + PORT);
});
