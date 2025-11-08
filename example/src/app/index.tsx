import { Alert, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SheetManager } from "@niibase/bottom-sheet-manager";

export default function Screen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <Text style={styles.title}>Welcome to the Example App</Text>
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
          onPress={async () => {
            const result = await SheetManager.show("example-sheet");
            if (typeof result === "number") {
              Alert.alert(
                "Result from Sheet Manager",
                `Sheet Closed at index: ${result}`,
              );
            }
          }}
        >
          <Text style={styles.buttonText}>Example</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
        >
          <Text style={styles.buttonText}>Router</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#6200ea",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonPressed: {
    backgroundColor: "#3700b3",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
