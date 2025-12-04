import { View, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export function PendingApprovalHeader({
  coopName,
  userName,
}: {
  coopName: string;
  userName?: string;
}) {
  const navigation = useNavigation() as any;

  return (
    <View className="bg-orange-500 px-4 pt-12 pb-6">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
          className="p-2 mr-3"
        >
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-lg">
            Hello, {userName || "Owner"}!
          </Text>
          <Text className="text-white text-2xl font-bold mt-1">{coopName}</Text>
          <Text className="text-orange-200 text-sm mt-1">
            Your cooperative is under review
          </Text>
        </View>
      </View>
    </View>
  );
}
