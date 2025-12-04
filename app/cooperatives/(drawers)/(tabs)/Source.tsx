import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Source() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock data for farmers/suppliers
  const farmers = [
    {
      id: "1",
      name: "Juan Dela Cruz Farm",
      image: null,
      distance: "2.5 km",
      rating: 4.8,
      products: ["Organic Vegetables", "Fresh Fruits"],
      specialties: ["Tomatoes", "Eggplant", "Pechay"],
      delivery: true,
      minOrder: 500,
      location: "San Jose, Nueva Ecija",
    },
    {
      id: "2",
      name: "Green Thumb Cooperative",
      image: null,
      distance: "5.1 km",
      rating: 4.9,
      products: ["Rice", "Grains", "Vegetables"],
      specialties: ["Brown Rice", "Corn", "Sitaw"],
      delivery: true,
      minOrder: 1000,
      location: "Cabanatuan City",
    },
    {
      id: "3",
      name: "Magsasaka Organic Farm",
      image: null,
      distance: "3.7 km",
      rating: 4.6,
      products: ["Organic Produce", "Herbs"],
      specialties: ["Lettuce", "Basil", "Kale"],
      delivery: false,
      minOrder: 300,
      location: "Santa Rosa, Nueva Ecija",
    },
    {
      id: "4",
      name: "Rice King Farmers",
      image: null,
      distance: "8.2 km",
      rating: 4.7,
      products: ["Rice Varieties", "Grains"],
      specialties: ["Jasmine Rice", "Milagrosa", "Sinandomeng"],
      delivery: true,
      minOrder: 800,
      location: "Palayan City",
    },
  ];

  // Mock data for available products
  const products = [
    {
      id: "1",
      name: "Organic Tomatoes",
      farmer: "Juan Dela Cruz Farm",
      price: 85,
      unit: "per kg",
      category: "vegetables",
      stock: 50,
      image: null,
    },
    {
      id: "2",
      name: "Brown Rice",
      farmer: "Green Thumb Cooperative",
      price: 65,
      unit: "per kg",
      category: "grains",
      stock: 200,
      image: null,
    },
    {
      id: "3",
      name: "Fresh Eggs",
      farmer: "Magsasaka Organic Farm",
      price: 220,
      unit: "per dozen",
      category: "poultry",
      stock: 30,
      image: null,
    },
    {
      id: "4",
      name: "Sitaw",
      farmer: "Green Thumb Cooperative",
      price: 45,
      unit: "per bundle",
      category: "vegetables",
      stock: 25,
      image: null,
    },
    {
      id: "5",
      name: "Jasmine Rice",
      farmer: "Rice King Farmers",
      price: 75,
      unit: "per kg",
      category: "grains",
      stock: 150,
      image: null,
    },
  ];

  const categories = [
    { id: "all", name: "All" },
    { id: "vegetables", name: "Vegetables" },
    { id: "grains", name: "Grains" },
    { id: "fruits", name: "Fruits" },
    { id: "poultry", name: "Poultry" },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.farmer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderFarmerCard = ({ item }) => (
    <TouchableOpacity className="bg-white rounded-xl p-4 mr-4 shadow-sm border border-gray-100 w-64">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 mb-1">
            {item.name}
          </Text>
          <Text className="text-sm text-gray-600">{item.location}</Text>
        </View>
        <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text className="text-xs font-medium text-gray-700 ml-1">
            {item.rating}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-2">
        <Ionicons name="location-outline" size={14} color="#6B7280" />
        <Text className="text-xs text-gray-600 ml-1">{item.distance} away</Text>
      </View>

      <View className="flex-row flex-wrap mb-3">
        {item.specialties.slice(0, 2).map((specialty, index) => (
          <View
            key={index}
            className="bg-green-100 px-2 py-1 rounded-full mr-2 mb-1"
          >
            <Text className="text-xs text-green-800 font-medium">
              {specialty}
            </Text>
          </View>
        ))}
        {item.specialties.length > 2 && (
          <View className="bg-gray-100 px-2 py-1 rounded-full">
            <Text className="text-xs text-gray-600 font-medium">
              +{item.specialties.length - 2}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          {item.delivery ? (
            <View className="flex-row items-center">
              <Ionicons name="car-outline" size={14} color="#10B981" />
              <Text className="text-xs text-green-600 ml-1">Delivery</Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="storefront-outline" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-1">Pickup</Text>
            </View>
          )}
        </View>
        <Text className="text-xs text-gray-600">Min: ₱{item.minOrder}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderProductCard = ({ item }) => (
    <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-bold text-gray-900 flex-1 mr-2">
          {item.name}
        </Text>
        <Text className="text-lg font-bold text-green-600">₱{item.price}</Text>
      </View>

      <Text className="text-sm text-gray-600 mb-2">{item.farmer}</Text>

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Ionicons name="cube-outline" size={14} color="#6B7280" />
          <Text className="text-xs text-gray-600 ml-1">{item.unit}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="trending-up" size={14} color="#10B981" />
          <Text className="text-xs text-green-600 ml-1">
            {item.stock} in stock
          </Text>
        </View>
      </View>

      <TouchableOpacity className="bg-green-600 py-3 rounded-lg mt-3">
        <Text className="text-white font-bold text-center">Add to Order</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-green-600 pt-16 pb-6 px-6">
        <Text className="text-2xl font-bold text-white">Source Supply</Text>
        <Text className="text-green-100 mt-1">
          Find farmers and suppliers near you
        </Text>
      </View>

      {/* Search Bar */}
      <View className="bg-white mx-4 mt-[-20px] p-3 rounded-xl shadow-lg flex-row items-center">
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          className="flex-1 ml-2 text-gray-800 text-base"
          placeholder="Search farmers or products..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10B981"]}
          />
        }
      >
        {/* Farmers Near You Section */}
        <View className="px-4 mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">
              Farmers Near You
            </Text>
            <TouchableOpacity>
              <Text className="text-green-600 font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={farmers}
            renderItem={renderFarmerCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          />
        </View>

        {/* Available Products Section */}
        <View className="px-4 mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">
              Available Products
            </Text>
            <Text className="text-gray-600">
              {filteredProducts.length} items
            </Text>
          </View>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            <View className="flex-row space-x-2">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  className={`px-4 py-2 rounded-full ${
                    selectedCategory === category.id
                      ? "bg-green-600"
                      : "bg-white"
                  }`}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text
                    className={`font-medium ${
                      selectedCategory === category.id
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Products List */}
          <FlatList
            data={filteredProducts}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View className="items-center justify-center py-8">
                <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                <Text className="text-lg text-gray-500 mt-2">
                  No products found
                </Text>
              </View>
            }
          />
        </View>

        {/* Quick Stats */}
        <View className="bg-green-600 mx-4 my-6 rounded-xl p-6">
          <Text className="text-white font-bold text-lg mb-4">Quick Stats</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">
                {farmers.length}
              </Text>
              <Text className="text-green-100 text-sm">Farmers</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">
                {products.length}
              </Text>
              <Text className="text-green-100 text-sm">Products</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">4.8</Text>
              <Text className="text-green-100 text-sm">Avg Rating</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">15km</Text>
              <Text className="text-green-100 text-sm">Radius</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
