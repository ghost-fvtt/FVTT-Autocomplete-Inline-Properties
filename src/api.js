import { MODULE_NAME } from "./const";
import { DATA_MODE, DATA_GETTERS, PACKAGE_CONFIG } from "./package-config";
import { refreshPackageConfig } from "./field-registration";

const API = {
    CONST: {
        DATA_MODE,
        DATA_GETTERS,
    },
    PACKAGE_CONFIG,
    refreshPackageConfig,
};

export function defineAPI() {
    const aip = game.modules.get(MODULE_NAME);
    aip.API = API;
}
