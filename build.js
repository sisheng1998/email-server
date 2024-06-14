import fs from "fs";
import path from "path";
import { build } from "esbuild";

const distFolder = "./dist";

const entryPoints = fs
  .readdirSync(distFolder)
  .filter((file) => file.endsWith(".js"))
  .map((file) => path.join(distFolder, file));

build({
  entryPoints: entryPoints,
  bundle: true,
  minify: true,
  treeShaking: true,
  outfile: "dist/app.cjs",
  platform: "node",
})
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Build completed!");
  });
