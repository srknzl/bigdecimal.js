'use strict';
// Headless-browser smoke for the pure-TS UMD bundle. Serves the repo root over
// HTTP (a <script src> under file:// is flaky across Chrome versions), loads
// smoke.html in headless Chrome, and checks for the RESULT:OK marker the page
// writes into the DOM. No browser-automation dependency — just a system Chrome.
// Reuses the harness pattern from the parked rust-core wasm branch.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = path.join(__dirname, '..'); // repo root, so /lib and /test-browser both resolve
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.wasm': 'application/wasm' };

// Resolve a Chrome binary: explicit env first, then the usual per-platform names.
function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const candidates = [
    'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  for (const c of candidates) {
    if (c.includes('/')) { if (fs.existsSync(c)) return c; continue; }
    try {
      require('child_process').execFileSync('which', [c], { stdio: 'ignore' });
      return c;
    } catch { /* not on PATH */ }
  }
  return candidates[0]; // let execFile surface the ENOENT
}

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
  const url = `http://localhost:${port}/test-browser/smoke.html`;
  execFile(findChrome(), [
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
