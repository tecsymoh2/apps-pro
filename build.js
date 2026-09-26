// Precompiles src/*.jsx into one plain JavaScript file (app.js) — no Babel needed in the browser.
// Usage: npm install && node build.js
const fs = require('fs'); const ts = require('typescript');
const order = ['i18n.js', 'app.jsx', 'features.jsx', 'admin.jsx', 'main.jsx'];
const src = order.map((f) => `/* ---- ${f} ---- */\n` + fs.readFileSync(`src/${f}`, 'utf8')).join('\n');
const out = ts.transpileModule(src, { reportDiagnostics: true, fileName: 'app.jsx', compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2019, removeComments: true } });
if (out.diagnostics.length) { out.diagnostics.forEach((d) => { const p = ts.getLineAndCharacterOfPosition(d.file, d.start); console.error(`Line ${p.line + 1}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`); }); process.exit(1); }
fs.writeFileSync('app.js', '(function(){\n' + out.outputText + '\n})();');
console.log('Built app.js', Math.round(out.outputText.length / 1024) + ' KB');
