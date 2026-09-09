import fs from "node:fs";
import path from "node:path";

const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p);
    else if (p.endsWith(".astro")) files.push(p);
  }
})("src");

const map = new Map();
for (const f of files) {
  const c = fs.readFileSync(f, "utf8");
  for (const m of c.matchAll(/class="([^"{]*)"/g)) {
    const v = m[1].trim();
    if (v.length < 15) continue;
    if (!map.has(v)) map.set(v, { n: 0, len: v.length, files: new Set() });
    const e = map.get(v);
    e.n++;
    e.files.add(f);
  }
}

const rows = [...map.entries()]
  .map(([v, e]) => ({ v, n: e.n, f: e.files.size, save: e.n * (e.len + 8) }))
  .sort((a, b) => b.save - a.save)
  .slice(0, 40);

let total = rows.reduce((s, r) => s + r.save, 0);
for (const r of rows)
  console.log(String(r.save).padStart(7) + "  x" + String(r.n).padStart(3) + " pages:" + r.f + "  " + r.v.slice(0, 95));
console.log("TOTAL potential: " + Math.round(total / 1024) + " KB (raw)");
console.log("files scanned: " + files.length);
