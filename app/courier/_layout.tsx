import { Stack } from "expo-router";
import React from "react";

export default function _layout() {
  return (
    <Stack>
      <Stack.Screen name="(drawers)" options={{ headerShown: false }} />
      <Stack.Screen name="Contact" options={{ headerShown: false }} />
      <Stack.Screen name="AboutUs" options={{ headerShown: false }} />
    </Stack>
  );
}
