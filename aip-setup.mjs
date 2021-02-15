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
        const button = document.createElement("button");
        button.innerHTML = `<i class="fas fa-at"></i>`;
        button.classList.add("autocompleter-summon");

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
        button.addEventListener("click", function(event) {
            event.preventDefault();
            console.log("Launching autocompleter", event); // TODO - remove logging
            const entity = ui.windows[this.closest("div.app.sheet").dataset.appid]?.object;
            if (!entity) throw new Error("The entity for this sheet does not exist");
            let data = {};
            switch (mode) {
                case Autocompleter.DATA_MODE.ENTITY_DATA: data = entity.data; break;
                case Autocompleter.DATA_MODE.ROLL_DATA: data = entity.getRollData(); break;
            }
            new Autocompleter(data, element, selectionStart, selectionEnd, mode).render(true);
        });

        button.disabled = element.disabled;

        element.parentNode.insertBefore(button, element);
    }
}
