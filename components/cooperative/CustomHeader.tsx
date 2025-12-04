import { View, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface CustomHeaderProps {
  title: string;
  bgColor?: string;
}

export function CustomHeader({
  title,
  bgColor = "bg-green-600",
}: CustomHeaderProps) {
  const navigation = useNavigation() as any;

  return (
    <View className={`${bgColor} px-4 pt-12 pb-6`}>
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
          className="p-2 mr-3"
        >
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-lg">Hello, Owner!</Text>
          <Text className="text-white text-2xl font-bold mt-1">{title}</Text>
          <Text className="text-green-200 text-sm mt-1">
            Your store performance dashboard
          </Text>
        </View>
      </View>
    </View>
  );
}
