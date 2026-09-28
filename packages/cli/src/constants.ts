import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const FALLBACK_VERSION = "0.5.12";
const FALLBACK_NAME = "ctx7";

function readPackageJson(): { version?: unknown; name?: unknown } {
  // Single-executable (SEA / pkg) builds have no package.json next to the
  // bundle, so the read below throws. Fall back gracefully.
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    return JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf-8"));
  } catch {
    return {};
  }
}

const pkg = readPackageJson();

export const VERSION: string =
  typeof pkg.version === "string" && pkg.version.length > 0
    ? pkg.version
    : (process.env.CONTEXT7_VERSION ?? FALLBACK_VERSION);
export const NAME: string =
  typeof pkg.name === "string" && pkg.name.length > 0 ? pkg.name : FALLBACK_NAME;
export const CLI_CLIENT_ID = "2veBSofhicRBguUT";
