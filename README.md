# Autocomplete Inline Properties

This module adds an autocompletion and hint UI for sheet fields that can accept inline properties or other entity data references,
for instance a damage field referencing an ability modifier (e.g. `@abilities.dex.mod`),
or an Active Effects key (e.g. `data.bonuses.mwak.attack`).

![A video showing usage of Autocomplete Inline Properties to add an inline property to a damage formula field](https://f002.backblazeb2.com/file/cws-images/FVTT-AIP/autocomplete-inline-properties-damage-roll.gif)

![A video showing usage of Autocomplete Inline Properties to add an active effect change key](https://f002.backblazeb2.com/file/cws-images/FVTT-AIP/autocomplete-inline-properties-active-effect.gif)

## Usage

There are two ways to invoke the AIP interface:
by pressing the "@" key in a field for which AIP is enabled, or by clicking on the floating "@" button in the UI.

Both options will open the AIP interface, which presents a textbox with the data path entered so far,
as well as a list of data keys at the current data path.
As you type, matching keys will be underlined, and the first key matching the currently entered path will be faintly highlighted.

Pressing "Tab" will insert the currently highlighted key into the path textbox and you can continue from there.

Pressing "Enter", or clicking on the insert button to the right of the path textbox will send the current path to the underlying field in the sheet.

Module and system authors can enable or disable the option to press the "@" hotkey, or the floating "@" button on a per-field basis.

## Limitations

Currently, AIP will not work for items that are not owned by an actor. It should be possible to resolve this limitation once core 0.8 is released, but for now you'll only be able to use it when the item is on an actor.

## Compatibility

This module currently offers built in support for the dnd5e system, though I am more than willing to accept pull requests to support other systems.
Modules that add their own sheets and fields can add those fields to the AIP configuration as desired.

See [CONTRIBUTING.md](CONTRIBUTING.md) for a guide on how to add support for your system or module. 

## License

Licensed under the GPLv3 License (see [LICENSE](LICENSE)).
