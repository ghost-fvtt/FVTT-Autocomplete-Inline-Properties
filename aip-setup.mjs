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
        const key = sheet.appId + element.name;

        // Create autocompleter summon button
        const button = document.createElement("button");
        button.innerHTML = `<i class="fas fa-at"></i>`;
        button.classList.add("autocompleter-summon");
        button.disabled = element.disabled;
        element.parentNode.insertBefore(button, element);

        // If the user had the target element focused, remember their selection for use later when the Autocompleter inserts new content.
        let selectionStart = null, selectionEnd = null;
        element.addEventListener("blur", function(event) {
            console.log("blur", event);
            if (event.relatedTarget === button) {
                selectionStart = this.selectionStart;
                selectionEnd = this.selectionEnd;
                _activateAutocompleter(event);
            } else {
                selectionStart = null;
                selectionEnd = null;
            }
        });

        element.addEventListener("keydown", function(event) {
            if (event.key === "@") {
                _activateAutocompleter(event);
            }
        });

        // If the user clicks on the autocompleter summoner button, create a new autocompleter,
        // or if an autocompleter already exists, retargets it to the current element.
        button.addEventListener("click", _activateAutocompleter);

        // If an autocompleter already exists with this key (because the target sheet is being re-rendered), re-activate the autocompleter.
        if (_registrations.has(key)) {
            _registrations.get(key).retarget(element);
        }

        // A function which creates a new autocompleter for this element, or if one already exists, retargets it to this element.
        function _activateAutocompleter(event) {
            event?.preventDefault();

            if (_registrations.has(key)) {
                _registrations.get(key).retarget(element);
                return;
            }

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
            _registrations.set(key, autocompleter);
        }
    }
}
