import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import client from "@/utils/axiosInstance";

// Types
interface Product {
  id: string;
  name: string;
  category: string;
  categoryId: string | null;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  image: string | null;
  supplier: string;
  barcode: string;
  lastRestocked: string;
  expiryDate: string;
}

interface CooperativeState {
  cooperativeLoggedIn: {
    id: string;
    name: string;
  };
}

interface RootState {
  cooperative: CooperativeState;
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState<"all" | "lowStock" | "outOfStock">(
    "all"
  );

  // Get cooperative from Redux store
  const coop = useSelector(
    (state: RootState) => state.cooperative.cooperativeLoggedIn
  );
  const cooperativeId = coop?.id;

  const router = useRouter();

  // Sample products data
  const sampleProducts: Product[] = [
    {
      id: "1",
      name: "Organic Tomatoes",
      category: "Vegetables",
      categoryId: "1",
      price: 120,
      cost: 80,
      stock: 45,
      minStock: 10,
      unit: "kg",
      image: null,
      supplier: "Local Farm Coop",
      barcode: "1234567890123",
      lastRestocked: "2024-01-15",
      expiryDate: "2024-02-20",
    },
    {
      id: "2",
      name: "Brown Rice",
      category: "Grains",
      categoryId: "2",
      price: 65,
      cost: 45,
      stock: 8,
      minStock: 15,
      unit: "kg",
      image: null,
      supplier: "Rice Producers Coop",
      barcode: "1234567890124",
      lastRestocked: "2024-01-10",
      expiryDate: "2024-12-15",
    },
  ];

  useEffect(() => {
    if (cooperativeId) {
      fetchData();
    }
  }, [cooperativeId]);

  const fetchData = async (): Promise<void> => {
    if (!cooperativeId) {
      Alert.alert("Error", "Cooperative ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // TODO: Replace with actual API call for products
      // For now, use sample data
      setProducts(sampleProducts);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to fetch data");
      // Fallback to sample data
      setProducts(sampleProducts);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = (): void => {
    setRefreshing(true);
    fetchData();
  };

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "lowStock") {
      return (
        matchesSearch && product.stock > 0 && product.stock <= product.minStock
      );
    } else if (filter === "outOfStock") {
      return matchesSearch && product.stock === 0;
    }

    return matchesSearch;
  });

  const getStockStatus = (
    product: Product
  ): { status: string; color: string } => {
    if (product.stock === 0)
      return { status: "Out of Stock", color: "bg-red-500" };
    if (product.stock <= product.minStock)
      return { status: "Low Stock", color: "bg-yellow-500" };
    return { status: "In Stock", color: "bg-green-500" };
  };

  const calculateProfit = (product: Product): number => {
    return product.price - product.cost;
  };

  const openProductDetails = (product: Product): void => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const stockStatus = getStockStatus(item);

    return (
      <TouchableOpacity
        className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100"
        onPress={() => openProductDetails(item)}
      >
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-semibold text-gray-900 flex-1 mr-2">
            {item.name}
          </Text>
          <View className={`px-2 py-1 rounded-full ${stockStatus.color}`}>
            <Text className="text-xs font-bold text-white">
              {stockStatus.status}
            </Text>
          </View>
        </View>

        <View className="mb-2">
          <Text className="text-sm text-gray-600">{item.category}</Text>
          <Text className="text-sm text-gray-800 font-medium">
            Stock: {item.stock} {item.unit}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold text-green-600">
            ₱{item.price}
          </Text>
          <Text className="text-sm text-gray-500">
            Profit: ₱{calculateProfit(item)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!cooperativeId) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="business" size={48} color="#6B7280" />
        <Text className="mt-4 text-lg text-gray-600">
          Cooperative not found
        </Text>
        <Text className="text-gray-400 text-center mt-2 px-8">
          Please make sure you are logged in to a cooperative
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="leaf" size={48} color="#10B981" />
        <Text className="mt-4 text-lg text-gray-600">Loading Inventory...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-green-600 pt-16 pb-6 px-6">
        <Text className="text-2xl font-bold text-white">
          Inventory Management
        </Text>
        <Text className="text-green-100 mt-1">
          Manage your products and inventory
        </Text>
      </View>

      {/* Search Bar */}
      <View className="bg-white mx-4 mt-4 p-3 rounded-xl shadow-lg flex-row items-center">
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          className="flex-1 ml-2 text-gray-800 text-base"
          placeholder="Search products..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 mt-4"
      >
        <View className="flex-row space-x-2">
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${filter === "all" ? "bg-green-600" : "bg-white"}`}
            onPress={() => setFilter("all")}
          >
            <Text
              className={`text-sm font-medium ${filter === "all" ? "text-white" : "text-gray-600"}`}
            >
              All ({products.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${filter === "lowStock" ? "bg-green-600" : "bg-white"}`}
            onPress={() => setFilter("lowStock")}
          >
            <Text
              className={`text-sm font-medium ${filter === "lowStock" ? "text-white" : "text-gray-600"}`}
            >
              Low Stock (
              {
                products.filter((p) => p.stock > 0 && p.stock <= p.minStock)
                  .length
              }
              )
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${filter === "outOfStock" ? "bg-green-600" : "bg-white"}`}
            onPress={() => setFilter("outOfStock")}
          >
            <Text
              className={`text-sm font-medium ${filter === "outOfStock" ? "text-white" : "text-gray-600"}`}
            >
              Out of Stock ({products.filter((p) => p.stock === 0).length})
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10B981"]}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="cart-outline" size={64} color="#9CA3AF" />
            <Text className="mt-4 text-lg text-gray-500">
              No products found
            </Text>
          </View>
        }
      />

      {/* Add Product Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-green-600 flex-row items-center px-6 py-4 rounded-full shadow-xl"
        onPress={() => router.push("/cooperatives/Product")}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text className="text-white font-bold ml-2">Add Product</Text>
      </TouchableOpacity>

      {/* Product Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/50 px-5">
          <View className="bg-white rounded-2xl max-h-[80%]">
            {selectedProduct && (
              <>
                <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
                  <Text className="text-xl font-bold text-gray-900 flex-1 mr-2">
                    {selectedProduct.name}
                  </Text>
                  <TouchableOpacity
                    className="p-1"
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView className="p-6">
                  {/* Product Details */}
                  <View className="space-y-4">
                    <View>
                      <Text className="text-sm font-medium text-gray-500 mb-1">
                        Category
                      </Text>
                      <Text className="text-base text-gray-900">
                        {selectedProduct.category}
                      </Text>
                    </View>

                    <View className="flex-row space-x-4">
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-500 mb-1">
                          Price
                        </Text>
                        <Text className="text-lg font-bold text-green-600">
                          ₱{selectedProduct.price}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-500 mb-1">
                          Cost
                        </Text>
                        <Text className="text-lg font-bold text-gray-900">
                          ₱{selectedProduct.cost}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-500 mb-1">
                          Profit
                        </Text>
                        <Text className="text-lg font-bold text-blue-600">
                          ₱{calculateProfit(selectedProduct)}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row space-x-4">
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-500 mb-1">
                          Current Stock
                        </Text>
                        <Text className="text-lg font-bold text-gray-900">
                          {selectedProduct.stock} {selectedProduct.unit}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-500 mb-1">
                          Minimum Stock
                        </Text>
                        <Text className="text-lg font-bold text-yellow-600">
                          {selectedProduct.minStock} {selectedProduct.unit}
                        </Text>
                      </View>
                    </View>

                    <View>
                      <Text className="text-sm font-medium text-gray-500 mb-1">
                        Supplier
                      </Text>
                      <Text className="text-base text-gray-900">
                        {selectedProduct.supplier}
                      </Text>
                    </View>

                    <View>
                      <Text className="text-sm font-medium text-gray-500 mb-1">
                        Barcode
                      </Text>
                      <Text className="text-base text-gray-900">
                        {selectedProduct.barcode}
                      </Text>
                    </View>

                    <View className="flex-row space-x-4">
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-500 mb-1">
                          Last Restocked
                        </Text>
                        <Text className="text-base text-gray-900">
                          {selectedProduct.lastRestocked}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray500 mb-1">
                          Expiry Date
                        </Text>
                        <Text className="text-base text-gray-900">
                          {selectedProduct.expiryDate}
                        </Text>
                      </View>
                    </View>

                    <View
                      className={`p-3 rounded-lg ${
                        getStockStatus(selectedProduct).color === "bg-red-500"
                          ? "bg-red-50"
                          : getStockStatus(selectedProduct).color ===
                              "bg-yellow-500"
                            ? "bg-yellow-50"
                            : "bg-green-50"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          getStockStatus(selectedProduct).color === "bg-red-500"
                            ? "text-red-800"
                            : getStockStatus(selectedProduct).color ===
                                "bg-yellow-500"
                              ? "text-yellow-800"
                              : "text-green-800"
                        }`}
                      >
                        Status: {getStockStatus(selectedProduct).status}
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                <View className="flex-row p-6 border-t border-gray-200">
                  <TouchableOpacity
                    className="flex-1 py-3 bg-gray-100 rounded-lg mr-2"
                    onPress={() => setModalVisible(false)}
                  >
                    <Text className="text-center font-bold text-gray-700">
                      Close
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity className="flex-1 py-3 bg-green-600 rounded-lg ml-2">
                    <Text className="text-center font-bold text-white">
                      Restock
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
