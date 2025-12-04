import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

export default function DrawerLayout() {
  const coop = useSelector((state) => state.cooperative.cooperativeLoggedIn);
  const isApproved = coop?.isApproved;

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: "#FFFFFF",
          width: 280,
        },
        drawerActiveTintColor: "#4CAF50",
        drawerInactiveTintColor: "#666666",
        drawerActiveBackgroundColor: "#E8F5E8",
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: "500",
          marginLeft: -16,
        },
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 8,
          marginVertical: 2,
        },
        sceneContainerStyle: {
          backgroundColor: "#F9F9F9",
        },
      }}
    >
      {/* Main Dashboard - Tabs Group */}
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
