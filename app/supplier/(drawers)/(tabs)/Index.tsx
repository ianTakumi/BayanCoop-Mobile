import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setSupplier } from "@/redux/slices/supplierSlice";
import client from "@/utils/axiosInstance";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
  AntDesign,
  Entypo,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SupplierDashboard() {
  const user = useSelector((state) => state.auth.user);
  const supplier = useSelector((state) => state.supplier.supplier);
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  // Check if supplier is pending approval
  const isPendingApproval =
    supplier?.status === "pending" || !supplier?.is_approved;

  // Fetch supplier data
  const fetchSupplierData = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/suppliers/${user.id}`);
      if (res.status === 200) {
        dispatch(setSupplier(res.data.data));
      }
    } catch (err) {
      console.log("Error fetching supplier data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      // Mock data for demo
      const mockStats = {
        totalOrders: 42,
        pendingOrders: 8,
        completedOrders: 34,
        totalRevenue: "₱156,800",
        monthlyRevenue: "₱45,200",
        activeProducts: 24,
        lowStockProducts: 5,
        customerCount: 32,
        averageRating: 4.8,
      };

      const mockRecentOrders = [
        {
          id: "ORD-0012",
          cooperative: "Bayanihan Farmers Cooperative",
          amount: "₱2,500",
          status: "pending",
          items: "50kg Organic Rice",
          date: "Today, 10:30 AM",
        },
        {
          id: "ORD-0011",
          cooperative: "Green Valley Cooperative",
          amount: "₱1,850",
          status: "processing",
          items: "25kg Carrots, 15kg Tomatoes",
          date: "Yesterday, 2:15 PM",
        },
        {
          id: "ORD-0010",
          cooperative: "Mountain Fresh Producers",
          amount: "₱3,200",
          status: "delivered",
          items: "100kg Potatoes",
          date: "Dec 2, 9:00 AM",
        },
      ];

      const mockLowStockProducts = [
        { id: "1", name: "Organic Tomatoes", stock: 8, minStock: 20 },
        { id: "2", name: "Fresh Carrots", stock: 15, minStock: 30 },
        { id: "3", name: "Native Chicken", stock: 12, minStock: 25 },
      ];

      setStats(mockStats);
      setRecentOrders(mockRecentOrders);
      setLowStockProducts(mockLowStockProducts);
    } catch (err) {
      console.log("Error fetching stats:", err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchSupplierData(), fetchDashboardStats()]);
    setRefreshing(false);
  };

  useEffect(() => {
    if (user.id) {
      fetchSupplierData();
      fetchDashboardStats();
    }
  }, [user.id]);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text className="text-gray-500 mt-4">Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Pending Approval Banner - Top of Dashboard */}
        {isPendingApproval && (
          <View className="mx-4 mt-20">
            {/* Main Pending Banner */}
            <View className="bg-amber-500 rounded-2xl shadow-lg overflow-hidden mb-3">
              {/* Decorative accent line */}
              <View className="h-1 bg-amber-400" />
              <View className="p-5">
                <View className="flex-row items-start">
                  <View className="bg-white/20 p-3 rounded-full mr-4">
                    <MaterialIcons
                      name="pending-actions"
                      size={30}
                      color="white"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold mb-1">
                      Awaiting Approval
                    </Text>
                    <Text className="text-white/90 text-sm mb-3">
                      Your supplier account is currently under review. You'll be
                      able to access all features once approved.
                    </Text>
                    <View className="flex-row items-center">
                      <Feather name="clock" size={16} color="white" />
                      <Text className="text-white text-xs ml-2">
                        Submitted on:{" "}
                        {new Date(supplier?.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push("/supplier/settings")}
                    className="bg-white/30 p-2 rounded-full"
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Progress Indicator */}
              <View className="px-5 pb-4">
                <View className="bg-white/20 rounded-full h-2">
                  <View className="bg-white h-2 rounded-full w-3/4" />
                </View>
                <View className="flex-row justify-between mt-2">
                  <View className="items-center">
                    <View className="bg-white w-4 h-4 rounded-full" />
                    <Text className="text-white text-xs mt-1">Submitted</Text>
                  </View>
                  <View className="items-center">
                    <View className="border-2 border-white w-4 h-4 rounded-full" />
                    <Text className="text-white text-xs mt-1">
                      Under Review
                    </Text>
                  </View>
                  <View className="items-center">
                    <View className="border-2 border-white w-4 h-4 rounded-full" />
                    <Text className="text-white text-xs mt-1">Approved</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Information Card */}
            <View className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
              <View className="flex-row items-center">
                <Ionicons name="information-circle" size={20} color="#F59E0B" />
                <Text className="text-amber-800 font-medium ml-2 text-sm">
                  What happens next?
                </Text>
              </View>
              <View className="mt-2 space-y-2">
                <View className="flex-row items-start">
                  <Text className="text-amber-600 text-xs mr-2">•</Text>
                  <Text className="text-gray-700 text-xs flex-1">
                    Our team will review your application within 2-3 business
                    days
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Text className="text-amber-600 text-xs mr-2">•</Text>
                  <Text className="text-gray-700 text-xs flex-1">
                    You'll receive an email notification once approved
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Text className="text-amber-600 text-xs mr-2">•</Text>
                  <Text className="text-gray-700 text-xs flex-1">
                    Complete your profile setup while waiting
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Limited Access Notice for Pending Suppliers */}
        {isPendingApproval && (
          <View className="mx-6 mt-10">
            <View className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <View className="flex-row items-center mb-4">
                <View className="bg-blue-50 p-3 rounded-full mr-4 border border-blue-100">
                  <MaterialCommunityIcons
                    name="lock-clock"
                    size={24}
                    color="#3B82F6"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900">
                    Limited Access Mode
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    While waiting for approval, you have access to:
                  </Text>
                </View>
              </View>

              <View>
                <View className="flex-row items-center bg-green-50 p-3 rounded-lg border border-green-100 mb-5">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text className="text-gray-700 ml-3 font-medium">
                    Profile Setup
                  </Text>
                </View>
                <View className="flex-row items-center bg-green-50 p-3 rounded-lg border border-green-100 mb-5">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text className="text-gray-700 ml-3 font-medium">
                    Product Management
                  </Text>
                </View>
                <View className="flex-row items-center bg-green-50 p-3 rounded-lg border border-green-100 mb-5">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text className="text-gray-700 ml-3 font-medium">
                    Business Information
                  </Text>
                </View>
                <View className="flex-row items-center bg-red-50 p-3 rounded-lg border border-red-100 mb-5">
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                  <Text className="text-gray-600 ml-3 font-medium">
                    Receive Orders
                  </Text>
                </View>
                <View className="flex-row items-center bg-red-50 p-3 rounded-lg border border-red-100 mb-5">
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                  <Text className="text-gray-600 ml-3 font-medium">
                    Marketplace Listing
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Stats Grid (Conditional based on approval) */}
        {!isPendingApproval && stats ? (
          <View className="px-6 -mt-6">
            <View className="bg-white rounded-2xl shadow-lg p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-900">
                  Business Overview
                </Text>
                <Text className="text-green-600 text-sm font-medium">
                  Today
                </Text>
              </View>

              <View className="grid grid-cols-2 gap-4">
                {/* Total Orders */}
                <View className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-gray-500 text-sm">
                        Total Orders
                      </Text>
                      <Text className="text-gray-900 font-bold text-2xl mt-1">
                        {stats.totalOrders}
                      </Text>
                    </View>
                    <View className="bg-blue-100 p-3 rounded-lg">
                      <Ionicons name="cart-outline" size={24} color="#3B82F6" />
                    </View>
                  </View>
                </View>

                {/* Monthly Revenue */}
                <View className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-gray-500 text-sm">
                        Monthly Revenue
                      </Text>
                      <Text className="text-green-600 font-bold text-2xl mt-1">
                        {stats.monthlyRevenue}
                      </Text>
                    </View>
                    <View className="bg-green-100 p-3 rounded-lg">
                      <FontAwesome name="money" size={24} color="#10B981" />
                    </View>
                  </View>
                </View>

                {/* Active Products */}
                <View className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-gray-500 text-sm">
                        Active Products
                      </Text>
                      <Text className="text-gray-900 font-bold text-2xl mt-1">
                        {stats.activeProducts}
                      </Text>
                    </View>
                    <View className="bg-purple-100 p-3 rounded-lg">
                      <Ionicons name="cube-outline" size={24} color="#8B5CF6" />
                    </View>
                  </View>
                </View>

                {/* Customer Count */}
                <View className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-gray-500 text-sm">Customers</Text>
                      <Text className="text-gray-900 font-bold text-2xl mt-1">
                        {stats.customerCount}
                      </Text>
                    </View>
                    <View className="bg-amber-100 p-3 rounded-lg">
                      <FontAwesome name="users" size={20} color="#F59E0B" />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : isPendingApproval ? (
          <View className="px-6 mt-6">
            <View className="bg-white rounded-2xl shadow p-6 border border-gray-200">
              <View className="flex-row items-center mb-6">
                <View className="bg-amber-100 p-3 rounded-full mr-4">
                  <MaterialIcons name="checklist" size={24} color="#F59E0B" />
                </View>
                <View>
                  <Text className="text-lg font-bold text-gray-900">
                    Getting Started Checklist
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Prepare your account for launch
                  </Text>
                </View>
              </View>

              <View className="space-y-4">
                <TouchableOpacity
                  onPress={() => router.push("/supplier/profile")}
                  className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <View className="flex-row items-center">
                    <View className="bg-green-100 p-3 rounded-full mr-4 border border-green-200">
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color="#10B981"
                      />
                    </View>
                    <View>
                      <Text className="font-medium text-gray-900">
                        Complete Profile
                      </Text>
                      <Text className="text-gray-500 text-sm mt-1">
                        Add business details & verification
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-green-600 text-sm font-medium mr-2">
                      Start
                    </Text>
                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/supplier/products/add")}
                  className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <View className="flex-row items-center">
                    <View className="bg-blue-100 p-3 rounded-full mr-4 border border-blue-200">
                      <Ionicons name="cube-outline" size={20} color="#3B82F6" />
                    </View>
                    <View>
                      <Text className="font-medium text-gray-900">
                        Add Products
                      </Text>
                      <Text className="text-gray-500 text-sm mt-1">
                        Set up your product catalog
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-blue-600 text-sm font-medium mr-2">
                      Add
                    </Text>
                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/supplier/settings")}
                  className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <View className="flex-row items-center">
                    <View className="bg-purple-100 p-3 rounded-full mr-4 border border-purple-200">
                      <MaterialIcons
                        name="business"
                        size={20}
                        color="#8B5CF6"
                      />
                    </View>
                    <View>
                      <Text className="font-medium text-gray-900">
                        Business Setup
                      </Text>
                      <Text className="text-gray-500 text-sm mt-1">
                        Configure pricing & logistics
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-purple-600 text-sm font-medium mr-2">
                      Setup
                    </Text>
                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              </View>

              <View className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="time-outline" size={20} color="#F59E0B" />
                  <Text className="text-amber-800 font-medium ml-2">
                    Approval Progress
                  </Text>
                </View>
                <Text className="text-amber-700 text-sm mb-3">
                  Your application is being reviewed by our team. We&apos;ll
                  notify you once approved.
                </Text>
                <TouchableOpacity className="flex-row items-center">
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={16}
                    color="#F59E0B"
                  />
                  <Text className="text-amber-600 font-medium ml-2">
                    Contact Support
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {/* Support Card */}
        <View className="px-6 my-8">
          <View className="bg-blue-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="bg-blue-500 p-3 rounded-full mr-4 shadow">
                <Ionicons name="help-circle-outline" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900">Need Help?</Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {isPendingApproval
                    ? "Questions about your application?"
                    : "Having issues with your account?"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/supplier/Contact")}
              className="bg-white px-4 py-3 rounded-xl border border-blue-300 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="chatbubbles-outline"
                  size={18}
                  color="#3B82F6"
                />
                <Text className="text-blue-700 font-medium ml-2">
                  Contact Support
                </Text>
              </View>
              <Entypo name="chevron-right" size={18} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
