import Autocompleter from "./scripts/autocompleter.mjs";

/** @type {(Autocompleter|null)} */
let _autocompleter = null;
/** @type {(HTMLButtonElement|null)} */
let _summonerButton = null;

Hooks.on("setup", () => {
    CONFIG.debug.aip = false;
    console.log("AIP | Setting up Autocomplete Inline Properties");

    const packageConfig = CONFIG.AIP.PACKAGE_CONFIG;

    if (!packageConfig.find(pkg => pkg.packageName === game.system.id)) {
        ui.notifications.warn(game.i18n.localize("AIP.SystemNotSupported"));
    }

    for (let pkg of packageConfig) {
        if (pkg.packageName !== game.system.id && !game.modules.get(pkg.packageName)?.active) continue;

        for (let sheetClass of pkg.sheetClasses) {
            if (CONFIG.debug.aip) console.log(`AIP | Registering hook for "render${sheetClass.name}"`);
            Hooks.on(`render${sheetClass.name}`, (sheet, $element, _) => {
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

    // Check that we get valid data for the given entity. If not, skip adding Autocomplete to this field.
    try {
        const data = Autocompleter.getEntityData(app, fieldConfig);
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

        if (fieldConfig.showButton && !targetElement.disabled) {
            // Show the summoner button when the user mouses over this field
            targetElement.addEventListener("mouseenter", function() {
                if (!_summonerButton) {
                    // Create button
                    _summonerButton = document.createElement("button");
                    _summonerButton.classList.add("autocompleter-summon");
                    _summonerButton.innerHTML = `<i class="fas fa-at"></i>`;

                    document.body.appendChild(_summonerButton);
                }

                // Position button
                const targetElementRect = targetElement.getBoundingClientRect();
                _summonerButton.style.width = (targetElementRect.height - 4) + "px";
                _summonerButton.style.height = (targetElementRect.height - 4) + "px";
                _summonerButton.style.top = (targetElementRect.top + 2) + "px";
                _summonerButton.style.left = (targetElementRect.right - targetElementRect.height) + "px";
                _summonerButton.firstElementChild.style.fontSize = (targetElementRect.height - 10) + "px";

                _summonerButton.addEventListener("click", function(event) {
                    event.preventDefault();
                    _activateAutocompleter(targetElement, key, fieldConfig, app);
                });
            });

            // Destroy the summoner button when the user moves away from this field
            targetElement.addEventListener("mouseout", function(event) {
                if (!event.relatedTarget?.closest("button.autocompleter-summon")) {
                    _summonerButton?.remove();
                    _summonerButton = null;
                }
            });

            // Destroy the summoner button when the user starts typing in the target element
            targetElement.addEventListener("input", function () {
                _summonerButton?.remove();
                _summonerButton = null;
            })

            // Destroy the summoner button when the user scrolls this sheet
            sheetElement.addEventListener("wheel", function() {
                _summonerButton?.remove();
                _summonerButton = null;
            });
        }

        if (fieldConfig.allowHotkey) {
            // If the user presses the "@" key while the target element is focused, open the Autocompleter
            targetElement.addEventListener("keydown", function (event) {
                if (event.key === "@") {
                    event.preventDefault();
                    _activateAutocompleter(targetElement, key, fieldConfig, app);
                }
            });
        }

        // If an autocompleter already exists with this key (because the target sheet is being re-rendered),
        // retarget the autocompleter to the newly rendered target element.
        if (_autocompleter?.targetKey === key) {
            _autocompleter.retarget(targetElement);
        }
    }
}

/**
 * Creates a new autocompleter, or if one already exists, closes it and creates a new one targeting the provided target element.
 * @param {HTMLInputElement} targetElement
 * @param {string} targetKey
 * @param {AIPFieldConfig} fieldConfig
 * @param {Application} app
 * @private
 */
function _activateAutocompleter(targetElement, targetKey, fieldConfig, app) {
    _autocompleter?.close();

    // Otherwise, create a new autocompleter
    const data = Autocompleter.getEntityData(app, fieldConfig);
    _autocompleter = new Autocompleter(data, targetElement, targetKey, fieldConfig.dataMode, function onClose() {
        // When this Autocompleter gets closed, clean up the registration for this element.
        _autocompleter = null;
    }).render(true);
}
