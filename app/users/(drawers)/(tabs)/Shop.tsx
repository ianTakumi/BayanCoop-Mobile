import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import client from "@/utils/axiosInstance";

const { width } = Dimensions.get("window");

export default function Store() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await client.get("/products");
      if (res.status === 200) {
        const productsData = res.data.data || [];
        setProducts(productsData);

        // Extract unique categories
        const uniqueCategories = [
          "All",
          ...new Set(
            productsData
              .map((product) => product.category?.name)
              .filter(Boolean)
          ),
        ];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  // Get minimum price
  const getMinPrice = (product) => {
    if (product.products_attributes?.length > 0) {
      const prices = product.products_attributes.map((attr) => attr.price || 0);
      return Math.min(...prices);
    }
    return 0;
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    if (
      selectedCategory !== "All" &&
      product.category?.name !== selectedCategory
    ) {
      return false;
    }

    if (searchQuery.trim() === "") return true;

    const query = searchQuery.toLowerCase();
    return (
      product.name?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    );
  });

  const getCategoryColor = (categoryName) => {
    switch (categoryName) {
      case "Citrus Fruits":
        return "bg-orange-100 border-orange-200";
      case "Herbs & Spices":
        return "bg-green-100 border-green-200";
      case "Rice & Grains":
        return "bg-amber-100 border-amber-200";
      default:
        return "bg-blue-100 border-blue-200";
    }
  };

  const renderProduct = ({ item }) => {
    const minPrice = getMinPrice(item);
    const imageUrl = item.images?.[0] || "https://via.placeholder.com/300";
    const categoryColor = getCategoryColor(item.category?.name);

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/users/Product",
            params: { productId: item.id },
          })
        }
        className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-3 mx-1.5"
        style={{ width: width / 2 - 16 }}
        activeOpacity={0.9}
      >
        {/* Product Image */}
        <View className="relative h-36 bg-gray-50">
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {item.is_new_arrival && (
            <View className="absolute top-2 left-2 bg-blue-500 rounded px-2 py-1">
              <Text className="text-white text-xs font-bold">NEW</Text>
            </View>
          )}

          {item.is_best_seller && (
            <View className="absolute top-2 right-2 bg-purple-500 rounded px-2 py-1">
              <Text className="text-white text-xs font-bold">BEST</Text>
            </View>
          )}

          {item.is_featured && (
            <View className="absolute bottom-2 left-2 bg-green-500 rounded px-2 py-1">
              <Text className="text-white text-xs font-bold">FEATURED</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="p-3">
          {/* Category */}
          <View className="mb-2">
            <View
              className={`rounded-lg px-2 py-1 border ${categoryColor} self-start`}
            >
              <Text className="text-gray-800 text-xs font-medium">
                {item.category?.name || "Uncategorized"}
              </Text>
            </View>
          </View>

          {/* Name */}
          <Text
            className="font-bold text-gray-800 text-sm mb-1"
            numberOfLines={2}
          >
            {item.name}
          </Text>

          {/* Description */}
          <Text className="text-gray-600 text-xs mb-2" numberOfLines={2}>
            {item.description || "No description"}
          </Text>

          {/* Price and Unit */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-green-600 font-bold text-base">
              ₱{minPrice.toFixed(2)}
            </Text>
            <Text className="text-gray-500 text-xs">
              {item.unit_type || "Unit"}
            </Text>
          </View>

          {/* Variants Info */}
          {item.products_attributes?.length > 1 && (
            <Text className="text-blue-600 text-xs mb-2">
              +{item.products_attributes.length - 1} variants
            </Text>
          )}

          {/* View Button */}
          <View className="pt-2 border-t border-gray-100 flex-row justify-between items-center">
            <Text className="text-gray-500 text-xs">View details</Text>
            <Text className="text-green-600 font-medium text-xs">→</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="text-gray-600 mt-4">Loading products...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-6 pb-4">
        <Text className="text-2xl font-bold text-green-600 mb-1">
          Our Store
        </Text>
        <Text className="text-gray-500">
          Fresh products for your daily needs
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-5 pb-4">
        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-base text-gray-700"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text className="text-gray-400 text-lg">×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View className="px-5 pb-4">
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          Categories
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl mr-3 ${
                selectedCategory === cat
                  ? "bg-green-600"
                  : "bg-gray-100 border border-gray-200"
              }`}
            >
              <Text
                className={`font-medium text-sm ${
                  selectedCategory === cat ? "text-white" : "text-gray-700"
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View className="px-5 pb-3 flex-row justify-between items-center">
        <Text className="text-gray-600">
          <Text className="font-semibold text-gray-800">
            {filteredProducts.length}
          </Text>{" "}
          products found
        </Text>
        <Text className="text-gray-500 text-xs">Tap for details</Text>
      </View>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#16a34a"]}
            />
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#16a34a"]}
            />
          }
        >
          <View className="flex-1 justify-center items-center py-16 px-8">
            <View className="w-20 h-20 bg-gray-100 rounded-full justify-center items-center mb-4">
              <Text className="text-gray-400 text-3xl">🔍</Text>
            </View>
            <Text className="text-xl font-semibold text-gray-800 mb-2 text-center">
              No products found
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              Try adjusting your search or filter criteria
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="bg-green-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Clear Filters</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
