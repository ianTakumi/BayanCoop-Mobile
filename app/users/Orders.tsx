import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import client from "@/utils/axiosInstance";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const user = useSelector((state: any) => state.auth.user);
  const params = useLocalSearchParams();

  // Show success message if redirected from checkout
  const [showSuccess, setShowSuccess] = useState(false);
  const [newOrder, setNewOrder] = useState(null);

  useEffect(() => {
    fetchOrders();

    // Check for newly placed order from checkout
    if (params.newlyPlacedOrder && params.showSuccess === "true") {
      try {
        const orderData = JSON.parse(params.newlyPlacedOrder);
        setNewOrder(orderData);
        setShowSuccess(true);

        // Hide success message after 5 seconds
        const timer = setTimeout(() => {
          setShowSuccess(false);
        }, 5000);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error("Error parsing order data:", error);
      }
    }
  }, [params]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await client.get(`/orders/user/${user.id}`);

      if (res.data.success) {
        setOrders(res.data.orders || []);
      } else {
        setError("Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      case "shipped":
        return "Shipped";
      default:
        return "Processing";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const OrderItemCard = ({ item }: { item: any }) => {
    const product = item.product_attribute?.product;
    const cooperative = item.product_attribute?.product?.cooperative;

    return (
      <View className="flex-row mb-4 p-3 border border-gray-200 rounded-lg bg-white">
        {/* Product Image */}
        <View className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 mr-3">
          {product?.images?.[0] ? (
            <Image
              source={{ uri: product.images[0] }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons name="image-outline" size={24} color="#9ca3af" />
            </View>
          )}
        </View>

        {/* Product Details */}
        <View className="flex-1">
          <Text className="font-medium text-gray-800" numberOfLines={1}>
            {product?.name || "Product"}
          </Text>
          <Text className="text-sm text-gray-500">
            {item.product_attribute?.attribute_value}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            From: {cooperative?.name || "Cooperative"}
          </Text>

          <View className="flex-row justify-between items-center mt-2">
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-600">
                {item.quantity} × {formatCurrency(item.unit_price)}
              </Text>
            </View>
            <Text className="font-semibold text-green-600">
              {formatCurrency(item.total_price)}
            </Text>
          </View>

          {/* Item Status */}
          <View className="mt-2">
            <View
              className={`px-2 py-1 rounded-full self-start ${getStatusBadgeColor(
                item.item_status,
              )}`}
            >
              <Text className="text-xs font-medium">
                {getStatusBadgeText(item.item_status)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const OrderCard = ({ order }: { order: any }) => {
    return (
      <View className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
        {/* Order Header */}
        <View className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="font-semibold text-gray-800 mr-3">
                  Order #{order.order_number}
                </Text>
                <View
                  className={`px-2 py-1 rounded-full ${getStatusBadgeColor(
                    order.order_status,
                  )}`}
                >
                  <Text className="text-xs font-medium">
                    {getStatusBadgeText(order.order_status)}
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-gray-500 mt-1">
                Placed on {formatDate(order.order_date)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="font-bold text-gray-900">
                {formatCurrency(order.total_amount)}
              </Text>
              <Text className="text-xs text-gray-500">
                {order.order_items?.length || 0} item(s)
              </Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View className="p-4">
          <Text className="font-medium text-gray-700 mb-3">Order Items</Text>
          {order.order_items?.map((item: any) => (
            <OrderItemCard key={item.id} item={item} />
          ))}
        </View>

        {/* Order Summary */}
        <View className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              {/* Shipping Address */}
              <View className="mb-3">
                <Text className="text-xs font-medium text-gray-500 mb-1">
                  Shipping Address
                </Text>
                <Text className="text-sm text-gray-800" numberOfLines={2}>
                  {order.shipping_address}
                </Text>
              </View>

              {/* Payment Info */}
              <View className="flex-row space-x-4">
                <View>
                  <Text className="text-xs font-medium text-gray-500 mb-1">
                    Payment Method
                  </Text>
                  <Text className="text-sm text-gray-800 capitalize">
                    {order.payment_method === "cod"
                      ? "Cash on Delivery"
                      : order.payment_method}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs font-medium text-gray-500 mb-1">
                    Payment Status
                  </Text>
                  <Text
                    className={`text-sm ${
                      order.payment_status === "paid"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {order.payment_status?.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Price Breakdown */}
            <View className="ml-4">
              <View className="space-y-1">
                <View className="flex-row justify-between min-w-32">
                  <Text className="text-xs text-gray-600">Subtotal:</Text>
                  <Text className="text-xs font-medium">
                    {formatCurrency(order.subtotal)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-600">Delivery:</Text>
                  <Text className="text-xs font-medium">
                    {formatCurrency(order.delivery_fee)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-600">Service Fee:</Text>
                  <Text className="text-xs font-medium">
                    {formatCurrency(order.service_fee)}
                  </Text>
                </View>
                <View className="border-t border-gray-300 pt-1 mt-1">
                  <View className="flex-row justify-between">
                    <Text className="text-sm font-bold text-gray-800">
                      Total:
                    </Text>
                    <Text className="text-sm font-bold text-green-600">
                      {formatCurrency(order.total_amount)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-2 mt-4">
            <TouchableOpacity className="flex-1 border border-gray-300 rounded-lg py-2 items-center">
              <Text className="text-gray-700 text-sm font-medium">
                View Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 border border-gray-300 rounded-lg py-2 items-center">
              <Text className="text-gray-700 text-sm font-medium">
                Track Order
              </Text>
            </TouchableOpacity>
            {order.order_status === "pending" && (
              <TouchableOpacity className="flex-1 bg-red-600 rounded-lg py-2 items-center">
                <Text className="text-white text-sm font-medium">
                  Cancel Order
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-4 text-gray-600">Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="alert-circle-outline" size={64} color="#dc2626" />
          <Text className="text-red-600 text-lg mb-4 mt-4">{error}</Text>
          <TouchableOpacity
            className="bg-green-600 px-6 py-3 rounded-lg"
            onPress={fetchOrders}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Success Banner */}
      {showSuccess && newOrder && (
        <View className="p-4 bg-green-50 border-b border-green-200">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
            <View className="ml-3 flex-1">
              <Text className="font-bold text-green-800">Order Confirmed!</Text>
              <Text className="text-green-600 text-sm">
                Order #{newOrder.order_number} has been placed successfully.
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowSuccess(false)}>
              <Ionicons name="close" size={20} color="#16a34a" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-3 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-800">My Orders</Text>
          <Text className="text-gray-500 mt-1">
            View and manage your orders
          </Text>
        </View>

        {orders.length === 0 ? (
          <View className="flex-1 justify-center items-center p-4">
            <Ionicons name="receipt-outline" size={80} color="#d1d5db" />
            <Text className="text-gray-500 text-lg mt-4 mb-2">
              No orders found
            </Text>
            <Text className="text-gray-400 text-center">
              Start shopping to see your orders here!
            </Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <OrderCard order={item} />}
            contentContainerClassName="p-4"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#16a34a"]}
                tintColor="#16a34a"
              />
            }
            ListHeaderComponent={
              <Text className="text-gray-500 text-sm mb-4">
                {orders.length} order{orders.length !== 1 ? "s" : ""} found
              </Text>
            }
          />
        )}

        {/* Bottom Navigation Helper */}
        <View className="p-4 bg-white border-t border-gray-200">
          <Text className="text-gray-500 text-sm text-center">
            Pull down to refresh orders
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
