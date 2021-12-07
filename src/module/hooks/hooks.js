import { registerForInitHook } from "./init";
import { registerForSetupHook } from "./setup";

export function registerForHooks() {
    registerForInitHook();
    registerForSetupHook();
}
