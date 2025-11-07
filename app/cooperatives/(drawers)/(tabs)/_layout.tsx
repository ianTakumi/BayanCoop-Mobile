import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          height: 60,
          borderTopWidth: 0.3,
          borderTopColor: "#E5E7EB",
          backgroundColor: "#fff",
          paddingBottom: 5,
        },
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case "Index":
              return <Ionicons name="home-outline" size={22} color={color} />;

            case "Shop":
              return <Ionicons name="bag" size={22} color={color} />;

            case "Cart":
              return <Ionicons name="cart" size={22} color={color} />;

            case "Order":
              return <Ionicons name="reader" size={22} color={color} />;

            case "Profile":
              return <Ionicons name="person-outline" size={22} color={color} />;

            default:
              return null;
          }
        },
      })}
    >
      <Tabs.Screen name="Index" options={{ title: "Home" }} />
      <Tabs.Screen name="Shop" options={{ title: "Shop" }} />
      <Tabs.Screen name="Cart" options={{ title: "Cart" }} />
      <Tabs.Screen name="Order" options={{ title: "Order" }} />
      <Tabs.Screen name="Profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
