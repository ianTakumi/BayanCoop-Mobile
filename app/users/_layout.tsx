import { Stack } from "expo-router";
import React from "react";

export default function _layout() {
  return (
    <Stack>
      <Stack.Screen name="(drawers)" options={{ headerShown: false }} />
      <Stack.Screen name="Contact" options={{ headerShown: false }} />
      <Stack.Screen
        name="CoopRegisterScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="AboutUs" options={{ headerShown: false }} />
      <Stack.Screen name="UpdateProfile" options={{ headerShown: false }} />
      <Stack.Screen name="UpdatePassword" options={{ headerShown: false }} />
      <Stack.Screen name="Article" options={{ headerShown: false }} />
      <Stack.Screen name="Articles" options={{ headerShown: false }} />
      <Stack.Screen name="Product" options={{ headerShown: false }} />
      <Stack.Screen name="Checkout" options={{ headerShown: false }} />
    </Stack>
  );
}
