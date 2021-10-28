# Autocomplete Inline Properties

[![Checks](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/workflows/Checks/badge.svg)](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/actions)
![Supported Foundry Versions](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https://raw.githubusercontent.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/master/module.json)
![Latest Release Download Count](https://img.shields.io/github/downloads/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/latest/module.zip)
[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fautocomplete-inline-properties&colorB=4aa94a)](https://forge-vtt.com/bazaar#package=autocomplete-inline-properties)
[![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fautocomplete-inline-properties%2Fshield%2Fendorsements)](https://www.foundryvtt-hub.com/package/autocomplete-inline-properties/)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-ghostfvtt-00B9FE?logo=kofi)](https://ko-fi.com/ghostfvtt)


This module adds an autocompletion and hint UI for sheet fields that can accept inline properties or other document data
references, for instance a damage field referencing an ability modifier (e.g. `@abilities.dex.mod`), or an
`ActiveEffect` key (e.g. `data.bonuses.mwak.attack`).

![A video showing usage of Autocomplete Inline Properties to add an inline property to a damage formula field](https://f002.backblazeb2.com/file/cws-images/FVTT-AIP/autocomplete-inline-properties-damage-roll.gif)

![A video showing usage of Autocomplete Inline Properties to add an active effect change key](https://f002.backblazeb2.com/file/cws-images/FVTT-AIP/autocomplete-inline-properties-active-effect.gif)

## Usage

There are two ways to invoke the AIP interface: By pressing the `@` key in a field for which AIP is enabled, or by
clicking on the floating `@` button in the UI.

Both actions will open the AIP interface, which consists of a text box with the data path entered so far and a list of
data keys at the current data path. As you type, matching keys will be underlined, and the first key matching the
currently entered path will be faintly highlighted, indicating it is currently selected. You can adjust the selected key
by using the up and down arrow keys.

Pressing `Tab` will insert the currently selected key into the path text box, and you can continue from there.

Pressing `Enter`, or clicking on the insert button to the right of the path text box will send the currently selected
key to the underlying field in the sheet.

Module and system authors can enable or disable the option to press the `@` hotkey, or the floating `@` button on a
per-field basis.

## Compatibility

This module currently offers built in support for the following systems:
* dnd5e
* pf1
* sw5e
* ds4

Pull requests to support additional systems are more than welcome!

Systems and modules can also add support for their sheets on their own side by inject corresponding configuration into
the AIP configuration using the `aipSetup` hook event. See [CONTRIBUTING.md](CONTRIBUTING.md) for a guide on how to add support for your system or
module.

## License

Licensed under the MIT License (see [LICENSE](LICENSE)).
