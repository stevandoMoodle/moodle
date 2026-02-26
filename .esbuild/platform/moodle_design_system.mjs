// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Build code for building the react_autoinit code
 *
 * @copyright  2026 Adrian Greeve
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import esbuild from "esbuild";
import chalk from 'chalk';
import fs from 'fs';
import path from "node:path";
import { exec } from 'child_process';
import { promisify } from 'util';

/**
 * Build and bundle the Moodle Design System platform package.
 *
 * Writes the browser-ready ESM bundle to
 * `public/lib/js/platform_bundles/moodle-design-system/0.1.0/index.js`.
 *
 * @returns {Promise<void>}
 */
export async function buildMoodleDesignSystem() {
    const consoleShow = (message, success = true) => {
        if (success) {
            process.stdout.write(`${chalk.green("✓")} ${message}\n`);
        } else {
            process.stdout.write(`${chalk.red("✗")} ${message}\n`);
        }
    }

    console.log('\n' + chalk.green('> Building moodle-design-system...'));

    const projectroot = process.cwd();
    const targetjsfile = path.resolve(projectroot, 'node_modules/@moodlehq/design-system/dist/index.es.js');
    if (!fs.existsSync(targetjsfile)) {
        console.log(chalk.red('✗ Package @moodlehq/design-system has not been installed yet!'));
        console.log(chalk.green('> Installing @moodlehq/design-system package...'));

        const execAsync = promisify(exec);
        async function installPackage(pkg) {
            try {
                const { stdout } = await execAsync(`npm i ${pkg}`);
                console.log(stdout);
            } catch (err) {
                console.error(err);
            }
        }

        await installPackage('@moodlehq/design-system');
    }

    const outputdir = path.resolve(projectroot, 'lib/platform_bundles/moodle-design-system');
    // Node will create if missing otherwise, does nothing.
    fs.mkdirSync(outputdir, { recursive: true });

    // Build the index.js file.
    await esbuild.build({
        entryPoints: [ targetjsfile ],
        bundle: true,
        format: "esm",
        platform: 'browser',
        target: 'es2022',
        outfile: outputdir + '/index.js',
        external: [
            "react",
            "react-dom",
            "react/*",
            "react/cjs/*",
            "react-dom/*",
            "react-dom/cjs/*",
            "react-dom/client",
            "react/jsx-runtime",
            "react/jsx-dev-runtime"
        ],
        minify: true,
        define: {'process.env.NODE_ENV': '"production"'},
    });

    // Build the index.css file.
    const targetcssfile = path.resolve(projectroot, 'node_modules/@moodlehq/design-system/dist/index.css');
    await esbuild.build({
        entryPoints: [targetcssfile], // must be a .css file
        bundle: true,
        outfile: outputdir + '/index.css',
        minify: true,
    });
    consoleShow('Moodle design system build complete!', true)
}
