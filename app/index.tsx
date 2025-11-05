import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export default function Index() {
  const router = useRouter();

  const { hasOnboarded, isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasOnboarded) {
        if (isAuthenticated) {
          // ✅ Check the role before navigating
          if (user?.role === "user") {
            router.replace("/users/(drawers)/(tabs)");
          }
        } else {
          router.replace("/LoginScreen");
        }
      } else {
        router.replace("/Onboarding");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasOnboarded, isAuthenticated, user?.role]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#22C55E" />
    </View>
  );
}
