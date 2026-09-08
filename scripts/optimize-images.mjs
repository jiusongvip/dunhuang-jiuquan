/**
 * Re-encode public/images + public/images/responsive webp in place at lower quality.
 * Lighthouse "improve image delivery" fix: ~q68 effort 6 keeps visual quality
 * while cutting 25-60% of bytes for AI/photo imagery.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const DIRS = ["public/images", "public/images/responsive"];
const MIN_SAVING = 512; // skip rewrite if we save less than 0.5 KiB

let totalBefore = 0;
let totalAfter = 0;
let changed = 0;

for (const dir of DIRS) {
  const entries = fs.readdirSync(dir).filter((f) => f.endsWith(".webp"));
  for (const name of entries) {
    const file = path.join(dir, name);
    const before = fs.statSync(file).size;
    try {
      const input = fs.readFileSync(file);
      const buf = await sharp(input)
        .webp({ quality: 68, effort: 6, smartSubsample: true })
        .toBuffer();
      if (before - buf.length > MIN_SAVING && buf.length < before) {
        fs.writeFileSync(file, buf);
        totalBefore += before;
        totalAfter += buf.length;
        changed++;
        console.log(
          `${name}: ${(before / 1024).toFixed(1)} -> ${(buf.length / 1024).toFixed(1)} KiB`
        );
      }
    } catch (err) {
      console.error(`${name}: FAILED ${err.message}`);
      process.exitCode = 1;
    }
  }
}

console.log(
  `\nchanged=${changed}, saved=${((totalBefore - totalAfter) / 1024).toFixed(1)} KiB`
);
