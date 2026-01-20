import React, { useState, useEffect } from "react";
import client from "@/utils/axiosInstance";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Modal,
  FlatList,
} from "react-native";
import { useSelector } from "react-redux";
import { useLocalSearchParams, router } from "expo-router";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

export default function Checkout() {
  const user = useSelector((state) => state.auth.user);
  console.log("User from Redux:", user);
  const params = useLocalSearchParams();

  // Parse the checkoutData from params
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Form states
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [customerNotes, setCustomerNotes] = useState("");
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Payment methods
  const paymentMethods = [
    { id: "cod", name: "Cash on Delivery", icon: "cash-outline" },
    { id: "gcash", name: "GCash", icon: "phone-portrait-outline" },
  ];

  // Check if user has complete address
  const hasCompleteAddress = () => {
    return (
      user?.address &&
      user?.barangay &&
      user?.city &&
      user?.province &&
      user?.region
    );
  };

  // Get complete address string
  const getCompleteAddress = () => {
    if (hasCompleteAddress()) {
      return `${user.address}, ${user.barangay}, ${user.city}, ${user.province}, ${user.region}`;
    }
    return "";
  };

  // Calculate delivery date (5-7 days from now)
  const calculateDeliveryDate = () => {
    const today = new Date();
    const deliveryDays = 5; // Standard delivery in 5-7 days
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + deliveryDays);

    return deliveryDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₱${amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Initialize checkout data
  useEffect(() => {
    if (params.checkoutData) {
      try {
        const parsedData = JSON.parse(params.checkoutData);
        console.log("Parsed checkoutData:", parsedData);
        setCheckoutData(parsedData);

        // Set shipping address from user profile
        if (hasCompleteAddress()) {
          setShippingAddress(getCompleteAddress());
        }
      } catch (error) {
        console.error("Error parsing checkout data:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Invalid checkout data",
        });
        router.back();
      }
    }
    setLoading(false);
  }, [params.checkoutData, user]);

  // Calculate service fee for GCash
  const calculateServiceFee = () => {
    if (paymentMethod === "gcash" && checkoutData?.totals?.total) {
      // PayMongo GCash fee: 2.5% + ₱15
      const serviceFee = checkoutData.totals.total * 0.025 + 15;
      return Math.round(serviceFee * 100) / 100;
    }
    return 0;
  };

  const serviceFee = calculateServiceFee();
  const totalWithServiceFee = checkoutData?.totals?.total
    ? checkoutData.totals.total + serviceFee
    : 0;

  const handlePlaceOrder = async () => {
    if (!hasCompleteAddress()) {
      setShowAddressModal(true);
      Toast.show({
        type: "error",
        text1: "Complete Address Required",
        text2: "Please update your profile with complete address details",
        visibilityTime: 3000,
      });
      return;
    }

    if (!user?.phone) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Phone number is required. Please update your profile.",
      });
      return;
    }

    setPlacingOrder(true);

    try {
      // Prepare order items
      const orderItems = checkoutData.selectedItems.map((item) => ({
        cart_item_id: item.id,
        product_attribute_id: item.product?.productAttributeId,
        quantity: item.quantity,
        unit_price: item.product?.price || 0,
      }));

      // Prepare order data
      const orderData = {
        user_id: user.id,
        items: orderItems,
        shipping_address: getCompleteAddress(),
        payment_method: paymentMethod,
        customer_notes: customerNotes,
        subtotal: checkoutData.totals.subtotal,
        delivery_fee: checkoutData.totals.deliveryFee,
        service_fee: serviceFee,
        total_amount:
          paymentMethod === "gcash"
            ? totalWithServiceFee
            : checkoutData.totals.total,
      };

      console.log("Placing order with data:", orderData);

      const res = await client.post("/orders", orderData);

      if (res.status === 201 && res.data.success) {
        setOrderNumber(res.data.order.order_number);
        // setOrderPlaced(true);
        router.replace({ pathname: "/users/orders" });

        Toast.show({
          type: "success",
          text1: "Order Placed!",
          text2: "Your order has been placed successfully",
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to place order",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    setPaymentModalVisible(false);
  };

  const AddressModal = () => (
    <Modal visible={showAddressModal} animationType="slide" transparent={true}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6 max-h-96">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">
              Complete Address Required
            </Text>
            <TouchableOpacity onPress={() => setShowAddressModal(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View className="space-y-4">
            <View className="p-4 bg-red-50 rounded-lg border border-red-200">
              <Ionicons name="alert-circle" size={24} color="#dc2626" />
              <Text className="text-red-800 font-medium mt-2">
                Complete Address Required
              </Text>
              <Text className="text-red-600 text-sm mt-1">
                You need to provide complete address details to proceed with
                checkout.
              </Text>
            </View>

            <View className="space-y-3">
              <Text className="text-gray-700">
                Please update your profile with the following details:
              </Text>
              <View className="space-y-2">
                {!user?.address && (
                  <View className="flex-row items-center">
                    <Ionicons name="close-circle" size={16} color="#dc2626" />
                    <Text className="ml-2 text-gray-600">Street Address</Text>
                  </View>
                )}
                {!user?.barangay && (
                  <View className="flex-row items-center">
                    <Ionicons name="close-circle" size={16} color="#dc2626" />
                    <Text className="ml-2 text-gray-600">Barangay</Text>
                  </View>
                )}
                {!user?.city && (
                  <View className="flex-row items-center">
                    <Ionicons name="close-circle" size={16} color="#dc2626" />
                    <Text className="ml-2 text-gray-600">
                      City/Municipality
                    </Text>
                  </View>
                )}
                {!user?.province && (
                  <View className="flex-row items-center">
                    <Ionicons name="close-circle" size={16} color="#dc2626" />
                    <Text className="ml-2 text-gray-600">Province</Text>
                  </View>
                )}
                {!user?.region && (
                  <View className="flex-row items-center">
                    <Ionicons name="close-circle" size={16} color="#dc2626" />
                    <Text className="ml-2 text-gray-600">Region</Text>
                  </View>
                )}
              </View>
            </View>

            <View className="pt-4 border-t border-gray-200">
              <TouchableOpacity
                className="bg-green-600 py-3 rounded-xl flex-row items-center justify-center"
                onPress={() => {
                  setShowAddressModal(false);
                  router.push("/users/UpdateProfile");
                }}
              >
                <Ionicons name="create-outline" size={20} color="#ffffff" />
                <Text className="text-white font-bold text-lg ml-2">
                  Update Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="mt-4 text-gray-600">Loading checkout...</Text>
      </View>
    );
  }

  if (!checkoutData) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Ionicons name="cart-outline" size={64} color="#9ca3af" />
        <Text className="mt-4 text-lg text-gray-700">
          No checkout data found
        </Text>
        <TouchableOpacity
          className="mt-6 bg-green-600 px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back to Cart</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (orderPlaced) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-b from-amber-50 to-green-50">
        <ScrollView className="flex-1 p-4">
          <View className="bg-white rounded-2xl p-6 mt-4 shadow-sm border border-gray-200">
            <View className="items-center mb-6">
              <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="checkmark-circle" size={48} color="#16a34a" />
              </View>
              <Text className="text-2xl font-bold text-gray-800">
                Order Confirmed!
              </Text>
              <Text className="text-gray-600 text-center mt-2">
                Thank you for your order. Your order has been received and is
                being processed.
              </Text>
            </View>

            <View className="bg-gray-50 rounded-xl p-4 mb-6">
              <Text className="text-sm text-gray-500 text-center mb-2">
                Order Number
              </Text>
              <Text className="text-2xl font-bold text-gray-800 text-center mb-4">
                {orderNumber}
              </Text>

              <View className="space-y-3">
                <View className="bg-white rounded-lg p-4">
                  <Text className="text-sm text-gray-500">
                    Estimated Delivery
                  </Text>
                  <Text className="font-semibold text-gray-800">
                    {calculateDeliveryDate()}
                  </Text>
                </View>
                <View className="bg-white rounded-lg p-4">
                  <Text className="text-sm text-gray-500">Payment Method</Text>
                  <Text className="font-semibold text-gray-800 capitalize">
                    {paymentMethod === "cod" ? "Cash on Delivery" : "GCash"}
                  </Text>
                </View>
                <View className="bg-white rounded-lg p-4">
                  <Text className="text-sm text-gray-500">Total Amount</Text>
                  <Text className="font-semibold text-green-600 text-xl">
                    {formatCurrency(
                      paymentMethod === "gcash"
                        ? totalWithServiceFee
                        : checkoutData.totals.total,
                    )}
                  </Text>
                </View>
              </View>
            </View>

            <View className="space-y-3">
              <TouchableOpacity
                className="bg-gradient-to-r from-green-600 to-emerald-600 py-4 rounded-xl"
                onPress={() => router.push("/users/(drawers)/(tabs)/Orders")}
              >
                <Text className="text-white font-bold text-center text-lg">
                  View My Orders
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-white border border-green-600 py-4 rounded-xl"
                onPress={() => router.push("/users/(drawers)/(tabs)/Shop")}
              >
                <Text className="text-green-600 font-bold text-center text-lg">
                  Continue Shopping
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-4 pb-6 bg-gradient-to-b from-green-50 to-white">
          <TouchableOpacity
            className="flex-row items-center mb-4"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
            <Text className="ml-2 text-gray-700 font-medium">Back to Cart</Text>
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Checkout
          </Text>

          {/* Progress Steps */}
          <View className="flex-row items-center justify-between mt-4">
            <View className="items-center">
              <View className="w-10 h-10 bg-green-600 rounded-full items-center justify-center">
                <Text className="text-white font-bold">1</Text>
              </View>
              <Text className="text-xs font-medium mt-1">Cart</Text>
            </View>
            <View className="h-1 w-8 bg-green-600" />
            <View className="items-center">
              <View className="w-10 h-10 bg-green-600 rounded-full items-center justify-center">
                <Text className="text-white font-bold">2</Text>
              </View>
              <Text className="text-xs font-medium mt-1">Checkout</Text>
            </View>
            <View className="h-1 w-8 bg-gray-300" />
            <View className="items-center">
              <View className="w-10 h-10 bg-gray-300 rounded-full items-center justify-center">
                <Text className="text-gray-600 font-bold">3</Text>
              </View>
              <Text className="text-xs text-gray-500 mt-1">Confirm</Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View className="px-4 mb-4">
          <View className="bg-white rounded-xl p-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Customer Information
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Name</Text>
                <Text className="font-medium text-gray-800">
                  {user?.first_name} {user?.last_name}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Email</Text>
                <Text className="font-medium text-gray-800">{user?.email}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Phone</Text>
                <Text className="font-medium text-gray-800">
                  {user?.phone ? `+63 ${user.phone}` : "Not provided"}
                </Text>
              </View>
            </View>
            {!user?.phone && (
              <View className="mt-3 p-3 bg-amber-50 rounded-lg">
                <Text className="text-amber-700 text-sm">
                  Phone number is required for delivery. Please update your
                  profile.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Shipping Address */}
        <View className="px-4 mb-4">
          <View className="bg-white rounded-xl p-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={20} color="#16a34a" />
                <Text className="ml-2 text-lg font-bold text-gray-800">
                  Shipping Address
                </Text>
              </View>
              {!hasCompleteAddress() && (
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => router.push("/users/UpdateProfile")}
                >
                  <Ionicons name="create-outline" size={16} color="#16a34a" />
                  <Text className="ml-1 text-green-600 text-sm font-medium">
                    Update
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {hasCompleteAddress() ? (
              <View className="bg-green-50 border border-green-200 rounded-lg p-4">
                <View className="flex-row items-start">
                  <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                  <View className="ml-2 flex-1">
                    <Text className="font-medium text-gray-800 mb-2">
                      Complete Address ✓
                    </Text>
                    <View className="space-y-1">
                      <Text className="font-semibold text-sm">
                        {user.address}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {user.barangay}, {user.city}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {user.province}, {user.region}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-green-100 px-2 py-1 rounded-full">
                    <Text className="text-green-800 text-xs font-medium">
                      Ready
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View className="bg-red-50 border border-red-200 rounded-lg p-4">
                <View className="flex-row items-start">
                  <Ionicons name="alert-circle" size={20} color="#dc2626" />
                  <View className="ml-2 flex-1">
                    <Text className="font-medium text-red-800 mb-2">
                      Incomplete Address
                    </Text>
                    <Text className="text-sm text-red-600">
                      Please update your profile with complete address details
                      to proceed with checkout.
                    </Text>
                    <TouchableOpacity
                      className="mt-3 bg-red-600 px-4 py-2 rounded-lg flex-row items-center"
                      onPress={() => router.push("/users/UpdateProfile")}
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color="#ffffff"
                      />
                      <Text className="text-white font-medium ml-2">
                        Complete Address Now
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Payment Method */}
        <View className="px-4 mb-4">
          <View className="bg-white rounded-xl p-4 border border-gray-200">
            <View className="flex-row items-center mb-3">
              <Ionicons name="card-outline" size={20} color="#16a34a" />
              <Text className="ml-2 text-lg font-bold text-gray-800">
                Payment Method
              </Text>
            </View>

            <TouchableOpacity
              className="border border-gray-300 rounded-lg p-4 mb-2"
              onPress={() => setPaymentModalVisible(true)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons
                    name={
                      paymentMethod === "cod"
                        ? "cash-outline"
                        : "phone-portrait-outline"
                    }
                    size={24}
                    color="#16a34a"
                  />
                  <Text className="ml-3 font-medium">
                    {paymentMethod === "cod" ? "Cash on Delivery" : "GCash"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>

            {paymentMethod === "gcash" && serviceFee > 0 && (
              <View className="p-3 bg-amber-50 rounded-lg">
                <Text className="text-amber-800 text-sm font-medium mb-1">
                  Service Fee Breakdown:
                </Text>
                <View className="space-y-1">
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-amber-700">Order Total:</Text>
                    <Text className="text-xs text-amber-700">
                      {formatCurrency(checkoutData.totals.total)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-amber-700">
                      GCash Processing Fee (2.5%):
                    </Text>
                    <Text className="text-xs text-amber-700">
                      {formatCurrency(checkoutData.totals.total * 0.025)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-amber-700">Flat Fee:</Text>
                    <Text className="text-xs text-amber-700">₱15.00</Text>
                  </View>
                  <View className="border-t border-amber-300 pt-1 mt-1">
                    <View className="flex-row justify-between">
                      <Text className="text-xs font-medium text-amber-800">
                        Total Service Fee:
                      </Text>
                      <Text className="text-xs font-medium text-amber-800">
                        {formatCurrency(serviceFee)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Order Items */}
        <View className="px-4 mb-4">
          <View className="bg-white rounded-xl p-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Order Items
            </Text>
            <FlatList
              data={checkoutData.selectedItems}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="flex-row mb-3 pb-3 border-b border-gray-100">
                  <View className="w-16 h-16 bg-green-100 rounded-lg overflow-hidden">
                    {item.product?.images?.[0] ? (
                      <Image
                        source={{ uri: item.product.images[0] }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <Ionicons
                          name="image-outline"
                          size={24}
                          color="#9ca3af"
                        />
                      </View>
                    )}
                  </View>
                  <View className="ml-3 flex-1">
                    <Text
                      className="font-medium text-gray-800"
                      numberOfLines={1}
                    >
                      {item.product?.productName}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {item.product?.attributeValue}
                    </Text>
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-sm text-gray-600">
                        {item.quantity} ×{" "}
                        {formatCurrency(item.product?.price || 0)}
                      </Text>
                      <Text className="font-semibold text-green-600">
                        {formatCurrency(
                          (item.product?.price || 0) * item.quantity,
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>
        </View>

        {/* Order Notes */}
        <View className="px-4 mb-4">
          <View className="bg-white rounded-xl p-4 border border-gray-200">
            <Text className="font-bold text-gray-800 mb-2">
              Order Notes (Optional)
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Special instructions for delivery, gift message, etc."
              value={customerNotes}
              onChangeText={setCustomerNotes}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Order Summary */}
        <View className="px-4 mb-24">
          <View className="bg-white rounded-xl p-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Order Summary
            </Text>

            <View className="space-y-2 mb-4">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Subtotal</Text>
                <Text className="font-medium">
                  {formatCurrency(checkoutData.totals.subtotal)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Delivery Fee</Text>
                <Text className="font-medium">
                  {formatCurrency(checkoutData.totals.deliveryFee)}
                </Text>
              </View>

              {paymentMethod === "gcash" && serviceFee > 0 && (
                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-gray-600">GCash Service Fee</Text>
                    <Text className="text-xs text-gray-500">(2.5% + ₱15)</Text>
                  </View>
                  <Text className="font-medium text-amber-600">
                    +{formatCurrency(serviceFee)}
                  </Text>
                </View>
              )}
            </View>

            <View className="border-t border-gray-300 pt-3">
              <View className="flex-row justify-between">
                <Text className="font-bold text-gray-800 text-lg">Total</Text>
                <View>
                  <Text className="font-bold text-green-600 text-xl">
                    {formatCurrency(
                      paymentMethod === "gcash"
                        ? totalWithServiceFee
                        : checkoutData.totals.total,
                    )}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {paymentMethod === "gcash"
                      ? "Including delivery and GCash service fee"
                      : "Including delivery fee"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Delivery Estimate */}
            <View className="mt-4 p-3 bg-gray-50 rounded-lg">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text className="ml-2 text-sm text-gray-600">
                  Estimated delivery:{" "}
                  <Text className="font-medium text-gray-800">
                    {calculateDeliveryDate()}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Order Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-gray-500">Total to Pay</Text>
            <Text className="text-xl font-bold text-green-600">
              {formatCurrency(
                paymentMethod === "gcash"
                  ? totalWithServiceFee
                  : checkoutData.totals.total,
              )}
            </Text>
          </View>

          <TouchableOpacity
            className={`px-6 py-3 rounded-xl flex-row items-center ${
              placingOrder || !user?.phone || !hasCompleteAddress()
                ? "bg-gray-400"
                : "bg-green-600"
            }`}
            onPress={handlePlaceOrder}
            disabled={placingOrder || !user?.phone || !hasCompleteAddress()}
          >
            {placingOrder ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#ffffff"
                  className="mr-2"
                />
                <Text className="text-white font-bold">Processing...</Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#ffffff"
                />
                <Text className="text-white font-bold ml-2">Place Order</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {(!user?.phone || !hasCompleteAddress()) && (
          <View className="mt-2">
            <Text className="text-xs text-red-500 text-center">
              {!user?.phone
                ? "Phone number is required"
                : "Complete address is required"}
            </Text>
          </View>
        )}
      </View>

      {/* Payment Method Modal */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-96">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">
                Select Payment Method
              </Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={paymentMethods}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`flex-row items-center p-4 rounded-lg mb-2 ${
                    paymentMethod === item.id
                      ? "bg-green-50 border border-green-200"
                      : "bg-gray-50"
                  }`}
                  onPress={() => handlePaymentMethodSelect(item.id)}
                >
                  <Ionicons name={item.icon} size={24} color="#16a34a" />
                  <Text className="ml-3 font-medium text-gray-800 flex-1">
                    {item.name}
                  </Text>
                  {paymentMethod === item.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#16a34a"
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Address Requirement Modal */}
      <AddressModal />

      <Toast />
    </SafeAreaView>
  );
}
