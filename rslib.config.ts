import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";

import { readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ISLANDS_DIR = path.resolve(__dirname, "src", "islands");

async function buildExposes(dir: string): Promise<Record<string, string>> {
  const entries = await readdir(dir, { withFileTypes: true });
  const exposes: Record<string, string> = {};

  for (const ent of entries) {
    const fullPath = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      const subExposes = await buildExposes(fullPath);
      Object.assign(exposes, subExposes);
    } else if (ent.isFile() && /\.(tsx?|jsx?)$/.test(ent.name)) {
      const mfKey = `./${path
        .relative(ISLANDS_DIR, fullPath)
        .replace(/\\/g, "/")
        .replace(/\.(tsx?|jsx?)$/, "")}`;
      const mfVal = `./src/islands/${path.relative(ISLANDS_DIR, fullPath).replace(/\\/g, "/")}`;
      exposes[mfKey] = mfVal;
    }
  }

  return exposes;
}

const exposes = await buildExposes(ISLANDS_DIR);

const reactIslandsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001/mf"
    : process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/mf`
        : ""
      : process.env.VERCEL_ENV === "preview"
        ? process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}/mf`
          : ""
        : "";

export default defineConfig({
  source: {
    entry: {
      index: [],
    },
  },
  lib: [
    {
      format: "mf",
      output: {
        assetPrefix: reactIslandsUrl,
        distPath: {
          root: "./dist/mf",
        },
      },
      plugins: [
        pluginModuleFederation({
          name: "react_islands",
          exposes,
          shared: {
            react: {
              singleton: true,
            },
            "react-dom": {
              singleton: true,
            },
          },
          shareStrategy: "loaded-first",
        }),
      ],
    },
  ],
  output: {
    target: "web",
  },
  server: {
    port: 3001,
  },
  plugins: [pluginReact()],
});
