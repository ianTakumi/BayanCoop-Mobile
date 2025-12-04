import { setCooperativeLoggedIn } from "@/redux/slices/coopSlice";
import ActionSheetHelper from "@/utils/ActionSheetHelper";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import client from "@/utils/axiosInstance";

export default function CoopProfile() {
  const coop = useSelector((state) => state.cooperative.cooperativeLoggedIn);
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

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

  if (!coop) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text>Loading cooperative profile...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 pt-5">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 ">
        <Text className="text-2xl font-bold text-gray-900 ">
          Cooperative Profilee
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Cooperative Header */}
        <View className="bg-[#4CAF50] mx-4 py-8 items-center border-b border-gray-200 rounded-xl">
          <View className="bg-white w-20 h-20 rounded-full items-center justify-center mb-4">
            <Text className="text-black text-2xl font-bold">
              {coop.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>
          <Text className="text-xl font-bold text-white mb-1">{coop.name}</Text>
          <Text className="text-gray-200 text-base">{coop.email}</Text>
          <Text className="text-gray-200 text-sm mt-1">{coop.address}</Text>
        </View>

        {/* Business Overview Section */}
        <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              Business Overview
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Your cooperative business summary
            </Text>
          </View>

          {/* Business Stats */}
          <View className="px-6 py-4 border-b border-gray-200">
            <View className="flex-row justify-between mb-4">
              <View className="flex-1">
                <Text className="text-gray-500 text-sm">Total Products</Text>
                <Text className="text-gray-900 font-bold text-lg">156</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-sm">Low Stock</Text>
                <Text className="text-red-600 font-bold text-lg">12</Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-gray-500 text-sm">Today's Sales</Text>
                <Text className="text-gray-900 font-bold text-lg">₱12,450</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-sm">Monthly Revenue</Text>
                <Text className="text-green-600 font-bold text-lg">
                  ₱245,800
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cooperative Management Section */}
        <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              Business Management
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Manage your cooperative operations
            </Text>
          </View>

          {/* Inventory Management */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/cooperative/Inventory")}
          >
            <View className="flex-row items-center">
              <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="cube-outline" size={20} color="#10B981" />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Inventory Management
                </Text>
                <Text className="text-gray-500 text-sm">
                  Manage products and stock levels
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Sales & Transactions */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/cooperative/Sales")}
          >
            <View className="flex-row items-center">
              <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="cash-outline" size={20} color="#10B981" />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Sales & Transactions
                </Text>
                <Text className="text-gray-500 text-sm">
                  View sales history and records
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Business Reports */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/cooperative/Reports")}
          >
            <View className="flex-row items-center">
              <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="bar-chart-outline" size={20} color="#10B981" />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Business Reports
                </Text>
                <Text className="text-gray-500 text-sm">
                  Analytics and performance reports
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Cooperative Settings */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between"
            onPress={() => router.push("/cooperative/Settings")}
          >
            <View className="flex-row items-center">
              <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="business-outline" size={20} color="#10B981" />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Cooperative Settings
                </Text>
                <Text className="text-gray-500 text-sm">
                  Manage business information
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Switch to User Profile */}
        <TouchableOpacity
          className="bg-white mt-6 mx-4 rounded-2xl px-6 py-4 flex-row items-center justify-between border border-gray-200 mb-8"
          onPress={confirmSwitchProfile}
        >
          <View className="flex-row items-center">
            <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
              <Ionicons name="person-outline" size={20} color="#3B82F6" />
            </View>
            <View>
              <Text className="text-blue-600 font-medium">
                Switch to User Profile
              </Text>
              <Text className="text-gray-500 text-sm">
                Go back to personal profile
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
