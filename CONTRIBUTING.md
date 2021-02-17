# Contributing

Pull requests are welcome! I appreciate any bugfixes you can provide, and I am also very willing to accept support for new systems in the module.
Note that I would prefer not to add explicit support for modules within AIP.
Other modules can, however, add their own configuration at runtime in the `init` hook if they wish.

## Adding support for new systems or modules

Adding support for a new system is relatively simple, and happens in the
[`package-config.mjs`](https://github.com/schultzcole/FVTT-Autocomplete-Inline-Properties/blob/master/package-config.mjs) file.
Modules can add their own configuration to `CONFIG.AIP.PACKAGE_CONFIG` in the `init` hook.
There are some documentation comments in that file with an explanation of the structure that AIP expects for its configuration,
and the dnd5e system can also serve as an example,
however I'll also briefly cover it here.

### Package Config

Each package (system or module) that wants to specify fields for autocompletion support gets an entry in the `CONFIG.AIP.PACKAGE_CONFIG` array.
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
 - `showButton`: whether the "@" ui button should be shown when the user hovers over this field.
 - `allowHotkey`: whether pressing the "@" key on the keyboard while this field is focused should open the Autocompleter interface.
 - `dataMode`: this defines what data is shown in the Autocompleter interface. This can take the following values:
   - `CONST.AIP.DATA_MODE.ENTITY_DATA`: The data of the sheet's entity
   - `CONST.AIP.DATA_MODE.ROLL_DATA`: The roll data of the sheet's entity
   - `CONST.AIP.DATA_MODE.OWNING_ACTOR_DATA`: The data of the sheet's entity's owning actor
   - `CONST.AIP.DATA_MODE.CUSTOM`: Custom data as defined by the `customDataGetter`
 - [`customDataGetter`]: (optional) when `dataMode` is `CUSTOM`, the function provided here will be used to get the data to be shown in the Autocompleter interface.
