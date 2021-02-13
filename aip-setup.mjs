import { SYSTEM_CONFIG } from "./system-config.mjs";
import { Autocompleter, DATA_MODE } from "./scripts/autocompleter.mjs";


Hooks.on("setup", () => {
    CONFIG.debug.aip = true; // TODO - disable debug logging by default;
    console.log("AIP | Setting up Autocomplete Inline Properties");

    const systemId = game.system.id;
    const systemConfig = SYSTEM_CONFIG[systemId];

    if (!systemConfig) {
        ui.notifications.warn(game.i18n.localize("AIP.SystemNotSupported"));
        return;
    }

    for (let sheetClass of systemConfig.sheetClasses) {
        if (CONFIG.debug.aip) console.log(`AIP | Registering hook for "render${sheetClass.name}"`);
        Hooks.on(`render${sheetClass.name}`, (sheet, $element, templateData) => {
            const element = $element[0];
            for (let selector of sheetClass.entityDataFieldSelectors) {
                registerSelector(element, selector, DATA_MODE.ENTITY_DATA);
            }
            for (let selector of sheetClass.rollDataFieldSelectors) {
                registerSelector(element, selector, DATA_MODE.ROLL_DATA);
            }
        });
    }
});

/**
 * @param {Element} sheetElement - the sheet to register the selector for.
 * @param {string} selector
 * @param {DATA_MODE} mode
 */
function registerSelector(sheetElement, selector, mode) {
    if (CONFIG.debug.aip) console.log(`AIP | Registering oninput handler for "${selector}"`);
    const elements = Array.from(sheetElement.querySelectorAll(selector)).filter(e => e.type === "text");
    for (let element of elements) {
        element.oninput = (event) => {
            if (event.inputType === "insertText" && event.data === "@") {
                console.log(event); // TODO - remove debug logging
                Autocompleter.create(element, mode);
            }
        };
    }
}
