import type {
    DefaultNavigatorOptions,
    Descriptor,
    NavigationHelpers,
    NavigationProp,
    NavigationState,
    ParamListBase,
    RouteProp,
    StackActionHelpers,
    StackNavigationState,
    StackRouterOptions,
} from "@react-navigation/native";
import type { BottomSheetModalProps, SNAP_POINT_TYPE } from "@gorhom/bottom-sheet";

/**
 * Bottom-sheet-specific screen options.
 * These only take effect when `presentation: "bottomSheet"`.
 */
export type BottomSheetScreenOptions = Omit<
    BottomSheetModalProps,
    // Remove props that are managed by the navigator
    | "containerHeight"
    | "snapPoints"
    | "gestureEventsHandlersHook"
    | "iosModalSheetTypeOfAnimation"
    | "animatedPosition"
    | "onBeforeShow"
    | "onChange"
    | "onClose"
    | "onDismiss"
    | "onAnimate"
    | "children"
    | "$modal"
    | "waitFor"
    | "simultaneousHandlers"
> & {
    /**
     * Points for the bottom sheet to snap to.
     * Accepts an array of numbers (pixels) or strings (percentages).
     *
     * @example
     * snapPoints={[200, 500]}
     * snapPoints={[200, '50%']}
     * snapPoints={['100%']}
     *
     * @default ['66%']
     */
    snapPoints?: Array<string | number>;

    /**
     * When `true`, tapping on the backdrop will not dismiss the sheet.
     * @default false
     */
    passThrough?: boolean;

    /**
     * Opacity of the backdrop overlay.
     * @default 0.45
     */
    opacity?: number;
};

/**
 * Navigation options for the bottom sheet navigator.
 *
 * The first screen is rendered as the base content.
 * All subsequent screens are rendered as bottom sheets using these options.
 */
export type BottomSheetNavigationOptions = Partial<BottomSheetScreenOptions>;

/**
 * Navigation events emitted by the bottom sheet navigator.
 */
export type BottomSheetNavigationEventMap = {
    /**
     * Event emitted when a sheet is presented.
     */
    sheetPresent: { data: unknown };
    /**
     * Event emitted when a sheet is dismissed.
     */
    sheetDismiss: { data: unknown };
    /**
     * Event emitted when a sheet changes between position/snap points
     */
    sheetOnChange: {
        data: {
            index: number;
            position: number;
            type: SNAP_POINT_TYPE;
        };
    };
    /**
     * Event emitted when a sheet animates between snap points.
     */
    sheetOnAnimate: {
        data: {
            fromIndex: number;
            toIndex: number;
            fromPosition: number;
            toPosition: number;
        };
    };
};

/**
 * Extended route type with bottom sheet specific properties.
 */
export type BottomSheetRoute<ParamList extends ParamListBase = ParamListBase> =
    NavigationState<ParamList>["routes"][number] & {
        /**
         * The snap point index the sheet should animate to.
         */
        snapToIndex?: number | null;
        /**
         * Key to track snap changes for re-rendering.
         */
        snapToKey?: number;
        /**
         * Whether this route is in the process of being closed.
         */
        closing?: boolean;
    };

/**
 * Navigation state type for the bottom sheet navigator.
 *
 * Extends `StackNavigationState` with bottom-sheet-specific route properties
 * and a `"bottom-sheet"` type discriminator.
 */
export type BottomSheetNavigationState<ParamList extends ParamListBase = ParamListBase> =
    Omit<StackNavigationState<ParamList>, "routes" | "type"> & {
        type: "bottom-sheet";
        routes: BottomSheetRoute<ParamList>[];
    };

/**
 * Action helpers available on the navigation object.
 */
export type BottomSheetActionHelpers<ParamList extends ParamListBase> =
    StackActionHelpers<ParamList> & {
        /**
         * Snap the sheet to a specific point.
         * @param index The snap point index to snap to.
         */
        snapTo(index: number): void;

        /**
         * Dismiss the current sheet.
         */
        dismiss(): void;
    };

/**
 * Navigation prop type for screens in the bottom sheet navigator.
 */
export type BottomSheetNavigationProp<
    ParamList extends ParamListBase = ParamListBase,
    RouteName extends keyof ParamList = string,
    NavigatorID extends string | undefined = undefined,
> = NavigationProp<
    ParamList,
    RouteName,
    NavigatorID,
    BottomSheetNavigationState<ParamListBase>,
    BottomSheetNavigationOptions,
    BottomSheetNavigationEventMap
> &
    BottomSheetActionHelpers<ParamList>;

/**
 * Props available to screen components in the bottom sheet navigator.
 */
export type BottomSheetScreenProps<
    ParamList extends ParamListBase,
    RouteName extends keyof ParamList = string,
    NavigatorID extends string | undefined = undefined,
> = {
    navigation: BottomSheetNavigationProp<ParamList, RouteName, NavigatorID>;
    route: RouteProp<ParamList, RouteName>;
};

/**
 * Navigation helpers type for the bottom sheet navigator.
 */
export type BottomSheetNavigationHelpers = NavigationHelpers<
    ParamListBase,
    BottomSheetNavigationEventMap
> &
    BottomSheetActionHelpers<ParamListBase>;

/**
 * Props for the bottom sheet navigator component.
 */
export type BottomSheetNavigatorProps = DefaultNavigatorOptions<
    ParamListBase,
    string | undefined,
    BottomSheetNavigationState<ParamListBase>,
    BottomSheetNavigationOptions,
    BottomSheetNavigationEventMap,
    BottomSheetNavigationProp<ParamListBase>
> &
    StackRouterOptions;

/**
 * Descriptor type for bottom sheet screens.
 */
export type BottomSheetDescriptor = Descriptor<
    BottomSheetNavigationOptions,
    BottomSheetNavigationProp<ParamListBase, string, undefined>,
    RouteProp<ParamListBase>
>;

/**
 * Map of route keys to their descriptors.
 */
export type BottomSheetDescriptorMap = {
    [key: string]: BottomSheetDescriptor;
};

export type BottomSheetModalScreenProps = Omit<BottomSheetModalProps, "onDismiss"> & {
    route: BottomSheetRoute;
    navigation: BottomSheetNavigationHelpers;

    passThrough?: boolean;
    opacity?: number;

    /**
     * Callback when sheet animation changes.
     */
    onSheetAnimate?: (from: number, to: number) => void;
};
