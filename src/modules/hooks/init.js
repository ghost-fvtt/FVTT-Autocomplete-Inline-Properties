import { MODULE_NAME } from "../const";
import { DATA_GETTERS, DATA_MODE, PACKAGE_CONFIG } from "../package-config";
import { registerSettings } from "../settings";

export function registerForInitHook() {
    Hooks.on("init", init);
}

function init() {
    defineAPI();
    registerSettings();
}

function defineAPI() {
    const api = (game.modules.get(MODULE_NAME).API = {});
    api.CONST = { DATA_MODE, DATA_GETTERS };
    api.PACKAGE_CONFIG = PACKAGE_CONFIG;
}
