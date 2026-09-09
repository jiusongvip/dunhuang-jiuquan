import fs from "node:fs";
import path from "node:path";

const patterns = [
  ["mt-1.5 w-1.5 h-1.5 rounded-full bg-mogao-400 flex-shrink-0", "u-dot"],
  ["mt-1 w-5 h-5 rounded-full bg-mogao-100 flex items-center justify-center flex-shrink-0", "u-badge-icon"],
  ["text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mb-6", "u-h2"],
  ["text-mogao-600 hover:text-mogao-700 underline", "u-link"],
  ["flex items-start gap-2", "u-li"],
  ["flex items-start gap-3", "u-li3"],
  ["bg-white rounded-2xl border border-stone-200 p-6", "u-card"],
  ["text-sm text-stone-600 hover:text-mogao-700 transition-colors", "u-nav-link"],
  ["font-semibold text-stone-900", "u-strong"],
  ["w-8 h-8 rounded-full bg-mogao-600 text-white flex items-center justify-center text-xs font-bold", "u-chip-num"],
  ["text-2xl font-display font-semibold text-stone-900 mb-6", "u-h3"],
  ["text-xs text-stone-500 uppercase tracking-wider font-semibold", "u-eyebrow"],
  ["bg-stone-50 rounded-2xl p-6 border border-stone-200", "u-box"],
  ["inline-flex items-center gap-2 px-5 py-3 bg-mogao-700 text-white rounded-xl text-sm font-semibold hover:bg-mogao-800 transition", "u-btn-solid"],
  ["inline-flex items-center gap-2 px-5 py-3 bg-mogao-600 text-white rounded-xl text-sm font-semibold hover:bg-mogao-700 transition-colors", "u-btn-solid2"],
  ["inline-flex items-center gap-2 px-5 py-3 bg-mogao-700 text-white rounded-xl text-sm font-semibold hover:bg-mogao-800 transition-colors border border-mogao-500", "u-btn-solid3"],
  ["inline-flex items-center gap-2 px-5 py-3 bg-stone-200 text-stone-800 rounded-xl text-sm font-semibold hover:bg-stone-300 transition-colors", "u-btn-ghost"],
  ["inline-flex items-center gap-2 mt-5 px-5 py-3 bg-white text-mogao-700 rounded-xl text-sm font-semibold hover:bg-mogao-50 transition-colors", "u-btn-outline2"],
  ["inline-flex items-center gap-2 px-5 py-3 bg-white text-mogao-700 rounded-xl text-sm font-semibold hover:bg-mogao-50 transition-colors", "u-btn-outline"],
  ["w-full h-auto object-cover", "u-img"],
  ["bg-mogao-600 text-white rounded-2xl p-8 text-center reveal", "u-cta-card reveal"],
  ["rounded-full bg-stone-100 px-2.5 py-0.5", "u-pill"],
  ["px-4 py-3 text-stone-500 text-xs", "u-td-note"],
  ["text-2xl font-display font-semibold text-stone-900 mb-6", "u-h3"],
  ["bg-stone-50 rounded-xl p-4 text-center", "u-stat"],
  ["mb-8 rounded-2xl overflow-hidden bg-stone-200", "u-figure"],
  ["mt-1 text-sm text-stone-500 leading-relaxed", "u-p1"],
  ["mt-1 text-sm text-stone-500", "u-p2"],
  ["space-y-1.5 text-sm text-stone-600 ml-11", "u-list-indent"],
  ["text-stone-600 leading-relaxed mb-4", "u-p3"],
  ["mt-2 text-sm text-stone-500 leading-relaxed", "u-p4"],
  ["section-container max-w-3xl", "u-prose-wrap"],
];

const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p);
    else if (p.endsWith(".astro")) files.push(p);
  }
})("src");

let totalReplaced = 0;
const perPattern = new Map(patterns.map(([, cls]) => [cls, 0]));

for (const f of files) {
  let c = fs.readFileSync(f, "utf8");
  const before = c;
  for (const [pat, cls] of patterns) {
    const re = new RegExp(`(?<=class=")([^"]*)`, "g");
    c = c.replace(re, (full, inner) => {
      const idx = inner.indexOf(pat);
      if (idx === -1) return full;
      // must occupy the whole class attr (boundary = quote or space on both sides)
      const beforeOk = idx === 0 || inner[idx - 1] === " ";
      const end = idx + pat.length;
      const afterOk = end === inner.length || inner[end] === " ";
      if (!beforeOk || !afterOk) return full;
      const next = (inner.slice(0, idx) + cls + inner.slice(end)).replace(/ {2,}/g, " ").trim();
      perPattern.set(cls, perPattern.get(cls) + 1);
      return next;
    });
  }
  if (c !== before) {
    fs.writeFileSync(f, c);
    totalReplaced++;
  }
}

console.log("files changed: " + totalReplaced);
for (const [cls, n] of perPattern) console.log(cls.padEnd(16) + " x" + n);
