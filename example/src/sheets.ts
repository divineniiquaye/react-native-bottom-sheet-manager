import { registerSheet, SheetDefinition } from "@niibase/bottom-sheet-manager";

import ReplaceDemo3Sheet from "./modals/ReplaceDemo3Sheet";
import ReplaceDemo2Sheet from "./modals/ReplaceDemo2Sheet";
import ReplaceDemo1Sheet from "./modals/ReplaceDemo1Sheet";
import SwitchDemo3Sheet from "./modals/SwitchDemo3Sheet";
import SwitchDemo2Sheet from "./modals/SwitchDemo2Sheet";
import SwitchDemo1Sheet from "./modals/SwitchDemo1Sheet";
import PushDemo3Sheet from "./modals/PushDemo3Sheet";
import PushDemo2Sheet from "./modals/PushDemo2Sheet";
import PushDemo1Sheet from "./modals/PushDemo1Sheet";
import IOSModalSheet from "./modals/iOSModalSheet";
import ExampleSheet from "./modals/ExampleSheet";
import TrueSheetBasic from "./modals/truesheet/Basic";
import TrueSheetHeaderFooter from "./modals/truesheet/HeaderFooter";
import TrueSheetSwitch from "./modals/truesheet/Switch";
import TrueSheetPush from "./modals/truesheet/Push";

// Register all sheets with the SheetProvider
registerSheet("example-sheet", ExampleSheet);

// Switch behavior demos (Depth 1, 2, 3)
registerSheet("switch-demo-1", SwitchDemo1Sheet);
registerSheet("switch-demo-2", SwitchDemo2Sheet);
registerSheet("switch-demo-3", SwitchDemo3Sheet);

// Replace behavior demos (Depth 1, 2, 3)
registerSheet("replace-demo-1", ReplaceDemo1Sheet);
registerSheet("replace-demo-2", ReplaceDemo2Sheet);
registerSheet("replace-demo-3", ReplaceDemo3Sheet);

// Push behavior demos (Depth 1, 2, 3)
registerSheet("push-demo-1", PushDemo1Sheet);
registerSheet("push-demo-2", PushDemo2Sheet);
registerSheet("push-demo-3", PushDemo3Sheet);

registerSheet("ios-modal", IOSModalSheet);

// TrueSheet demos
registerSheet("truesheet-basic", TrueSheetBasic);
registerSheet("truesheet-header-footer", TrueSheetHeaderFooter);
registerSheet("truesheet-switch", TrueSheetSwitch);
registerSheet("truesheet-switch-2", TrueSheetSwitch);
registerSheet("truesheet-push", TrueSheetPush);
registerSheet("truesheet-push-2", TrueSheetPush);

// We extend some of the types here to give us great intellisense
// across the app for all registered sheets.
declare module "@niibase/bottom-sheet-manager" {
    interface Sheets {
        "example-sheet": SheetDefinition<undefined, number>;
        // Switch demos
        "switch-demo-1": SheetDefinition;
        "switch-demo-2": SheetDefinition;
        "switch-demo-3": SheetDefinition;
        // Replace demos
        "replace-demo-1": SheetDefinition;
        "replace-demo-2": SheetDefinition;
        "replace-demo-3": SheetDefinition;
        // Push demos
        "push-demo-1": SheetDefinition;
        "push-demo-2": SheetDefinition;
        "push-demo-3": SheetDefinition;
        // Other demos
        "ios-modal": SheetDefinition;
        // TrueSheet demos
        "truesheet-basic": SheetDefinition;
        "truesheet-header-footer": SheetDefinition;
        "truesheet-switch": SheetDefinition;
        "truesheet-switch-2": SheetDefinition;
        "truesheet-push": SheetDefinition;
        "truesheet-push-2": SheetDefinition;
    }
}

export {};
