'use strict';
// Headless-browser smoke for the wasm `web` build: serve the crate dir over HTTP
// (wasm fetch needs http, not file://), load index.html in headless Chrome, and
// check for the RESULT:OK marker. Uses Chrome's --virtual-time-budget so async
// wasm init + the ops complete before --dump-dom captures the page. No browser
// automation dependency — just a system Chrome.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = path.join(__dirname, '..'); // rust/crates/wasm
const CHROME = process.env.CHROME
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.wasm': 'application/wasm' };

const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); return res.end('not found');
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

server.listen(0, () => {
  const port = server.address().port;
  const url = `http://localhost:${port}/browser-test/index.html`;
  execFile(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox',
    '--virtual-time-budget=15000', '--dump-dom', url,
  ], { timeout: 60000 }, (err, stdout, stderr) => {
    server.close();
    const m = (stdout || '').match(/RESULT:(OK|FAIL)[^<]*/);
    if (err && !m) {
      console.error('chrome failed:', err.message, stderr);
      process.exit(1);
    }
    const line = m ? m[0].trim() : '(no RESULT marker in DOM)';
    console.log(line);
    process.exit(m && m[1] === 'OK' ? 0 : 1);
  });
});
