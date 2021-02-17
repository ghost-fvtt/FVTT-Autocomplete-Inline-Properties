CONST.AIP = {
    /**
     * @enum {string}
     * Determines which data should be provided to the Autocompleter
     */
    DATA_MODE: {
        // The data of the sheet's entity
        ENTITY_DATA: "entity",
        // The roll data of the sheet's entity
        ROLL_DATA: "roll",
        // The data of the sheet's entity's owning actor
        OWNING_ACTOR_DATA: "owning-actor",
        // Custom data as defined by the `customDataGetter`
        CUSTOM: "custom",
    },
}

/**
 * @typedef {Object} AIPPackageConfig
 * A configuration object describing the sheet classes that AIP should be applied to for this package
 *
 * @property {string} packageName - the name of the package that this AIP config belongs to.
 * @property {AIPSheetClassConfig[]} sheetClasses - an array of sheet class configs registered by this package.
 */

/**
 * @typedef {Object} AIPSheetClassConfig
 * A configuration object describing a specific sheet class and which fields within that sheet should have AIP applied
 *
 * @property {string} name - the name of the sheet class
 * @property {AIPFieldConfig[]} fieldConfigs - the fields within this sheet that should have AIP applied
 */

/**
 * @typedef {Object} AIPFieldConfig
 * A configuration object describing a field to which AIP should be applied
 *
 * @property {string} selector - the selector string that should be used to find this field within the containing sheet
 * @property {boolean} showButton - whether the AIP "@" button should be shown for this field.
 * @property {boolean} allowHotkey - whether pressing the "@" key on the keyboard should activate the Autocompleter for this field.
 * @property {CONST.AIP.DATA_MODE} dataMode - determines what data is provided to the Autocompleter for this field.
 * @property {(function(Entity): object|undefined)} customDataGetter - if `dataMode` is `CUSTOM`, this function will be called
 *     to produce the data for the Autocompleter.
 */

CONFIG.AIP = {
    /** @type {AIPPackageConfig[]} */
    PACKAGE_CONFIG: [
        {
            packageName: "dnd5e",
            sheetClasses: [
                {
                    name: "ItemSheet5e",
                    fieldConfigs: [
                        { selector: `.sheet.item .tab.details input[type="text"][name="data.attackBonus"]`, showButton: true, allowHotkey: true, dataMode: CONST.AIP.DATA_MODE.ROLL_DATA },
                        { selector: `.sheet.item .tab.details input[type="text"][name^="data.damage"]`, showButton: true, allowHotkey: true, dataMode: CONST.AIP.DATA_MODE.ROLL_DATA },
                        { selector: `.sheet.item .tab.details input[type="text"][name="data.formula"]`, showButton: true, allowHotkey: true, dataMode: CONST.AIP.DATA_MODE.ROLL_DATA },
                    ],
                },
                {
                    name: "ActiveEffectConfig",
                    fieldConfigs: [
                        { selector: `.sheet.active-effect-sheet .tab[data-tab="effects"] .key input[type="text"]`, showButton: true, allowHotkey: true, dataMode: CONST.AIP.DATA_MODE.OWNING_ACTOR_DATA },
                    ]
                }
            ],
        }
    ]
}
