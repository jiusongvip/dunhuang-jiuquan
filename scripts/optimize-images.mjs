/**
 * Re-encode public/images + public/images/responsive webp in place.
 * Manifest-guarded: each file is processed at most once per recorded size,
 * so repeated builds never stack lossy generations.
 *
 * Usage: node scripts/optimize-images.mjs [--quality=68] [--min=0] [--force]
 *   --quality  webp quality (default 68)
 *   --min      only process files larger than this many bytes (default 0)
 *   --force    re-process even if manifest says done
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);

const DIRS = ["public/images", "public/images/responsive"];
const QUALITY = Number(args.quality ?? 68);
const MIN_FILE = Number(args.min ?? 0);
const FORCE = !!args.force;
const MIN_SAVING = 512;
const MANIFEST = ".image-opt-manifest.json";

const manifestPath = path.join(process.cwd(), MANIFEST);
const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
  : {};

let totalBefore = 0;
let totalAfter = 0;
let changed = 0;
let skipped = 0;

for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue;
  const entries = fs.readdirSync(dir).filter((f) => f.endsWith(".webp"));
  for (const name of entries) {
    const file = path.join(dir, name);
    const key = path.relative(process.cwd(), file).replace(/\\/g, "/");
    const before = fs.statSync(file).size;
    if (before < MIN_FILE) {
      skipped++;
      continue;
    }
    if (!FORCE && manifest[key] === before) {
      skipped++;
      continue;
    }
    try {
      const input = fs.readFileSync(file);
      const buf = await sharp(input)
        .webp({ quality: QUALITY, effort: 6, smartSubsample: true })
        .toBuffer();
      if (before - buf.length > MIN_SAVING && buf.length < before) {
        fs.writeFileSync(file, buf);
        totalBefore += before;
        totalAfter += buf.length;
        changed++;
        console.log(
          `${name}: ${(before / 1024).toFixed(1)} -> ${(buf.length / 1024).toFixed(1)} KiB`
        );
        manifest[key] = buf.length;
      } else {
        manifest[key] = before;
      }
    } catch (err) {
      console.error(`${name}: FAILED ${err.message}`);
      process.exitCode = 1;
    }
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(
  `\nq=${QUALITY} changed=${changed}, skipped=${skipped}, saved=${((totalBefore - totalAfter) / 1024).toFixed(1)} KiB`
);
