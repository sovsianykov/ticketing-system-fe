#!/usr/bin/env node
/**
 * Generates favicon files in /public and updates head metadata.
 * Uses sharp (bundled with Next.js) to produce PNG assets from an SVG source.
 *
 * Run: node scripts/setupMetaAndFavicon.js
 */

const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

// Ticket-shaped SVG logo (simple "T" mark on a blue background)
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#2563EB"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
        font-family="system-ui, sans-serif" font-size="38" font-weight="700" fill="#ffffff">T</text>
</svg>`;

async function run() {
  let sharp;
  try {
    // sharp is a transitive dep of Next.js
    sharp = require(require.resolve("sharp", { paths: [ROOT] }));
  } catch {
    console.error("sharp not found. Run: npm install sharp");
    process.exit(1);
  }

  fs.mkdirSync(PUBLIC, { recursive: true });

  const svgBuffer = Buffer.from(SVG);

  // 64×64 PNG – apple-touch-icon / general use
  const png64Path = path.join(PUBLIC, "apple-touch-icon.png");
  if (!fs.existsSync(png64Path)) {
    await sharp(svgBuffer).resize(64, 64).png().toFile(png64Path);
    console.log("Created public/apple-touch-icon.png");
  } else {
    console.log("Skipped public/apple-touch-icon.png (already exists)");
  }

  // 32×32 PNG – browser tab fallback
  const png32Path = path.join(PUBLIC, "favicon-32x32.png");
  if (!fs.existsSync(png32Path)) {
    await sharp(svgBuffer).resize(32, 32).png().toFile(png32Path);
    console.log("Created public/favicon-32x32.png");
  } else {
    console.log("Skipped public/favicon-32x32.png (already exists)");
  }

  // 192×192 PNG – Android PWA icon
  const pwaPath = path.join(PUBLIC, "icon-192.png");
  if (!fs.existsSync(pwaPath)) {
    await sharp(svgBuffer).resize(192, 192).png().toFile(pwaPath);
    console.log("Created public/icon-192.png");
  } else {
    console.log("Skipped public/icon-192.png (already exists)");
  }

  // SVG copy – scalable icon (Next.js picks this up as icon.svg in app/)
  const svgPath = path.join(PUBLIC, "favicon.svg");
  if (!fs.existsSync(svgPath)) {
    fs.writeFileSync(svgPath, SVG, "utf8");
    console.log("Created public/favicon.svg");
  } else {
    console.log("Skipped public/favicon.svg (already exists)");
  }

  console.log("\nDone. Add the following to your Next.js metadata export if not already present:");
  console.log(`
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
