import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Get all necessary state
  const coop = useSelector(
    (state: RootState) => state.cooperative?.cooperativeLoggedIn || false
  );
  const { hasOnboarded, isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const determineInitialScreen = async () => {
      // No need for setTimeout - direct logic
      if (!hasOnboarded) {
        router.replace("/Onboarding");
        return;
      }

      if (!isAuthenticated) {
        router.replace("/LoginScreen");
        return;
      }

      // Authenticated user
      if (user?.role === "user") {
        // Check for stored preference first (for returning users)
        try {
          const storedProfile =
            await AsyncStorage.getItem("@preferred_profile");

          // Priority: 1. Stored preference 2. Current state 3. Default to user
          const shouldShowCoop = storedProfile === "coop" || coop;

          if (shouldShowCoop) {
            await AsyncStorage.setItem("@preferred_profile", "coop");
            router.replace("/cooperatives/(drawers)/(tabs)/Index");
          } else {
            await AsyncStorage.setItem("@preferred_profile", "user");
            router.replace("/users/(drawers)/(tabs)");
          }
        } catch (error) {
          // Fallback if AsyncStorage fails
          if (coop) {
            router.replace("/cooperatives/(drawers)/(tabs)/Index");
          } else {
            router.replace("/users/(drawers)/(tabs)");
          }
        }
      } else if (user?.role === "supplier") {
        // Direct cooperative user (not switching)
        router.replace("/supplier/(drawers)/(tabs)/Index");
      } else {
        // Other roles or undefined
        router.replace("/LoginScreen");
      }

      setIsChecking(false);
    };

    determineInitialScreen();
  }, [hasOnboarded, isAuthenticated, user?.role, coop]);

  // Quick fallback in case something goes wrong
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isChecking) {
        // Force navigation after 3 seconds if stuck
        if (isAuthenticated) {
          router.replace("/users/(drawers)/(tabs)");
        } else {
          router.replace("/LoginScreen");
        }
        setIsChecking(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isChecking]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#22C55E" />
      <Text className="mt-2 text-gray-600">
        {!hasOnboarded
          ? "Loading onboarding..."
          : !isAuthenticated
            ? "Redirecting to login..."
            : user?.role === "user"
              ? `Loading ${coop ? "cooperative" : "user"} profile...`
              : "Loading..."}
      </Text>
    </View>
  );
}
