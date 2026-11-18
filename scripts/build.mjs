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

const APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#fef3c7"/>
  <rect x="20" y="20" width="472" height="472" rx="96" fill="none" stroke="#059669" stroke-width="20"/>
  <ellipse cx="148" cy="186" rx="34" ry="44" transform="rotate(-14 148 186)" fill="#059669"/>
  <ellipse cx="220" cy="140" rx="32" ry="44" transform="rotate(-5 220 140)" fill="#059669"/>
  <ellipse cx="292" cy="140" rx="32" ry="44" transform="rotate(5 292 140)" fill="#059669"/>
  <ellipse cx="364" cy="186" rx="34" ry="44" transform="rotate(14 364 186)" fill="#059669"/>
  <path d="M256 218c-56 0-110 46-110 98 0 38 30 62 66 56 18-3 28-8 44-8s26 5 44 8c36 6 66-18 66-56 0-52-54-98-110-98z" fill="#059669"/>
  <path d="M206 300c14-20 34-30 50-30s36 10 50 30c-12 18-28 28-50 28s-38-10-50-28z" fill="#f59e0b"/>
</svg>
`;

const MANIFEST_JSON = JSON.stringify(
    {
        name: 'Pimlico Paws: Carry & Biscotti',
        short_name: 'Pimlico Paws',
        start_url: './',
        display: 'standalone',
        background_color: '#f8f5f0',
        theme_color: '#f8f5f0',
        icons: [
            {
                src: 'icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
                purpose: 'any'
            }
        ]
    },
    null,
    2
);

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
    const iconPath = path.join(ROOT, 'icon.svg');
    const manifestPath = path.join(ROOT, 'manifest.webmanifest');
    const nojekyllPath = path.join(ROOT, '.nojekyll');

    fs.writeFileSync(outPath, html, 'utf8');
    fs.writeFileSync(iconPath, APP_ICON_SVG, 'utf8');
    fs.writeFileSync(manifestPath, MANIFEST_JSON + '\n', 'utf8');
    fs.writeFileSync(nojekyllPath, '', 'utf8');

    const sizeKb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
    return { outPath, iconPath, manifestPath, nojekyllPath, sizeKb, bytes: Buffer.byteLength(html, 'utf8') };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const res = buildBundle();
    console.log(`Built ${res.outPath} (${res.sizeKb} KB)`);
}
