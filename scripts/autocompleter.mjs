class AIP {
    /** @type {(HTMLInputElement|null)} */
    _activeTargetElement = null;

    /** @type {(HTMLElement|null)} */
    _activeListElement = null;

    /** @type {(Object|null)} */
    _activeData = null;

    /** @type {(String[])} */
    _activePath = [];

    _activeListeners = null;
    _windowClickListener = null;

    constructor() {
    }

    /**
     * Creates a new autocomplete list for a given element with a given data mode
     * @param {HTMLInputElement} element - the input element that this autocomplete list is attached to
     * @param {DATA_MODE} dataMode - whether to use the entity's data or the entity's roll data
     */
    create(element, dataMode) {
        if (CONFIG.debug.aip) console.log("AIP | Creating autocomplete list", dataMode, element);

        // Get the sheet element that contains this input element
        const sheet = element.closest("[data-appid]");
        if (!sheet) {
            throw new Error("The given element does not have a containing Application.");
        }

        // Get the entity that the containing sheet represents
        const entity = ui.windows[sheet.dataset.appid].object;
        if (!entity) {
            throw new Error(`Could not find an entity for Application ${sheet.dataset.appid}`)
        }

        // Get the appropriate data from the entity based upon the provided data mode
        let data;
        switch (dataMode) {
            case DATA_MODE.ENTITY_DATA: data = entity.data; break;
            case DATA_MODE.ROLL_DATA: data = entity.getRollData(); break;
            default: throw new Error(`Unrecognized data mode: ${dataMode}`);
        }

        // If the resulting data does not exist, don't attempt to create an autocomplete list.
        if (!data) {
            return;
        }

        this._create(element, data);
    }

    /**
     * Creates a autocomplete list from the keys in the provided data
     * @param {HTMLInputElement} element
     * @param {Object} data
     * @private
     */
    _create(element, data) {
        console.log(element, data); // TODO - remove debug logging

        this.close();
        this._activeTargetElement = element;
        this._activeData = data;
        this._activeListElement = this._render(element.parentElement, element);
        this._activateListeners(element);
    }

    /**
     * Closes the currently open autocomplete list and reset autocompleter state
     */
    close() {
        this._activeListElement?.remove();
        this._activeListElement = null;
        this._activeData = null;
        this._activePath = [];
        this._deactivateListeners();
        this._activeTargetElement = null;
    }

    /**
     * Renders the autocomplete list given the current autocompleter state
     * @param {HTMLElement} parentElement
     * @param {HTMLInputElement} targetElement
     * @returns {(HTMLElement|null)}
     * @private
     */
    _render(parentElement, targetElement) {
        // Create list element
        const container = AIP._createElement(document.body, "div", "autocompleter");
        const list = AIP._createElement(container, "ol");

        // Get the data at our active path
        const currentData = this._activePath.length ? getProperty(this._activeData, this._activePath.join(".")) : this._activeData;
        if (!currentData) {
            return container;
        }

        // Populate the list with the entries at the active path
        const entries = Object.entries(currentData);
        const valEntries = entries.filter(([key, value]) => typeof value !== "object");
        const objEntries = entries.filter(([key, value]) => typeof value === "object");
        for (let [key, val] of [...valEntries, ...objEntries]) {
            key = (!this._activePath.length ? "@" : ".") + key;
            const el = AIP._createElement(list, "li");
            const label = AIP._createElement(el, "span", "", ["label"]);
            const value = AIP._createElement(el, "span", "", ["value"]);

            if (typeof val === "object") {
                label.innerText = key + ".";
                value.innerText = "{}";
            } else {
                label.innerText = key;
                value.innerText = val.toString();
            }
        }

        // Set list position
        const targetRect = targetElement.getBoundingClientRect();
        if (targetRect.bottom + container.offsetHeight < window.innerHeight) {
            // There is enough space to put the list below the target element
            container.style.top = (targetRect.bottom).toString() + "px";
        } else {
            // There is not enough space to put the list below the target element, flip it to above and reverse list order.
            container.style.top = (targetRect.top - container.offsetHeight).toString() + "px";
            list.style.flexDirection = "column-reverse";
        }

        const caretLocation = Math.min(targetElement.selectionStart, targetElement.selectionEnd);
        const text = targetElement.value.slice(0, caretLocation - 1);
        const textOffset = AIP._getTextWidth(text, targetElement);
        const totalLeftOffset = Math.min(
            (targetRect.left + textOffset),
            (targetRect.left + targetRect.width - container.offsetWidth)
        );
        container.style.left = totalLeftOffset.toString() + "px";

        return container;
    }

    /**
     * Activates listeners on the given element
     * @param {HTMLElement} element
     * @private
     */
    _activateListeners(element) {
        this._activeListeners = {
            blur: this._onFocusLost.bind(this),
            input: this._onInput.bind(this),
        };

        for (let [eventType, fn] of Object.entries(this._activeListeners)) {
            element.addEventListener(eventType, fn);
        }

        this._windowClickListener = (event) => {
            event.stopPropagation();
            if (event.target && [this._activeTargetElement, this._activeListElement].every(el => !event.path.includes(el))) {
                this.close();
            }
        }
        window.addEventListener("mousedown", this._windowClickListener);
    }

    /**
     * Deactivates listeners on the active target element (cleanup)
     * @private
     */
    _deactivateListeners() {
        if (!this._activeListeners) return;

        for (let [eventType, fn] of Object.entries(this._activeListeners)) {
            this._activeTargetElement.removeEventListener(eventType, fn);
        }
        window.removeEventListener("mousedown", this._windowClickListener);

        this._activeListeners = null;
        this._windowClickListener = null;
    }

    /**
     * Handle new text being entered (or deleted) on the active target element
     * @param event
     * @private
     */
    _onInput(event) {
        console.log(event); // TODO - remove debug logging
    }

    /**
     * Handle the active target element losing focus
     * @param event
     * @private
     */
    _onFocusLost(event) {
        if (!event.relatedTarget) return;
        this.close();
    }

    /**
     * Creates a new DOM element with the given tag
     * @param {HTMLElement} parent
     * @param {String} tag
     * @param id
     * @param {String[]} classes
     * @param {Object} attributes
     * @returns {HTMLElement}
     * @private
     */
    static _createElement(parent, tag, id="", classes=[], attributes={}) {
        const element = document.createElement(tag);
        parent.appendChild(element);
        element.id = id;
        element.classList.add(...classes);
        for (let [attr, value] of Object.entries(attributes)) {
            element.setAttribute(attr, value.toString());
        }
        return element;
    }

    /**
     * Gets the approximate width in pixels of the given string when using the style of the given element
     * @param {String} text
     * @param {HTMLElement} element
     * @returns {number}
     * @private
     */
    static _getTextWidth(text, element) {
        const container = document.createElement("div");
        document.body.append(container);
        container.style.cssText = getComputedStyle(element).cssText;
        container.style.visibility = "hidden";
        container.style.position = "fixed";
        container.style.width = "unset";
        container.style.whiteSpace = "nowrap";
        container.innerText = text;
        const result = container.offsetWidth;
        container.remove();
        return result;
    }

}

export const Autocompleter = new AIP();

/** @enum {string} */
export const DATA_MODE = {
    ENTITY_DATA: "entity",
    ROLL_DATA: "roll",
}
