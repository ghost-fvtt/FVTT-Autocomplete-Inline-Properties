import Autocompleter from "./scripts/autocompleter.mjs";

// Store active autocompleters in a map, where the key is a stable identifier for the element that the autocompleter is targeting.
const _registrations = new Map();

Hooks.on("setup", () => {
    CONFIG.debug.aip = true; // TODO - disable debug logging by default;
    console.log("AIP | Setting up Autocomplete Inline Properties");

    const packageConfig = CONFIG.AIP.PACKAGE_CONFIG;

    if (!packageConfig.find(pkg => pkg.packageName === game.system.id)) {
        ui.notifications.warn(game.i18n.localize("AIP.SystemNotSupported"));
    }

    for (let pkg of packageConfig) {
        if (pkg.packageName !== game.system.id && !game.modules.get(pkg.packageName)?.active) continue;

        for (let sheetClass of pkg.sheetClasses) {
            if (CONFIG.debug.aip) console.log(`AIP | Registering hook for "render${sheetClass.name}"`);
            Hooks.on(`render${sheetClass.name}`, (sheet, $element, templateData) => {
                const sheetElement = $element[0];
                for (let fieldDef of sheetClass.fieldConfigs) {
                    registerField(sheetElement, fieldDef);
                }
            });
        }
    }
});

/**
 * @param {HTMLElement} applicationElement - the sheet to register the selector for.
 * @param {AIPFieldConfig} fieldConfig
 */
function registerField(applicationElement, fieldConfig) {
    const app = ui.windows[applicationElement.closest(`[data-appid]`).dataset.appid];
    if (!app) return;
    const entity = app.object;

    const elements = Array.from(applicationElement.querySelectorAll(fieldConfig.selector)).filter(e => e.type === "text");
    for (let element of elements) {
        const key = app.appId + element.name;

        let button;
        if (fieldConfig.showButton) {
            // Create autocompleter summon button
            button = document.createElement("button");
            button.innerHTML = `<i class="fas fa-at"></i>`;
            button.classList.add("autocompleter-summon");
            button.disabled = element.disabled;
            element.parentNode.insertBefore(button, element);

            // If the user clicks on the autocompleter summoner button, create a new autocompleter,
            // or if an autocompleter already exists, retargets it to the current element.
            button.addEventListener("click", _activateAutocompleter);
        }

        // If the user had the target element focused, remember their selection for use later when the Autocompleter inserts new content.
        let selectionStart = null, selectionEnd = null;
        element.addEventListener("blur", function(event) {
            console.log("blur", event);
            if (button && event.relatedTarget === button) {
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
            switch (fieldConfig.dataMode) {
                case CONST.AIP.DATA_MODE.ENTITY_DATA:
                    data = entity.data;
                    break;
                case CONST.AIP.DATA_MODE.ROLL_DATA:
                    data = entity.getRollData();
                    break;
                case CONST.AIP.DATA_MODE.CUSTOM:
                    data = fieldConfig.customDataGetter(entity);
                    break;
            }

            const autocompleter = new Autocompleter(data, element, selectionStart, selectionEnd, fieldConfig.dataMode, () => {
                // When this Autocompleter gets closed, clean up the registration for this element.
                _registrations.delete(key);
            }).render(true);
            _registrations.set(key, autocompleter);
        }
    }
}
