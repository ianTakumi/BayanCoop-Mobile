import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useSelector } from "react-redux";

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
            case "Inventory":
              return <Ionicons name="cube-outline" size={22} color={color} />;
            case "Source":
              return <Ionicons name="leaf-outline" size={22} color={color} />;
            case "Members":
              return <Ionicons name="people-outline" size={22} color={color} />;
            case "Profile":
              return <Ionicons name="person-outline" size={22} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tabs.Screen name="Index" options={{ title: "Home" }} />
      <Tabs.Screen name="Products" options={{ title: "Products" }} />
      <Tabs.Screen name="Orders" options={{ title: Orders }} />
    </Tabs>
  );
}
