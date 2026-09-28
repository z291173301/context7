"""Post-process an esbuild CJS bundle so it survives Node SEA single-exe packaging.

esbuild rewrites `import.meta` to `var import_meta = {};` (or import_meta2/3..)
in CJS output, which makes `fileURLToPath(import_meta.url)` throw at module
init time (figlet does this unconditionally). Replace every occurrence with a
shim that derives a file URL from the CJS `__filename`:

- during blob generation: points at the bundle file (module init succeeds)
- inside the SEA exe: points at the exe path; optional resource loads (e.g.
  figlet fonts) then fail gracefully at runtime, and callers must try/catch
  (the ctx7 banner already does).

Our own constants.ts reads package.json via import.meta.url inside try/catch,
so the shim is safe there too (read fails -> version fallback).
"""
import re
import sys

PATTERN = re.compile(r"var (import_meta\d*) = \{\};")
REPLACEMENT = r'var \1 = { url: require("url").pathToFileURL(__filename).href };'

path = sys.argv[1]
with open(path, encoding="utf-8") as f:
    src = f.read()
src, count = PATTERN.subn(REPLACEMENT, src)
with open(path, "w", encoding="utf-8") as f:
    f.write(src)
print(f"patched import_meta occurrences: {count}")
