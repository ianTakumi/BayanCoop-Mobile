import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Fresh Apple",
      price: 57.0,
      quantity: 2,
      image: "🍎",
      category: "Fruits",
    },
    {
      id: 2,
      name: "Rice Sack",
      price: 105.0,
      quantity: 1,
      image: "🍚",
      category: "Grains",
    },
    {
      id: 3,
      name: "Fresh Mango",
      price: 15.0,
      quantity: 3,
      image: "🥭",
      category: "Fruits",
    },
  ]);

  const dispatch = useDispatch();

  const updateQuantity = (id, change) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () =>
          setCartItems((prevItems) =>
            prevItems.filter((item) => item.id !== id)
          ),
      },
    ]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (cartItems.length === 0) {
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
      <View className="flex-1 bg-white">
        <ScrollView className="p-6">
          <Text className="text-2xl font-bold text-green-600 mb-6">
            My Cart
          </Text>

          {/* Cart Items */}
          {cartItems.map((item) => (
            <View
              key={item.id}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 flex-row items-center"
            >
              {/* Product Image */}
              <View className="bg-green-50 rounded-xl w-16 h-16 items-center justify-center mr-4">
                <Text className="text-2xl">{item.image}</Text>
              </View>

              {/* Product Details */}
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800">
                  {item.name}
                </Text>
                <Text className="text-green-500 font-bold text-lg">
                  P{item.price.toFixed(2)}
                </Text>
                <Text className="text-gray-500 text-sm">{item.category}</Text>
              </View>

              {/* Quantity Controls */}
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => updateQuantity(item.id, -1)}
                  className="bg-green-100 w-8 h-8 rounded-full items-center justify-center"
                >
                  <Text className="text-green-600 font-bold">-</Text>
                </TouchableOpacity>

                <Text className="mx-3 text-lg font-semibold text-gray-800 min-w-8 text-center">
                  {item.quantity}
                </Text>

                <TouchableOpacity
                  onPress={() => updateQuantity(item.id, 1)}
                  className="bg-green-100 w-8 h-8 rounded-full items-center justify-center"
                >
                  <Text className="text-green-600 font-bold">+</Text>
                </TouchableOpacity>
              </View>

              {/* Remove Button */}
              <TouchableOpacity
                onPress={() => removeItem(item.id)}
                className="ml-4"
              >
                <FontAwesome name="trash-o" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Order Summary */}
          <View className="bg-green-50 rounded-2xl p-6 mt-4">
            <Text className="text-xl font-bold text-green-700 mb-4">
              Order Summary
            </Text>

            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Items ({getTotalItems()})</Text>
              <Text className="text-gray-800">
                P{getTotalPrice().toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Delivery</Text>
              <Text className="text-gray-800">P50.00</Text>
            </View>

            <View className="flex-row justify-between mb-4">
              <Text className="text-gray-600">Tax</Text>
              <Text className="text-gray-800">
                P{(getTotalPrice() * 0.12).toFixed(2)}
              </Text>
            </View>

            <View className="border-t border-green-200 pt-4 flex-row justify-between">
              <Text className="text-lg font-bold text-green-700">Total</Text>
              <Text className="text-lg font-bold text-green-700">
                P{(getTotalPrice() + 50 + getTotalPrice() * 0.12).toFixed(2)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Checkout Button */}
        <View className="p-6 border-t border-gray-200">
          <TouchableOpacity
            className="bg-green-500 rounded-xl py-4 items-center"
            onPress={() => Alert.alert("Checkout", "Proceeding to checkout...")}
          >
            <Text className="text-white text-lg font-semibold">
              Proceed to Checkout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
