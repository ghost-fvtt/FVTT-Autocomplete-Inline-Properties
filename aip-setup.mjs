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
 * @param {HTMLElement} sheetElement - the sheet to register the selector for.
 * @param {AIPFieldConfig} fieldConfig
 */
function registerField(sheetElement, fieldConfig) {
    const app = ui.windows[sheetElement.closest(`[data-appid]`).dataset.appid];
    if (!app) return;
    const entity = app.object;

    // Check that we get valid data for the given entity. If not, skip adding Autocomplete to this field.
    try {
        const data = getData(entity, fieldConfig);
        if (!data) {
            if (CONFIG.debug.aip) console.log("Specified data for field not found", app, fieldConfig);
            return;
        }
    } catch (e) {
        console.error("Error registering AIP field", e, app, fieldConfig);
        return;
    }


    const elements = Array.from(sheetElement.querySelectorAll(fieldConfig.selector)).filter(e => e.type === "text");
    for (let targetElement of elements) {
        const key = app.appId + targetElement.name;

        let button;
        if (fieldConfig.showButton) {
            button = createSummonButton(targetElement);
        }

        // If the user had the target element focused, remember their selection for use later when the Autocompleter inserts new content.
        let selectionStart = null, selectionEnd = null;
        targetElement.addEventListener("blur", function(event) {
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

        // If the user presses the "@" key while the target element is focused, open the Autocompleter
        targetElement.addEventListener("keydown", function(event) {
            if (event.key === "@") {
                _activateAutocompleter(event);
            }
        });

        // If an autocompleter already exists with this key (because the target sheet is being re-rendered), re-activate the autocompleter.
        if (_registrations.has(key)) {
            _registrations.get(key).retarget(targetElement);
        }

        // A function which creates a new autocompleter for this element, or if one already exists, retargets it to this element.
        function _activateAutocompleter(event) {
            event?.preventDefault();

            if (_registrations.has(key)) {
                _registrations.get(key).retarget(targetElement);
                return;
            }

            // Otherwise, create a new autocompleter
            const data = getData(entity, fieldConfig);
            const autocompleter = new Autocompleter(data, targetElement, selectionStart, selectionEnd, fieldConfig.dataMode, () => {
                // When this Autocompleter gets closed, clean up the registration for this element.
                _registrations.delete(key);
            }).render(true);
            _registrations.set(key, autocompleter);
        }
    }
}

function getData(entity, fieldConfig) {
    switch (fieldConfig.dataMode) {
        case CONST.AIP.DATA_MODE.ENTITY_DATA:
            return entity.data;
        case CONST.AIP.DATA_MODE.ROLL_DATA:
            return entity.getRollData();
        case CONST.AIP.DATA_MODE.CUSTOM:
            return fieldConfig.customDataGetter(entity);
        default:
            throw new Error(`Unrecognized data mode "${fieldConfig.dataMode}"`);
    }
}

function createSummonButton(targetElement, _activateAutocompleter) {
    const button = document.createElement("button");
    button.innerHTML = `<i class="fas fa-at"></i>`;
    button.classList.add("autocompleter-summon");
    button.disabled = targetElement.disabled;
    targetElement.parentNode.insertBefore(button, targetElement);

    button.addEventListener("click", _activateAutocompleter);

    return button;
}
