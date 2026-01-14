import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  FlatList,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useSelector } from "react-redux";
import client from "@/utils/axiosInstance";
import {
  Ionicons,
  MaterialIcons,
  Feather,
  FontAwesome,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SupplierOrders() {
  const supplier = useSelector((state) => state.supplier.supplier);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Mock orders data
  const mockOrders = [
    {
      id: "ORD-0012",
      cooperative: "Bayanihan Farmers Cooperative",
      cooperativeId: "1",
      amount: "₱2,500",
      items: [
        {
          name: "Organic Brown Rice",
          quantity: 50,
          unit: "kg",
          price: "₱50/kg",
        },
      ],
      status: "pending",
      date: "2024-12-05",
      time: "10:30 AM",
      deliveryDate: "2024-12-06",
      paymentMethod: "Cash on Delivery",
      notes: "Deliver before 12 PM",
      contact: "09123456789",
      address: "123 Cooperative St, Taguig City",
    },
    {
      id: "ORD-0011",
      cooperative: "Green Valley Cooperative",
      cooperativeId: "2",
      amount: "₱1,850",
      items: [
        { name: "Fresh Carrots", quantity: 25, unit: "kg", price: "₱74/kg" },
        { name: "Organic Tomatoes", quantity: 15, unit: "kg", price: "₱74/kg" },
      ],
      status: "processing",
      date: "2024-12-04",
      time: "2:15 PM",
      deliveryDate: "2024-12-05",
      paymentMethod: "Bank Transfer",
      notes: "Separate packaging for carrots and tomatoes",
      contact: "09234567890",
      address: "456 Valley Rd, Makati City",
    },
    {
      id: "ORD-0010",
      cooperative: "Mountain Fresh Producers",
      cooperativeId: "3",
      amount: "₱3,200",
      items: [
        {
          name: "Premium Potatoes",
          quantity: 100,
          unit: "kg",
          price: "₱32/kg",
        },
      ],
      status: "delivered",
      date: "2024-12-02",
      time: "9:00 AM",
      deliveryDate: "2024-12-03",
      paymentMethod: "Cash on Delivery",
      notes: "Delivered successfully",
      contact: "09345678901",
      address: "789 Mountain View, Antipolo City",
    },
    {
      id: "ORD-0009",
      cooperative: "Organic Harvest Coop",
      cooperativeId: "4",
      amount: "₱4,500",
      items: [
        { name: "Native Chicken", quantity: 30, unit: "kg", price: "₱150/kg" },
      ],
      status: "delivered",
      date: "2024-12-01",
      time: "11:45 AM",
      deliveryDate: "2024-12-02",
      paymentMethod: "GCash",
      notes: "Customer satisfied",
      contact: "09456789012",
      address: "321 Organic Farm, Laguna",
    },
    {
      id: "ORD-0008",
      cooperative: "Sunrise Agriculture Coop",
      cooperativeId: "5",
      amount: "₱1,200",
      items: [
        { name: "Eggplant", quantity: 40, unit: "kg", price: "₱30/kg" },
        { name: "Okra", quantity: 20, unit: "kg", price: "₱30/kg" },
      ],
      status: "cancelled",
      date: "2024-11-30",
      time: "3:30 PM",
      deliveryDate: null,
      paymentMethod: null,
      notes: "Cancelled by customer",
      contact: "09567890123",
      address: "654 Sunrise Blvd, Cavite",
    },
  ];

  const statusOptions = [
    { label: "All Orders", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Processing", value: "processing" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual
      setTimeout(() => {
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.log("Error fetching orders:", err);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders
  useEffect(() => {
    let filtered = [...orders];

    // Apply status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.cooperative.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [selectedStatus, searchQuery, orders]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#F59E0B";
      case "processing":
        return "#3B82F6";
      case "delivered":
        return "#10B981";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "hourglass-outline";
      case "processing":
        return "sync-outline";
      case "delivered":
        return "checkmark-circle-outline";
      case "cancelled":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    // Update order status
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    setShowOrderDetails(false);
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedOrder(item);
        setShowOrderDetails(true);
      }}
      className="bg-white rounded-xl p-4 mb-3 mx-4 border border-gray-200"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="font-bold text-gray-900 text-lg">{item.id}</Text>
              <Text className="text-gray-700 mt-1">{item.cooperative}</Text>
            </View>
            <View
              className="px-3 py-1 rounded-full items-center"
              style={{ backgroundColor: `${getStatusColor(item.status)}20` }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: getStatusColor(item.status) }}
              >
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View className="mt-3">
            <Text className="text-gray-600 text-sm">
              {item.items.length} item{item.items.length > 1 ? "s" : ""} •{" "}
              {item.date} • {item.time}
            </Text>
            <Text className="text-gray-900 font-bold text-lg mt-2">
              {item.amount}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-4">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text className="text-gray-600 text-sm ml-2">
                Deliver: {item.deliveryDate || "Not scheduled"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const OrderDetailsModal = () => (
    <Modal
      visible={showOrderDetails}
      animationType="slide"
      onRequestClose={() => setShowOrderDetails(false)}
    >
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        {selectedOrder && (
          <ScrollView className="flex-1">
            {/* Header */}
            <View className="px-6 py-4 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <TouchableOpacity onPress={() => setShowOrderDetails(false)}>
                  <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">
                  Order Details
                </Text>
                <View style={{ width: 24 }} />
              </View>
            </View>

            {/* Order Info */}
            <View className="px-6 py-6">
              <View className="bg-gray-50 rounded-xl p-4 mb-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="font-bold text-gray-900 text-lg">
                    {selectedOrder.id}
                  </Text>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: `${getStatusColor(selectedOrder.status)}20`,
                    }}
                  >
                    <Text
                      className="text-sm font-medium"
                      style={{ color: getStatusColor(selectedOrder.status) }}
                    >
                      {selectedOrder.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View className="space-y-3">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="business-outline"
                      size={18}
                      color="#6B7280"
                    />
                    <Text className="text-gray-700 ml-3">
                      {selectedOrder.cooperative}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color="#6B7280"
                    />
                    <Text className="text-gray-700 ml-3">
                      Ordered: {selectedOrder.date} at {selectedOrder.time}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color="#6B7280"
                    />
                    <Text className="text-gray-700 ml-3">
                      Delivery: {selectedOrder.deliveryDate || "Not scheduled"}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="call-outline" size={18} color="#6B7280" />
                    <Text className="text-gray-700 ml-3">
                      {selectedOrder.contact}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Order Items */}
              <View className="mb-6">
                <Text className="font-bold text-gray-900 text-lg mb-4">
                  Order Items
                </Text>
                {selectedOrder.items.map((item, index) => (
                  <View key={index} className="bg-gray-50 rounded-lg p-4 mb-3">
                    <View className="flex-row justify-between items-center">
                      <Text className="font-medium text-gray-900">
                        {item.name}
                      </Text>
                      <Text className="text-gray-700">{item.price}</Text>
                    </View>
                    <View className="flex-row justify-between items-center mt-2">
                      <Text className="text-gray-600">
                        Quantity: {item.quantity} {item.unit}
                      </Text>
                      <Text className="font-bold text-gray-900">
                        ₱
                        {(
                          parseFloat(
                            item.price.replace("₱", "").replace("/kg", "")
                          ) * item.quantity
                        ).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Payment & Address */}
              <View className="mb-6">
                <Text className="font-bold text-gray-900 text-lg mb-4">
                  Payment & Delivery
                </Text>
                <View className="bg-gray-50 rounded-lg p-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-700">Payment Method</Text>
                    <Text className="font-medium text-gray-900">
                      {selectedOrder.paymentMethod || "Not specified"}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-700">Total Amount</Text>
                    <Text className="font-bold text-gray-900 text-lg">
                      {selectedOrder.amount}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-gray-700 mb-2">Delivery Address</Text>
                    <Text className="text-gray-900">
                      {selectedOrder.address}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Notes */}
              {selectedOrder.notes && (
                <View className="mb-6">
                  <Text className="font-bold text-gray-900 text-lg mb-4">
                    Notes
                  </Text>
                  <View className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                    <Text className="text-gray-800">{selectedOrder.notes}</Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              {selectedOrder.status !== "delivered" &&
                selectedOrder.status !== "cancelled" && (
                  <View className="mb-8">
                    <Text className="font-bold text-gray-900 text-lg mb-4">
                      Update Status
                    </Text>
                    <View className="flex-row space-x-3">
                      {selectedOrder.status === "pending" && (
                        <TouchableOpacity
                          onPress={() =>
                            handleUpdateStatus(selectedOrder.id, "processing")
                          }
                          className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
                        >
                          <Text className="text-white font-bold">
                            Start Processing
                          </Text>
                        </TouchableOpacity>
                      )}
                      {selectedOrder.status === "processing" && (
                        <TouchableOpacity
                          onPress={() =>
                            handleUpdateStatus(selectedOrder.id, "delivered")
                          }
                          className="flex-1 bg-green-600 py-3 rounded-lg items-center"
                        >
                          <Text className="text-white font-bold">
                            Mark as Delivered
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => {
                          // Navigate to message
                          router.push(
                            `/supplier/messages?cooperative=${selectedOrder.cooperativeId}`
                          );
                          setShowOrderDetails(false);
                        }}
                        className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
                      >
                        <Text className="text-gray-800 font-bold">
                          Message Customer
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900">Orders</Text>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-6 py-3"
      >
        {statusOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => setSelectedStatus(option.value)}
            className={`px-4 py-2 rounded-full mr-3 ${selectedStatus === option.value ? "bg-green-600" : "bg-gray-100"}`}
          >
            <Text
              className={`font-medium ${selectedStatus === option.value ? "text-white" : "text-gray-700"}`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text className="text-gray-500 mt-4">Loading orders...</Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View className="flex-1 justify-center items-center p-8">
          <Ionicons name="cart-outline" size={80} color="#D1D5DB" />
          <Text className="text-xl font-bold text-gray-500 mt-4">
            No orders found
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            {searchQuery || selectedStatus !== "all"
              ? "Try adjusting your filters"
              : "You haven't received any orders yet"}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              setSelectedStatus("all");
            }}
            className="mt-6 bg-green-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-bold">Clear Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<View className="h-2" />}
          ListFooterComponent={<View className="h-20" />}
        />
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal />
    </SafeAreaView>
  );
}
