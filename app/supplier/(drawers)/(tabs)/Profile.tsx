import { setSupplier } from "@/redux/slices/supplierSlice";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import client from "@/utils/axiosInstance";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  Feather,
  AntDesign,
  FontAwesome6,
} from "@expo/vector-icons";
import ActionSheetHelper from "@/utils/ActionSheetHelper";
import { logout } from "@/redux/slices/authSlice";
import { supplierLogout } from "@/redux/slices/supplierSlice";

export default function SupplierProfile() {
  const supplier = useSelector((state) => state.supplier.supplier);
  const user = useSelector((state) => state.auth.user); // Get user from auth state
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock stats data
  const [stats, setStats] = useState({
    totalProducts: 24,
    activeOrders: 8,
    lowStock: 5,
    totalRevenue: "₱156,800",
    monthlyRevenue: "₱45,200",
    totalCustomers: 42,
    rating: 4.8,
    reviews: 128,
  });

  // SupplierProfile.tsx - Update handleLogout
  const handleLogout = () => {
    ActionSheetHelper.showLogoutConfirmation(() => {
      // 1. Clear Redux state
      dispatch(logout());
      dispatch(supplierLogout());

      // 2. Use navigation.reset for Expo Router
      router.navigate({
        pathname: "/LoginScreen",
      });
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call to refresh supplier data
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const getStatusBadge = () => {
    if (!supplier) return null;

    let statusColor = "#6B7280";
    let statusText = "Inactive";

    // Note: Your supplier object has is_approved and is_active, not k_approved and k_active
    if (supplier.is_approved && supplier.is_active) {
      statusColor = "#10B981";
      statusText = "Active & Verified";
    } else if (supplier.is_approved) {
      statusColor = "#F59E0B";
      statusText = "Approved (Inactive)";
    } else if (supplier.is_active) {
      statusColor = "#3B82F6";
      statusText = "Pending Approval";
    }

    return (
      <View
        className="px-3 py-1 rounded-full items-center justify-center"
        style={{ backgroundColor: `${statusColor}20` }}
      >
        <Text className="text-xs font-medium" style={{ color: statusColor }}>
          {statusText}
        </Text>
      </View>
    );
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user) return "SU";
    const { first_name, last_name } = user;
    return `${first_name?.[0] || ""}${last_name?.[0] || ""}`.toUpperCase();
  };

  // Get supplier initials
  const getSupplierInitials = () => {
    if (!supplier) return "SP";
    return supplier.name
      ? supplier.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "SP";
  };

  if (!supplier || !user) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text className="text-gray-500 mt-4">Loading profiles...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6">
        <Text className="text-2xl font-bold text-gray-900">Profile</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Supplier Profile Section */}
        <View className="bg-[#4CAF50] mx-4 mt-4 py-8 items-center rounded-2xl">
          <View className="relative">
            <View className="bg-white w-20 h-20 rounded-full items-center justify-center mb-4">
              <Text className="text-black text-2xl font-bold">
                {getSupplierInitials()}
              </Text>
            </View>
            {getStatusBadge()}
          </View>
          <Text className="text-xl font-bold text-white mb-1">
            {supplier.name}
          </Text>
          <Text className="text-gray-200 text-base">{supplier.email}</Text>

          <TouchableOpacity
            onPress={() => router.push("/supplier/EditBusinessProfile")}
            className="mt-4 bg-white/20 px-6 py-2 rounded-full"
          >
            <Text className="text-white font-medium">
              Edit Business Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Business Status Card */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl border border-gray-200">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-700 font-medium">Business Status</Text>
              <View className="flex-row items-center mt-1">
                <View
                  className={`w-3 h-3 rounded-full mr-2 ${
                    supplier.status === "pending"
                      ? "bg-yellow-500"
                      : supplier.status === "approved"
                        ? "bg-green-500"
                        : supplier.status === "rejected"
                          ? "bg-red-500"
                          : "bg-gray-500"
                  }`}
                />
                <Text className="text-gray-800 font-medium capitalize">
                  {supplier.status}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-gray-500 text-sm">Type</Text>
              <Text className="text-gray-800 font-medium capitalize">
                {supplier.type || "produce"}
              </Text>
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-gray-500 text-sm mb-1">Address</Text>
            <Text className="text-gray-800">
              {supplier.address || "Not specified"}
            </Text>
            <Text className="text-gray-600 text-sm">
              {[
                supplier.barangay,
                supplier.city,
                supplier.province,
                supplier.region,
              ]
                .filter(Boolean)
                .join(", ")}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row mx-4 mt-6 bg-white rounded-xl p-1 border border-gray-200">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg items-center ${activeTab === "overview" ? "bg-green-100" : ""}`}
            onPress={() => setActiveTab("overview")}
          >
            <Text
              className={`font-medium ${activeTab === "overview" ? "text-green-700" : "text-gray-600"}`}
            >
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg items-center ${activeTab === "performance" ? "bg-green-100" : ""}`}
            onPress={() => setActiveTab("performance")}
          >
            <Text
              className={`font-medium ${activeTab === "performance" ? "text-green-700" : "text-gray-600"}`}
            >
              Performance
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        {activeTab === "overview" && (
          <View>
            {/* Business Stats */}
            <View className="bg-white mt-6 mx-4 rounded-2xl p-6 border border-gray-200">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold text-gray-900">
                  Business Overview
                </Text>
                <Text className="text-green-600 text-sm font-medium">
                  Real-time
                </Text>
              </View>

              <View className="grid grid-cols-2 gap-4">
                <View className="bg-green-50 p-4 rounded-xl">
                  <View className="flex-row items-center">
                    <View className="bg-green-100 p-2 rounded-lg">
                      <Ionicons name="cube-outline" size={20} color="#10B981" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-gray-500 text-sm">
                        Total Products
                      </Text>
                      <Text className="text-gray-900 font-bold text-xl">
                        {stats.totalProducts}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="bg-blue-50 p-4 rounded-xl">
                  <View className="flex-row items-center">
                    <View className="bg-blue-100 p-2 rounded-lg">
                      <Ionicons name="cart-outline" size={20} color="#3B82F6" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-gray-500 text-sm">
                        Active Orders
                      </Text>
                      <Text className="text-gray-900 font-bold text-xl">
                        {stats.activeOrders}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="bg-amber-50 p-4 rounded-xl">
                  <View className="flex-row items-center">
                    <View className="bg-amber-100 p-2 rounded-lg">
                      <Feather name="alert-circle" size={20} color="#F59E0B" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-gray-500 text-sm">Low Stock</Text>
                      <Text className="text-gray-900 font-bold text-xl">
                        {stats.lowStock}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="bg-purple-50 p-4 rounded-xl">
                  <View className="flex-row items-center">
                    <View className="bg-purple-100 p-2 rounded-lg">
                      <FontAwesome name="users" size={20} color="#8B5CF6" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-gray-500 text-sm">Customers</Text>
                      <Text className="text-gray-900 font-bold text-xl">
                        {stats.totalCustomers}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Revenue Section */}
              <View className="mt-6 pt-6 border-t border-gray-200">
                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-gray-500 text-sm">
                      Monthly Revenue
                    </Text>
                    <Text className="text-green-600 font-bold text-2xl">
                      {stats.monthlyRevenue}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-gray-500 text-sm">Total Revenue</Text>
                    <Text className="text-gray-900 font-bold text-2xl">
                      {stats.totalRevenue}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
              <View className="px-6 py-4 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Manage your supplier operations
                </Text>
              </View>

              <TouchableOpacity
                className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
                onPress={() =>
                  router.push("/supplier/(drawers)/(tabs)/Products")
                }
              >
                <View className="flex-row items-center">
                  <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                    <Ionicons name="cube-outline" size={20} color="#10B981" />
                  </View>
                  <View>
                    <Text className="text-gray-900 font-medium">
                      Products Management
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Manage products and stock levels
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
                onPress={() => router.push("/supplier/(drawers)/(tabs)/Orders")}
              >
                <View className="flex-row items-center">
                  <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                    <Ionicons name="cart-outline" size={20} color="#3B82F6" />
                  </View>
                  <View>
                    <Text className="text-gray-900 font-medium">
                      Orders & Transactions
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      View and manage customer orders
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                className="px-6 py-4 flex-row items-center justify-between"
                onPress={() => router.push("/supplier/settings")}
              >
                <View className="flex-row items-center">
                  <View className="bg-amber-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                    <Ionicons
                      name="settings-outline"
                      size={20}
                      color="#F59E0B"
                    />
                  </View>
                  <View>
                    <Text className="text-gray-900 font-medium">
                      Business Settings
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Update business information
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Account & Security Section */}
            <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
              <View className="px-6 py-4 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900">
                  Account & Security
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Manage your account settings and security
                </Text>
              </View>

              {/* Update User Profile */}
              <TouchableOpacity
                className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
                onPress={() => router.push("/supplier/UpdateProfile")}
              >
                <View className="flex-row items-center">
                  <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                    <AntDesign name="user" size={20} color="#3B82F6" />
                  </View>
                  <View>
                    <Text className="text-gray-900 font-medium">
                      Update Profile
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Edit personal information
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {/* Change Password */}
              <TouchableOpacity
                className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
                onPress={() => router.push("/supplier/UpdatePassword")}
              >
                <View className="flex-row items-center">
                  <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                    <FontAwesome6 name="lock" size={20} color="#10B981" />
                  </View>
                  <View>
                    <Text className="text-gray-900 font-medium">
                      Change Password
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Update your account password
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {/* Settings */}
              <TouchableOpacity
                className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
                onPress={() => router.push("/users/settings")}
              >
                <View className="flex-row items-center">
                  <View className="bg-purple-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                    <Ionicons
                      name="settings-outline"
                      size={20}
                      color="#8B5CF6"
                    />
                  </View>
                  <View>
                    <Text className="text-gray-900 font-medium">
                      Account Settings
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Notification preferences and more
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {/* Log Out */}
              <TouchableOpacity
                className="px-6 py-4 flex-row items-center justify-between"
                onPress={handleLogout}
              >
                <View className="flex-row items-center">
                  <View className="bg-red-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color="#EF4444"
                    />
                  </View>
                  <View>
                    <Text className="text-red-600 font-medium">Log out</Text>
                    <Text className="text-gray-500 text-sm">
                      Further secure your account for safety
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* More Section */}
            <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200 mb-8">
              <View className="px-6 py-4 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900">
                  More
                </Text>
              </View>

              {/* Help & Support */}
              <TouchableOpacity
                className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
                onPress={() => router.push("/supplier/Contact")}
              >
                <View className="flex-row items-center">
                  <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                    <Ionicons
                      name="help-circle-outline"
                      size={20}
                      color="#10B981"
                    />
                  </View>
                  <Text className="text-gray-900 font-medium">
                    Help & Support
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {/* About App */}
              <TouchableOpacity
                className="px-6 py-4 flex-row items-center justify-between"
                onPress={() => router.push("/supplier/AboutUs")}
              >
                <View className="flex-row items-center">
                  <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                    <Ionicons
                      name="information-circle-outline"
                      size={20}
                      color="#10B981"
                    />
                  </View>
                  <Text className="text-gray-900 font-medium">About App</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === "performance" && (
          <View className="bg-white mt-6 mx-4 rounded-2xl p-6 border border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Performance Metrics
            </Text>

            {/* Rating */}
            <View className="bg-gray-50 p-4 rounded-xl mb-4">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-gray-700 font-medium">Rating</Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text className="text-gray-900 font-bold text-lg ml-2">
                      {stats.rating}
                    </Text>
                    <Text className="text-gray-500 text-sm ml-2">
                      ({stats.reviews} reviews)
                    </Text>
                  </View>
                </View>
                <View className="bg-yellow-100 px-3 py-1 rounded-full">
                  <Text className="text-yellow-800 text-sm font-medium">
                    Excellent
                  </Text>
                </View>
              </View>
            </View>

            {/* Order Fulfillment */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-700 font-medium">
                  Order Fulfillment Rate
                </Text>
                <Text className="text-green-600 font-bold">98%</Text>
              </View>
              <View className="w-full bg-gray-200 rounded-full h-2">
                <View
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: "98%" }}
                />
              </View>
            </View>

            {/* Response Time */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-700 font-medium">
                  Average Response Time
                </Text>
                <Text className="text-blue-600 font-bold">2.3 hours</Text>
              </View>
              <View className="w-full bg-gray-200 rounded-full h-2">
                <View
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "85%" }}
                />
              </View>
            </View>

            {/* Customer Satisfaction */}
            <View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-700 font-medium">
                  Customer Satisfaction
                </Text>
                <Text className="text-purple-600 font-bold">96%</Text>
              </View>
              <View className="w-full bg-gray-200 rounded-full h-2">
                <View
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: "96%" }}
                />
              </View>
            </View>

            {/* Account & Security Section for other tabs */}
            <View className="bg-white mt-6 rounded-2xl overflow-hidden border border-gray-200">
              <View className="px-6 py-4 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900">
                  Account & Security
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Manage your account settings and security
                </Text>
              </View>

              <TouchableOpacity
                className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
                onPress={() => router.push("/users/profile/update")}
              >
                <View className="flex-row items-center">
                  <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                    <AntDesign name="user" size={20} color="#3B82F6" />
                  </View>
                  <Text className="text-gray-900 font-medium">
                    Update Profile
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
                onPress={() => router.push("/users/update-password")}
              >
                <View className="flex-row items-center">
                  <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                    <FontAwesome6 name="lock" size={20} color="#10B981" />
                  </View>
                  <Text className="text-gray-900 font-medium">
                    Change Password
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                className="px-6 py-4 flex-row items-center justify-between"
                onPress={handleLogout}
              >
                <View className="flex-row items-center">
                  <View className="bg-red-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color="#EF4444"
                    />
                  </View>
                  <Text className="text-red-600 font-medium">Log out</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
