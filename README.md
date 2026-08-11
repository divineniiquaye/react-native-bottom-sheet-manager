# Bottom Sheet Router & Manager

A powerful bottom sheet manager and router for React Native, inspired by [react-native-actions-sheet](https://github.com/ammarahm-ed/react-native-actions-sheet) and built on top of [@gorhom/bottom-sheet](https://github.com/gorhom/react-native-bottom-sheet) with optional support for [@lodev09/react-native-true-sheet](https://github.com/lodev09/react-native-true-sheet).

## Features

- 🎯 **Simple API** - Show/hide sheets from anywhere in your app
- 🔄 **Stack Behaviors** - Control how sheets stack with `push`, `switch`, or `replace` behaviors
- 🧭 **React Navigation Integration** - Full support for React Navigation v7 and Expo Router
- 📱 **iOS 18 Modal Animation** - Native-like modal sheet animations
- 🎨 **TypeScript Support** - Full type safety with IntelliSense
- ⚡ **Performance Optimized** - High-performance event system with O(1) lookups
- 🔌 **Flexible Hooks** - Rich set of hooks for advanced use cases
- 🪟 **Dual Vendor Support** - Use `@gorhom/bottom-sheet` (JS-driven) or `@lodev09/react-native-true-sheet` (native-driven)

## Installation

```bash
npm install @niibase/bottom-sheet-manager
```

## Vendors

This library supports two bottom sheet implementations. Choose the one that fits your needs:

| Vendor                               | Import                   | Sheet Component                                                        | Platform          | Best For                                                                   |
| ------------------------------------ | ------------------------ | ---------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------- |
| **@gorhom/bottom-sheet** (default)   | `import { BottomSheet }` | JS-driven, highly customizable                                         | iOS + Android     | Full control over animations, custom handles, backdrop, and sub-components |
| **@lodev09/react-native-true-sheet** | `import { TrueSheet }`   | Native-driven (UISheetPresentationController / Material 3 BottomSheet) | iOS 16+ + Android | True native look & feel, smaller bundle, less JS overhead                  |

Both vendors share the same manager API (`SheetManager.show`, `SheetManager.hide`, `registerSheet`, `useSheetRef`, etc.) — the only difference is the sheet component and its props.

## Quick Start

### Using @gorhom/bottom-sheet (default)

`SheetManager` helps you save development time by allowing you to reuse modal sheets throughout your app without boilerplate.

```tsx
import { BottomSheet, SheetManager } from "@niibase/bottom-sheet-manager";
import type { SheetProps } from "@niibase/bottom-sheet-manager";
```

Create your BottomSheet component:

```tsx
function ExampleSheet({ id }: SheetProps<"example-sheet">) {
    return (
        <BottomSheet id={id} snapPoints={["50%", "90%"]}>
            <BottomSheet.View>
                <Text>Hello World</Text>
            </BottomSheet.View>
        </BottomSheet>
    );
}

export default ExampleSheet;
```

### Using @lodev09/react-native-true-sheet

Import `TrueSheet` instead of `BottomSheet`. The component API uses native-oriented props:

```tsx
import { SheetManager, TrueSheet } from "@niibase/bottom-sheet-manager";
import type { SheetProps } from "@niibase/bottom-sheet-manager";
```

```tsx
function ExampleSheet({ id }: SheetProps<"example-sheet">) {
    return (
        <TrueSheet id={id} detents={[0.5, 1]} cornerRadius={24} grabber scrollable>
            <ScrollView style={{ padding: 16 }}>
                <Text>Hello from TrueSheet</Text>
            </ScrollView>
        </TrueSheet>
    );
}

export default ExampleSheet;
```

### Registration (same for both vendors)

Register your sheet **at module level** in a `sheets.ts` file (never inside JSX):

```ts
import type { SheetDefinition } from "@niibase/bottom-sheet-manager";
import { registerSheet } from "@niibase/bottom-sheet-manager";

import ExampleSheet from "./ExampleSheet";

// ✅ Correct: register at module level
registerSheet("example-sheet", ExampleSheet);

// Extend types for IntelliSense
declare module "@niibase/bottom-sheet-manager" {
    interface Sheets {
        "example-sheet": SheetDefinition;
    }
}
```

Import `sheets.ts` in your app entry point, then wrap your app with `SheetProvider`:

```tsx
import { SheetProvider } from "@niibase/bottom-sheet-manager";

import "./sheets";

function App() {
    return <SheetProvider>{/* your app components */}</SheetProvider>;
}
```

Show and hide sheets:

```tsx
// Show a sheet
SheetManager.show("example-sheet");

// Show with payload
SheetManager.show("example-sheet", { payload: { userId: 123 } });

// Hide a sheet
SheetManager.hide("example-sheet");

// Hide and get return value
const result = await SheetManager.show("example-sheet");

// Check if a sheet is visible
SheetManager.isVisible("example-sheet"); // boolean

// Get the sheet instance directly
const instance = SheetManager.get("example-sheet");
instance?.expand();
```

## Stack Behaviors

Control how sheets behave when opened on top of existing sheets:

- **`switch`** (default): Dismisses the current sheet before showing the new one. Previous sheet is restored when new one closes.
- **`replace`**: Swaps the current sheet's content with smooth crossfade animation. Previous sheet is removed from stack.
- **`push`**: Pushes new sheet on top, creating a navigable stack. Previous sheet remains visible underneath.

```tsx
// Using BottomSheet (gorhom)
<BottomSheet
    id={id}
    stackBehavior="push"
    snapPoints={["50%", "90%"]}
>
    {/* content */}
</BottomSheet>

// Using TrueSheet
<TrueSheet
    id={id}
    stackBehavior="push"
    detents={[0.5, 0.9]}
>
    {/* content */}
</TrueSheet>
```

## React Navigation Integration

Full support for React Navigation v7 and Expo Router. The first screen in the navigator is rendered as main content, and subsequent screens are rendered as bottom sheet modals.

### With Expo Router

```tsx
import { Slot, withLayoutContext } from "expo-router";
import {
    BottomSheetNavigationEventMap,
    BottomSheetNavigationOptions,
    BottomSheetNavigationState,
    createBottomSheetNavigator,
} from "@niibase/bottom-sheet-manager/navigation";

const { Navigator } = createBottomSheetNavigator();
const BottomSheet = withLayoutContext<
    BottomSheetNavigationOptions,
    typeof Navigator,
    BottomSheetNavigationState<any>,
    BottomSheetNavigationEventMap
>(Navigator);

export const unstable_settings = {
    initialRouteName: "index",
};

export default function Layout() {
    // SSR guard - navigator doesn't work on server
    if (typeof window === "undefined") return <Slot />;

    return (
        <BottomSheet
            screenOptions={{
                // See: https://gorhom.github.io/react-native-bottom-sheet/modal/props/
            }}
        >
            <BottomSheet.Screen name="index" />
            <BottomSheet.Screen name="details" options={{ snapPoints: ["50%"] }} />
        </BottomSheet>
    );
}
```

### With React Navigation

```tsx
import { createBottomSheetNavigator } from "@niibase/bottom-sheet-manager/navigation";

const { Navigator, Screen } = createBottomSheetNavigator();

function App() {
    return (
        <Navigator>
            <Screen name="Home" component={HomeScreen} />
            <Screen
                name="Details"
                component={DetailsSheet}
                options={{
                    snapPoints: ["50%", "100%"],
                    enableBlurKeyboardOnGesture: true,
                }}
            />
        </Navigator>
    );
}
```

### Navigation Actions

Use the navigation object to control sheets programmatically:

```tsx
import { useBottomSheetNavigation } from "@niibase/bottom-sheet-manager/navigation";

function MySheet() {
    const navigation = useBottomSheetNavigation();

    // Snap to a specific index
    const handleExpand = () => {
        navigation.snapTo(1); // Snap to second snap point
    };

    // Dismiss the current sheet
    const handleDismiss = () => {
        navigation.dismiss();
    };

    return (
        <View>
            <Button title="Expand" onPress={handleExpand} />
            <Button title="Dismiss" onPress={handleDismiss} />
        </View>
    );
}
```

## Hooks

### `useBottomSheetNavigation`

Access navigation helpers including `snapTo()` and `dismiss()`:

```tsx
import { useBottomSheetNavigation } from "@niibase/bottom-sheet-manager/navigation";

const navigation = useBottomSheetNavigation();
navigation.snapTo(1);
navigation.dismiss();
```

### `useSheetRef`

Get a ref to control the sheet instance. Always use optional chaining (`?.`) since `current` can be null before the sheet is mounted:

```tsx
import { useSheetRef } from "@niibase/bottom-sheet-manager";

function MySheet({ id }: SheetProps<"my-sheet">) {
    const ref = useSheetRef<"my-sheet">();

    // Control the sheet — use ?. since current may be null
    ref.current?.expand();
    ref.current?.collapse();
    ref.current?.snapToIndex(1);
    ref.current?.close({ value: "result" });
}
```

### `useSheetPayload`

Access the payload passed when showing the sheet:

```tsx
import { useSheetPayload } from "@niibase/bottom-sheet-manager";

function MySheet({ id }: SheetProps<"my-sheet">) {
    const payload = useSheetPayload<"my-sheet">();
    // payload is typed based on your SheetDefinition
}
```

### `useSheetStackBehavior`

Get the current stack behavior context:

```tsx
import { useSheetStackBehavior } from "@niibase/bottom-sheet-manager";

function MySheet() {
    const { behavior, isTransitioning, previousSheetId } = useSheetStackBehavior();
    // behavior: "push" | "replace" | "switch"
}
```

### `useOnSheet`

Subscribe to sheet events. Takes the sheet id, an event type (`"show"`, `"hide"`, or `"onclose"`), and a listener:

```tsx
import { useOnSheet } from "@niibase/bottom-sheet-manager";

function MyComponent() {
    useOnSheet("my-sheet", "show", (payload, context) => {
        console.log("Sheet shown with:", payload);
    });

    useOnSheet("my-sheet", "onclose", (returnValue, context) => {
        console.log("Sheet closed with:", returnValue);
    });
}
```

## Styling with NativeWind / Uniwind

Both `BottomSheet` and `TrueSheet` are third-party components — `className` does **not** work on them out of the box. You must wrap or register them so the styling framework knows how to convert class names to native styles.

### Uniwind — wrapping with `withUniwind`

**Uniwind** provides a `withUniwind` HOC that converts `className` → `style` and color props → `*ColorClassName`. Wrap **outside your component** (at module level) so the HOC only runs once:

```tsx
import { BottomSheet } from "@niibase/bottom-sheet-manager";
import { withUniwind } from "uniwind";

// ✅ Wrap at module level — not inside JSX
const StyledBottomSheet = withUniwind(BottomSheet);

function MySheet({ id }: SheetProps<"my-sheet">) {
    return (
        <StyledBottomSheet
            id={id}
            snapPoints={["50%", "90%"]}
            className="bg-white rounded-t-3xl"
            handleIndicatorClassName="bg-gray-300 w-10"
        >
            {/* content */}
        </StyledBottomSheet>
    );
}
```

For **TrueSheet**:

```tsx
import { TrueSheet } from "@niibase/bottom-sheet-manager";
import { withUniwind } from "uniwind";

const StyledTrueSheet = withUniwind(TrueSheet);

function MySheet({ id }: SheetProps<"my-sheet">) {
    return (
        <StyledTrueSheet
            id={id}
            detents={[0.5, 1]}
            cornerRadius={24}
            grabber
            className="bg-white"
        >
            <ScrollView className="gap-4 px-4 py-6">
                <Text className="text-lg font-bold">Hello TrueSheet</Text>
            </ScrollView>
        </StyledTrueSheet>
    );
}
```

**NativeWind** uses `cssInterop` to tell the Babel plugin how to convert `className` on a given component. Call it **once at your app entry point** (e.g. your `_layout.tsx`):

```tsx
import { BottomSheet, TrueSheet } from "@niibase/bottom-sheet-manager";
import { cssInterop } from "nativewind";

// Register once at app entry
cssInterop(BottomSheet, { className: "style" });
cssInterop(TrueSheet, { className: "style" });
```

Now `className` works directly on the registered components:

```tsx
function MySheet({ id }: SheetProps<"my-sheet">) {
    return (
        <BottomSheet
            id={id}
            snapPoints={["50%", "90%"]}
            className="bg-white rounded-t-3xl"
        >
            <Text className="text-lg font-bold">Hello World</Text>
        </BottomSheet>
    );
}
```

```tsx
function MySheet({ id }: SheetProps<"my-sheet">) {
    return (
        <TrueSheet
            id={id}
            detents={[0.5, 1]}
            className="bg-white"
            scrollable
        >
            <ScrollView className="gap-4 px-4 py-6">
                <Text className="text-lg font-bold">Hello TrueSheet</Text>
            </ScrollView>
        </BottomSheet>
    );
}
```

### TrueSheet-Specific Styling Props

| Prop              | Type                                                                | Description                                                       |
| ----------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `cornerRadius`    | `number`                                                            | Border radius of the sheet (use `0` for sharp corners)            |
| `backgroundColor` | `ColorValue`                                                        | Sheet background color (use to override liquid glass on iOS 26+)  |
| `grabber`         | `boolean`                                                           | Show a native drag handle (default `true`)                        |
| `grabberOptions`  | `{ width?, height?, topMargin?, cornerRadius?, color?, adaptive? }` | Customize the grabber appearance                                  |
| `dimmed`          | `boolean`                                                           | Dim the background (default `true`)                               |
| `dismissible`     | `boolean`                                                           | Allow interactive dismissal (default `true`)                      |
| `draggable`       | `boolean`                                                           | Allow dragging to resize (default `true`)                         |
| `backgroundBlur`  | `BackgroundBlur`                                                    | iOS blur style behind the sheet (e.g. `"system-material"`)        |
| `blurOptions`     | `{ intensity?, interaction? }`                                      | Fine-tune the blur effect (iOS only)                              |
| `elevation`       | `number`                                                            | Sheet shadow elevation (Android/Web, default `4`)                 |
| `insetAdjustment` | `"automatic" \| "never"`                                            | Safe area inset behavior for sheet height (default `"automatic"`) |

## iOS 18 Modal Animation

Enable native-like iOS 18 modal sheet animations:

```tsx
<BottomSheet
    id={id}
    iosModalSheetTypeOfAnimation={true}
    snapPoints={["50%", "90%", "100%"]}
>
    {/* At 90% snap point, content behind scales down with border radius */}
</BottomSheet>
```

> **Note:** When `iosModalSheetTypeOfAnimation` is `false` (the default), no animated wrappers are added to the component tree, keeping your app's layout overhead minimal.
>
> **TrueSheet Android behavior:** When `iosModalSheetTypeOfAnimation` is `true`, Android normalizes full-screen detents so `1` maps to `0.9` (and `0.9` stays `0.9`) to keep modal-style animation behavior consistent.

## Advanced Features

### Custom Contexts

Use separate contexts for nested sheets or modals.

> **Important:** Context names must be unique across all `SheetProvider` instances in your app.

```tsx
// Register at module level — not inside JSX
registerSheet("local-sheet", LocalSheet, "modal-context");

// Then use the provider where you want the sheet to appear
function MyModal() {
    return <SheetProvider context="modal-context">{/* Modal content */}</SheetProvider>;
}
```

### Sheet Instance Methods

Control sheets programmatically:

```tsx
// Get the sheet instance
const instance = SheetManager.get("example-sheet");

// Expand to maximum snap point
instance?.expand();

// Collapse to minimum snap point
instance?.collapse();

// Snap to specific index
instance?.snapToIndex(1);

// Snap to specific position
instance?.snapToPosition("75%");

// Close with return value
instance?.close({ value: { success: true } });
```

### Checking Visibility

```tsx
// Check if a sheet is currently open
const isOpen = SheetManager.isVisible("example-sheet");

// Check in a specific context
const isOpen = SheetManager.isVisible("example-sheet", "modal-context");
```

### Animation Configuration

Customize animations:

```tsx
instance?.expand({
    animationConfigs: {
        type: "spring",
        damping: 20,
        stiffness: 90,
    },
});
```

### Reset (for Testing)

```tsx
import { SheetManager } from "@niibase/bottom-sheet-manager";

// In your test setup/teardown
afterEach(() => {
    SheetManager.reset();
});
```

## API Reference

### `SheetManager`

Global manager for showing and hiding sheets.

| Method      | Signature                                              | Description                                   |
| ----------- | ------------------------------------------------------ | --------------------------------------------- |
| `show`      | `show(id, options?) → Promise<ReturnValue>`            | Show a sheet, optionally with payload         |
| `hide`      | `hide(id, options?) → Promise<ReturnValue>`            | Hide a specific sheet                         |
| `hideAll`   | `hideAll(id?) → void`                                  | Hide all open sheets                          |
| `get`       | `get(id, context?) → BottomSheetInstance \| undefined` | Get the sheet's imperative instance           |
| `isVisible` | `isVisible(id, context?) → boolean`                    | Check if a sheet is currently visible         |
| `replace`   | `replace(id, options?) → Promise<ReturnValue>`         | Show with `replace` stack behavior            |
| `push`      | `push(id, options?) → Promise<ReturnValue>`            | Show with `push` stack behavior               |
| `pop`       | `pop() → void`                                         | Close top-most pushed sheet                   |
| `reset`     | `reset() → void`                                       | Reset all internal state (useful for testing) |

### Shared Props (applicable to both `BottomSheet` and `TrueSheet`)

| Prop                           | Type                              | Default    | Description                                                                           |
| ------------------------------ | --------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| `id`                           | `SheetID<SheetIds>`               | -          | Unique identifier for the sheet                                                       |
| `stackBehavior`                | `"push" \| "replace" \| "switch"` | `"switch"` | How sheets stack when opened                                                          |
| `iosModalSheetTypeOfAnimation` | `boolean`                         | `false`    | Enable iOS 18 modal animation (for TrueSheet on Android, detent `1` is normalized to `0.9`) |
| `passThrough`                  | `boolean`                         | `false`    | Allow tapping through backdrop                                                        |
| `opacity`                      | `number`                          | `0.45`     | Backdrop opacity                                                                      |
| `hardwareBackPressToClose`     | `boolean`                         | `true`     | Close on hardware back button (Android)                                               |
| `onClose`                      | `(data?) => ReturnValue \| void`  | -          | Callback when sheet closes; return a value to override what's sent back to the caller |
| `onBeforeShow`                 | `(data?) => void`                 | -          | Callback before sheet shows                                                           |

### `BottomSheet` Props (gorhom-specific)

All props from `@gorhom/bottom-sheet` are supported, including:

| Prop                   | Type                      | Description                                |
| ---------------------- | ------------------------- | ------------------------------------------ |
| `snapPoints`           | `Array<string \| number>` | Snap points (e.g. `["25%", "50%", "90%"]`) |
| `enableDynamicSizing`  | `boolean`                 | Size sheet to fit content                  |
| `enablePanDownToClose` | `boolean`                 | Swipe down to dismiss                      |
| `handleComponent`      | `React.FC`                | Custom handle component                    |
| `footerComponent`      | `React.FC`                | Custom footer component                    |
| `backgroundStyle`      | `ViewStyle`               | Background container style                 |
| `handleIndicatorStyle` | `ViewStyle`               | Handle indicator style                     |

Sub-components available on `BottomSheet`:

- `BottomSheet.View` — Wrapper view with proper insets
- `BottomSheet.ScrollView` — ScrollView optimized for bottom sheets
- `BottomSheet.FlatList` — FlatList optimized for bottom sheets
- `BottomSheet.SectionList` — SectionList optimized for bottom sheets
- `BottomSheet.TextInput` — TextInput that works with keyboard handling
- `BottomSheet.Handle` — Custom drag handle
- `BottomSheet.Footer` — Footer component
- `BottomSheet.Backdrop` — Custom backdrop component

### `TrueSheet` Props (native-specific)

| Prop                    | Type                            | Default       | Description                                                      |
| ----------------------- | ------------------------------- | ------------- | ---------------------------------------------------------------- |
| `detents`               | `SheetDetent[]`                 | `[0.5, 1]`    | Detent heights (`'auto'`, or `0`–`1` fraction). Max 3. With `iosModalSheetTypeOfAnimation` on Android, `1` is treated as `0.9` |
| `cornerRadius`          | `number`                        | -             | Sheet corner radius (`0` for sharp)                              |
| `grabber`               | `boolean`                       | `true`        | Show native drag handle                                          |
| `grabberOptions`        | `GrabberOptions`                | -             | Customize grabber appearance                                     |
| `scrollable`            | `boolean`                       | `false`       | Enable native scroll handling (auto-detects ScrollView/FlatList) |
| `scrollableOptions`     | `ScrollableOptions`             | -             | Keyboard offset, scroll expansion behavior                       |
| `dimmed`                | `boolean`                       | `true`        | Dim the background                                               |
| `dimmedDetentIndex`     | `number`                        | `0`           | Detent at which dimming starts                                   |
| `dismissible`           | `boolean`                       | `true`        | Allow interactive dismissal                                      |
| `draggable`             | `boolean`                       | `true`        | Allow dragging to resize                                         |
| `header`                | `ComponentType \| ReactElement` | -             | Fixed header pinned to top                                       |
| `footer`                | `ComponentType \| ReactElement` | -             | Floating footer pinned to bottom                                 |
| `headerStyle`           | `ViewStyle`                     | -             | Header container style                                           |
| `footerStyle`           | `ViewStyle`                     | -             | Footer container style                                           |
| `backgroundColor`       | `ColorValue`                    | -             | Sheet background color                                           |
| `backgroundBlur`        | `BackgroundBlur`                | -             | iOS blur style                                                   |
| `blurOptions`           | `BlurOptions`                   | -             | Blur intensity/interaction options                               |
| `elevation`             | `number`                        | `4`           | Android/Web shadow depth                                         |
| `maxContentHeight`      | `number`                        | -             | Max content height override                                      |
| `maxContentWidth`       | `number`                        | -             | Max content width override                                       |
| `anchor`                | `"left" \| "center" \| "right"` | `"center"`    | Horizontal anchor (tablet/landscape)                             |
| `anchorOffset`          | `number`                        | `16`          | Offset from edge when anchored                                   |
| `pageSizing`            | `boolean`                       | `true`        | iPad page sheet style (iOS 17+)                                  |
| `insetAdjustment`       | `"automatic" \| "never"`        | `"automatic"` | Safe area inset behavior                                         |
| `initialDetentIndex`    | `number`                        | `-1`          | Auto-present at this detent on mount                             |
| `initialDetentAnimated` | `boolean`                       | `true`        | Animate initial presentation                                     |

### `SheetProvider` Props

| Prop          | Type             | Default     | Description                                                                                        |
| ------------- | ---------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `context`     | `string`         | `"global"`  | Unique name for this provider context                                                              |
| `statusBar`   | `StatusBarStyle` | `"default"` | Status bar style when a full-screen sheet is open                                                  |
| `scaleConfig` | `object`         | -           | Controls the iOS 18-style scale/translate/radius animation applied to the content behind the sheet |

### `BottomSheetNavigationOptions`

Screen options for navigation-based sheets:

| Option                         | Type                      | Default   | Description                    |
| ------------------------------ | ------------------------- | --------- | ------------------------------ |
| `snapPoints`                   | `Array<string \| number>` | `['66%']` | Snap points for the sheet      |
| `passThrough`                  | `boolean`                 | `false`   | Allow tapping through backdrop |
| `iosModalSheetTypeOfAnimation` | `boolean`                 | `false`   | Enable iOS 18 modal animation  |
| `opacity`                      | `number`                  | `0.45`    | Backdrop opacity               |

### Navigation Actions

```tsx
import { BottomSheetActions } from "@niibase/bottom-sheet-manager/navigation";

// Snap to index
navigation.dispatch(BottomSheetActions.snapTo(1));

// Dismiss sheet
navigation.dispatch(BottomSheetActions.dismiss());

// Remove from stack
navigation.dispatch(BottomSheetActions.remove());
```

## Examples

The source code for the example (showcase) app is under the [/example](/example/) directory. It includes:

- Basic sheet usage (gorhom and TrueSheet)
- Stack behavior demos (push, replace, switch) for both vendors
- React Navigation integration
- iOS modal animation examples
- TrueSheet-specific demos (header/footer, grabber, scrollable, stacking)
- Navigation actions and hooks usage

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](./LICENSE)

---

<div align="center">

**Built with ❤️ by [@divineniiquaye](https://github.com/divineniiquaye) using React Native with [@gorhom/bottom-sheet](https://github.com/gorhom/react-native-bottom-sheet) and [@lodev09/react-native-true-sheet](https://github.com/lodev09/react-native-true-sheet).**

[⬆ Back to Top](#bottom-sheet-router--manager)

</div>
