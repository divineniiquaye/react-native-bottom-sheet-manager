import { registerSheet, SheetDefinition } from "@niibase/bottom-sheet-manager";

import ExampleSheet from "./modals/ExampleSheet";

registerSheet("example-sheet", ExampleSheet);

// We extend some of the types here to give us great intellisense
// across the app for all registered sheets.
declare module "@niibase/bottom-sheet-manager" {
    interface Sheets {
        "example-sheet": SheetDefinition;
    }
}

export {};
