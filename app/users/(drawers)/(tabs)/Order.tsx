import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Orders() {
  const [activeTab, setActiveTab] = useState("All");

  const orders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "Delivered",
      total: 224.0,
      items: [
        { name: "Fresh Apple", quantity: 2, price: 57.0 },
        { name: "Rice Sack", quantity: 1, price: 105.0 },
      ],
      deliveryAddress: "123 Main St, City, Province",
    },
    {
      id: "ORD-002",
      date: "2024-01-14",
      status: "Processing",
      total: 45.0,
      items: [{ name: "Fresh Mango", quantity: 3, price: 15.0 }],
      deliveryAddress: "456 Oak St, City, Province",
    },
    {
      id: "ORD-003",
      date: "2024-01-12",
      status: "Shipped",
      total: 80.0,
      items: [
        { name: "Potato", quantity: 2, price: 15.0 },
        { name: "Carrot", quantity: 2, price: 25.0 },
      ],
      deliveryAddress: "789 Pine St, City, Province",
    },
  ];

  const tabs = [
    { key: "All", icon: "list" },
    { key: "Processing", icon: "clock-o" },
    { key: "Shipped", icon: "truck" },
    { key: "Delivered", icon: "check" },
    { key: "Cancelled", icon: "times" },
  ];

  const filteredOrders =
    activeTab === "All"
      ? orders
      : orders.filter((order) => order.status === activeTab);

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
          iconBg: "bg-green-100",
        };
      case "Processing":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          iconBg: "bg-amber-100",
        };
      case "Shipped":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          iconBg: "bg-blue-100",
        };
      case "Cancelled":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          iconBg: "bg-red-100",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          iconBg: "bg-gray-100",
        };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return { name: "check", color: "#10B981" };
      case "Processing":
        return { name: "clock-o", color: "#F59E0B" };
      case "Shipped":
        return { name: "truck", color: "#3B82F6" };
      case "Cancelled":
        return { name: "times", color: "#EF4444" };
      default:
        return { name: "question", color: "#6B7280" };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pt-14 px-6 pb-6 bg-white">
        <Text className="text-3xl font-bold text-gray-900 mb-2">My Orders</Text>
        <Text className="text-gray-500 text-base">
          Track your orders and deliveries
        </Text>
      </View>

      {/* Improved Tabs - Icons with labels */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row px-2">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`items-center justify-center mx-2 px-4 py-3 rounded-2xl min-w-[70px] ${
                  activeTab === tab.key ? "bg-green-500" : "bg-gray-100"
                }`}
              >
                <FontAwesome
                  name={tab.icon}
                  size={16}
                  color={activeTab === tab.key ? "white" : "#6B7280"}
                />
                <Text
                  className={`text-xs font-semibold mt-1 ${
                    activeTab === tab.key ? "text-white" : "text-gray-600"
                  }`}
                  numberOfLines={1}
                >
                  {tab.key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Alternative: Compact Text Tabs */}
      {/* 
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full mx-1 ${
                  activeTab === tab.key
                    ? "bg-green-500"
                    : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeTab === tab.key ? "text-white" : "text-gray-600"
                  }`}
                >
                  {tab.key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      */}

      {/* Orders List */}
      <ScrollView
        className="flex-1 px-5 py-6"
        showsVerticalScrollIndicator={false}
      >
        {filteredOrders.map((order) => {
          const statusColors = getStatusColor(order.status);
          const statusIcon = getStatusIcon(order.status);

          return (
            <View
              key={order.id}
              className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-200"
            >
              {/* Order Header */}
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-lg font-bold text-gray-900 mr-2">
                      {order.id}
                    </Text>
                    <View
                      className={`px-3 py-1 rounded-full ${statusColors.bg} ${statusColors.text} flex-row items-center`}
                    >
                      <FontAwesome
                        name={statusIcon.name}
                        size={12}
                        color={statusIcon.color}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        className={`font-semibold text-xs ${statusColors.text}`}
                      >
                        {order.status}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-gray-500 text-sm">
                    {formatDate(order.date)}
                  </Text>
                </View>
              </View>

              {/* Order Items */}
              <View className="mb-4">
                {order.items.map((item, index) => (
                  <View
                    key={index}
                    className="flex-row justify-between items-center mb-2"
                  >
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-green-400 mr-3"></View>
                      <Text className="text-gray-700 font-medium">
                        {item.quantity}x {item.name}
                      </Text>
                    </View>
                    <Text className="text-gray-900 font-semibold">
                      P{(item.quantity * item.price).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Delivery Address */}
              <View className="flex-row items-start mb-4 p-3 bg-gray-50 rounded-lg">
                <Entypo name="location-pin" size={16} color="#6B7280" />
                <Text className="text-gray-600 text-sm ml-2 flex-1">
                  {order.deliveryAddress}
                </Text>
              </View>

              {/* Order Footer */}
              <View className="flex-row justify-between items-center pt-4 border-t border-gray-100">
                <View>
                  <Text className="text-gray-500 text-xs">Total Amount</Text>
                  <Text className="text-xl font-bold text-green-600">
                    P{order.total.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row space-x-2">
                  {order.status === "Delivered" && (
                    <TouchableOpacity className="bg-green-500 px-4 py-2.5 rounded-xl">
                      <Text className="text-white font-semibold text-sm">
                        Reorder
                      </Text>
                    </TouchableOpacity>
                  )}
                  {order.status === "Processing" && (
                    <TouchableOpacity className="bg-red-500 px-4 py-2.5 rounded-xl">
                      <Text className="text-white font-semibold text-sm">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity className="border border-gray-300 px-4 py-2.5 rounded-xl">
                    <Text className="text-gray-700 font-semibold text-sm">
                      Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {filteredOrders.length === 0 && (
          <View className="flex-1 justify-center items-center py-20">
            <View className="bg-gray-100 p-6 rounded-full mb-4">
              <FontAwesome name="file-text-o" size={64} color="#9CA3AF" />
            </View>
            <Text className="text-gray-700 text-xl font-semibold mt-4">
              No orders found
            </Text>
            <Text className="text-gray-500 text-center mt-2 px-10">
              {activeTab === "All"
                ? "You haven't placed any orders yet"
                : `No ${activeTab.toLowerCase()} orders`}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
