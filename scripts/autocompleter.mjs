class AIP {
    /** @type {(HTMLInputElement|null)} */
    _activeTargetElement = null;

    /** @type {(HTMLElement|null)} */
    _activeListElement = null;

    /** @type {(Object|null)} */
    _activeData = null;

    /** @type {(String[])} */
    _activePath = [];

    /** @type {(number|null)} */
    _activeTerm = null;

    _activeListeners = null;
    _windowClickListener = null;

    get _activeDataAtPath() {
        return this._activePath.length ? getProperty(this._activeData, this._activePath.join(".")) : this._activeData ?? {};
    }

    get _activeDataOrderedEntriesAtPath() {
        const entries = Object.entries(this._activeDataAtPath);
        const valEntries = entries.filter(([key, value]) => typeof value !== "object");
        const objEntries = entries.filter(([key, value]) => typeof value === "object");
        return [...valEntries, ...objEntries];
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

        this._activeTargetElement = element;
        this._activeData = data;
        this._activeTerm = this._getCursorTerm()?.termIndex ?? null;
        this._activateListeners(this._activeTargetElement);
        this._createUI();
    }

    /**
     * Creates a autocomplete list from the keys in the provided data
     * @private
     */
    _createUI() {
        this._cleanupUI();
        this._activeListElement = this._render();
    }

    _cleanupUI() {
        this._activeListElement?.remove();
        this._activeListElement = null;
    }

    /**
     * Closes the currently open autocomplete list and reset autocompleter state
     */
    close() {
        this._cleanupUI();
        this._activePath = [];
        this._activeData = null;
        this._activeTerm = null;
        this._deactivateListeners();
        this._activeTargetElement = null;
    }

    /**
     * Renders the autocomplete list according to the current state
     * @returns {(HTMLElement|null)}
     * @private
     */
    _render() {
        const targetElement = this._activeTargetElement;

        // Create list element
        const container = AIP._createElement(document.body, "div", "autocompleter");
        const list = AIP._createElement(container, "ol");

        // Populate the list with the entries at the active path
        for (let [key, val] of this._activeDataOrderedEntriesAtPath) {
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
            keydown: this._onKeyDown.bind(this),
        };

        for (let [eventType, fn] of Object.entries(this._activeListeners)) {
            element.addEventListener(eventType, fn);
        }

        this._windowClickListener = (event) => {
            event.stopPropagation();
            if (event.path.includes(this._activeListElement)) return;
            this.close();
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
     * Gets the index of the symbol the cursor is in, and the index of the cursor within that term
     * @returns {({ terms: string[], cursorTerm: string, termIndex: number, remainder: number }|null)}
     * @private
     */
    _getCursorTerm() {
        const element = this._activeTargetElement;
        if (!element) return null;

        const cursorLocation = Math.min(element.selectionStart, element.selectionEnd);
        const delimiter = "[^a-zA-Z0-9@\\.]";
        const terms = this._activeTargetElement.value.split(new RegExp(`(?=${delimiter})|(?<=${delimiter})`));

        const result = terms.reduce(({ cursorTerm, termIndex, remainder }, nextTerm, idx) => {
            if (termIndex !== null) return { cursorTerm, termIndex, remainder };
            else {
                const nextRemaining = remainder - nextTerm.length;
                if (nextRemaining <= 0) return { cursorTerm: nextTerm, termIndex: idx, remainder };
                else return { cursorTerm, termIndex, remainder: nextRemaining };
            }
        }, { cursorTerm: null,termIndex: null, remainder: cursorLocation });

        return { terms, ...result };
    }

    /**
     * Inserts the first matching entry in place of the active term
     * @private
     */
    _insertBestMatch() {
        const { terms, cursorTerm, termIndex } = this._getCursorTerm() ?? {};

        const splitCursorTerm = cursorTerm.slice(1).split(".");
        const nextStepPartialKey = splitCursorTerm[splitCursorTerm.length - 1];
        const filteredDataEntries = this._activeDataOrderedEntriesAtPath.filter(([key, value]) => key.startsWith(nextStepPartialKey));
        if (!filteredDataEntries.length) return;

        const bestMatch = filteredDataEntries[0];
        const concatenatedPath = this._activePath.join(".");
        terms[termIndex] = "@" + concatenatedPath + (concatenatedPath.length ? "." : "") + bestMatch[0];
        this._activeTargetElement.value = terms.join("");
        if (typeof bestMatch[1] === "object") {
            this._activeTargetElement.value += ".";
            this._activePath.push(bestMatch[0]);
            this._createUI();
        } else {
            this.close();
        }
    }

    /**
     * Handle new text being entered (or deleted) on the active target element
     * @param {InputEvent} event
     * @private
     */
    _onInput(event) {
        // If the term that the cursor is currently in isn't the term we started with, or if it no longer contains an "@", quit
        const { cursorTerm, termIndex } = this._getCursorTerm() ?? {};
        if (termIndex !== this._activeTerm || !cursorTerm.includes("@")) {
            this.close();
        }
    }

    /**
     * Handle the active target element losing focus
     * @param {FocusEvent} event
     * @private
     */
    _onFocusLost(event) {
        if (!event.relatedTarget) return;
        this.close();
    }

    _onKeyDown(event) {
        console.log(event);

        switch (event.key) {
            case "Tab":
            case "Enter":
                this._insertBestMatch();
                break;
            case "Escape":
                this.close();
                break;
            default: return;
        }

        event.preventDefault();
        event.stopPropagation();
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
