import { existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

const unsupportedConfigPath = resolve(process.cwd(), "next.config.ts");

if (existsSync(unsupportedConfigPath)) {
  unlinkSync(unsupportedConfigPath);
  console.warn("[config-fix] Removed unsupported next.config.ts. Use next.config.mjs instead.");
}
