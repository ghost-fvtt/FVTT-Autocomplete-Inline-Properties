import { PACKAGE_CONFIG } from "../package-config";
import { logger } from "../logger";
import { registerFields } from "../field-registration";

export function registerForSetupHook() {
    Hooks.on("setup", setup);
}

function setup() {
    CONFIG.debug.aip = false;
    logger.info("Setting up Autocomplete Inline Properties");

    Hooks.callAll("aipSetup", PACKAGE_CONFIG);
    registerFields(PACKAGE_CONFIG);
    Hooks.callAll("aipReady");
}
