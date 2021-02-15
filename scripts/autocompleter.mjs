export default class Autocompleter extends Application {
    /**
     *
     * @param {object} data
     * @param {HTMLInputElement} target
     * @param {(number|null)} targetSelectionStart
     * @param {(number|null)} targetSelectionEnd
     * @param {Autocompleter.DATA_MODE} mode
     * @param options
     */
    constructor(data, target, targetSelectionStart, targetSelectionEnd, mode, options) {
        super(options);

        this.targetData = data;
        this.target = target;
        this.targetSelectionStart = targetSelectionStart;
        this.targetSelectionEnd = targetSelectionEnd;
        this.mode = mode;

        this.dataPath = [];
    }

    /** @enum {string} */
    static DATA_MODE = {
        ENTITY_DATA: "entity",
        ROLL_DATA: "roll",
    };

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["autocompleter"],
            template: "./modules/autocomplete-inline-properties/templates/autocompleter.hbs",
            minWidth: 250,
            height: "auto",
        });
    }

    get combinedFullPath() { return this.dataPath.join("."); }
    get combinedPath() { return this.dataPath.slice(0, -1).join("."); }

    get dataAtPath() {
        return this.dataPath?.length ? getProperty(this.targetData, this.combinedPath) : this.targetData;
    }

    get sortedDataAtPath() {
        const path = this.combinedPath;
        const dataAtPath = this.dataAtPath;
        return !dataAtPath ? [] : Object.entries(dataAtPath)
            .sort((a, b) => {
                if (typeof a[1] !== "object") return -1;
                else if (typeof b[1] !== "object") return 1;
                else return a[0].localeCompare(b[0]);
            })
            .map(([key, value]) => ({
                "key": path + key,
                "value": typeof value === "object" ? "{}" : value,
            }));
    }

    /** @override */
    getData(options = {}) {
        let keyPrefix;
        switch (this.mode) {
            case Autocompleter.DATA_MODE.ROLL_DATA: keyPrefix = "@"; break;
            case Autocompleter.DATA_MODE.ENTITY_DATA:
            default:
                keyPrefix = ""; break;
        }

        const dataEntries = this.sortedDataAtPath.reverse();
        return {
            dataEntries,
            keyPrefix,
        };
    }

    /** @override */
    activateListeners($html) {
        super.activateListeners($html);
        const html = $html[0];

        const input = html.querySelector(`input[type="text"]`);
        input.focus();

        // input.addEventListener("blur", () => this.close());
        input.addEventListener("input", this._onInputChanged.bind(this));
        input.addEventListener("keydown", this._onInputKeydown.bind(this));

        const insert = html.querySelector(`button`);
        insert.addEventListener("click", this._onInsertClicked.bind(this));
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

    /**
     * @param {InputEvent} event
     * @private
     */
    _onInputChanged(event) {
        console.log(`Autocompleter input changed`, event); // TODO - remove logging
    }

    /**
     * @param {KeyboardEvent} event
     * @private
     */
    _onInputKeydown(event) {
        console.log(`Autocompleter key down`, event); // TODO - remove logging

        switch (event.key) {
            case "Escape":
                this.close();
                return;
        }
    }

    /**
     * @param {MouseEvent} event
     * @private
     */
    _onInsertClicked(event) {
        console.log(`Autocompleter insert button clicked`, event); // TODO - remove logging

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
        const insert = this.element[0].querySelector("input.aip-input").value;
        this.target.value = preString + preSpacer + insert + postSpacer + postString;
        this.target.dispatchEvent(new UIEvent("change", { bubbles: true }));

        this.close();
    }
}
