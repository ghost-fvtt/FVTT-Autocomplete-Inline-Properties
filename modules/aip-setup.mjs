import Autocompleter from "./autocompleter.mjs";
import { MODULE_NAME } from "./const.mjs";
import logger from "./logger.mjs";

/** @type {(Autocompleter|null)} */
let _autocompleter = null;
/** @type {(HTMLButtonElement|null)} */
let _summonerButton = null;

Hooks.on("setup", () => {
    CONFIG.debug.aip = false;
    logger.info("Setting up Autocomplete Inline Properties");

    const packageConfig = game.modules.get(MODULE_NAME).API.PACKAGE_CONFIG;

    if (!packageConfig.find((pkg) => pkg.packageName === game.system.id)) {
        ui.notifications.warn(game.i18n.localize("AIP.SystemNotSupported"));
    }

    for (const pkg of packageConfig) {
        if (pkg.packageName !== game.system.id && !game.modules.get(pkg.packageName)?.active) continue;

        for (const sheetClass of pkg.sheetClasses) {
            logger.debug(`Registering hook for "render${sheetClass.name}"`);
            Hooks.on(`render${sheetClass.name}`, (app, $element) => {
                const sheetElement = $element[0];
                for (const fieldDef of sheetClass.fieldConfigs) {
                    registerField(app, sheetElement, fieldDef);
                }
            });
        }
    }
});

/**
 * Register autocompletion for a field according to the given `fieldConfig`.
 *
 * @param {Application} app            - The `Application` on which the selector should be registered
 * @param {HTMLElement} sheetElement   - The inner HTML of the `Application` on which the selector should be registered
 * @param {AIPFieldConfig} fieldConfig - The configuration object describing the field
 */
function registerField(app, sheetElement, fieldConfig) {
    // Check that we get valid data for the given application. If not, skip adding Autocomplete to this field.
    try {
        const data = Autocompleter.getData(app, fieldConfig);
        if (!data) {
            logger.debug("Specified data for field not found", app, fieldConfig);
            return;
        }
    } catch (e) {
        logger.error("Error registering AIP field", e, app, fieldConfig);
        return;
    }

    const elements = Array.from(sheetElement.querySelectorAll(fieldConfig.selector)).filter(
        (e) => e.tagName === "TEXTAREA" || (e.tagName === "INPUT" && e.type === "text"),
    );
    for (const targetElement of elements) {
        const key = app.appId + targetElement.name;

        if (fieldConfig.showButton && !targetElement.disabled) {
            // Show the summoner button when the user mouses over this field
            targetElement.addEventListener("mouseenter", function () {
                if (!_summonerButton) {
                    // Create button
                    _summonerButton = document.createElement("button");
                    _summonerButton.classList.add("autocompleter-summon");
                    _summonerButton.innerHTML = `<i class="fas fa-at autocompleter-summon-icon"></i>`;

                    document.body.appendChild(_summonerButton);
                }

                // Position button
                const targetElementRect = targetElement.getBoundingClientRect();
                _summonerButton.style.width = targetElementRect.height - 4 + "px";
                _summonerButton.style.height = targetElementRect.height - 4 + "px";
                _summonerButton.style.top = targetElementRect.top + 2 + "px";
                const buttonElementRect = _summonerButton.getBoundingClientRect();
                _summonerButton.style.left = targetElementRect.right - buttonElementRect.height - 4 + "px";
                _summonerButton.firstElementChild.style.fontSize = buttonElementRect.height - 8 + "px";

                _summonerButton.addEventListener("click", function (event) {
                    event.preventDefault();
                    _activateAutocompleter(targetElement, key, fieldConfig, app);
                });
                _summonerButton.addEventListener("mouseout", (event) => {
                    if (
                        !event.relatedTarget?.closest("i.autocompleter-summon-icon") &&
                        !event.relatedTarget?.closest(fieldConfig.selector) &&
                        !event.relatedTarget?.closest("button.autocompleter-summon")
                    ) {
                        _removeSummonerButton();
                    }
                });
            });

            // Destroy the summoner button when the user moves away from this field
            targetElement.addEventListener("mouseout", (event) => {
                if (!event.relatedTarget?.closest("button.autocompleter-summon")) {
                    _removeSummonerButton();
                }
            });

            // Destroy the summoner button when the user starts typing in the target element
            targetElement.addEventListener("input", _removeSummonerButton);

            // Destroy the summoner button when the user scrolls this sheet
            sheetElement.addEventListener("wheel", _removeSummonerButton, { passive: true });
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
 * Removes the summoner button of it currently exists.
 * @private
 */
function _removeSummonerButton() {
    _summonerButton?.remove();
    _summonerButton = null;
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
    const data = Autocompleter.getData(app, fieldConfig);
    _autocompleter = new Autocompleter(data, targetElement, targetKey, fieldConfig, () => {
        // When this Autocompleter gets closed, clean up the registration for this element.
        _autocompleter = null;
    }).render(true);
}
