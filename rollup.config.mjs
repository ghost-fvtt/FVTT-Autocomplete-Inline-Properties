// SPDX-FileCopyrightText: 2021 Johannes Loher
//
// SPDX-License-Identifier: MIT

import copy from "@guanghechen/rollup-plugin-copy";
import terser from "@rollup/plugin-terser";

import { distDirectory, entryPointName, sourceDirectory } from "./tools/const.mjs";

const staticFiles = [
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "lang",
    "LICENSE",
    "module.json",
    "README.md",
    "styles",
    "templates",
];
const isProduction = process.env.NODE_ENV === "production";

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
    input: { [`${entryPointName}`]: `${sourceDirectory}/${entryPointName}.js` },
    output: {
        dir: distDirectory,
        format: "es",
        sourcemap: true,
    },
    plugins: [
        copy({
            targets: [{ src: staticFiles, dest: distDirectory }],
        }),
        isProduction && terser({ ecma: 2020, keep_fnames: true }),
    ],
};

export default config;
