import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');

const JS_ORDER = ['audio.js', 'map.js', 'entities.js', 'renderer.js', 'game.js'];

function stripModuleSyntax(code) {
    return code
        .replace(/^import\s+\{[\s\S]*?\}\s+from\s+['"][^'"]+['"];\s*/gm, '')
        .replace(/^import\s+[^\n;]+;\s*/gm, '')
        .replace(/^export\s+(?=(class|function|async\s+function|const|let|var)\b)/gm, '');
}

export function buildBundle() {
    const template = fs.readFileSync(path.join(SRC, 'template.html'), 'utf8');
    const styles = fs.readFileSync(path.join(SRC, 'styles.css'), 'utf8');

    const jsChunks = JS_ORDER.map((file) => {
        const raw = fs.readFileSync(path.join(SRC, file), 'utf8');
        return `// --- ${file} ---\n${stripModuleSyntax(raw).trim()}`;
    });

    const inlinedScript = `(() => {\n'use strict';\n${jsChunks.join('\n\n')}\n})();`;

    // Verify zero JS syntax errors at build time
    new vm.Script(inlinedScript, { filename: 'pimlico_paws_bundle.js' });

    const html = template
        .replace('/* __INLINED_STYLES__ */', () => styles)
        .replace('/* __INLINED_SCRIPT__ */', () => inlinedScript);

    const outPath = path.join(ROOT, 'index.html');
    fs.writeFileSync(outPath, html, 'utf8');
    const sizeKb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
    return { outPath, sizeKb, bytes: Buffer.byteLength(html, 'utf8') };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const res = buildBundle();
    console.log(`Built ${res.outPath} (${res.sizeKb} KB)`);
}
