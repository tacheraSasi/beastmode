import Colors from "@/constants/Colors";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareView } from "./keyboard-aware-view";

interface ScreenLayoutProps {
  children: React.ReactNode;
  styles?: object;
  fullScreen?: boolean;
  keyboardAware?: boolean;
  keyboardVerticalOffset?: number;
  /** Set to true when used inside a tab navigator to avoid double bottom spacing */
  insideTabs?: boolean;
}

/**
 * A reusable screen layout component that handles safe area, status bar, and optional keyboard awareness.
 * - By default, it wraps content in a SafeAreaView to respect device notches and edges.
 * - If `fullScreen` is true, it renders content without SafeAreaView for edge-to-edge layouts.
 * - If `keyboardAware` is true, it wraps content in a KeyboardAwareView to adjust for the keyboard.
 * - The `insideTabs` prop adjusts safe area edges when used within a tab navigator to prevent double spacing with the tab bar.
 */
export default function ScreenLayout({
  children,
  styles,
  fullScreen = false,
  keyboardAware = false,
  keyboardVerticalOffset = 0,
  insideTabs = false
}: ScreenLayoutProps) {
  const content = (
    <>
      {children}
    </>
  );

  if (fullScreen) {
    const fullScreenContent = (
      <View
        style={[
          screenLayoutStyles.container,
          screenLayoutStyles.fullScreen,
          ...(styles ? [styles] : []),
        ]}
      >
        {content}
      </View>
    );

    return keyboardAware ? (
      <KeyboardAwareView keyboardVerticalOffset={keyboardVerticalOffset}>
        {fullScreenContent}
      </KeyboardAwareView>
    ) : (
      fullScreenContent
    );
  }

  // When inside tabs, exclude bottom edge to avoid double spacing with tab bar
  const safeAreaEdges = insideTabs ? ['top', 'left', 'right'] as const : undefined;

  const safeAreaContent = (
    <SafeAreaView
      edges={safeAreaEdges}
      style={[
        screenLayoutStyles.container,
        { backgroundColor: Colors.light.background },
        ...(styles ? [styles] : []),
      ]}
    >
      {content}
    </SafeAreaView>
  );

  return keyboardAware ? (
    <KeyboardAwareView keyboardVerticalOffset={keyboardVerticalOffset}>
      {safeAreaContent}
    </KeyboardAwareView>
  ) : (
    safeAreaContent
  );
}

const screenLayoutStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreen: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
});
