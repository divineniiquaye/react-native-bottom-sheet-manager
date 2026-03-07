import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the package root (one level up from scripts/)
const packageRoot = dirname(__dirname);
const maybeNodeModules = resolve(packageRoot, "../");
const isInNodeModules =
    maybeNodeModules.endsWith("node_modules") ||
    maybeNodeModules.endsWith("node_modules/@niibase");

if (isInNodeModules) {
    // Fix keyboard not closing issue: https://github.com/gorhom/react-native-bottom-sheet/pull/2511
    const gorhamBottomSheet = join(
        maybeNodeModules,
        "@gorhom/bottom-sheet/src/components/bottomSheet/BottomSheet.tsx",
    );

    try {
        const content = readFileSync(gorhamBottomSheet, "utf-8");
        const updated = content.replace(
            /index\s*=\s*highestDetentPosition\s*\?\?\s*DEFAULT_KEYBOARD_INDEX\s*;/g,
            "index = detents?.indexOf(highestDetentPosition ?? 0) ?? DEFAULT_KEYBOARD_INDEX;",
        );
        writeFileSync(gorhamBottomSheet, updated, "utf-8");
        console.log("Applied patch for @gorhom/bottom-sheet");
    } catch (error) {
        console.error("Error updating @gorhom/bottom-sheet:", error.message);
    }
} else {
    execSync("yarn run patch", { stdio: "inherit" });
}
