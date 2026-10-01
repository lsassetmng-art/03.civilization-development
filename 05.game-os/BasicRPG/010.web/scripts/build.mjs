import {
  cp,
  mkdir,
  rm
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = fileURLToPath(new URL(".", import.meta.url));
const WEB_DIR = resolve(SCRIPT_DIR, "..");
const BASIC_RPG_DIR = resolve(WEB_DIR, "..");
const SOURCE_DIR = join(WEB_DIR, "src");
const SHARED_SOURCE = join(
  BASIC_RPG_DIR,
  "020.shared-js",
  "src",
  "m01-builder-foundation.mjs"
);

const output = resolve(
  process.env.GAMEOS_BUILD_OUT ||
  join(WEB_DIR, "dist")
);

await rm(output, {
  recursive: true,
  force: true
});

await mkdir(join(output, "shared"), {
  recursive: true
});

await cp(SOURCE_DIR, output, {
  recursive: true
});

await cp(
  SHARED_SOURCE,
  join(output, "shared", "m01-builder-foundation.mjs")
);

process.stdout.write(`BUILD_OUT=${output}\n`);
