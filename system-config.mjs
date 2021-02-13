export const SYSTEM_CONFIG = {
    "dnd5e": {
        sheetClasses: [
            {
                name: "ItemSheet5e",
                rollDataFieldSelectors: [
                    `.dnd5e.sheet.item .tab.details .damage-part input[type="text"]`
                ],
                entityDataFieldSelectors: [ ],
            },
        ],
    }
}
