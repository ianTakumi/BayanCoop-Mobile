import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useSelector } from "react-redux";
import { View, Text } from "react-native";

export default function TabLayout() {
  // Example: Get unread messages count from Redux
  const unreadCount = useSelector((state) => state.messages?.unreadCount || 0);

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
            case "Products":
              return <Ionicons name="cube-outline" size={22} color={color} />;
            case "Orders":
              return <Ionicons name="cart-outline" size={22} color={color} />;
            case "Messages":
              return (
                <Ionicons name="chatbubble-outline" size={22} color={color} />
              );
            case "Profile":
              return <Ionicons name="person-outline" size={22} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tabs.Screen name="Index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="Products" options={{ title: "Products" }} />
      <Tabs.Screen
        name="Orders"
        options={{
          title: "Orders",
          // Optional: Add badge for pending orders
          // tabBarBadge: 3
        }}
      />
      <Tabs.Screen
        name="Messages"
        options={{
          title: "Messages",
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tabs.Screen name="Profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
