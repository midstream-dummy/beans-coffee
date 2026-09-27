import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// The published @midstream/sdk (0.2.2) sends `Authorization: Bearer <GITHUB_TOKEN>`.
// Production expects `Authorization: GitHub <token>` for GitHub-issued credentials
// and answers 403 to the Bearer form, so every scene fails to register. Flip the
// one word until a fixed SDK is published.
const dir = "node_modules/@midstream/sdk/dist";
const before = "const headers = { authorization: `Bearer ${token}` };";
const after = "const headers = { authorization: `GitHub ${token}` };";

let patched = 0;
for (const name of readdirSync(dir)) {
  if (!name.endsWith(".js")) continue;
  const path = join(dir, name);
  const src = readFileSync(path, "utf8");
  if (!src.includes(before)) continue;
  writeFileSync(path, src.replaceAll(before, after));
  patched += 1;
}

console.log(`[patch-sdk] rewrote the auth scheme in ${patched} file(s)`);
if (patched === 0) process.exit(1);
