import { Stack } from "expo-router";

export default function _layout() {
  return (
    <Stack>
      <Stack.Screen name="(drawers)" options={{ headerShown: false }} />
      <Stack.Screen name="Contact" options={{ headerShown: false }} />
      <Stack.Screen name="UpdatePassword" options={{ headerShown: false }} />
      <Stack.Screen name="AboutUs" options={{ headerShown: false }} />
      <Stack.Screen
        name="EditBusinessProfile"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="UpdateProfile" options={{ headerShown: false }} />
    </Stack>
  );
}
