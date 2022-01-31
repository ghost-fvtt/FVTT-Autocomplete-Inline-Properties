import { defineAPI } from "../api";
import { registerSettings } from "../settings";

export function registerForInitHook() {
    Hooks.on("init", init);
}

function init() {
    defineAPI();
    registerSettings();
}
