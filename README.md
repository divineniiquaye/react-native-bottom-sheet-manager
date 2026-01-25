# Bottom Sheet Router & Manager

A powerful bottom sheet manager and router for React Native, inspired by [react-native-actions-sheet](https://github.com/ammarahm-ed/@repo/bottom-sheet) and built on top of [@gorhom/bottom-sheet](https://github.com/gorhom/react-native-bottom-sheet).

## Features

- 🎯 **Simple API** - Show/hide sheets from anywhere in your app
- 🔄 **Stack Behaviors** - Control how sheets stack with `push` (experimental), `switch`, or `replace` behaviors
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
import { BottomSheet, SheetManager } from '@niibase/bottom-sheet-manager';
import type { SheetProps } from '@niibase/bottom-sheet-manager';
```

Create your BottomSheet component:

```tsx
function ExampleSheet({ id }: SheetProps<"example-sheet">) {
  return (
    <BottomSheet 
      id={id}
      snapPoints={['50%', '90%']}
    >
      <View>
        <Text>Hello World</Text>
      </View>
    </BottomSheet>
  );
}

export default ExampleSheet;
```

Register your sheet in a `sheets.ts` file:

```ts
import { registerSheet } from '@niibase/bottom-sheet-manager';
import type { SheetDefinition } from '@niibase/bottom-sheet-manager';
import ExampleSheet from './ExampleSheet';

registerSheet('example-sheet', ExampleSheet);

// Extend types for IntelliSense
declare module '@niibase/bottom-sheet-manager' {
  interface Sheets {
    'example-sheet': SheetDefinition;
  }
}
```

Wrap your app with `SheetProvider`:

```tsx
import { SheetProvider } from '@niibase/bottom-sheet-manager';
import './sheets';

function App() {
  return (
    <SheetProvider>
      {/* your app components */}
    </SheetProvider>
  );
}
```

Show and hide sheets:

```tsx
// Show a sheet
SheetManager.show('example-sheet');

// Show with payload
SheetManager.show('example-sheet', { userId: 123 });

// Hide a sheet
SheetManager.hide('example-sheet');

// Hide and get return value
const result = await SheetManager.show('example-sheet');
```

## Stack Behaviors

Control how sheets behave when opened on top of existing sheets:

- **`switch`** (default): Dismisses the current sheet before showing the new one. Previous sheet is restored when new one closes.
- **`replace`**: Swaps the current sheet's content with smooth crossfade animation. Previous sheet is removed from stack.
- **`push`** (experimental): Pushes new sheet on top, creating a navigable stack. Previous sheet remains visible underneath.

```tsx
// Set stack behavior per sheet
<BottomSheet 
  id={id}
  stackBehavior="push" // or "switch" or "replace"
  snapPoints={['50%', '90%']}
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
  createBottomSheetNavigator,
  BottomSheetNavigationOptions,
  BottomSheetNavigationEventMap,
  BottomSheetNavigationState,
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
        snapPoints: ['50%', '90%'],
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
          snapPoints: ['50%', '100%'],
          iosModalSheetTypeOfAnimation: true,
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

Get a ref to control the sheet instance:

```tsx
import { useSheetRef } from "@niibase/bottom-sheet-manager";

function MySheet({ id }: SheetProps<"my-sheet">) {
  const ref = useSheetRef(id);
  
  // Control the sheet
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

### `useStackBehaviorContext`

Get the current stack behavior context:

```tsx
import { useStackBehaviorContext } from "@niibase/bottom-sheet-manager";

function MySheet() {
  const stackBehavior = useStackBehaviorContext();
  // Returns: "push" | "replace" | "switch"
}
```

### `useOnSheet`

Subscribe to sheet events:

```tsx
import { useOnSheet } from "@niibase/bottom-sheet-manager";

function MyComponent() {
  useOnSheet("my-sheet", {
    onShow: (payload) => {
      console.log("Sheet shown with:", payload);
    },
    onHide: (returnValue) => {
      console.log("Sheet hidden with:", returnValue);
    },
  });
}
```

## iOS 18 Modal Animation

Enable native-like iOS 18 modal sheet animations:

```tsx
<BottomSheet
  id={id}
  iosModalSheetTypeOfAnimation={true}
  snapPoints={['50%', '90%', '100%']}
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
    snapPoints: ['50%', '90%', '100%'],
  }}
/>
```

## Advanced Features

### Custom Contexts

Use separate contexts for nested sheets or modals:

```tsx
// In a modal or nested sheet
<SheetProvider context="modal-context">
  {/* Register sheets for this context */}
  {registerSheet('local-sheet', LocalSheet, 'modal-context')}
</SheetProvider>
```

### Sheet Instance Methods

Control sheets programmatically:

```tsx
const instance = SheetManager.get('example-sheet');

// Expand to maximum snap point
instance?.expand();

// Collapse to minimum snap point
instance?.collapse();

// Snap to specific index
instance?.snapToIndex(1);

// Snap to specific position
instance?.snapToPosition('75%');

// Close with return value
instance?.close({ value: { success: true } });
```

### Animation Configuration

Customize animations:

```tsx
instance?.expand({
  animationConfigs: {
    type: 'spring',
    damping: 20,
    stiffness: 90,
  },
});
```

## API Reference

### `SheetManager`

Global manager for showing and hiding sheets.

```tsx
// Show a sheet
SheetManager.show<Id extends SheetIds>(
  id: Id,
  payload?: SheetPayload<Id>
): Promise<SheetReturnValue<Id>>

// Hide a sheet
SheetManager.hide(id: SheetIds): void

// Get sheet instance
SheetManager.get(id: SheetIds): BottomSheetInstance<Id> | undefined
```

### `BottomSheet` Props

All props from `@gorhom/bottom-sheet` are supported, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `SheetID<SheetIds>` | - | Unique identifier for the sheet |
| `stackBehavior` | `"push" \| "replace" \| "switch"` | `"switch"` | How sheets stack when opened (push is experimental) |
| `iosModalSheetTypeOfAnimation` | `boolean` | `false` | Enable iOS 18 modal animation |
| `clickThrough` | `boolean` | `false` | Allow tapping through backdrop |
| `opacity` | `number` | `0.45` | Backdrop opacity |
| `hardwareBackPressToClose` | `boolean` | `true` | Close on hardware back button |
| `onClose` | `(data?: unknown) => unknown` | - | Callback when sheet closes |
| `onBeforeShow` | `(data?: unknown) => void` | - | Callback before sheet shows |

### `BottomSheetNavigationOptions`

Screen options for navigation-based sheets:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `snapPoints` | `Array<string \| number>` | `['66%']` | Snap points for the sheet |
| `clickThrough` | `boolean` | `false` | Allow tapping through backdrop |
| `iosModalSheetTypeOfAnimation` | `boolean` | `false` | Enable iOS 18 modal animation |
| `opacity` | `number` | `0.45` | Backdrop opacity |

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
- Stack behavior demos (push (experimental), replace, switch)
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

