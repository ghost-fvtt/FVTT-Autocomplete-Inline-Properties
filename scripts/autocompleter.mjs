export default class Autocompleter extends Application {
    /**
     *
     * @param {object} data
     * @param {HTMLInputElement} target
     * @param {(number|null)} targetSelectionStart
     * @param {(number|null)} targetSelectionEnd
     * @param {CONST.AIP.DATA_MODE} mode
     * @param {function} onClose
     * @param options
     */
    constructor(data, target, targetSelectionStart, targetSelectionEnd, mode, onClose, options) {
        super(options);

        this.targetData = data;
        this.target = target;
        this.targetSelectionStart = targetSelectionStart;
        this.targetSelectionEnd = targetSelectionEnd;
        this.mode = mode;
        switch (this.mode) {
            case CONST.AIP.DATA_MODE.ROLL_DATA: this.keyPrefix = "@"; break;
            case CONST.AIP.DATA_MODE.ENTITY_DATA:
            default:
                this.keyPrefix = ""; break;
        }
        this.onClose = onClose;

        this.rawPath = "";
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["autocompleter"],
            template: "./modules/autocomplete-inline-properties/templates/autocompleter.hbs",
            minWidth: 250,
            height: "auto",
        });
    }

    get inputElement() { return this.element?.[0]?.querySelector("input.aip-input"); }

    get splitPath() { return this.rawPath.split("."); }
    get combinedFullPath() { return this.rawPath; }
    get combinedPath() { return this.splitPath.slice(0, -1).join("."); }

    get _dataAtPath() {
        const path = this.combinedPath;
        const value = path?.length ? getProperty(this.targetData, path) : this.targetData;
        if (value === null || value === undefined) return [];
        return Object.entries(value).map(([key, value]) => ({
                "key": path + (path.length ? "." : "") + key,
                value,
            }));
    }

    /**
     * @param {string} key
     * @param {any} value
     * @returns {{ key: string, value: string }}
     * @private
     */
    static _formatData({ key, value }) {
        let formattedValue;
        switch (typeof value) {
            case "undefined":
                formattedValue = typeof value;
                break
            case "object":
                if (!value) {
                    formattedValue = "null";
                } else {
                    formattedValue = "{}";
                }
                break;
            case "string":
                formattedValue = `"${value}"`;
                break
            default:
                formattedValue = value.toString();
        }
        return { key, value: formattedValue };
    }

    get sortedDataAtPath() {
        return this._dataAtPath
            .sort((a, b) => {
                if (typeof a.value !== "object" && typeof b.value !== "object") return a.key.localeCompare(b.key);
                if (typeof a.value !== "object") return -1;
                if (typeof b.value !== "object") return 1;

                return a.key.localeCompare(b.key);
            });
    }

    get sortedDataAtPathFormatted() {
        return this.sortedDataAtPath.map(Autocompleter._formatData);
    }

    get currentBestMatch() {
        return this.sortedDataAtPath.filter(({ key }) => key.startsWith(this.combinedFullPath))?.[0];
    }

    retarget(newTarget) {
        this.target = newTarget;
        this.render(false);
        this.bringToTop();
    }

    /** @override */
    getData(options = {}) {
        const escapedCombinedPath = "^" + this.combinedFullPath.replace(/\./, "\\.");
        let highlightedEntry = null;
        const dataEntries = this.sortedDataAtPathFormatted
            .map(({ key, value }, index) => {
                const match = key.match(escapedCombinedPath)?.[0];
                if (!match) return { key, value };
                const matchedKey = key.slice(0, match.length);
                const unmatchedKey = key.slice(match.length);

                if (highlightedEntry === null) highlightedEntry = index;

                return {
                    "key": `<span class="match">${matchedKey}</span>${unmatchedKey}`,
                    value,
                }
            });

        highlightedEntry = highlightedEntry ?? 0;
        return {
            keyPrefix: this.keyPrefix,
            path: this.rawPath,
            dataEntries,
            highlightedEntry,
        };
    }

    /** @override */
    activateListeners($html) {
        super.activateListeners($html);
        const html = $html[0];

        const input = html.querySelector(`input.aip-input`);
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);

        input.addEventListener("focusout", (event) => {
            this.close();
        });
        input.addEventListener("input", this._onInputChanged.bind(this));
        input.addEventListener("keydown", this._onInputKeydown.bind(this));

        const insert = html.querySelector(`form.aip-form`);
        insert.addEventListener("submit", this._onSubmit.bind(this));
    }

    /** @override */
    async _render(force = false, options = {}) {
        // Set location to be just above the target
        const targetRect = this.target.getBoundingClientRect();
        mergeObject(this.position, {
            width: targetRect.width,
            left: targetRect.left,
        })
        return super._render(force, options).then(result => {
            this.setPosition({ top: targetRect.top - this.element[0].getBoundingClientRect().height - 5 });
            this.bringToTop();
            return result;
        })
    }

    /** @override */
    async _renderOuter(options) {
        return super._renderOuter(options).then(html => {
            // Remove the header added to normal Application windows
            html[0].querySelector("header.window-header").remove();
            return html;
        });
    }

    /** @override */
    async close(options = {}) {
        this.onClose();
        return super.close(options);
    }

    /**
     * @param {InputEvent} event
     * @private
     */
    _onInputChanged(event) {
        const input = this.inputElement;
        this.rawPath = input.value;
        this.render(false);
    }

    /**
     * @param {KeyboardEvent} event
     * @private
     */
    _onInputKeydown(event) {
        switch (event.key) {
            case "Escape": this.close(); return;
            case "Tab":
                event.preventDefault();
                const bestMatch = this.currentBestMatch;
                if (!bestMatch) {
                    ui.notifications.warn(`The key "${this.combinedFullPath}" does not match any known keys.`);
                    this.rawPath = "";
                } else {
                    const newEntry = bestMatch;
                    this.rawPath = newEntry.key + (typeof newEntry.value === "object" && newEntry.value ? "." : "");
                }
                this.render(false);
                return;
        }
    }

    /**
     * @param {Event} event
     * @private
     */
    async _onSubmit(event) {
        event.preventDefault();
        const oldValue = this.target.value;

        let spliceStart = oldValue.length;
        let spliceEnd = oldValue.length;
        if (Number.isNumeric(this.targetSelectionStart) && Number.isNumeric(this.targetSelectionEnd)) {
            spliceStart = Math.min(this.targetSelectionStart, this.targetSelectionEnd);
            spliceEnd = Math.max(this.targetSelectionStart, this.targetSelectionEnd);
        }

        const preString = oldValue.slice(0, spliceStart);
        const preSpacer = (!preString.length || preString[preString.length - 1] === " ") ? "" : " ";
        const postString = oldValue.slice(spliceEnd);
        const postSpacer = (!postString.length || postString[postString.length - 1] === " ") ? "" : " ";
        const insert = this.inputElement.value;
        this.target.value = preString + preSpacer + this.keyPrefix + insert + postSpacer + postString;

        await this.close();
        this.target.dispatchEvent(new UIEvent("change", { bubbles: true }));
    }
}
