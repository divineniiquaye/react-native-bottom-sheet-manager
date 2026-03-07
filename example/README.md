# React Native Bottom Sheet Manager Showcase

This directory contains a comprehensive example application demonstrating the full capabilities of `@niibase/bottom-sheet-manager`. It highlights how easily you can implement advanced modal layering strategies, iOS 18 style animations, and even an entire navigation router powered by Expo Router.

## Features Demonstrated

The showcase app is divided into distinct sections exploring different API capabilities:

### Basic Sheet Usage
See a standard bottom sheet in action. It mounts an independent `<BottomSheet>` with customizable snap points.

### Stack Behaviors
The manager elegantly handles what happens when presenting a sheet over an already open sheet. We demonstrate:
- **Switch**: The default behavior. Closes the currently active sheet to present the new one.
- **Replace**: Instantly swaps only the content inside the sheet container with a smooth cross-fade animation, keeping the container mounted.
- **Push (Experimental)**: Build an intricate navigation layer of stacked overlapping bottom sheets that retain state history allowing you to easily go back.

### iOS 18 Modal Animation
This demo showcases beautiful native-like scale and radius animations applied to background content directly behind your bottom sheets, simulating native iOS 18 environments.

### Router Integration (`createBottomSheetNavigator`)
A deep-dive into utilizing `expo-router` tightly integrated directly with a robust bottom sheet layout context.
- **Profile**: A full 100% height screen inside a sheet.
- **Settings**: A multi-tiered settings hierarchy.
- **Comments**: An interactive layout adapting directly to your gestures as you pull it all the way up.

## Getting Started

To run the example app locally, simply navigate into this directory, install the required packages, and run your preferred platform:

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Build and run:
   ```bash
   yarn ios
   # OR
   yarn android
   ```
