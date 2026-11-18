import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_ID = '1NZ1ZHMhimvDlvNisLn-1Uyb75ilMAHEf';
const CDP_URL = 'http://127.0.0.1:9222/json';

function fetchTargets() {
    return new Promise((resolve, reject) => {
        http.get(CDP_URL, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', reject);
    });
}

async function injectHtml() {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const targets = await fetchTargets();
    const siteTarget = targets.find((t) => t.url && t.url.includes(SITE_ID));
    if (!siteTarget) {
        throw new Error(`No open AgentChrome tab found for Google Site ${SITE_ID}. Open the embed dialog first.`);
    }

    const ws = new WebSocket(siteTarget.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
        ws.onopen = resolve;
        ws.onerror = reject;
    });

    const expression = `(() => {
        const htmlContent = ${JSON.stringify(html)};
        const ta = document.querySelector('textarea[aria-label*="Paste the HTML code"], dialog textarea, textarea');
        if (!ta) return { ok: false, error: 'Embed HTML textarea not found in open dialog' };
        ta.focus();
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeSetter.call(ta, htmlContent);
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));
        return { ok: true, length: ta.value.length };
    })()`;

    const reply = await new Promise((resolve, reject) => {
        ws.onmessage = (ev) => {
            const msg = JSON.parse(ev.data);
            if (msg.id === 1) resolve(msg);
        };
        ws.onerror = reject;
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
    });

    ws.close();
    console.log('Google Sites embed injection result:', JSON.stringify(reply.result));
}

injectHtml().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
});
