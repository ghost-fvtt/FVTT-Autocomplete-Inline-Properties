# Contributing

Pull requests are more than welcome! Any provided bug fixes are highly appreciated and PRs that add support for
additional systems will also be accepted.

Unless there is a very specific need, support for sheets from other modules will _not_ be added to AIP. Instead, it is
recommended that those modules add the support on their side by injecting corresponding configuration into the AIP
configuration using the `aipSetup` hook event.

## Adding support for new systems and modules

Adding support for a new system in AIP is quite simple. All that is needed is adding a corresponding entry in the
[`package-config.js`](src/package-config.js) file.

Modules can add their own configuration to the `packageConfig` that is passed as a parameter with the `aipSetup` hook
event.

**⚠️ Note:** The previous way of adding configurations to
`game.modules.get("autocomplete-inline-properties").API.PACKAGE_CONFIG` during the `init` hook event is deprecated and
will be removed in a future version.

The [`package-config.js`](src/package-config.js) file contains detailed documentation that explains the structure
of the AIP configuration. Additionally, the configurations for the already supported systems can serve as examples.

For convenience here is a short overview of the configuration.

### Package Config

The package config is an array of objects where each element represents the configuration for a system or module. Each
entry in this array has a `packageName` property to define the package that the entry belongs to. AIP searches for an
active system or module that matches the `packageName`, and if it doesn't find a match, it simply ignores the
configuration for that entry. Each entry also has an array of sheet class config objects (`sheetClasses`), each of which
corresponds to a foundry sheet `Application`.

### Sheet Class Config

Each sheet class config consists of:
* A `name`, which is the name of the `Application` subclass.
* An array of field config objects (`fieldConfigs`).

By default, sheet classes are _assumed_ to be `FormApplication`s, however with a bit of extra configuration, other
`Application`s can work, too.

### Field Config

This is where the actual configuration happens.
Each field config object consists of the following properties:
 * `selector`: A CSS selector that matches the field(s) that autocompletion should be added to.
 * \[`defaultPath`\] (optional): This path is used as the default content of the path field when the Autocompleter is
   invoked.
 * `showButton`: Whether the floating `@` button should be shown when the user hovers over the field.
 * `allowHotkey`: Whether pressing the `@` key on the keyboard while this field is focused should invoke the
   Autocompleter.
 * \[`filteredKeys`\] (optional): An array of keys that should not be shown in the Autocompleter.
 * `dataMode`: This defines what data is shown in the Autocompleter. The following values are possible:
   | Data Mode                          | Description                                                                                                                                               |
   | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `DATA_MODE.DOCUMENT_DATA`          | The data of the sheet's document.                                                                                                                         |
   | `DATA_MODE.ROLL_DATA`              | The roll data of the sheet's document.                                                                                                                    |
   | `DATA_MODE.OWNING_ACTOR_DATA`      | The data of the sheet's document's owning actor, falling back to the merged data of     dummy actors of all types if the document is not owned.           |
   | `DATA_MODE.OWNING_ACTOR_ROLL_DATA` | The roll data of the sheet's document's owning actor, falling back to the     merged roll data of dummy actors of all types if the document is not owned. |
   | `DATA_MODE.CUSTOM`                 | Custom data as defined by the `customDataGetter`.                                                                                                         |
 * \[`inlinePrefix`\] (optional): If provided, this prefix is inserted in the target field when the Autocompleter is
   submitted. Otherwise, the default for the chosen `dataMode` is used. The defaults are:
   | Data Mode                          | Default Inline Prefix |
   | ---------------------------------- | :-------------------: |
   | `DATA_MODE.DOCUMENT_DATA`          |         `""`          |
   | `DATA_MODE.ROLL_DATA`              |         `"@"`         |
   | `DATA_MODE.OWNING_ACTOR_DATA`      |         `""`          |
   | `DATA_MODE.OWNING_ACTOR_ROLL_DATA` |         `"@"`         |
   | `DATA_MODE.CUSTOM`                 |         `""`          |
 * `customDataGetter`: When `dataMode` is `CUSTOM`, the function provided here is used to get the data to be shown in
   the Autocompleter. When `dataMode` is `CUSTOM`, this field is _required_.
 * \[`customInlinePrefix`\] (optional): Deprecated, use `inlinePrefix` instead.


## API

Autocomplete Inline Properties provides an API that other packages can use to interact with it. The API is available as
soon as the `aipSetup` hook event is fired and can be accessed via

```js
game.modules.get("autocomplete-inline-properties").API
```

The API is defined in [api.js](src/api.js) and currently consists of
| Property               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CONST.DATA_MODE`      | An enum for the available data modes                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `CONST.DATA_GETTERS`   | The data getters provided by AIP                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `PACKAGE_CONFIG`       | The [package config](#package-config)                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `refreshPackageConfig` | A function that allows to refresh the package config for a given application. It takes the application as its first parameter and accepts a package name as an optional second parameter (if given, only the config for that package is considered). Calling this may be necessary if the package config changes and needs to be applied to an already rendered application, or if new elements to which the config applies are added to the application dynamically. |

## Example
### Adding a Package Config
Here is an example of how adding a new package config for a module or system might look like:

```js
Hooks.on("aipSetup", (packageConfig) => {
    const api = game.modules.get("autocomplete-inline-properties").API;
    const DATA_MODE = api.CONST.DATA_MODE;

    // Define the config for our package
    const config = {
        packageName: "my-package",
        sheetClasses: [
            {
                name: "ItemSheet5e", // this _must_ be the class name of the `Application` you want it to apply to
                fieldConfigs: [
                    {
                        selector: `.tab[data-tab="details"] input[type="text"]`, // this targets all text input fields on the "details" tab. Any css selector should work here.
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
    packageConfig.push(config);
});
```

### Refreshing the Package Config for an Application

Here is an example of how refreshing the package config for an application could look like, for example after
dynamically adding additional fields that match the selector of one of the field configs.

```js
/**
 * @param {ActiveEffectConfig} activeEffectConfig
 */
function addAdditionalFields(activeEffectConfig) {
    /* code to add the additional fields to the activeEffectConfig */

    /* ... */

    const { refreshPackageConfig } =  game.modules.get("autocomplete-inline-properties").API;
    refreshPackageConfig(activeEffectConfig); // alternatively, refreshPackageConfig(activeEffectConfig, "my-package");
}
