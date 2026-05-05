import { TrueSheet } from "@lodev09/react-native-true-sheet";
import type {
  TrueSheetProps as NativeTrueSheetProps,
  PositionChangeEvent,
} from "@lodev09/react-native-true-sheet";
import React from "react";
import {
  BackHandler,
  Platform,
  StyleSheet,
  View,
  type NativeEventSubscription,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { interpolate } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrivateManager } from "../manager";
import {
  useProviderContext,
  useSheetIDContext,
  useSheetRef,
  useSheetSharedContext,
} from "../provider";
import { useSheetManager, useTeardownSheet } from "./shared";
import { BottomSheetInstance, BottomSheetProps, SheetIds, StackBehavior } from "../types";

type OmittedTrueSheetProps =
  | "name"
  | "onDidDismiss"
  | "onBackPress"
  | "onPositionChange"
  | "onMount"
  | "children"
  | "style";

interface TrueSheetComponentProps<Id extends SheetIds = SheetIds>
  extends Omit<NativeTrueSheetProps, OmittedTrueSheetProps> {
  id?: BottomSheetProps<Id>["id"];
  children: React.ReactNode;
  hardwareBackPressToClose?: BottomSheetProps<Id>["hardwareBackPressToClose"];
  onClose?: BottomSheetProps<Id>["onClose"];
  onBeforeShow?: BottomSheetProps<Id>["onBeforeShow"];
  opacity?: BottomSheetProps<Id>["opacity"];
  stackBehavior?: BottomSheetProps<Id>["stackBehavior"];
  iosModalSheetTypeOfAnimation?: BottomSheetProps<Id>["iosModalSheetTypeOfAnimation"];
  closeAnimationConfigs?: BottomSheetProps<Id>["closeAnimationConfigs"];
  style?: StyleProp<ViewStyle>;
}

interface BottomSheetFC
  extends React.MemoExoticComponent<
    React.ForwardRefExoticComponent<TrueSheetComponentProps>
  > {
  <Id extends SheetIds>(
    props: TrueSheetComponentProps<Id> & React.RefAttributes<BottomSheetInstance<Id>>,
  ): React.JSX.Element;
}

const FULL_SCREEN_DETENT = 0.9;

const BottomSheetComponent = React.forwardRef<
  BottomSheetInstance,
  TrueSheetComponentProps
>(
  (
    {
      children,
      onClose,
      onBeforeShow,
      stackBehavior = "switch",
      hardwareBackPressToClose = true,
      detents: defaultDetents,
      dimmed = true,
      opacity,
      iosModalSheetTypeOfAnimation,
      closeAnimationConfigs,
      style,
      ...props
    },
    ref,
  ) => {
    const currentSheetRef = useSheetRef();
    const currentCtx = useProviderContext();

    const [currentStackBehavior, setCurrentStackBehavior] =
      React.useState<StackBehavior>(stackBehavior);
    const isPushed = currentStackBehavior === "push";

    const { bottom } = useSafeAreaInsets();
    const defaultStyle = React.useMemo(() => ({ paddingBottom: bottom }), [bottom]);

    const { fullScreenValues } = useSheetSharedContext();
    const [detents, fullScreenIndex] = React.useMemo(() => {
      let resolved = defaultDetents ?? [0.5, 1];

      if (Platform.OS === "android" && iosModalSheetTypeOfAnimation) {
        resolved = resolved.map((detent) =>
          detent === 1 || detent === FULL_SCREEN_DETENT ? FULL_SCREEN_DETENT : detent,
        );
      }

      const fullScreenIdx = resolved.findIndex(
        (p) => p === FULL_SCREEN_DETENT || p === 1,
      );
      return [resolved, fullScreenIdx] as const;
    }, [defaultDetents, iosModalSheetTypeOfAnimation]);

    const valueRef = React.useRef<unknown>(null);
    const trueSheetRef = React.useRef<TrueSheet>(null);
    const hardwareBackPressEvent = React.useRef<NativeEventSubscription>(
      null,
    ) as React.MutableRefObject<NativeEventSubscription>;
    const teardownDataRef = React.useRef<{
      dismiss?: boolean;
      behavior?: StackBehavior;
    }>({});
    const hasPresentedRef = React.useRef(false);
    const isDismissingRef = React.useRef(false);

    const id = useSheetIDContext();
    const sheetId = props.id || id;

    const hideSheetRef = React.useRef<
      (
        data?: unknown,
        fromManager?: boolean,
        dismiss?: boolean,
        incomingBehavior?: StackBehavior,
      ) => void
    >(null!);

    useSheetManager({
      id: sheetId,
      onHide: (data, dismiss, behavior) => {
        if (behavior) setCurrentStackBehavior(behavior);
        hideSheetRef.current(data, true, dismiss, behavior);
      },
      onBeforeShow: (data, behavior) => {
        if (behavior) setCurrentStackBehavior(behavior);
        onBeforeShow?.(data as never);
        valueRef.current = undefined;
        currentSheetRef.current = getInstance();
      },
      onContextUpdate: () => {
        if (sheetId) {
          PrivateManager.add(sheetId, currentCtx);
          PrivateManager.registerRef(sheetId, currentCtx, {
            current: getInstance(),
          } as React.RefObject<BottomSheetInstance>);
        }
      },
    });

    const handlePositionChange = React.useCallback(
      (event: PositionChangeEvent) => {
        const { index, detent: detentValue } = event.nativeEvent;

        if (iosModalSheetTypeOfAnimation && sheetId) {
          const fullScreenIdx = fullScreenIndex >= 0 ? fullScreenIndex : 1;
          const base =
            fullScreenIndex >= 0
              ? index / fullScreenIdx
              : detentValue >= FULL_SCREEN_DETENT
                ? 1
                : 0;
          const val = interpolate(base, [0.8, 1, 1.2], [0, 1, 0], "clamp");
          const current = { ...fullScreenValues.value };
          current[sheetId] = val;
          fullScreenValues.set(current);
        }
      },
      [iosModalSheetTypeOfAnimation, sheetId, fullScreenIndex, fullScreenValues],
    );

    React.useEffect(() => {
      return () => {
        if (iosModalSheetTypeOfAnimation && sheetId) {
          const current = { ...fullScreenValues.value };
          delete current[sheetId];
          fullScreenValues.set(current);
        }
      };
    }, [iosModalSheetTypeOfAnimation, sheetId, fullScreenValues]);

    const teardownSheet = useTeardownSheet({ sheetId, currentCtx });
    const hideSheet = React.useCallback(
      (
        data?: unknown,
        fromManager?: boolean,
        dismiss?: boolean,
        incomingBehavior?: StackBehavior,
      ) => {
        const activeBehavior = incomingBehavior ?? currentStackBehavior;

        let value = data ?? valueRef.current;

        hardwareBackPressEvent.current?.remove();

        if (dismiss && activeBehavior === "push") {
          if (fromManager) valueRef.current = data;
          return;
        }

        const shouldClose = activeBehavior !== "replace" || !dismiss;

        if (fromManager && shouldClose) {
          if (isDismissingRef.current) return;
          isDismissingRef.current = true;
          valueRef.current = value;
          teardownDataRef.current = { dismiss, behavior: activeBehavior };
          trueSheetRef.current?.dismiss();
          return;
        }

        const finalDismiss = fromManager ? dismiss : teardownDataRef.current.dismiss;
        const finalBehavior = fromManager
          ? activeBehavior
          : (teardownDataRef.current.behavior ?? activeBehavior);

        teardownDataRef.current = {};

        const closeValue = onClose?.(value as never);
        if (closeValue !== undefined) value = closeValue;

        teardownSheet(value, finalDismiss, finalBehavior);
        isDismissingRef.current = false;
        if (fromManager) valueRef.current = data;
      },
      [currentStackBehavior, onClose, teardownSheet],
    );

    React.useEffect(() => {
      hideSheetRef.current = hideSheet;
    }, [hideSheet]);

    const handleDidDismiss = React.useCallback(() => {
      hideSheetRef.current();
    }, []);

    const handleBackPress = React.useCallback(() => {
      hideSheetRef.current(undefined, true, false);
      return true;
    }, []);

    const detectCount = React.useMemo(() => Math.min(detents?.length ?? 2, 3), [detents]);

    const getInstance = React.useCallback(
      (): BottomSheetInstance => ({
        close(options = {}): void {
          valueRef.current = (options as Record<string, unknown>).value;
          // Ignore animationConfigs — TrueSheet dismiss only supports animated boolean
          trueSheetRef.current?.dismiss();
        },
        expand(): void {
          trueSheetRef.current?.resize(detectCount - 1);
        },
        collapse(): void {
          trueSheetRef.current?.resize(0);
        },
        snapToIndex(index: number): void {
          if (index >= 0 && index < detectCount) {
            trueSheetRef.current?.resize(index);
          }
        },
        snapToPosition(position): void {
          const numeric =
            typeof position === "string"
              ? parseFloat(position) / 100
              : typeof position === "number"
                ? position
                : 0;
          let closestIndex = 0;
          let minDiff = Infinity;
          for (let i = 0; i < detectCount; i++) {
            const d = detents[i];
            if (typeof d === "number") {
              const diff = Math.abs(d - numeric);
              if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
              }
            }
          }
          trueSheetRef.current?.resize(closestIndex);
        },
      }),
      [detectCount, detents],
    );

    const presentSheet = React.useCallback(async () => {
      if (hasPresentedRef.current) return;
      hasPresentedRef.current = true;
      await trueSheetRef.current?.present(0);
    }, []);

    React.useEffect(() => {
      if (sheetId) {
        PrivateManager.registerRef(sheetId, currentCtx, {
          current: getInstance(),
        });
      }
      currentSheetRef.current = getInstance();
    }, [currentCtx, getInstance, sheetId, currentSheetRef]);

    React.useEffect(() => {
      presentSheet();

      return () => {
        hasPresentedRef.current = false;
      };
    }, [presentSheet]);

    React.useEffect(() => {
      if (
        Platform.OS === "android" &&
        hardwareBackPressToClose &&
        !trueSheetRef.current
      ) {
        hardwareBackPressEvent.current = BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
            hideSheetRef.current(undefined, true, false);
            return true;
          },
        );
      }

      return () => hardwareBackPressEvent.current?.remove();
    }, [hardwareBackPressToClose]);

    React.useImperativeHandle(ref, getInstance, [getInstance]);

    const zIndex = React.useMemo(
      () => (isPushed && sheetId ? PrivateManager.zIndex(sheetId, currentCtx) : 0),
      [sheetId, isPushed, currentCtx],
    );

    return (
      <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex }]}>
        <TrueSheet
          {...props}
          ref={trueSheetRef}
          name={sheetId}
          detents={detents}
          dimmed={dimmed}
          style={[defaultStyle, style]}
          onDidDismiss={handleDidDismiss}
          onBackPress={handleBackPress}
          onPositionChange={handlePositionChange}
        >
          {children}
        </TrueSheet>
      </View>
    );
  },
);

const BottomSheet = React.memo(BottomSheetComponent) as BottomSheetFC;
BottomSheet.displayName = "BottomSheet";

export default BottomSheet;
