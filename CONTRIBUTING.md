# Contributing

Pull requests are welcome! I appreciate any bugfixes you can provide, and I am also very willing to accept support for new systems in this module.
Note that I would prefer not to add explicit support for other modules within AIP.
Other modules can, however, add their own configuration at runtime in the `init` hook if they wish.

## Adding support for new systems or modules

Adding support for a new system is relatively simple, and happens in the
[`package-config.mjs`](https://github.com/schultzcole/FVTT-Autocomplete-Inline-Properties/blob/master/package-config.mjs) file.
Modules can add their own configuration to `game.modules.get("autocomplete-inline-properties").API.PACKAGE_CONFIG` in the `init` hook.
There are some documentation comments in that file with an explanation of the structure that AIP expects for its configuration,
and the dnd5e system can also serve as an example,
however I'll also briefly cover it here.

### Package Config

Each package (system or module) that wants to specify fields for autocompletion support gets an entry in the `game.modules.get("autocomplete-inline-properties").API.PACKAGE_CONFIG` array.
Each entry in this array has a `packageName` property to define the package that the entry belongs to.
AIP will search for an active system or module that matches the `packageName`, and if it doesn't find a match, it will not use the configuration for that package.
Each entry also has an array of sheet configuration objects, each of which corresponds with a foundry sheet `Application`

### Sheet Class Config

Each sheet class defines the following: A `name`, which is the name of the `Application` subclass, and an array of field configs.
Sheet classes are *assumed* to be `FormApplications`, however with a bit of extra configuration, other `Application`s can work as well.

### Field Config

This is where the actual configuration happens.
Each field config *must* define the following:
 - `selector`: a css selector that matches the field(s) you want to add autocompletion to.
 - \[`defaultPath`\]: (optional) this path will be used as the default contents of the path field when the Autocompleter is first created.
 - `showButton`: whether the "@" ui button should be shown when the user hovers over this field.
 - `allowHotkey`: whether pressing the "@" key on the keyboard while this field is focused should open the Autocompleter interface.
 - \[`filteredKeys`\]: (optional) an array of keys that should not be shown in the Autocompleter.
 - `dataMode`: this defines what data is shown in the Autocompleter interface. This can take the following values:
   - `DATA_MODE.ENTITY_DATA`: The data of the sheet's entity
   - `DATA_MODE.ROLL_DATA`: The roll data of the sheet's entity
   - `DATA_MODE.OWNING_ACTOR_DATA`: The data of the sheet's entity's owning actor, falling back to the merged data of dummy actors of all types if the entity is not owned
   - `DATA_MODE.OWNING_ACTOR_ROLL_DATA`: The roll data of the sheet's entity's owning actor, falling back to the merged roll data of dummy actors of all types if the entity is not owned
   - `DATA_MODE.CUSTOM`: Custom data as defined by the `customDataGetter`
- \[`inlinePrefix`\]: (optional) if provided, this prefix will be inserted in the target field when the Autocompleter is submitted. Otherwise, the default for the chosen `dataMode` is used.
 - `customDataGetter`: when `dataMode` is `CUSTOM`, the function provided here will be used to get the data to be shown in the Autocompleter interface.
    When `dataMode` is `CUSTOM`, this field is *required*.
- \[`customInlinePrefix`\]: (optional) deprecated, use `inlinePrefix` instead.

## Example

Here's an example of how you might add a new package config for a module or system (assuming you don't create a PR for it to be included in AIP directly):

```js
Hooks.on("init", () => {
    const api = game.modules.get("autocomplete-inline-properties").API;
    const DATA_MODE = api.CONST.DATA_MODE;
    
    // Define the config for our package
    const config = {
        packageName: "my-package",
        sheetClasses: [
            {
                name: "ItemSheet5e", // this *must* be the class name of the `Application` you want it to apply to
                fieldConfigs: [
                    {
                        selector: `.tab[data-tab="details"] input[type="text"]`, // this will target all text input fields on the "details" tab. Any css selector should work here.
                        showButton: true,
                        allowHotkey: true,
                        dataMode: DATA_MODE.ROLL_DATA,
                    },
                    // Add more field configs if necessary
                ]
            },
            // Add more sheet classes if necessary
        ]
    };
    
    // Add our config
    api.PACKAGE_CONFIG.push(config);
});
```
