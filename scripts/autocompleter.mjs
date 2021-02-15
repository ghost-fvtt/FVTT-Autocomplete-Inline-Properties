export default class Autocompleter extends Application {
    /**
     *
     * @param {HTMLInputElement} target
     * @param {(number|null)} targetSelectionStart
     * @param {(number|null)} targetSelectionEnd
     * @param {Autocompleter.DATA_MODE} mode
     * @param options
     */
    constructor(target, targetSelectionStart, targetSelectionEnd, mode, options) {
        super(options);

        this.target = target;
        this.targetSelectionStart = targetSelectionStart;
        this.targetSelectionEnd = targetSelectionEnd;
        this.mode = mode;
    }

    /** @enum {string} */
    static DATA_MODE = {
        ENTITY_DATA: "entity",
        ROLL_DATA: "roll",
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: [ "autocompleter" ],
            template: "./modules/autocomplete-inline-properties/templates/autocompleter.hbs",
            width: 250,
            height: "auto",
        });
    }

    /** @override */
    activateListeners($html) {
        super.activateListeners($html);
        const html = $html[0];

        const input = html.querySelector(`input[type="text"]`)
        input.focus();

        // input.addEventListener("blur", () => this.close());
        input.addEventListener("input", this._onInputChanged.bind(this));
        input.addEventListener("keydown", this._onInputKeydown.bind(this));

        const insert = html.querySelector(`button`);
        insert.addEventListener("click", this._onInsertClicked.bind(this));
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
            case "Escape": this.close(); return;
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
