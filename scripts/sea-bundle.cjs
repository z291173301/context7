// Bundle a package entry to a single CJS file for Node SEA packaging.
// Usage: node scripts/sea-bundle.cjs <entry> <outfile> <version>
// (run with cwd = the package directory; <entry>/<outfile> are cwd-relative)
//
// Why a script instead of `esbuild --define:...` on the CLI: PowerShell
// strips the inner quotes of `--define:process.env.X="1.2.3"`, so esbuild
// receives a bare 4.1.1 and fails with "Invalid define value". Calling the
// JS API with JSON.stringify has no quoting issues on any shell.
//
// esbuild is resolved from packages/mcp (a devDependency there), so both the
// mcp and cli builds use the repo-pinned version without extra installs.
const { createRequire } = require("node:module");
const path = require("node:path");

const [entry, outfile, version] = process.argv.slice(2);
if (!entry || !outfile || !version) {
  console.error("usage: node scripts/sea-bundle.cjs <entry> <outfile> <version>");
  process.exit(1);
}

const repoRoot = path.resolve(__dirname, "..");
const req = createRequire(path.join(repoRoot, "packages", "mcp", "package.json"));
const esbuild = req("esbuild");

esbuild.buildSync({
  entryPoints: [entry],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  outfile,
  define: { "process.env.CONTEXT7_VERSION": JSON.stringify(version) },
  logLevel: "info",
});
