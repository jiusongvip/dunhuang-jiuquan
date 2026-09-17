import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.dunhuang-jiuquan.com",
  trailingSlash: "always",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/404"),
      // Bump this date whenever page content actually changes. Google treats
      // lastmod as a recrawl hint, so leaving it stale tells Google the pages
      // have not been touched since that date.
      // 2026-08-07 -> 2026-09-17: GSC-driven content pass across 17 pages
      // (title rewrites, lead-answer paragraphs, visible FAQ blocks).
      lastmod: new Date("2026-09-17"),
    }),
  ],
  output: "static",
  build: {
    inlineStylesheets: "always",
  },
});