import chalk from 'chalk';
import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __outputdir = path.dirname(__filename);

// Get react and react-dom version from package.json dependencies.
const raw = fs.readFileSync('./package.json', 'utf-8');
const pkg = JSON.parse(raw);

// Bundle config.
const TARGET = "es2022";
const REACT_VERSION = pkg.dependencies?.react;
const REACT_DOM_VERSION = pkg.dependencies?.['react-dom'];

// Check if react and react-dom is defined in package.json.
if (!REACT_VERSION || !REACT_DOM_VERSION) {
  console.log(chalk.red('→') + ' React or ReactDOM has not been added as dependencies in package.json' + chalk.red(' ✗'));
  console.log('→ Please add them with its required version as dependencies in package.json');
  process.exit(1);
}

// Bundles to download.
const bundles = [
  { name: "react", url: `https://esm.sh/react@${REACT_VERSION}/${TARGET}/react.bundle.mjs` },
  { name: "react-dom", url: `https://esm.sh/react-dom@${REACT_DOM_VERSION}/${TARGET}/react-dom.bundle.mjs` },
  { name: "jsx-runtime", url: `https://esm.sh/react@${REACT_VERSION}/${TARGET}/jsx-runtime.bundle.mjs` },
  { name: "jsx-dev-runtime", url: `https://esm.sh/react@${REACT_VERSION}/${TARGET}/jsx-dev-runtime.bundle.mjs` },
];

// Location to save the files.
if (!fs.existsSync(__outputdir)) {
  fs.mkdirSync(__outputdir, { recursive: true });
}

/**
 * Fetch the esm.sh url.
 *
 * @param {string} url
 * @param {string} outputPath
 * @returns {Promise}
 */
function download(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Handle redirect.
      if (
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        return download(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        return reject(
          new Error(`Failed: ${url} (${response.statusCode})`)
        );
      }

      const file = fs.createWriteStream(outputPath);
      response.pipe(file);

      file.on("finish", () => file.close(resolve));
      file.on("error", reject);
    }).on("error", reject);
  });
}

/**
 * Executes the download function.
 */
async function init() {
  console.log(`Downloading React ${REACT_VERSION} bundles...\n`);

  for (const bundle of bundles) {
    const outputFile = path.join(__outputdir, `${bundle.name}.js`);
    console.log(`→ ${bundle.name} ` + chalk.green("✓"));
    await download(bundle.url, outputFile);
  }

  console.log("\nAll bundles saved to " + __outputdir.replace(process.cwd(), '') + chalk.green(" ✓"));
  console.log("Done!");
}

init().catch((err) => {
  console.error("Download failed:", err.message);
  process.exit(1);
});
