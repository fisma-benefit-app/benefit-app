import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve(process.cwd(), "dist");
const versionFile = path.join(distDir, "version.json");

const payload = {
  sha: process.env.GITHUB_SHA ?? "",
  ref: process.env.GITHUB_REF ?? "",
  builtAt: new Date().toISOString(),
};

await mkdir(distDir, { recursive: true });
await writeFile(versionFile, JSON.stringify(payload), "utf8");

console.log(`Wrote ${versionFile}: ${payload.sha}`);
