const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'main.html');
const baseDir = path.dirname(htmlPath);
const outPath = path.join(__dirname, 'index.html');

let html = fs.readFileSync(htmlPath, 'utf8');

// ── 1. Embed images as base64 data URLs ──────────────────────────────────────
html = html.replace(/src="([^"]+\.(png|jpg|jpeg|gif|webp|svg))"/gi, (match, imgPath) => {
    if (imgPath.startsWith('data:')) return match;

    const absPath = path.resolve(baseDir, imgPath);
    if (!fs.existsSync(absPath)) {
        console.warn('Image not found, skipping:', absPath);
        return match;
    }

    const ext = path.extname(imgPath).slice(1).toLowerCase();
    const mime = ext === 'svg' ? 'image/svg+xml'
               : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
               : `image/${ext}`;

    const data = fs.readFileSync(absPath).toString('base64');
    console.log('Embedded image:', imgPath);
    return `src="data:${mime};base64,${data}"`;
});

// ── 2. Inline CSS — replace <link> stylesheet tag with <style> block ─────────
html = html.replace(/<link[^>]+href="([^"]+\.css)"[^>]*>/gi, (match, cssPath) => {
    const absPath = path.resolve(baseDir, cssPath);
    if (!fs.existsSync(absPath)) {
        console.warn('CSS not found, skipping:', absPath);
        return match;
    }

    const css = fs.readFileSync(absPath, 'utf8');
    console.log('Inlined CSS:', cssPath);
    return `<style>\n${css}\n</style>`;
});

// ── 3. Save to ~/index.html ───────────────────────────────────────────────────
fs.writeFileSync(outPath, html, 'utf8');
console.log(`\nDone — self-contained file saved to: ${outPath}`);
