# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.4.0](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/compare/v2.3.3...v2.4.0) (2021-10-02)


### Features

* allow selecting properties with arrow keys ([2481102](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/commit/2481102e6e9151cd7ccab19a501bc6680cec4d95)), closes [#3](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/issues/3)
* use highlighted entry when pressing enter ([194ed13](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/commit/194ed13a09f9a987d8299bae129cb4c93617ec19)), closes [#9](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/issues/9)

### [2.3.3](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/compare/v2.3.2...v2.3.3) (2021-10-01)

### [2.3.2](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/compare/v2.3.1...v2.3.2) (2021-09-01)


### Bug Fixes

* add missing files to release zip ([90b409f](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/commit/90b409f2e1e30bbd9bf914c87998e8344d6f1db8))

### [2.3.1](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/compare/v2.3.0...v2.3.1) (2021-08-31)


### Bug Fixes

* remove the floating "@" button on mouse out ([c82ee5a](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/commit/c82ee5ac3a2dad82de3e10d5f9ef0b0b9d8cbb4d))

## [2.3.0](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/compare/v2.2.0...v2.3.0) (2021-08-21)


### Features

* re-focus text area after inserting ([a7f2553](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/commit/a7f2553817a5f941c36236dff6ab87230ac0f5af))

## 2.2.0 (2021-08-21)


### Features

* add support for effects and unowned items ([71b9b97](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/commit/71b9b97b6abaedd8637a1d626a5600d63857fd8a))
* add support for the ds4 system ([8cb3dee](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/commit/8cb3dee38b6828b7b41f18835394898879ad7b0c))
* allow specifying an `inlinePrefix` for every `dataMode` ([c200bfb](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties/commit/c200bfbcf391d64f3bd849edaf169b7962737ec7))

### 2.1.1 (2021-06-05)


### Bug Fixes

* Fixed an error that would occur on startup because the SW5e config was still referring to the old location of AIP constants
* Fixed an error that would occur on startup because a symbol was used before it had been initialized.

## 2.1.0 (2021-06-05)


### Features

* Added compatibility with SW5e system. (Thanks Cyr-)

## 2.0.0 (2021-06-05)


### ⚠ BREAKING CHANGES

* Moved publicly accessible AIP properties from the global CONST and CONFIG into `game.modules.get("autocomplete-inline-properties").API`.

### Features

* Compatibility with 0.8.x

## 1.2.0 (2021-02-19)


### Features

* Added pf1 support (thank you @MikauScekzen for the contribution!)
* Added support for `<textarea>` tags in addition to text `<input>` tags

## 1.1.0 (2021-02-17)


### Features

* Added several field configuration properties
  * `defaultPath`: sets the default path that will appear in the Autocompleter on initial load for the target field.
  * `DATA_MODE.OWNING_ACTOR_ROLL_DATA`: a new data mode which will get the roll data of the owning actor.
  * `customInlinePrefix`: a prefix that will be inserted in front of the final path in the target field when the Autocompleter is submitted.
  * `filteredKeys`: an array of keys which should not be displayed in the Autocompleter for the target field.

### 1.0.1 (2021-02-17)


### Bug Fixes

* Fix an issue which would cause `customDataGetter`s to not be as useful as they should have been.
* Fix an issue where an error would be thrown in circumstances where a data getter returned null or undefined

## 1.0.0 (2021-02-17)
