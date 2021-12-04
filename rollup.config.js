// SPDX-FileCopyrightText: 2021 Johannes Loher
//
// SPDX-License-Identifier: MIT

import copy from "@guanghechen/rollup-plugin-copy";
import sourcemaps from "rollup-plugin-sourcemaps";
import { terser } from "rollup-plugin-terser";

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
            targets: staticFiles.map((file) => ({
                src: `${file}`,
                dest: "dist",
            })),
        }),
    ],
};

export default config;
