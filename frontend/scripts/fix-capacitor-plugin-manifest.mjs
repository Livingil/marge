import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifestPath = path.resolve(__dirname, "../android/app/src/main/assets/capacitor.plugins.json");
const monetizationPlugin = {
  pkg: "ru.marge.game",
  classpath: "ru.marge.game.MonetizationBridgePlugin"
};

const sortPlugins = (plugins) =>
  [...plugins].sort((left, right) => left.classpath.localeCompare(right.classpath));

const applyManifestPatch = async () => {
  const rawManifest = await readFile(manifestPath, "utf8");
  const plugins = JSON.parse(rawManifest);

  if (!Array.isArray(plugins)) {
    throw new Error("capacitor.plugins.json must contain an array");
  }

  const hasMonetizationPlugin = plugins.some((plugin) => plugin?.classpath === monetizationPlugin.classpath);
  const nextPlugins = hasMonetizationPlugin ? sortPlugins(plugins) : sortPlugins([...plugins, monetizationPlugin]);

  await writeFile(manifestPath, `${JSON.stringify(nextPlugins, null, 2)}\n`, "utf8");
};

await applyManifestPatch();
