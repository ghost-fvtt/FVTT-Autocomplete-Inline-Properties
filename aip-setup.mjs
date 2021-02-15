import { SYSTEM_CONFIG } from "./system-config.mjs";
import Autocompleter from "./scripts/autocompleter.mjs";

// Store active autocompleters in a map, where the key is a stable identifier for the element that the autocompleter is targeting.
const _registrations = new Map();

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
    const sheet = ui.windows[sheetElement.closest(`[data-appid]`).dataset.appid];
    if (!sheet) return;
    const entity = sheet.object;

    const elements = Array.from(sheetElement.querySelectorAll(selector)).filter(e => e.type === "text");
    for (let element of elements) {
        // Create autocompleter summon button
        const button = document.createElement("button");
        button.innerHTML = `<i class="fas fa-at"></i>`;
        button.classList.add("autocompleter-summon");

        // When the user clicks on the button, if they had
        let selectionStart = null, selectionEnd = null;
        element.addEventListener("blur", function(event) {
            if (event.relatedTarget === button) {
                selectionStart = this.selectionStart;
                selectionEnd = this.selectionEnd;
            } else {
                selectionStart = null;
                selectionEnd = null;
            }
        });

        button.addEventListener("click", function (event) {
            event.preventDefault();

            const key = sheet.appId + element.name;

            if (_registrations.has(key)) {
                // If this sheet is being re-rendered, we will have already registered an Autocompleter for this element.
                // If so, retarget the autocompleter to the correct new element.
                _registrations.get(key).retarget(element);
            } else {
                // Otherwise, create a new autocompleter
                let data = {};
                switch (mode) {
                    case Autocompleter.DATA_MODE.ENTITY_DATA:
                        data = entity.data;
                        break;
                    case Autocompleter.DATA_MODE.ROLL_DATA:
                        data = entity.getRollData();
                        break;
                }

                const autocompleter = new Autocompleter(data, element, selectionStart, selectionEnd, mode, () => {
                    // When this Autocompleter gets closed, clean up the registration for this element.
                    _registrations.delete(key);
                }).render(true);
                _registrations.set(sheet.appId + element.name, autocompleter);
            }
        });

        button.disabled = element.disabled;

        element.parentNode.insertBefore(button, element);
    }
}
