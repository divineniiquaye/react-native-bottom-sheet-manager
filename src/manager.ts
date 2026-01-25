import { RefObject } from "react";

import { BottomSheetInstance, Sheets, StackBehavior } from "./types";
import { providerRegistryStack, sheetsRegistry } from "./provider";
import { eventManager } from "./events";

// Array of all the ids of Sheets currently rendered in the app.
const ids: string[] = [];
const keys: string[] = [];
const refs: { [name: string]: RefObject<BottomSheetInstance> } = {};
const DEFAULT_Z_INDEX = 999;

const makeKey = (id: string, context: string) => `${id}:${context}`;

interface HistoryEntry {
    id: string;
    context: string;
    behavior: StackBehavior;
}

export const PrivateManager = {
    // Stack of sheet history for restoration when sheets are closed
    history: [] as HistoryEntry[],

    context(options?: { context?: string; id?: string }) {
        if (!options) options = {};
        if (!options?.context) {
            // If no context is provided, use the current top-most context
            // to render the sheet.
            for (const context of providerRegistryStack.slice().reverse()) {
                // We only automatically select nested sheet providers.
                if (
                    context.startsWith("$$-auto") &&
                    !context.includes(options?.id as string)
                ) {
                    options.context = context;
                    break;
                }
            }
        }
        return options.context;
    },

    registerRef: (
        id: string,
        context: string,
        instance: RefObject<BottomSheetInstance>,
    ) => {
        const key = makeKey(id, context);
        refs[key] = instance;
        if (!keys.includes(key)) {
            keys.push(key);
        }
    },

    /**
     * Get internal ref of a sheet by the given id.
     *
     * @param id Id of the sheet
     * @param context Context in which the sheet is rendered. Normally this function returns the top most rendered sheet ref automatically.
     */
    get: <SheetId extends keyof Sheets>(
        id: SheetId | (string & {}),
        context?: string,
    ): RefObject<BottomSheetInstance<SheetId>> => {
        if (!context) {
            for (const ctx of providerRegistryStack.slice().reverse()) {
                for (const _id in sheetsRegistry[ctx]) {
                    if (_id === id) {
                        context = ctx;
                        break;
                    }
                }
            }
        }
        return refs[makeKey(id, context!)] as RefObject<BottomSheetInstance<SheetId>>;
    },

    add: (id: string, context: string) => {
        const key = makeKey(id, context);
        if (!ids.includes(key)) {
            ids.push(key);
        }
    },

    remove: (id: string, context: string) => {
        const key = makeKey(id, context);
        const index = ids.indexOf(key);
        if (index > -1) {
            ids.splice(index, 1);
        }
    },

    zIndex: (id: string, context: string = "global"): number => {
        const index = keys.indexOf(makeKey(id, context));
        return index > -1 ? DEFAULT_Z_INDEX + index + 1 : DEFAULT_Z_INDEX;
    },

    stack: () =>
        ids.map((id) => ({
            id: id.split(":")[0],
            context: id.split(":")?.[1] || "global",
        })),

    /**
     * Get the top-most sheet in the stack
     */
    topSheet: () => {
        if (ids.length === 0) return null;
        const topId = ids[ids.length - 1];
        return {
            id: topId.split(":")[0],
            context: topId.split(":")?.[1] || "global",
        };
    },

    /**
     * Check if a sheet is currently visible
     */
    isSheetVisible: (id: string, context?: string): boolean => {
        if (context) {
            return ids.includes(makeKey(id, context));
        }
        return ids.some((key) => key.startsWith(`${id}:`));
    },

    /**
     * Clear all history entries
     */
    clearHistory: () => {
        PrivateManager.history = [];
    },
};

class _SheetManager {
    /**
     * Show the Modal Sheet with an id.
     *
     * @param id id of the Sheet to show
     * @param options
     */
    async show<SheetId extends keyof Sheets>(
        id: SheetId | (string & {}),
        options?: {
            /**
             * Any data to pass to the Sheet. Will be available from the component `props` prop on the modal sheet.
             */
            payload?: Sheets[SheetId]["payload"];

            /**
             * Receive payload from the Sheet when it closes
             */
            onClose?: (data: Sheets[SheetId]["returnValue"] | undefined) => void;

            /**
             * Provide `context` of the `SheetProvider` where you want to show the action sheet.
             */
            context?: string;

            /**
             * Stack behavior for this sheet.
             * - `switch`: (default) Closes current sheet, shows new one
             * - `replace`: Swaps content with crossfade animation
             * - `push`: Stacks new sheet on top of current
             */
            stackBehavior?: StackBehavior;
        },
    ): Promise<Sheets[SheetId]["returnValue"]> {
        return new Promise((resolve) => {
            const currentContext = PrivateManager.context({ ...options, id: id });
            const behavior = options?.stackBehavior ?? "switch";

            const handler = (
                data: unknown,
                context = "global",
                _reopened?: boolean,
                _behavior?: StackBehavior,
            ) => {
                if (context !== "global" && currentContext && currentContext !== context)
                    return;
                options?.onClose?.(data as Sheets[SheetId]["returnValue"]);
                sub?.unsubscribe();
                resolve(data as Sheets[SheetId]["returnValue"]);
            };

            const sub = eventManager.subscribe(`onclose_${id}`, handler);

            // Handle existing sheets based on stack behavior
            const currentStack = PrivateManager.stack();
            if (currentStack.length > 0) {
                currentStack.forEach(({ id: sheetId, context }) => {
                    eventManager.publish(
                        `hide_${sheetId}`,
                        undefined,
                        context,
                        true,
                        behavior,
                    );
                });
            }

            // Check if the sheet is registered with any `SheetProviders`.
            let isRegisteredWithSheetProvider = false;
            for (const ctx in sheetsRegistry) {
                for (const _id in sheetsRegistry[ctx]) {
                    if (_id === id) {
                        isRegisteredWithSheetProvider = true;
                        break;
                    }
                }
                if (isRegisteredWithSheetProvider) break;
            }

            eventManager.publish(
                isRegisteredWithSheetProvider ? `show_wrap_${id}` : `show_${id}`,
                options?.payload,
                currentContext || "global",
                false,
                behavior,
            );
        });
    }

    /**
     * An async hide function. This is useful when you want to show one Sheet after closing another.
     *
     * @param id id of the Sheet to show
     * @param options
     */
    async hide<SheetId extends keyof Sheets>(
        id: SheetId | (string & {}),
        options?: {
            /**
             * Return some data to the caller on closing the Sheet.
             */
            payload?: Sheets[SheetId]["returnValue"];
            /**
             * Provide `context` of the `SheetProvider` to hide the action sheet.
             */
            context?: string;
        },
    ): Promise<Sheets[SheetId]["returnValue"]> {
        const currentContext = PrivateManager.context({
            ...options,
            id: id,
        });

        return new Promise((resolve) => {
            let isRegisteredWithSheetProvider = false;
            // Check if the sheet is registered with any `SheetProviders`
            // and select the nearest context where sheet is registered.

            for (const _id of ids) {
                if (_id === `${id}:${currentContext}`) {
                    isRegisteredWithSheetProvider = true;
                    break;
                }
            }

            const hideHandler = (data: unknown, context = "global") => {
                if (context !== "global" && currentContext && currentContext !== context)
                    return;
                sub?.unsubscribe();
                resolve(data as Sheets[SheetId]["returnValue"]);
            };

            const sub = eventManager.subscribe(`onclose_${id}`, hideHandler);
            eventManager.publish(
                isRegisteredWithSheetProvider ? `hide_wrap_${id}` : `hide_${id}`,
                options?.payload,
                !isRegisteredWithSheetProvider ? "global" : currentContext,
            );
        });
    }

    /**
     * Hide all the opened Sheets.
     *
     * @param id Hide all sheets for the specific id.
     */
    hideAll<SheetId extends keyof Sheets>(id?: SheetId | (string & {})) {
        // Clear history when hiding all sheets
        PrivateManager.clearHistory();

        PrivateManager.stack().forEach(({ id: _id, context }) => {
            if (id && !_id.startsWith(id)) return;
            eventManager.publish(`hide_${_id}`, undefined, context);
        });
    }

    /**
     * Replace the current sheet with a new one using crossfade animation.
     * This is a convenience method for show() with stackBehavior: 'replace'.
     */
    async replace<SheetId extends keyof Sheets>(
        id: SheetId | (string & {}),
        options?: {
            payload?: Sheets[SheetId]["payload"];
            onClose?: (data: Sheets[SheetId]["returnValue"] | undefined) => void;
            context?: string;
        },
    ): Promise<Sheets[SheetId]["returnValue"]> {
        return this.show(id, { ...options, stackBehavior: "replace" });
    }

    /**
     * Push a new sheet on top of the current one, creating a stack.
     * This is a convenience method for show() with stackBehavior: 'push'.
     */
    async push<SheetId extends keyof Sheets>(
        id: SheetId | (string & {}),
        options?: {
            payload?: Sheets[SheetId]["payload"];
            onClose?: (data: Sheets[SheetId]["returnValue"] | undefined) => void;
            context?: string;
        },
    ): Promise<Sheets[SheetId]["returnValue"]> {
        return this.show(id, { ...options, stackBehavior: "push" });
    }

    /**
     * Pop the top sheet from the stack and restore the previous one.
     * Only works when sheets were opened with stackBehavior: 'push'.
     */
    pop(): void {
        const topSheet = PrivateManager.topSheet();
        if (topSheet) {
            eventManager.publish(`hide_${topSheet.id}`, undefined, topSheet.context);
        }
    }

    /**
     * Check if a specific sheet is currently visible.
     */
    isVisible<SheetId extends keyof Sheets>(
        id: SheetId | (string & {}),
        context?: string,
    ): boolean {
        return PrivateManager.isSheetVisible(id, context);
    }
}

/**
 * SheetManager is used to imperatively show/hide any sheet with a unique id prop.
 */
export const SheetManager = new _SheetManager();
