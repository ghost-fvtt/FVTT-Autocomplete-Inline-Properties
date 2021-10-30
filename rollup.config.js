// SPDX-FileCopyrightText: 2021 Johannes Loher
//
// SPDX-License-Identifier: MIT

const copy = require("rollup-plugin-copy");
const sourcemaps = require("rollup-plugin-sourcemaps");
const { terser } = require("rollup-plugin-terser");

const staticFiles = ["styles", "templates", "lang", "module.json"].map((file) => `src/${file}`);

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
    input: "src/modules/aip.js",
    output: {
        dir: "dist/modules",
        format: "es",
        sourcemap: true,
    },
    plugins: [
        sourcemaps(),
        process.env.NODE_ENV === "production" && terser({ ecma: 2020, keep_fnames: true }),
        copy({
            watch: staticFiles,
            targets: staticFiles.map((file) => ({
                src: `${file}`,
                dest: "dist",
            })),
        }),
    ],
};

module.exports = config;
