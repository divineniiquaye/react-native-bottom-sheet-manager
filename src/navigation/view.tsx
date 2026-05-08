import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParamListBase, useTheme } from "@react-navigation/native";
import { SNAP_POINT_TYPE } from "@gorhom/bottom-sheet";
import * as React from "react";

import type {
  BottomSheetDescriptorMap,
  BottomSheetNavigationHelpers,
  BottomSheetNavigationState,
  BottomSheetRoute,
} from "./types";
import { BottomSheetInstance, BottomSheetProps } from "../types";
import { BottomSheetActions } from "./router";
import BottomSheet from "../sheets/gorhom";

type Props = {
  state: BottomSheetNavigationState<ParamListBase>;
  navigation: BottomSheetNavigationHelpers;
  descriptors: BottomSheetDescriptorMap;
};

function BottomSheetScreen({
  children,
  navigation,
  route,
  ...props
}: BottomSheetProps & {
  route: BottomSheetRoute<ParamListBase>;
  navigation: BottomSheetNavigationHelpers;
}) {
  const ref = React.useRef<BottomSheetInstance>(null);
  const lastSnapIndexRef = React.useRef(route.snapToIndex ?? props.index ?? 0);

  // Handle route closing state
  React.useEffect(() => {
    if (route.closing) {
      ref.current?.close();
    }
  }, [route.closing]);

  // Handle snap point changes from navigation actions
  React.useEffect(() => {
    if (route.snapToIndex != null && route.snapToIndex !== lastSnapIndexRef.current) {
      ref.current?.snapToIndex(route.snapToIndex);
      lastSnapIndexRef.current = route.snapToIndex;
    }
  }, [route.snapToIndex, route.snapToKey]);

  const handleChange = React.useCallback(
    (newIndex: number, position: number, type: SNAP_POINT_TYPE) => {
      navigation.emit({
        type: "sheetOnChange",
        target: route.key,
        data: { index: newIndex, position, type },
      });

      const currentIndex = lastSnapIndexRef.current;
      lastSnapIndexRef.current = newIndex;

      if (newIndex >= 0 && newIndex !== currentIndex) {
        navigation.dispatch(BottomSheetActions.snapTo(newIndex));
      }
    },
    [navigation],
  );

  return (
    <BottomSheet ref={ref} onChange={handleChange} {...props}>
      {children}
    </BottomSheet>
  );
}

export function BottomSheetView({ state, navigation, descriptors }: Props) {
  const { colors } = useTheme();
  const { bottom, left, right } = useSafeAreaInsets();

  const themeBackgroundStyle = React.useMemo(
    () => ({
      borderCurve: "continuous" as unknown as undefined,
      backgroundColor: colors.card,
    }),
    [colors.card],
  );

  const themeHandleIndicatorStyle = React.useMemo(
    () => ({
      borderCurve: "continuous" as unknown as undefined,
      backgroundColor: colors.border,
    }),
    [colors.border],
  );

  const defaultStyle = React.useMemo(
    () => ({ paddingBottom: bottom, paddingLeft: left, paddingRight: right }),
    [bottom, left, right],
  );

  const [baseRoute, ...sheetRoutes] = state.routes;
  const baseDescriptor = baseRoute ? descriptors[baseRoute.key] : null;

  return (
    <>
      {baseDescriptor?.render()}
      {sheetRoutes.map((route) => {
        const descriptor = descriptors[route.key];
        if (!descriptor) return null;

        const { options, render } = descriptor;
        const {
          index = 0,
          style,
          backgroundStyle,
          handleIndicatorStyle,
          handleStyle,
          ...props
        } = options;

        return (
          <BottomSheetScreen
            key={route.key}
            id={route.key}
            route={route}
            index={index}
            navigation={navigation}
            style={[defaultStyle, style]}
            backgroundStyle={[themeBackgroundStyle, backgroundStyle]}
            handleIndicatorStyle={[themeHandleIndicatorStyle, handleIndicatorStyle]}
            handleStyle={[themeBackgroundStyle, { borderRadius: 24 }, handleStyle]}
            onClose={(data) => {
              navigation.dispatch({
                ...BottomSheetActions.remove(),
                source: route.key,
              });
              navigation.emit({
                type: "sheetDismiss",
                target: route.key,
                data,
              });
            }}
            onBeforeShow={(data) => {
              navigation.emit({
                type: "sheetPresent",
                target: route.key,
                data,
              });
            }}
            onAnimate={(fromIndex, toIndex, fromPosition, toPosition) => {
              navigation.emit({
                type: "sheetOnAnimate",
                target: route.key,
                data: { fromIndex, toIndex, fromPosition, toPosition },
              });
            }}
            {...props}
          >
            {render()}
          </BottomSheetScreen>
        );
      })}
    </>
  );
}
