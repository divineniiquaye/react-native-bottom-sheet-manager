# Bottom Sheet Router & Manager

A powerful bottom sheet manager and router for React Native, inspired by [react-native-actions-sheet](https://github.com/ammarahm-ed/@repo/bottom-sheet) and built on top of [@gorhom/bottom-sheet](https://github.com/gorhom/react-native-bottom-sheet).

## Features

- 🎯 **Simple API** - Show/hide sheets from anywhere in your app
- 🔄 **Stack Behaviors** - Control how sheets stack with `push`, `switch`, or `replace` behaviors
- 🧭 **React Navigation Integration** - Full support for React Navigation v6/v7 and Expo Router
- 📱 **iOS 18 Modal Animation** - Native-like modal sheet animations
- 🎨 **TypeScript Support** - Full type safety with IntelliSense
- ⚡ **Performance Optimized** - High-performance event system with O(1) lookups
- 🔌 **Flexible Hooks** - Rich set of hooks for advanced use cases

## Installation

```bash
npm install @niibase/bottom-sheet-manager
```

## Quick Start

### Basic Usage

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
// Set stack behavior per sheet
<BottomSheet
    id={id}
    stackBehavior="push" // or "switch" or "replace"
    snapPoints={["50%", "90%"]}
>
    {/* content */}
</BottomSheet>
```

## React Navigation Integration

Full support for React Navigation v6/v7 and Expo Router. The first screen in the navigator is rendered as main content, and subsequent screens are rendered as bottom sheet modals.

### With Expo Router

```tsx
import { Slot, withLayoutContext } from "expo-router";

import {
    BottomSheetNavigationEventMap,
    BottomSheetNavigationOptions,
    BottomSheetNavigationState,
    createBottomSheetNavigator,
} from "@niibase/bottom-sheet-manager";

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
                snapPoints: ["50%", "90%"],
                // See: https://gorhom.github.io/react-native-bottom-sheet/modal/props/
            }}
        />
    );
}
```

### With React Navigation

```tsx
import { createBottomSheetNavigator } from "@niibase/bottom-sheet-manager";

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
import { useBottomSheetNavigation } from "@niibase/bottom-sheet-manager";

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
import { useBottomSheetNavigation } from "@niibase/bottom-sheet-manager";

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

Or in navigation options:

```tsx
<Screen
    name="Details"
    component={DetailsSheet}
    options={{
        iosModalSheetTypeOfAnimation: true,
        snapPoints: ["50%", "90%", "100%"],
    }}
/>
```

> **Note:** When `iosModalSheetTypeOfAnimation` is `false` (the default), no animated wrappers are added to the component tree, keeping your app's layout overhead minimal.

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

### `BottomSheet` Props

All props from `@gorhom/bottom-sheet` are supported, plus:

| Prop                           | Type                              | Default    | Description                                                                           |
| ------------------------------ | --------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| `id`                           | `SheetID<SheetIds>`               | -          | Unique identifier for the sheet                                                       |
| `stackBehavior`                | `"push" \| "replace" \| "switch"` | `"switch"` | How sheets stack when opened                                                          |
| `iosModalSheetTypeOfAnimation` | `boolean`                         | `false`    | Enable iOS 18 modal animation                                                         |
| `clickThrough`                 | `boolean`                         | `false`    | Allow tapping through backdrop                                                        |
| `opacity`                      | `number`                          | `0.45`     | Backdrop opacity                                                                      |
| `hardwareBackPressToClose`     | `boolean`                         | `true`     | Close on hardware back button (Android)                                               |
| `onClose`                      | `(data?) => ReturnValue \| void`  | -          | Callback when sheet closes; return a value to override what's sent back to the caller |
| `onBeforeShow`                 | `(data?) => void`                 | -          | Callback before sheet shows                                                           |

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
| `clickThrough`                 | `boolean`                 | `false`   | Allow tapping through backdrop |
| `iosModalSheetTypeOfAnimation` | `boolean`                 | `false`   | Enable iOS 18 modal animation  |
| `opacity`                      | `number`                  | `0.45`    | Backdrop opacity               |

### Navigation Actions

```tsx
import { BottomSheetActions } from "@niibase/bottom-sheet-manager";

// Snap to index
navigation.dispatch(BottomSheetActions.snapTo(1));

// Dismiss sheet
navigation.dispatch(BottomSheetActions.dismiss());

// Remove from stack
navigation.dispatch(BottomSheetActions.remove());
```

## Examples

The source code for the example (showcase) app is under the [/example](/example/) directory. It includes:

- Basic sheet usage
- Stack behavior demos (push, replace, switch) including mixed stacks
- React Navigation integration
- iOS modal animation examples
- Navigation actions and hooks usage

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](./LICENSE)

---

<div align="center">

**Built with ❤️ by [@divineniiquaye](https://github.com/divineniiquaye) using React Native and [@gorhom/bottom-sheet](https://github.com/gorhom/react-native-bottom-sheet).**

[⬆ Back to Top](#bottom-sheet-router--manager)

</div>
