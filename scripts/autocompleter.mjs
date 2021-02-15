export default class Autocompleter extends Application {
    constructor(target, mode, options) {
        super(options);

        this.target = target;
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
     * @param {InputEvent} event
     * @private
     */
    _onInputKeydown(event) {
        console.log(`Autocompleter key down`, event); // TODO - remove logging
    }

    /**
     * @param {MouseEvent} event
     * @private
     */
    _onInsertClicked(event) {
        console.log(`Autocompleter insert button clicked`, event); // TODO - remove logging
    }
}
