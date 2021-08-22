module.exports = {
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
    },

    env: {
        browser: true,
        es2020: true,
    },

    extends: ["eslint:recommended", "@typhonjs-fvtt/eslint-config-foundry.js/0.8.0", "plugin:prettier/recommended"],

    plugins: [],

    globals: {},

    rules: {
        // Specify any specific ESLint rules.
    },

    overrides: [
        {
            files: ["./*.js"],
            env: {
                node: true,
            },
        },
    ],
};
