import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState, useEffect } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import client from "@/utils/axiosInstance";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import { sub } from "date-fns";
import { router } from "expo-router";

export default function Cart() {
  const [cartData, setCartData] = useState({ cartItems: [], cartId: null });
  const [selectedItems, setSelectedItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.auth.user);

  const fetchCarts = async () => {
    setLoading(true);
    await client
      .get(`/carts/${user.id}`)
      .then((res) => {
        const itemsWithSelection =
          res.data.cartItems?.map((item) => ({
            ...item,
            selected: true,
          })) || [];

        setCartData({
          cartItems: itemsWithSelection,
          cartId: res.data.cartId,
        });

        setSelectedItems(itemsWithSelection.map((item) => item.id));
      })
      .catch((err) => {
        Toast.show({
          type: "error",
          text1: "Error fetching cart items",
          text2: err.message,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCarts();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Refresh failed",
        text2: error.message,
      });
    } finally {
      setRefreshing(false);
    }
  };

  const toggleItemSelection = (itemId) => {
    setCartData((prev) => ({
      ...prev,
      cartItems: prev.cartItems.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item,
      ),
    }));

    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const selectAllItems = () => {
    const allSelected = cartData.cartItems.every((item) => item.selected);

    setCartData((prev) => ({
      ...prev,
      cartItems: prev.cartItems.map((item) => ({
        ...item,
        selected: !allSelected,
      })),
    }));

    if (!allSelected) {
      setSelectedItems(cartData.cartItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    try {
      await client.put(`/carts/${itemId}`, {
        quantity: newQuantity,
        user_id: user.id,
      });

      Toast.show({
        type: "success",
        text1: "Quantity updated",
        text2: "Item quantity has been updated successfully",
      });
      setCartData((prev) => ({
        ...prev,
        cartItems: prev.cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item,
        ),
      }));
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error updating quantity",
        text2: err.message,
      });
    }
  };

  const removeItem = async (itemId) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await client.delete(`/carts/${itemId}`);

              setCartData((prev) => ({
                ...prev,
                cartItems: prev.cartItems.filter((item) => item.id !== itemId),
              }));

              setSelectedItems((prev) => prev.filter((id) => id !== itemId));

              Toast.show({
                type: "success",
                text1: "Item removed",
                text2: "Item has been removed from your cart",
              });
            } catch (err) {
              Toast.show({
                type: "error",
                text1: "Error removing item",
                text2: err.message,
              });
            }
          },
        },
      ],
    );
  };

  const formatPrice = (price) => {
    const numPrice = Number(price) || 0;
    return `₱${numPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const calculateSubtotal = () => {
    return cartData.cartItems
      .filter((item) => item.selected)
      .reduce((total, item) => {
        const itemPrice = item.product.price; // Use regular price instead of memberPrice
        return total + itemPrice * item.quantity;
      }, 0);
  };

  const calculateSelectedItemsCount = () => {
    return cartData.cartItems.filter((item) => item.selected).length;
  };

  const calculateDeliveryFee = () => {
    const selectedItemsCount = cartData.cartItems.filter(
      (item) => item.selected,
    ).length;
    return selectedItemsCount > 0 ? 50 : 0;
  };

  const calculateTotalItems = () => {
    return cartData.cartItems
      .filter((item) => item.selected)
      .reduce((total, item) => total + item.quantity, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = calculateDeliveryFee();
    return subtotal + deliveryFee;
  };

  const handleCheckout = () => {
    const selectedCartItems = cartData.cartItems.filter(
      (item) => item.selected,
    );

    if (selectedCartItems.length === 0) {
      Toast.show({
        type: "info",
        text1: "No items selected",
        text2: "Please select items to checkout",
      });
      return;
    }

    Alert.alert(
      "Checkout",
      `Proceed with ${calculateTotalItems()} items (Total: ${formatPrice(calculateSubtotal())})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed",
          onPress: () => {
            const checkoutData = {
              cartId: cartData.cartId,
              selectedItems: selectedCartItems,
              totals: {
                subtotal: calculateSubtotal(),
                deliveryFee: calculateDeliveryFee(),
                total: calculateTotal(),
              },
            };
            console.log("Checkout Data:", JSON.stringify(checkoutData));
            router.push({
              pathname: "/users/Checkout",
              params: { checkoutData: JSON.stringify(checkoutData) },
            });
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#22C55E" />
          <Text className="mt-4 text-gray-600">Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!loading && cartData.cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 bg-white p-6">
          <Text className="text-2xl font-bold text-green-600 mb-6">
            My Cart
          </Text>
          <View className="flex-1 justify-center items-center">
            <Text className="text-6xl mb-4">🛒</Text>
            <Text className="text-xl text-gray-600 mb-2">
              Your cart is empty
            </Text>
            <Text className="text-gray-400 text-center">
              Start adding some products to your cart
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-white pt-10">
        <ScrollView
          className="px-4"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#22C55E"]}
              tintColor="#22C55E"
              title="Refreshing cart..."
              titleColor="#6B7280"
            />
          }
        >
          <View className="py-4">
            <Text className="text-2xl font-bold text-green-600">My Cart</Text>
          </View>

          <TouchableOpacity
            className="flex-row items-center mb-4 p-3 bg-gray-50 rounded-lg"
            onPress={selectAllItems}
          >
            <View
              className={`w-6 h-6 rounded-md border-2 ${cartData.cartItems.every((item) => item.selected) ? "bg-green-500 border-green-500" : "border-gray-300"} justify-center items-center mr-3`}
            >
              {cartData.cartItems.every((item) => item.selected) && (
                <FontAwesome name="check" size={12} color="white" />
              )}
            </View>
            <Text className="text-gray-700">
              {cartData.cartItems.every((item) => item.selected)
                ? "Deselect All"
                : "Select All"}
            </Text>
          </TouchableOpacity>

          {cartData.cartItems.map((item) => (
            <View
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 mb-4 p-4"
            >
              <View className="flex-row">
                <TouchableOpacity
                  className="mr-4"
                  onPress={() => toggleItemSelection(item.id)}
                >
                  <View
                    className={`w-6 h-6 rounded-md border-2 ${item.selected ? "bg-green-500 border-green-500" : "border-gray-300"} justify-center items-center`}
                  >
                    {item.selected && (
                      <FontAwesome name="check" size={12} color="white" />
                    )}
                  </View>
                </TouchableOpacity>

                <Image
                  source={{
                    uri:
                      item.product.images?.[0] ||
                      "https://via.placeholder.com/100",
                  }}
                  className="w-20 h-20 rounded-lg mr-4"
                  resizeMode="cover"
                />

                <View className="flex-1">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-2">
                      <Text
                        className="font-bold text-gray-800 text-base"
                        numberOfLines={2}
                      >
                        {item.product.productName}
                      </Text>
                      <Text className="text-gray-500 text-sm mt-1">
                        {item.product.attributeValue}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {item.product.cooperativeName}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      className="p-2"
                    >
                      <FontAwesome name="trash" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row justify-between items-center mt-3">
                    <View>
                      <Text className="text-lg font-bold text-green-600">
                        {formatPrice(item.product.price)}{" "}
                        {/* Changed to regular price */}
                      </Text>
                    </View>

                    <View className="flex-row items-center bg-gray-100 rounded-lg">
                      <TouchableOpacity
                        className="px-3 py-2"
                        onPress={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <FontAwesome
                          name="minus"
                          size={14}
                          color={item.quantity <= 1 ? "#9CA3AF" : "#374151"}
                        />
                      </TouchableOpacity>

                      <Text className="px-4 py-2 font-semibold">
                        {item.quantity}
                      </Text>

                      <TouchableOpacity
                        className="px-3 py-2"
                        onPress={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.product.stock}
                      >
                        <FontAwesome
                          name="plus"
                          size={14}
                          color={
                            item.quantity >= item.product.stock
                              ? "#9CA3AF"
                              : "#374151"
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="mt-2 pt-2 border-t border-gray-100">
                    <Text className="text-right font-semibold">
                      Total: {formatPrice(item.product.price * item.quantity)}{" "}
                      {/* Changed to regular price */}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <View className="p-4 border-t border-gray-200 bg-white">
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Selected Items:</Text>
              <Text className="font-semibold">
                {calculateSelectedItemsCount()}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Subtotal:</Text>
              <Text className="font-semibold">
                {formatPrice(calculateSubtotal())}
              </Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-600">Delivery Fee:</Text>
              <Text className="font-semibold">
                {formatPrice(calculateDeliveryFee())}
              </Text>
            </View>
            <View className="border-t border-gray-200 pt-3">
              <View className="flex-row justify-between">
                <Text className="text-lg font-bold">Total:</Text>
                <Text className="text-lg font-bold text-green-600">
                  {formatPrice(calculateTotal())}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            className={`rounded-xl py-4 items-center ${selectedItems.length === 0 ? "bg-gray-300" : "bg-green-500"}`}
            onPress={handleCheckout}
            disabled={selectedItems.length === 0}
          >
            <Text className="text-white text-lg font-semibold">
              {selectedItems.length === 0
                ? "Select Items to Checkout"
                : `Checkout (${selectedItems.length} items)`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
