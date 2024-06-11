// This file is used as entry point to load the app in a CommonJS environment
// To fix ERR_REQUIRE_ESM error in Node.js

async function loadApp() {
  await import("./dist/index.js");
}

loadApp();
