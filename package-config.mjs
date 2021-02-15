CONFIG.AIP = {
    PACKAGE_CONFIG: [
        {
            packageName: "dnd5e",
            sheetClasses: [
                {
                    name: "ItemSheet5e",
                    rollDataFieldSelectors: [
                        `.sheet.item .tab.details input[type="text"][name^="data.damage"]`,
                        `.sheet.item .tab.details input[type="text"][name="data.formula"]`,
                    ],
                    entityDataFieldSelectors: [],
                },
            ],
        }
    ]
}
