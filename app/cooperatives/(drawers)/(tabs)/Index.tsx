import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function OwnerHomePage() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header Section */}
      <View className="bg-green-700 px-6 pt-12 pb-6">
        <Text className="text-white text-lg">Good Morning, Owner!</Text>
        <Text className="text-white text-2xl font-bold mt-1">
          Sta Maria Cooperative
        </Text>
        <Text className="text-green-200 text-sm mt-1">
          Your store performance dashboard
        </Text>
      </View>

      {/* Business Performance Metrics */}
      <View className="px-6 mt-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Today's Performance
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
          <TouchableOpacity className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm items-center border border-gray-200">
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
