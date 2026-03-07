import type { BottomSheetProps as RNBottomSheetProps } from "@gorhom/bottom-sheet";
import type { WithSpringConfig, WithTimingConfig } from "react-native-reanimated";
import { StatusBarStyle } from "react-native";
import React from "react";

export interface Sheets {}
export type SheetIds = keyof Sheets;
export type SheetID<Id extends SheetIds> = Id | (string & {});

export type SheetPayload<Id extends SheetIds> = Sheets[Id]["payload"];
export type SheetReturnValue<Id extends SheetIds> = Sheets[Id]["returnValue"];
type AnimationConfigs = WithSpringConfig | WithTimingConfig;

export interface SheetProps<Id extends SheetIds = SheetIds> {
    readonly id: SheetID<Id>;
    readonly payload: SheetPayload<Id>;
    readonly context: string;
}

export interface SheetDefinition<Payload = never, ReturnValue = never> {
    payload: Payload;
    returnValue: ReturnValue;
}

/**
 * Defines how sheets behave when a new sheet is opened.
 *
 * - `switch`: Closes current sheet and shows new one. Previous sheet is
 *   restored when new one closes.
 *
 * - `replace`: Closes current sheet and opens new one. Previous sheet is
 *   removed from stack (not restored on close).
 *
 * - `push`: Stacks new sheet on top. Previous sheet remains visible underneath.
 */
export type StackBehavior = "switch" | "replace" | "push";

export type SheetProviderProps = React.PropsWithChildren<{
    context?: string;
    /** @default default */
    statusBar?: StatusBarStyle;
    scaleConfig?: {
        /** Scale factor when sheet is open (default: 0.92) */
        scale?: number;
        /** Vertical translation when sheet is open (default: 5) */
        translateY?: number;
        /** Border radius when sheet is open (default: 24) */
        borderRadius?: number;
        /** Animation config - timing or spring (default: timing with 300ms duration) */
        animation?:
            | { type: "timing"; config?: WithTimingConfig }
            | { type: "spring"; config?: WithSpringConfig };
    };
}>;

export interface BottomSheetInstance<Id extends SheetIds = SheetIds> {
    /**
     * Close the bottom sheet.
     * @param args
     */
    readonly close: (
        ...args: SheetReturnValue<Id> extends never
            ? [
                  options?: {
                      /**
                       * Snap animation configs.
                       */
                      animationConfigs?: AnimationConfigs;
                  },
              ]
            : [
                  options: {
                      /**
                       * Return some data to the caller on closing the `BottomSheet`.
                       */
                      value: SheetReturnValue<Id>;

                      /**
                       * Snap animation configs.
                       */
                      animationConfigs?: AnimationConfigs;
                  },
              ]
    ) => void;

    /**
     * Snap to the maximum provided point from `snapPoints`.
     * @param animationConfigs Snap animation configs.
     */
    readonly expand: (animationConfigs?: AnimationConfigs) => void;

    /**
     * Snap to the minimum provided point from `snapPoints`.
     * @param animationConfigs Snap animation configs.
     */
    readonly collapse: (animationConfigs?: AnimationConfigs) => void;

    /**
     * Snap to one of the provided points from `snapPoints`.
     * @param index Snap point index.
     * @param animationConfigs Snap animation configs.
     */
    readonly snapToIndex: (index: number, animationConfigs?: AnimationConfigs) => void;

    /**
     * Snap to a position out of provided  `snapPoints`.
     * @param position Position in pixel or percentage.
     * @param animationConfigs Snap animation configs.
     */
    readonly snapToPosition: (
        position: string | number,
        animationConfigs?: AnimationConfigs,
    ) => void;
}

export type BottomSheetProps<Id extends SheetIds = SheetIds> = Omit<
    RNBottomSheetProps,
    "children" | "onClose"
> & {
    /**
     * ID of the `BottomSheet`.
     */
    id?: SheetID<Id>;

    /**
     * Content of the `BottomSheet`.
     */
    children: React.ReactNode;

    /**
     * When set to true, `BottomSheet` is closed when the hardware back button is pressed.
     * @default true
     */
    hardwareBackPressToClose?: boolean;

    /**
     * Callback when the sheet closes. Return a value to override the close data
     * forwarded to `SheetManager.show()` callers.
     *
     * @returns Optionally return a new value to pass back to the caller.
     */
    onClose?: (data?: SheetReturnValue<Id>) => SheetReturnValue<Id> | void;

    /**
     * Event called before sheets is visible.
     * @param data Payload of the sheet if any.
     * @type () => void;
     */
    onBeforeShow?: (data?: SheetPayload<Id>) => void;

    /**
     * Can click through the sheet to the underlying view.
     * @default false
     */
    passThrough?: boolean;

    /**
     * Opacity of the sheet's overlay.
     * @default 0.45
     */
    opacity?: number;

    /**
     * Defines the stack behavior when sheets are opened.
     *
     * - `switch`: (default) Dismisses the current sheet before showing the new one.
     * - `replace`: Swaps the current sheet's content with smooth crossfade animation.
     * - `push`: Pushes new sheet on top, creating a navigable stack.
     *
     * @default "switch"
     */
    stackBehavior?: StackBehavior;

    /**
     * Whether the bottom sheet is an iOS 18 modal sheet type of animation.
     * When enabled at snap point 90%, the content behind the sheet scales down and gets a
     * border radius, similar to iOS 18 system sheets.
     * @default false
     */
    iosModalSheetTypeOfAnimation?: boolean;
};
