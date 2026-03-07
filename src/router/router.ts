import {
    StackActions,
    StackRouter,
    useNavigation,
    type CommonActions,
    type ParamListBase,
    type Router,
    type StackActionType,
    type StackRouterOptions,
} from "@react-navigation/native";
import { nanoid } from "nanoid/non-secure";

import type { BottomSheetNavigationProp, BottomSheetNavigationState } from "./types";

export type BottomSheetRouterOptions = StackRouterOptions;

export type BottomSheetActionType =
    | StackActionType
    | ReturnType<typeof CommonActions.goBack>
    | {
          type: "SNAP_TO";
          index: number;
          source?: string;
          target?: string;
      }
    | {
          type: "DISMISS";
          source?: string;
          target?: string;
      }
    | {
          type: "REMOVE";
          source?: string;
          target?: string;
      };

export const BottomSheetActions = {
    ...StackActions,
    /**
     * Snap the bottom sheet to a specific index.
     */
    snapTo: (index: number): BottomSheetActionType => ({ type: "SNAP_TO", index }),
    /**
     * Dismiss the current bottom sheet.
     */
    dismiss: (): BottomSheetActionType => ({ type: "DISMISS" }),
    /**
     * Remove the sheet from navigation state after dismiss animation completes.
     */
    remove: (): BottomSheetActionType => ({ type: "REMOVE" }),
};

/**
 * Ensures the base route (first screen) exists in the navigation state.
 * This is important because the first screen is the main content,
 * and subsequent screens are rendered as bottom sheets.
 */
const ensureBaseRoute = <T extends { routes: { name: string }[] }>(
    state: T,
    baseRouteName: string | undefined,
    routeParamList: Record<string, object | undefined> | undefined,
): T & { index: number; routes: T["routes"] } => {
    if (!baseRouteName) {
        return state as T & { index: number; routes: T["routes"] };
    }

    const hasBaseRoute = state.routes.some((r) => r.name === baseRouteName);

    if (!hasBaseRoute) {
        const baseRoute = {
            key: `${baseRouteName}-${nanoid()}`,
            name: baseRouteName,
            params: routeParamList?.[baseRouteName],
        };

        return {
            ...state,
            index: state.routes.length,
            routes: [baseRoute, ...state.routes],
        } as T & { index: number; routes: T["routes"] };
    }

    return state as T & { index: number; routes: T["routes"] };
};

export const BottomSheetRouter = (
    routerOptions: StackRouterOptions,
): Router<
    BottomSheetNavigationState<ParamListBase>,
    BottomSheetActionType
> => {
    const baseRouter = StackRouter(routerOptions) as unknown as Router<
        BottomSheetNavigationState<ParamListBase>,
        BottomSheetActionType
    >;

    return {
        ...baseRouter,
        type: "bottom-sheet",

        getInitialState(options) {
            const state = baseRouter.getInitialState(options);
            const baseRouteName = routerOptions.initialRouteName ?? options.routeNames[0];
            const stateWithBaseRoute = ensureBaseRoute(
                state,
                baseRouteName,
                options.routeParamList,
            );

            return {
                ...stateWithBaseRoute,
                stale: false,
                type: "bottom-sheet",
                key: `bottom-sheet-${nanoid()}`,
            };
        },

        getStateForAction(state, action, options) {
            switch (action.type) {
                case "SNAP_TO": {
                    const routeIndex =
                        action.target === state.key && action.source
                            ? state.routes.findIndex((r) => r.key === action.source)
                            : state.index;

                    return {
                        ...state,
                        routes: state.routes.map((route, i) =>
                            i === routeIndex
                                ? {
                                      ...route,
                                      snapToIndex: action.index,
                                      snapToKey: (route.snapToKey ?? 0) + 1,
                                  }
                                : route,
                        ),
                    };
                }

                case "GO_BACK":
                case "DISMISS": {
                    return this.getStateForAction(state, StackActions.pop(1), options);
                }

                case "POP": {
                    // Only base screen remains - let parent navigator handle it
                    if (state.routes.length <= 1) {
                        return null;
                    }

                    const count =
                        "payload" in action && typeof action.payload?.count === "number"
                            ? action.payload.count
                            : 1;

                    // Calculate how many routes we can actually pop (don't pop base screen)
                    const maxPopCount = state.routes.length - 1;
                    const actualCount = Math.min(count, maxPopCount);

                    // Base screen - let parent navigator handle it
                    if (actualCount <= 0) {
                        return null;
                    }

                    // Target index is the route we want to stay on (land on after pop)
                    // closingIndex is the first route to be dismissed (the one after target)
                    const targetIndex = state.routes.length - 1 - actualCount;
                    const closingIndex = targetIndex + 1;

                    // Mark only the bottom-most route to pop as closing
                    // The sheet's dismiss() will handle dismissing sheets above it first
                    return {
                        ...state,
                        index: closingIndex,
                        routes: state.routes.map((route, i) =>
                            i === closingIndex ? { ...route, closing: true } : route,
                        ),
                    };
                }

                case "POP_TO_TOP": {
                    const popCount = state.routes.length - 1;
                    return this.getStateForAction(
                        state,
                        StackActions.pop(popCount),
                        options,
                    );
                }

                case "REMOVE": {
                    // Actually remove the closing route and all routes above it
                    const routeKey = action.source;
                    const routeIndex = routeKey
                        ? state.routes.findIndex((r) => r.key === routeKey)
                        : state.routes.findIndex((r) => r.closing);

                    if (routeIndex === -1) {
                        return state;
                    }

                    // Remove the route and all routes above it (they were dismissed together)
                    const routes = state.routes.filter((_, i) => i < routeIndex);

                    return {
                        ...state,
                        index: Math.min(state.index, routes.length - 1),
                        routes,
                    };
                }

                default:
                    return baseRouter.getStateForAction(state, action, options);
            }
        },

        getRehydratedState(partialState, { routeNames, routeParamList, routeGetIdList }) {
            if (partialState.stale === false) {
                return partialState;
            }

            const state = baseRouter.getRehydratedState(partialState, {
                routeNames,
                routeParamList,
                routeGetIdList,
            });

            const baseRouteName = routerOptions.initialRouteName ?? routeNames[0];
            const stateWithBaseRoute = ensureBaseRoute(
                state,
                baseRouteName,
                routeParamList,
            );

            return {
                ...stateWithBaseRoute,
                type: "bottom-sheet",
                key: `bottom-sheet-${nanoid()}`,
            };
        },

        actionCreators: BottomSheetActions,
    };
};

/**
 * Hook to access BottomSheet navigation with the snapTo helper.
 *
 * @example
 * ```tsx
 * function MySheet() {
 *   const navigation = useBottomSheetNavigation();
 *
 *   // Snap to a specific index
 *   const handleExpand = () => {
 *     navigation.snapTo(1); // Snap to second index
 *   };
 *
 *   return (
 *     <Button title="Expand" onPress={handleExpand} />
 *   );
 * }
 * ```
 */
export const useBottomSheetNavigation = <
    T extends ParamListBase = ParamListBase,
>(): BottomSheetNavigationProp<T> =>
    useNavigation<BottomSheetNavigationProp<T>>();
