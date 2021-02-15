import { SYSTEM_CONFIG } from "./system-config.mjs";
import Autocompleter from "./scripts/autocompleter.mjs";


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
                registerSelector(element, selector, Autocompleter.DATA_MODE.ENTITY_DATA);
            }
            for (let selector of sheetClass.rollDataFieldSelectors) {
                registerSelector(element, selector, Autocompleter.DATA_MODE.ROLL_DATA);
            }
        });
    }
});

/**
 * @param {HTMLElement} sheetElement - the sheet to register the selector for.
 * @param {string} selector
 * @param {Autocompleter.DATA_MODE} mode
 */
function registerSelector(sheetElement, selector, mode) {
    if (CONFIG.debug.aip) console.log(`AIP | Registering oninput handler for "${selector}"`);
    const elements = Array.from(sheetElement.querySelectorAll(selector)).filter(e => e.type === "text");
    for (let element of elements) {
        let elementAutocompleter = null;
        const button = document.createElement("button");
        button.innerHTML = `<i class="fas fa-at"></i>`;
        button.classList.add("autocompleter-summon");
        button.addEventListener("click", (event) => {
            console.log("Launching autocompleter", event); // TODO - remove logging

            if (!elementAutocompleter) elementAutocompleter = new Autocompleter(element);
            elementAutocompleter.render(true);
        });

        button.disabled = element.disabled;

        element.parentNode.insertBefore(button, element.nextSibling);
    }
}
