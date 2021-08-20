const stringifyPackage = require("stringify-package");

const githubRepository = "https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties";

module.exports.readVersion = function (contents) {
    return JSON.parse(contents).version;
};

module.exports.writeVersion = function (contents, version) {
    const json = JSON.parse(contents);
    json.version = version;
    json.download = `${githubRepository}/releases/download/${version}/module.json`;
    return stringifyPackage(json);
};
