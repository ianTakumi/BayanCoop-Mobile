import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import { setCooperativeLoggedIn } from "@/redux/slices/coopSlice";

export default function DrawerLayout() {
  const coop = useSelector((state) => state.cooperative.cooperativeLoggedIn);
  const isApproved = coop?.isApproved;
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          // Clear cooperative data
          dispatch(setCooperativeLoggedIn(null));
          // Navigate to login screen
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const switchToUserProfile = () => {
    // Clear cooperative data and switch back to user profile
    dispatch(setCooperativeLoggedIn(null));
    router.replace("/users/(drawers)/(tabs)");
  };

  const confirmSwitchProfile = () => {
    Alert.alert(
      "Switch to User Profile",
      "Are you sure you want to switch back to your personal profile?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Switch",
          onPress: switchToUserProfile,
        },
      ]
    );
  };

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: handleLogout,
      },
    ]);
  };

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
          marginLeft: 0,
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

      {/* Events Screen */}
      <Drawer.Screen
        name="Events"
        options={{
          drawerLabel: "Events",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      {/* Articles Screen */}
      <Drawer.Screen
        name="Articles"
        options={{
          drawerLabel: "Articles",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
