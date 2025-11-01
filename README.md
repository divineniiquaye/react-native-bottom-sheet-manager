# Bottom Sheet Router & Manager

A bottom sheet manager inspired by package [react-native-actions-sheet](https://github.com/ammarahm-ed/@repo/bottom-sheet) and adapted to package [@gorhom/bottom-sheet](https://github.com/gorhom/react-native-bottom-sheet).


## Installation

Add it to your project with package.json:

```bash
npm install @niibase/bottom-sheet-manager
```

## Usage

`SheetManager` is great because it helps you save lots of development time. One great feature is that you can reuse the same modal sheet in the app and don't have to create or define it in multiple places. Another is that you don't have to write boilerplate for every component. Everything just works.

```tsx
import { BottomSheet } from '@niibase/bottom-sheet-manager';
```

Create your BottomSheet component and export it.

```tsx
function ExampleSheet({ id }: SheetProps<"example">) {
  return (
    <BottomSheet id={id}>
      <View>
        <Text>Hello World</Text>
      </View>
    </BottomSheet>
  );
}

export default ExampleSheet;
```

Create a `sheets.ts` file and import your sheet then register it.

```ts
import {registerSheet} from '@niibase/bottom-sheet-manager';
import ExampleSheet from 'example-sheet';

registerSheet('example-sheet', ExampleSheet);

// We extend some of the types here to give us great intellisense
// across the app for all registered sheets.
declare module '@niibase/bottom-sheet-manager' {
  interface Sheets {
    'example-sheet': SheetDefinition;
  }
}

export {};
```

In `App.js` import `sheets.ts` and wrap your app in `SheetProvider`.

```tsx
import { SheetProvider } from '@niibase/bottom-sheet-manager';
import 'sheets.tsx';

function App() {
  return (
    <SheetProvider>
      {
        // your app components
      }
    </SheetProvider>
  );
}
```

Open the modal sheet from anywhere in the app.

```jsx
SheetManager.show('example-sheet');
```

Hide the modal sheet

```jsx
SheetManager.hide('example-sheet');
```

### As a React Navigation Screen

Support for React Navigation v6 and v7 is available including expo router support.

```tsx
import {
  createBottomSheetNavigator,
  BottomSheetNavigationOptions,
  BottomSheetNavigationEventMap,
  BottomSheetNavigationState,
} from "@repo/bottom-sheet";
import { Slot, withLayoutContext } from "expo-router";

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
  if (typeof window === "undefined") return <Slot />;
  return (
    <BottomSheet
      screenOptions={
        {
          // API Reference: `@niibase/bottom-sheet-manager/router/types.ts`
          // And: https://gorhom.github.io/react-native-bottom-sheet/modal/props/
        }
      }
    />
  );
}
```

## Examples

The source code for the example (showcase) app is under the [/example](/example/) directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](./LICENSE)

---

<div align="center">

**Built with ❤️ by [@divineniiquaye](https://github.com/divineniiquaye) using React Native and [@gorhom/bottom-sheet](https://github.com/gorhom/react-native-bottom-sheet).**

[⬆ Back to Top](#-installation)

</div>

