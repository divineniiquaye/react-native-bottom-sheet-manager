import type {
    DefaultNavigatorOptions,
    Descriptor,
    NavigationHelpers,
    NavigationProp,
    NavigationState,
    ParamListBase,
    RouteProp,
    StackActionHelpers,
} from "@react-navigation/native";
import type { BottomSheetModalProps } from "@gorhom/bottom-sheet";

/**
 * Navigation events emitted by the bottom sheet navigator.
 */
export type BottomSheetNavigationEventMap = {
    /**
     * Event emitted when a sheet is presented.
     */
    sheetPresent: { data: undefined };
    /**
     * Event emitted when a sheet is dismissed.
     */
    sheetDismiss: { data: undefined };
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
 */
export type BottomSheetNavigationState<ParamList extends ParamListBase> = Omit<
    NavigationState<ParamList>,
    "routes" | "type"
> & {
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
    ParamList extends ParamListBase,
    RouteName extends keyof ParamList = string,
    NavigatorID extends string | undefined = undefined,
> = NavigationProp<
    ParamList,
    RouteName,
    NavigatorID,
    BottomSheetNavigationState<ParamList>,
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
 * Configuration options for the bottom sheet navigator.
 */
export type BottomSheetNavigationConfig = {
    /**
     * Whether to detach inactive sheets from the view hierarchy.
     * @default false
     */
    detachInactiveScreens?: boolean;
};

/**
 * Screen options available for bottom sheet screens.
 */
export type BottomSheetNavigationOptions = Omit<
    BottomSheetModalProps,
    // Remove props that are managed by the navigator
    | "containerHeight"
    | "snapPoints"
    | "gestureEventsHandlersHook"
    | "animatedPosition"
    | "onChange"
    | "onClose"
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
    clickThrough?: boolean;

    /**
     * Whether the bottom sheet is an iOS 18 modal sheet type of animation.
     * When enabled at snap point 90%, the content behind the sheet scales down and gets a
     * border radius, similar to iOS 18 system sheets.
     * @default false
     */
    iosModalSheetTypeOfAnimation?: boolean;

    /**
     * Opacity of the backdrop overlay.
     * @default 0.45
     */
    opacity?: number;
};

export type BottomSheetModalScreenProps = Omit<BottomSheetModalProps, "onDismiss"> & {
    route: BottomSheetRoute;
    navigation: BottomSheetNavigationHelpers;

    clickThrough?: boolean;
    opacity?: number;

    /**
     * Callback when sheet animation changes.
     */
    onSheetAnimate?: (from: number, to: number) => void;
};

/**
 * Props for the bottom sheet navigator component.
 */
export type BottomSheetNavigatorProps = DefaultNavigatorOptions<
    ParamListBase,
    undefined, // or your ID if you want a named ID, e.g. 'BottomSheetNavigator'
    BottomSheetNavigationState<ParamListBase>,
    BottomSheetNavigationOptions,
    BottomSheetNavigationEventMap,
    BottomSheetNavigationHelpers
> &
    BottomSheetNavigationConfig;

/**
 * Descriptor type for bottom sheet screens.
 */
export type BottomSheetDescriptor = Descriptor<
    BottomSheetNavigationOptions,
    BottomSheetNavigationProp<ParamListBase>,
    RouteProp<ParamListBase>
>;

/**
 * Map of route keys to their descriptors.
 */
export type BottomSheetDescriptorMap = {
    [key: string]: BottomSheetDescriptor;
};
