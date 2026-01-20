import React, { useState, useEffect } from "react";
import client from "@/utils/axiosInstance";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";

export default function Product() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const params = useLocalSearchParams();
  const user = useSelector((state: any) => state.auth.user);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/products/single/${params.productId}`);
      setProduct(res.data.data);
      // Select first variant by default
      if (res.data.data?.products_attributes?.length > 0) {
        setSelectedVariant(res.data.data.products_attributes[0]);
      }
    } catch (err) {
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const formatPrice = (price) => {
    return `₱${price.toLocaleString("en-PH")}`;
  };

  const calculateTotalPrice = () => {
    if (!selectedVariant) return 0;
    return selectedVariant.price * quantity;
  };

  const calculateMemberTotalPrice = () => {
    if (!selectedVariant) return 0;
    return selectedVariant.member_price * quantity;
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || !user) return;

    setIsAddingToCart(true);

    const itemToAdd = {
      coop_product_attribute_id: selectedVariant.id,
      product_source: "cooperative",
      quantity,
      user_id: user.id,
    };

    try {
      const res = await client.post("/carts", itemToAdd);

      if (res.status === 200 || res.status === 201) {
        Toast.show({
          type: "success",
          text1: "Added to cart!",
          text2: `${quantity} item${quantity > 1 ? "s" : ""} added to your cart`,
          visibilityTime: 2000,
        });
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.response?.data?.message || "Failed to add item to cart",
        visibilityTime: 2000,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    // Implement buy now logic
    handleAddToCart();
    // Navigate to checkout
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg">Product not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          className="h-96"
        >
          {product.images?.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              className="w-screen h-96"
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Product Info */}
        <View className="px-4 pb-24">
          {/* Badges */}
          <View className="flex-row flex-wrap gap-2 mt-4">
            {product.is_featured && (
              <View className="bg-purple-100 px-3 py-1 rounded-full">
                <Text className="text-purple-800 text-xs font-medium">
                  Featured
                </Text>
              </View>
            )}
            {product.is_best_seller && (
              <View className="bg-amber-100 px-3 py-1 rounded-full">
                <Text className="text-amber-800 text-xs font-medium">
                  Best Seller
                </Text>
              </View>
            )}
            {product.is_new_arrival && (
              <View className="bg-emerald-100 px-3 py-1 rounded-full">
                <Text className="text-emerald-800 text-xs font-medium">
                  New Arrival
                </Text>
              </View>
            )}
            <View
              className={`px-3 py-1 rounded-full ${
                product.status === "active" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  product.status === "active"
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {product.status.charAt(0).toUpperCase() +
                  product.status.slice(1)}
              </Text>
            </View>
          </View>

          {/* Product Name and Category */}
          <Text className="text-gray-500 text-sm mt-4">
            {product.category?.name}
          </Text>
          <Text className="text-2xl font-bold mt-1">{product.name}</Text>

          {/* Price Range */}
          <View className="flex-row items-baseline mt-2">
            <Text className="text-2xl font-bold text-gray-900">
              {formatPrice(product.price_range.min)} -{" "}
              {formatPrice(product.price_range.max)}
            </Text>
            <Text className="text-gray-500 ml-2">per {product.unit_type}</Text>
          </View>

          {/* Stock Info */}
          <View className="mt-2">
            <Text className="text-gray-700">
              Total Stock:{" "}
              <Text className="font-semibold">{product.total_stock}</Text>
            </Text>
          </View>

          {/* Description */}
          <Text className="text-gray-600 mt-4 leading-6">
            {product.description}
          </Text>

          {/* Variants Selection */}
          <View className="mt-6">
            <Text className="text-lg font-semibold mb-3">
              Select {selectedVariant?.attribute?.name}:
            </Text>
            <FlatList
              horizontal
              data={product.products_attributes}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`px-4 py-3 rounded-lg mr-3 border ${
                    selectedVariant?.id === item.id
                      ? "bg-blue-50 border-blue-500"
                      : "bg-gray-50 border-gray-300"
                  }`}
                  onPress={() => setSelectedVariant(item)}
                >
                  <Text
                    className={`font-medium ${
                      selectedVariant?.id === item.id
                        ? "text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    {item.attribute_value}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Selected Variant Details */}
          {selectedVariant && (
            <View className="mt-6 p-4 bg-gray-50 rounded-lg">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-600">SKU:</Text>
                <Text className="font-mono font-medium">
                  {selectedVariant.SKU}
                </Text>
              </View>

              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-600">Stock:</Text>
                <Text
                  className={`font-semibold ${
                    selectedVariant.stock > 10
                      ? "text-green-600"
                      : selectedVariant.stock > 0
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {selectedVariant.stock} available
                </Text>
              </View>

              {/* Regular Price */}
              <View className="mb-2">
                <Text className="text-gray-600 mb-1">Regular Price:</Text>
                <Text className="text-2xl font-bold text-gray-900">
                  {formatPrice(selectedVariant.price)}
                </Text>
              </View>

              {/* Member Price */}
              <View className="mb-4">
                <Text className="text-gray-600 mb-1">
                  Member Price:{" "}
                  <Ionicons
                    name="person-circle-outline"
                    size={16}
                    color="#6b7280"
                  />
                </Text>
                <View className="flex-row items-baseline">
                  <Text className="text-2xl font-bold text-blue-600">
                    {formatPrice(selectedVariant.member_price)}
                  </Text>
                  <Text className="text-sm text-blue-500 ml-2">
                    Save{" "}
                    {formatPrice(
                      selectedVariant.price - selectedVariant.member_price,
                    )}
                  </Text>
                </View>
              </View>

              {/* Quantity Selector */}
              <View className="mt-4">
                <Text className="text-gray-600 mb-3">Quantity:</Text>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-gray-200 justify-center items-center"
                    onPress={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Ionicons
                      name="remove"
                      size={20}
                      color={quantity <= 1 ? "#9ca3af" : "#374151"}
                    />
                  </TouchableOpacity>

                  <Text className="mx-6 text-xl font-semibold">{quantity}</Text>

                  <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-gray-200 justify-center items-center"
                    onPress={incrementQuantity}
                    disabled={quantity >= selectedVariant.stock}
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color={
                        quantity >= selectedVariant.stock
                          ? "#9ca3af"
                          : "#374151"
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Total Prices */}
              <View className="mt-6 pt-4 border-t border-gray-200">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Total (Regular):</Text>
                  <Text className="text-lg font-bold">
                    {formatPrice(calculateTotalPrice())}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Total (Member):</Text>
                  <Text className="text-lg font-bold text-blue-600">
                    {formatPrice(calculateMemberTotalPrice())}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 mr-4">
            <Text className="text-sm text-gray-500">Member Price</Text>
            <Text className="text-xl font-bold text-green-600">
              {selectedVariant
                ? formatPrice(selectedVariant.member_price)
                : "--"}
            </Text>
          </View>

          <View className="flex-row gap-3">
            {/* Add to Cart Button */}
            <TouchableOpacity
              className={`px-6 py-3 border border-green-600 rounded-lg flex-row items-center justify-center ${isAddingToCart ? "opacity-50" : ""}`}
              onPress={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="#16a34a"
                    className="mr-2"
                  />
                  <Text className="text-green-600 font-semibold">
                    Adding...
                  </Text>
                </>
              ) : (
                <Text className="text-green-600 font-semibold">
                  Add to Cart
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="px-6 py-3 bg-green-600 rounded-lg"
              onPress={handleBuyNow}
            >
              <Text className="text-white font-semibold">Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* <Toast /> */}
    </SafeAreaView>
  );
}
