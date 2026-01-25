import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StatusBar } from "react-native";
import React from "react";

import { BottomSheetInstance, SheetPayload, Sheets, StackBehavior } from "./types";
import { eventManager } from "./events";

export const providerRegistryStack: string[] = [];

/**
 * An object that holds all the sheet components against their ids.
 */
export const sheetsRegistry: {
  [context: string]: { [id: string]: React.ElementType };
} = {
  global: {},
};

export interface SheetProps<SheetId extends keyof Sheets = never> {
  sheetId: SheetId;
  payload?: Sheets[SheetId]["payload"];
}

// Registers your Sheet with the SheetProvider.
export function registerSheet<SheetId extends keyof Sheets = never>(
  id: SheetId | (string & {}),
  Sheet: React.ElementType,
  ...contexts: string[]
) {
  if (!id || !Sheet) return;
  if (!contexts || contexts.length === 0) contexts = ["global"];
  for (let context of contexts) {
    const registry = !sheetsRegistry[context]
      ? (sheetsRegistry[context] = {})
      : sheetsRegistry[context];
    registry[id as string] = Sheet;
    eventManager.publish(`${context}-on-register`);
  }
}

/**
 * Animation configuration for iOS modal sheet style animations.
 * @deprecated Use duration prop directly instead
 */
export interface ModalSheetAnimationConfig {
  /** Duration of the animation in milliseconds */
  duration: number;
}

/**
 * The SheetProvider makes available the sheets in a given context. The default context is
 * `global`. However if you want to render a Sheet within another sheet or if you want to render
 * Sheets in a modal. You can use a separate Provider with a custom context value.
 *
 * For example
 * ```ts
 * // Define your SheetProvider in the component/modal where
 * // you want to show some Sheets.
 * <SheetProvider context="local-context" />
 *
 * // Then register your sheet when for example the
 * // Modal component renders.
 *
 * registerSheet('local-sheet', LocalSheet,'local-context');
 *
 * ```
 */
export function SheetProvider({
  iosModalSheetTypeOfAnimation = false,
  context = "global",
  duration = 150,
  children,
}: React.PropsWithChildren<{
  context?: string;
  duration?: number;
  iosModalSheetTypeOfAnimation?: boolean;
}>) {
  const { top } = useSafeAreaInsets();
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const sheetIds = Object.keys(sheetsRegistry[context] || sheetsRegistry["global"] || {});

  // IOS modal sheet type of animation
  const isFullScreen = useSharedValue(-1);
  const colorStyle = useAnimatedStyle(() => ({
    flex: 1,
    backgroundColor: withSpring(
      interpolateColor(isFullScreen.value, [0, 1], ["transparent", "#000"]),
      { duration },
    ),
  }));
  const animatedStyle = useAnimatedStyle(
    () => ({
      flex: 1,
      overflow: "hidden",
      borderRadius: interpolate(isFullScreen.value, [0, 0.8, 1], [0, 20, 24], "clamp"),
      transform: [
        {
          scaleX: withSpring(
            interpolate(isFullScreen.value, [0, 0.8], [1, 0.92], "clamp"),
            { duration },
          ),
        },
        {
          translateY: withSpring(
            interpolate(isFullScreen.value, [0, 0.8, 1], [0, top, top + 5], "clamp"),
            { duration, dampingRatio: 1.5 },
          ),
        },
      ],
    }),
    [duration],
  );

  // Since background color is white, we need to set status bar to light
  const setStatusBar = StatusBar.setBarStyle;
  useAnimatedReaction(
    () => isFullScreen.value,
    (currentValue) => {
      "worklet";
      if (currentValue > -1) {
        runOnJS(setStatusBar)(currentValue >= 0.5 ? "light-content" : "default");
      }
    },
    [],
  );

  React.useEffect(() => {
    providerRegistryStack.indexOf(context) > -1
      ? providerRegistryStack.indexOf(context)
      : providerRegistryStack.push(context) - 1;
    const unsub = eventManager.subscribe(`${context}-on-register`, forceUpdate);
    return () => {
      providerRegistryStack.splice(providerRegistryStack.indexOf(context), 1);
      unsub?.unsubscribe();
    };
  }, [context, forceUpdate]);

  return (
    <SheetAnimationContext.Provider
      value={{ isFullScreen, iosModalSheetTypeOfAnimation, duration }}
    >
      <Animated.View style={colorStyle}>
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      </Animated.View>
      <BottomSheetModalProvider>
        {sheetIds.map((id) => (
          <RenderSheet key={id} id={id} context={context} />
        ))}
      </BottomSheetModalProvider>
    </SheetAnimationContext.Provider>
  );
}
const ProviderContext = React.createContext("global");
const SheetIDContext = React.createContext<string | undefined>(undefined);
const SheetAnimationContext = React.createContext<{
  iosModalSheetTypeOfAnimation: boolean;
  isFullScreen: SharedValue<number>;
  duration: number;
}>({
  isFullScreen: { value: 0 } as SharedValue<number>,
  iosModalSheetTypeOfAnimation: false,
  duration: 300,
});

export const SheetRefContext = React.createContext<
  React.RefObject<BottomSheetInstance | null>
>({} as React.RefObject<BottomSheetInstance | null>);

const SheetPayloadContext = React.createContext<unknown>(undefined);

// Stack behavior context for managing sheet transitions
interface StackBehaviorContextValue {
  behavior: StackBehavior;
  isTransitioning: boolean;
  previousSheetId: string | null;
}

const StackBehaviorContext = React.createContext<StackBehaviorContextValue>({
  behavior: "switch",
  isTransitioning: false,
  previousSheetId: null,
});

/**
 * Get id of the current context.
 */
export const useProviderContext = () => React.useContext(ProviderContext);
/**
 * Get id of the current sheet
 */
export const useSheetIDContext = () => React.useContext(SheetIDContext);
/**
 * Get the current sheet animation context.
 */
export const useSheetAnimationContext = () => React.useContext(SheetAnimationContext);
/**
 * Get stack behavior context for the current sheet.
 */
export const useStackBehaviorContext = () => React.useContext(StackBehaviorContext);
/**
 * Get the current Sheet's internal ref.
 */
export const useSheetRef = <
  SheetId extends keyof Sheets = never,
>(): React.MutableRefObject<BottomSheetInstance<SheetId>> =>
  React.useContext(SheetRefContext) as React.MutableRefObject<
    BottomSheetInstance<SheetId>
  >;

/**
 * Get the payload this sheet was opened with.
 */
export function useSheetPayload<SheetId extends keyof Sheets = never>() {
  return React.useContext(SheetPayloadContext) as Sheets[SheetId]["payload"];
}

/**
 * Listen to sheet events.
 */
export function useOnSheet<SheetId extends keyof Sheets = never>(
  id: SheetId | (string & {}),
  type: "show" | "hide" | "onclose",
  listener: (payload: SheetPayload<SheetId>, context: string, ...args: unknown[]) => void,
) {
  React.useEffect(() => {
    const subscription = eventManager.subscribe(`${type}_${id}`, listener);
    return () => subscription.unsubscribe();
  }, [id, listener, type]);
}

interface RenderSheetProps {
  id: string;
  context: string;
}

const RenderSheet = ({ id, context }: RenderSheetProps) => {
  const [payload, setPayload] = React.useState<unknown>();
  const [visible, setVisible] = React.useState(false);
  const [stackBehavior, setStackBehavior] = React.useState<StackBehavior>("switch");
  const [isPending, startTransition] = React.useTransition();
  const [previousSheetId, setPreviousSheetId] = React.useState<string | null>(null);

  const ref = React.useRef<BottomSheetInstance | null>(null);
  const Sheet = context.startsWith("$$-auto-")
    ? sheetsRegistry?.global?.[id]
    : sheetsRegistry[context]
      ? sheetsRegistry[context]?.[id]
      : undefined;

  const onShow = React.useCallback(
    (data: unknown, ctx = "global", reopened?: boolean, behavior?: StackBehavior) => {
      if (ctx !== context) return;

      if (behavior) {
        setStackBehavior(behavior);
      }

      if (!reopened) {
        setPayload(data);
      }

      // Smooth transition handling using React's useTransition
      startTransition(() => {
        setVisible(true);
      });
    },
    [context],
  );

  const onClose = React.useCallback(
    (_data: unknown, ctx = "global", reopened?: boolean, nextSheetId?: string) => {
      if (context !== ctx) return;

      if (nextSheetId) {
        setPreviousSheetId(nextSheetId);
      }

      if (!reopened) {
        setPayload(undefined);
        setVisible(false);
      } else {
        setVisible(false);
        setPreviousSheetId(null);
      }
    },
    [context],
  );

  const onHide = React.useCallback(
    (data: unknown, ctx = "global") => {
      eventManager.publish(`hide_${id}`, data, ctx);
    },
    [id],
  );

  React.useEffect(() => {
    if (visible) {
      eventManager.publish(`show_${id}`, payload, context);
    }
  }, [context, id, payload, visible]);

  React.useEffect(() => {
    const subs = [
      eventManager.subscribe(`show_wrap_${id}`, onShow),
      eventManager.subscribe(`onclose_${id}`, onClose),
      eventManager.subscribe(`hide_wrap_${id}`, onHide),
    ];
    return () => {
      subs.forEach((s) => s.unsubscribe());
    };
  }, [id, context, onShow, onHide, onClose]);

  if (!Sheet) return null;

  const stackContextValue: StackBehaviorContextValue = {
    behavior: stackBehavior,
    isTransitioning: isPending,
    previousSheetId,
  };

  if (!visible) return null;

  return (
    <ProviderContext.Provider value={context}>
      <SheetIDContext.Provider value={id}>
        <SheetRefContext.Provider value={ref}>
          <SheetPayloadContext.Provider value={payload}>
            <StackBehaviorContext.Provider value={stackContextValue}>
              <Sheet id={id} payload={payload} context={context} />
            </StackBehaviorContext.Provider>
          </SheetPayloadContext.Provider>
        </SheetRefContext.Provider>
      </SheetIDContext.Provider>
    </ProviderContext.Provider>
  );
};
