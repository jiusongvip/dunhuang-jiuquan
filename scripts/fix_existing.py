"""Remove duplicate nav and footer from existing pages (now in BaseLayout)"""
import re

files_to_fix = [
    "src/pages/index.astro",
    "src/pages/mogao-caves.astro",
    "src/pages/dunhuang-vs-jiuquan.astro",
]

for filepath in files_to_fix:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original_len = len(content)

    # Remove inline nav blocks
    content = re.sub(r"  <nav class=.+?</nav>\n", "", content, count=1, flags=re.DOTALL)

    # Remove inline footer block (index only)
    content = re.sub(r"  <footer class=.+?(?=\n</BaseLayout>)", "", content, count=1, flags=re.DOTALL)

    # Add SectionHeader import if not present
    if "SectionHeader" not in content and "import BaseLayout" in content:
        content = content.replace(
            'import BaseLayout from "../layouts/BaseLayout.astro";',
            'import BaseLayout from "../layouts/BaseLayout.astro";\nimport SectionHeader from "../components/SectionHeader.astro";'
        )

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"{filepath}: {original_len} -> {len(content)} bytes")

print("Done fixing existing pages")
