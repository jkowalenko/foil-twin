/**
 * Process Armstrong wordmark into theme-aware transparent PNGs.
 * - Dark: white lettering + red triangle on transparent
 * - Light: Armstrong blue (#0047BA) lettering + red triangle on transparent
 */
import { PNG } from "pngjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDark = path.join(root, "public/brand/armstrong-wordmark.png");
const outLight = path.join(root, "public/brand/armstrong-wordmark-light.png");
const CDN =
  "https://armstrongfoils.com/cdn/shop/files/Armstrong-Wordmark.png?v=1712702441";

/** Armstrong brand blue from armstrongfoils.com (--solid-button-background / header). */
const ARM_BLUE = { r: 0x00, g: 0x47, b: 0xba }; // #0047BA

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchUrl(res.headers.location).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

function isRed(r, g, b) {
  // Keep the red triangle in the A (and anti-aliased red edges).
  return r > 140 && r - g > 60 && r - b > 40 && g < 120 && b < 120;
}

function isNearBlack(r, g, b, a) {
  return a > 0 && Math.max(r, g, b) < 40;
}

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function processPng(srcBuf, letterRgb) {
  const src = PNG.sync.read(srcBuf);
  const out = new PNG({ width: src.width, height: src.height, colorType: 6 });

  for (let i = 0; i < src.data.length; i += 4) {
    let r = src.data[i];
    let g = src.data[i + 1];
    let b = src.data[i + 2];
    let a = src.data[i + 3];

    if (a === 0 || isNearBlack(r, g, b, a)) {
      out.data[i] = 0;
      out.data[i + 1] = 0;
      out.data[i + 2] = 0;
      out.data[i + 3] = 0;
      continue;
    }

    if (isRed(r, g, b)) {
      // Preserve red (including soft edges): keep RGB, keep alpha.
      out.data[i] = r;
      out.data[i + 1] = g;
      out.data[i + 2] = b;
      out.data[i + 3] = a;
      continue;
    }

    // Letter / anti-aliased edge: recolor to target, preserve coverage via alpha.
    // Source is white-on-transparent; use luminance * alpha as coverage.
    const cov = (luminance(r, g, b) / 255) * (a / 255);
    out.data[i] = letterRgb.r;
    out.data[i + 1] = letterRgb.g;
    out.data[i + 2] = letterRgb.b;
    out.data[i + 3] = Math.round(Math.min(1, cov) * 255);
  }

  return PNG.sync.write(out);
}

async function main() {
  let srcBuf;
  if (fs.existsSync(outDark)) {
    srcBuf = fs.readFileSync(outDark);
    // If local looks already recolored (not mostly white), restore from CDN.
    const probe = PNG.sync.read(srcBuf);
    let whiteish = 0;
    let opaque = 0;
    for (let i = 0; i < probe.data.length; i += 4) {
      const a = probe.data[i + 3];
      if (a < 200) continue;
      opaque++;
      const r = probe.data[i];
      const g = probe.data[i + 1];
      const b = probe.data[i + 2];
      if (r > 200 && g > 200 && b > 200) whiteish++;
      else if (isRed(r, g, b)) whiteish++; // red counts as "source-like"
    }
    if (opaque > 0 && whiteish / opaque < 0.85) {
      console.log("Local PNG looks processed; restoring from CDN…");
      srcBuf = await fetchUrl(CDN);
    } else {
      console.log("Using local source PNG.");
    }
  } else {
    console.log("Downloading from CDN…");
    srcBuf = await fetchUrl(CDN);
  }

  const dark = processPng(srcBuf, { r: 255, g: 255, b: 255 });
  const light = processPng(srcBuf, ARM_BLUE);

  fs.mkdirSync(path.dirname(outDark), { recursive: true });
  fs.writeFileSync(outDark, dark);
  fs.writeFileSync(outLight, light);

  console.log("Wrote", outDark);
  console.log("Wrote", outLight);
  console.log("Light lettering blue: #0047BA");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
