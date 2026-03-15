import { ReactNode } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ViewStyle,
} from "react-native";

interface KeyboardAwareViewProps {
    children: ReactNode;
    style?: ViewStyle;
    keyboardVerticalOffset?: number;
}

/**
 * A reusable wrapper component that handles keyboard avoidance
 * consistently across iOS and Android.
 *
 * Per Expo docs (https://docs.expo.dev/guides/keyboard-handling):
 * - iOS: Uses "padding" behavior for smooth keyboard animation
 * - Android: Uses undefined - just having KeyboardAvoidingView prevents covering
 */
export function KeyboardAwareView({
    children,
    style,
    keyboardVerticalOffset = 0,
}: KeyboardAwareViewProps) {
    return (
        <KeyboardAvoidingView
            style={[styles.container, style]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={keyboardVerticalOffset}
        >
            {children}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});