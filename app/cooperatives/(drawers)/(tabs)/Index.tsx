import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import client from "@/utils/axiosInstance";
import { CustomHeader } from "@/components/cooperative/CustomHeader";
import { PendingApprovalHeader } from "@/components/cooperative/PendingApprovalHeader";
import { useRouter } from "expo-router";

export default function OwnerHomePage() {
  const user = useSelector((state) => state.auth.user);
  const coop = useSelector((state) => state.cooperative.cooperativeLoggedIn);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Pending Approval Screen
  if (coop && coop.isApproved === false) {
    return (
      <ScrollView className="flex-1 bg-gray-50">
        {/* Custom Header with Drawer Button */}
        <PendingApprovalHeader coopName={coop.name} userName={user?.name} />

        {/* Pending Approval Card */}
        <View className="px-6 mt-8">
          <View className="bg-white rounded-2xl p-6 shadow-lg border border-orange-200">
            <View className="items-center mb-4">
              <View className="bg-orange-100 p-4 rounded-full">
                <Ionicons name="time-outline" size={40} color="#F59E0B" />
              </View>
            </View>

            <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
              Approval Pending
            </Text>

            <Text className="text-gray-600 text-center mb-6">
              Your cooperative registration is currently under review. You'll
              have full access to all features once approved.
            </Text>

            {/* Progress Steps */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-green-500 rounded-full items-center justify-center">
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                  <Text className="text-green-600 font-medium ml-2">
                    Registration Complete
                  </Text>
                </View>
                <Ionicons name="checkmark" size={20} color="#10B981" />
              </View>

              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-orange-500 rounded-full items-center justify-center">
                    <Ionicons name="document-text" size={16} color="white" />
                  </View>
                  <Text className="text-orange-600 font-medium ml-2">
                    Under Review
                  </Text>
                </View>
                <Ionicons
                  name="ellipsis-horizontal"
                  size={20}
                  color="#F59E0B"
                />
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-gray-300 rounded-full items-center justify-center">
                    <Ionicons name="storefront" size={16} color="white" />
                  </View>
                  <Text className="text-gray-500 font-medium ml-2">
                    Ready to Operate
                  </Text>
                </View>
                <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
              </View>
            </View>

            {/* Estimated Time */}
            <View className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
              <View className="flex-row items-center">
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text className="text-blue-800 font-medium ml-2">
                  Approval Timeline
                </Text>
              </View>
              <Text className="text-gray-600 text-sm mt-2">
                Typical approval process takes 2-3 business days. You'll receive
                a notification once your cooperative is approved.
              </Text>
            </View>

            {/* Contact Support */}
            <TouchableOpacity
              className="bg-gray-800 rounded-xl p-4 flex-row items-center justify-center"
              onPress={() =>
                Alert.alert(
                  "Contact Support",
                  "Email: support@coop.com\nPhone: +63 912 345 6789"
                )
              }
            >
              <Ionicons name="headset" size={20} color="white" />
              <Text className="text-white font-medium ml-2">
                Contact Support
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* What to Expect Section */}
        <View className="px-6 mt-8 mb-8">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            What to Expect After Approval
          </Text>

          <View className="space-y-3">
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text className="text-gray-700 ml-2 flex-1">
                Add and manage your products
              </Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text className="text-gray-700 ml-2 flex-1">
                Process customer orders
              </Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text className="text-gray-700 ml-2 flex-1">
                Track sales and analytics
              </Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text className="text-gray-700 ml-2 flex-1">
                Manage inventory and stocks
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Original Dashboard (when approved)
  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Custom Header with Drawer Button */}
      <CustomHeader title={coop?.name} />

      {/* Business Performance Metrics */}
      <View className="px-6 mt-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Today&apos;s Performance
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {/* Total Sales */}
          <View className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm border-l-4 border-green-500">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  ₱12,450
                </Text>
                <Text className="text-gray-500 text-sm mt-1">Total Sales</Text>
              </View>
              <Ionicons name="cash-outline" size={28} color="#10B981" />
            </View>
            <Text className="text-green-600 text-xs font-medium mt-2">
              ↑ 8% from yesterday
            </Text>
          </View>

          {/* Orders Processed */}
          <View className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm border-l-4 border-blue-500">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-800">24</Text>
                <Text className="text-gray-500 text-sm mt-1">Orders Today</Text>
              </View>
              <Ionicons name="cart-outline" size={28} color="#3B82F6" />
            </View>
            <Text className="text-green-600 text-xs font-medium mt-2">
              5 pending fulfillment
            </Text>
          </View>

          {/* Products Available */}
          <View className="bg-white rounded-xl p-4 w-[48%] shadow-sm border-l-4 border-purple-500">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-800">156</Text>
                <Text className="text-gray-500 text-sm mt-1">Products</Text>
              </View>
              <Ionicons name="cube-outline" size={28} color="#8B5CF6" />
            </View>
            <Text className="text-red-600 text-xs font-medium mt-2">
              12 low in stock
            </Text>
          </View>

          {/* Customer Satisfaction */}
          <View className="bg-white rounded-xl p-4 w-[48%] shadow-sm border-l-4 border-yellow-500">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-800">4.8</Text>
                <Text className="text-gray-500 text-sm mt-1">Rating</Text>
              </View>
              <Ionicons name="star-outline" size={28} color="#F59E0B" />
            </View>
            <Text className="text-green-600 text-xs font-medium mt-2">
              Based on 45 reviews
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Business Actions */}
      <View className="px-6 mt-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Business Management
        </Text>
        <View className="flex-row flex-wrap justify-between">
          <TouchableOpacity className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm items-center border border-gray-200" onPress={() => router.push("/cooperatives/(drawers)/(tabs)/Inventory")} >
            <View className="bg-green-100 p-3 rounded-full">
              <Ionicons name="add-circle-outline" size={28} color="#10B981" />
            </View>
            <Text className="text-gray-800 font-medium mt-2 text-center">
              Add Products
            </Text>
            <Text className="text-gray-500 text-xs text-center mt-1">
              New inventory
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm items-center border border-gray-200">
            <View className="bg-blue-100 p-3 rounded-full">
              <Ionicons name="pricetags-outline" size={28} color="#3B82F6" />
            </View>
            <Text className="text-gray-800 font-medium mt-2 text-center">
              Manage Inventory
            </Text>
            <Text className="text-gray-500 text-xs text-center mt-1">
              Update stocks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-xl p-4 w-[48%] shadow-sm items-center border border-gray-200">
            <View className="bg-orange-100 p-3 rounded-full">
              <Ionicons name="trending-up-outline" size={28} color="#F59E0B" />
            </View>
            <Text className="text-gray-800 font-medium mt-2 text-center">
              Sales Reports
            </Text>
            <Text className="text-gray-500 text-xs text-center mt-1">
              View analytics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-xl p-4 w-[48%] shadow-sm items-center border border-gray-200">
            <View className="bg-purple-100 p-3 rounded-full">
              <Ionicons name="people-outline" size={28} color="#8B5CF6" />
            </View>
            <Text className="text-gray-800 font-medium mt-2 text-center">
              Customers
            </Text>
            <Text className="text-gray-500 text-xs text-center mt-1">
              Manage clients
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Orders */}
      <View className="px-6 mt-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-800">Recent Orders</Text>
          <TouchableOpacity>
            <Text className="text-green-600 font-medium">View All</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm">
          {[
            {
              order: "ORD-001245",
              customer: "Maria Santos",
              amount: "₱1,250",
              status: "pending",
              time: "10:30 AM",
            },
            {
              order: "ORD-001244",
              customer: "Carlos Reyes",
              amount: "₱850",
              status: "completed",
              time: "9:45 AM",
            },
            {
              order: "ORD-001243",
              customer: "Ana Lopez",
              amount: "₱2,150",
              status: "processing",
              time: "Yesterday",
            },
            {
              order: "ORD-001242",
              customer: "Juan Dela Cruz",
              amount: "₱3,500",
              status: "completed",
              time: "Nov 28",
            },
          ].map((order, index) => (
            <View
              key={index}
              className={`flex-row items-center justify-between py-3 ${index < 3 ? "border-b border-gray-100" : ""}`}
            >
              <View className="flex-1">
                <Text className="text-gray-800 font-medium">{order.order}</Text>
                <Text className="text-gray-500 text-sm">{order.customer}</Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-800 font-medium">
                  {order.amount}
                </Text>
                <Text
                  className={`text-xs font-medium ${
                    order.status === "completed"
                      ? "text-green-600"
                      : order.status === "processing"
                        ? "text-blue-600"
                        : "text-yellow-600"
                  }`}
                >
                  {order.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Low Stock Alert */}
      <View className="px-6 mt-6 mb-8">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Low Stock Alert
        </Text>

        <View className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <View className="flex-row items-start">
            <Ionicons name="warning-outline" size={20} color="#F59E0B" />
            <Text className="text-orange-800 font-bold ml-2">
              ATTENTION NEEDED
            </Text>
          </View>
          <Text className="text-gray-800 font-medium mt-2">
            12 products running low in stock
          </Text>
          <Text className="text-gray-600 text-sm mt-1">
            Rice, Cooking Oil, and Detergents need restocking
          </Text>
          <TouchableOpacity className="bg-orange-500 rounded-lg px-4 py-2 mt-3 self-start">
            <Text className="text-white font-medium">Restock Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
