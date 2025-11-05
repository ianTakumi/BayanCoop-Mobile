import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Store() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  const categories = [
    "All",
    "Fruits",
    "Vegetables",
    "Grains",
    "Seafood",
    "Dairy",
  ];

  const products = [
    {
      id: 1,
      name: "Fresh Apple",
      price: 57.0,
      image: "🍎",
      category: "Fruits",
      rating: 4.5,
    },
    {
      id: 2,
      name: "Rice Sack",
      price: 105.0,
      image: "🍚",
      category: "Grains",
      rating: 4.8,
    },
    {
      id: 3,
      name: "Fresh Mango",
      price: 15.0,
      image: "🥭",
      category: "Fruits",
      rating: 4.3,
    },
    {
      id: 4,
      name: "Potato",
      price: 15.0,
      image: "🥔",
      category: "Vegetables",
      rating: 4.2,
    },
    {
      id: 5,
      name: "Bangus",
      price: 15.0,
      image: "🐟",
      category: "Seafood",
      rating: 4.6,
    },
    {
      id: 6,
      name: "Shrimp",
      price: 15.0,
      image: "🦐",
      category: "Seafood",
      rating: 4.7,
    },
    {
      id: 7,
      name: "Carrot",
      price: 25.0,
      image: "🥕",
      category: "Vegetables",
      rating: 4.4,
    },
    {
      id: 8,
      name: "Banana",
      price: 12.0,
      image: "🍌",
      category: "Fruits",
      rating: 4.1,
    },
    {
      id: 9,
      name: "Corn",
      price: 20.0,
      image: "🌽",
      category: "Grains",
      rating: 4.5,
    },
    {
      id: 10,
      name: "Milk",
      price: 45.0,
      image: "🥛",
      category: "Dairy",
      rating: 4.6,
    },
  ];

  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedCategory === "All" || product.category === selectedCategory)
    )
    .sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    });

  const renderProduct = ({ item }) => (
    <TouchableOpacity className="bg-white rounded-2xl p-4 m-2 shadow-sm border border-gray-100 w-44">
      <View className="bg-green-50 rounded-xl w-20 h-20 items-center justify-center mb-3 self-center">
        <Text className="text-3xl">{item.image}</Text>
      </View>

      <Text
        className="text-lg font-semibold text-gray-800 mb-1"
        numberOfLines={2}
      >
        {item.name}
      </Text>

      <View className="flex-row items-center mb-2">
        <FontAwesome name="star" size={14} color="#F59E0B" />
        <Text className="text-gray-600 text-sm ml-1">{item.rating}</Text>
      </View>

      <Text className="text-green-500 font-bold text-lg">
        P{item.price.toFixed(2)}
      </Text>

      <TouchableOpacity className="bg-green-500 rounded-lg py-2 mt-3">
        <Text className="text-white text-center font-medium">Add to Cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-6">
        <Text className="text-2xl font-bold text-green-600 mb-2">
          Our Store
        </Text>
        <Text className="text-gray-500">
          Fresh products for your daily needs
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-6 pb-4">
        <View className="flex-row items-center bg-[#F4F4F4] rounded-xl px-4 py-3 shadow-sm border border-[#E5E7EB]">
          <Entypo name="magnifying-glass" size={20} color="#6B7280" />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-base text-gray-700"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Entypo name="cross" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View className="px-6 pb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full mr-3 ${
                selectedCategory === category ? "bg-green-500" : "bg-green-100"
              }`}
            >
              <Text
                className={`font-medium ${
                  selectedCategory === category
                    ? "text-white"
                    : "text-green-700"
                }`}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Options */}
      <View className="px-6 pb-4 flex-row justify-between items-center">
        <Text className="text-gray-600">
          {filteredProducts.length} products found
        </Text>
        <View className="flex-row bg-green-100 rounded-lg p-1">
          {[
            { key: "name", label: "Name" },
            { key: "price", label: "Price" },
            { key: "rating", label: "Rating" },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => setSortBy(option.key)}
              className={`px-3 py-1 rounded ${
                sortBy === option.key ? "bg-green-500" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  sortBy === option.key ? "text-white" : "text-green-700"
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500 text-lg">No products found</Text>
            <Text className="text-gray-400 text-center mt-2">
              Try adjusting your search or filter
            </Text>
          </View>
        }
      />
    </View>
  );
}
