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
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import client from "@/utils/axiosInstance";
import { Product, ProductAttribute } from "@/types";

const { width } = Dimensions.get("window");

interface CooperativeState {
  cooperativeLoggedIn: {
    id: string;
    name: string;
  };
}

interface RootState {
  cooperative: CooperativeState;
}

// Updated status functions based on products_attributes
const getProductStatus = (product: Product) => {
  const { products_attributes } = product;

  // Check if product has attributes
  if (products_attributes && products_attributes.length > 0) {
    // Check stock status across all attributes
    const allOutOfStock = products_attributes.every(
      (attr) => (attr.stock || 0) <= 0
    );
    const anyLowStock = products_attributes.some(
      (attr) => (attr.stock || 0) > 0 && (attr.stock || 0) <= 10
    );
    const anyInStock = products_attributes.some(
      (attr) => (attr.stock || 0) > 0
    );

    if (allOutOfStock)
      return {
        text: "Out of Stock",
        color: "bg-red-500",
        textColor: "text-red-700",
        icon: "close-circle" as const,
      };
    if (anyLowStock)
      return {
        text: "Low Stock",
        color: "bg-yellow-500",
        textColor: "text-yellow-700",
        icon: "warning" as const,
      };
    if (anyInStock)
      return {
        text: "In Stock",
        color: "bg-green-500",
        textColor: "text-green-700",
        icon: "checkmark-circle" as const,
      };

    return {
      text: "No Stock",
      color: "bg-gray-500",
      textColor: "text-gray-700",
      icon: "help-circle" as const,
    };
  }

  // For products without attributes
  return {
    text: "No Attributes",
    color: "bg-gray-500",
    textColor: "text-gray-700",
    icon: "alert-circle" as const,
  };
};

// Calculate price range from products_attributes
const getPriceRange = (product: Product) => {
  if (product.products_attributes && product.products_attributes.length > 0) {
    const prices = product.products_attributes
      .map((attr) => parseFloat(attr.price?.toString() || "0") || 0)
      .filter((p) => p > 0);

    if (prices.length === 0) return { min: 0, max: 0, display: "No price set" };

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return {
      min,
      max,
      display:
        min === max
          ? `₱${min.toFixed(2)}`
          : `₱${min.toFixed(2)} - ₱${max.toFixed(2)}`,
    };
  }

  return {
    min: 0,
    max: 0,
    display: "No price set",
  };
};

// Calculate total stock from products_attributes
const getTotalStock = (product: Product) => {
  if (product.products_attributes && product.products_attributes.length > 0) {
    return product.products_attributes.reduce(
      (total, attr) => total + (parseInt(attr.stock?.toString() || "0") || 0),
      0
    );
  }
  return 0;
};

// Calculate total value from products_attributes
const getTotalValue = (product: Product) => {
  if (product.products_attributes && product.products_attributes.length > 0) {
    return product.products_attributes.reduce((total, attr) => {
      const price = parseFloat(attr.price?.toString() || "0") || 0;
      const stock = parseInt(attr.stock?.toString() || "0") || 0;
      return total + price * stock;
    }, 0);
  }
  return 0;
};

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    archived: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  });

  // Get cooperative from Redux store
  const coop = useSelector(
    (state: RootState) => state.cooperative.cooperativeLoggedIn
  );
  const cooperativeId = coop?.id;

  const router = useRouter();

  useEffect(() => {
    if (cooperativeId) {
      fetchData();
    }
  }, [cooperativeId, showArchived]);

  const fetchData = async (): Promise<void> => {
    if (!cooperativeId) {
      Alert.alert("Error", "Cooperative ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await client.get(
        `/products/${coop.id}?include=attributes,category`
      );

      if (response.status === 200) {
        const productsData = response.data.data || [];
        setProducts(productsData);
        calculateStatistics(productsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to fetch products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStatistics = (productsData: Product[]) => {
    const stats = {
      total: productsData.length,
      active: 0,
      archived: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0,
    };

    productsData.forEach((product) => {
      const productStatus = getProductStatus(product);

      if (product.is_archived === 1) {
        stats.archived++;
      } else {
        stats.active++;
      }

      if (product.is_archived !== 1) {
        switch (productStatus.text) {
          case "In Stock":
            stats.inStock++;
            break;
          case "Low Stock":
            stats.lowStock++;
            break;
          case "Out of Stock":
            stats.outOfStock++;
            break;
        }

        stats.totalValue += getTotalValue(product);
      }
    });

    setStats(stats);
  };

  const onRefresh = (): void => {
    setRefreshing(true);
    fetchData();
  };

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (product.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      product.products_attributes?.some(
        (attr) =>
          attr.SKU?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attr.attribute?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      ) ||
      false;

    // Archive filter
    const matchesArchiveStatus = showArchived
      ? product.is_archived === 1
      : product.is_archived !== 1;

    return matchesSearch && matchesArchiveStatus;
  });

  const openProductDetails = (product: Product): void => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const status = getProductStatus(item);
    const priceRange = getPriceRange(item);
    const totalStock = getTotalStock(item);
    const totalValue = getTotalValue(item);
    const hasAttributes =
      item.products_attributes && item.products_attributes.length > 0;
    const isArchived = item.is_archived === 1;

    return (
      <TouchableOpacity
        className={`bg-white p-4 rounded-xl mb-3 shadow-sm border ${isArchived ? "border-yellow-200 bg-yellow-50" : "border-gray-100"}`}
        onPress={() => openProductDetails(item)}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-row items-center flex-1 mr-2">
            {item.images && item.images.length > 0 ? (
              <Image
                source={{ uri: item.images[0] }}
                className="w-12 h-12 rounded-lg mr-3"
                resizeMode="cover"
              />
            ) : (
              <View
                className={`w-12 h-12 rounded-lg mr-3 flex items-center justify-center ${isArchived ? "bg-yellow-100" : "bg-gray-100"}`}
              >
                <Ionicons
                  name={isArchived ? "archive" : "cube"}
                  size={20}
                  color={isArchived ? "#F59E0B" : "#6B7280"}
                />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 mb-1">
                {item.name}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600">
                  {item.category?.name || "Uncategorized"}
                </Text>
              </View>
            </View>
          </View>

          {!isArchived && (
            <View className={`px-2 py-1 rounded-full ${status.color}`}>
              <Text className="text-xs font-bold text-white">
                {status.text}
              </Text>
            </View>
          )}
        </View>

        {item.description && (
          <Text
            className="text-sm text-gray-600 mb-3 line-clamp-2"
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}

        <View className="mb-2">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-sm text-gray-600">Price Range:</Text>
            <Text className="text-base font-bold text-green-600">
              {priceRange.display}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-sm text-gray-600">Total Stock:</Text>
            <Text className="text-sm font-medium text-gray-900">
              {totalStock} {item.unit_type || "units"}
            </Text>
          </View>

          {!isArchived && (
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Inventory Value:</Text>
              <Text className="text-sm font-bold text-purple-600">
                ₱{totalValue.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Special Tags */}
        {!isArchived && (
          <View className="flex-row flex-wrap gap-1 mt-2">
            {item.is_featured && (
              <View className="px-2 py-1 rounded-full bg-yellow-100">
                <Text className="text-xs text-yellow-700">
                  <Ionicons name="star" size={10} /> Featured
                </Text>
              </View>
            )}
            {item.is_best_seller && (
              <View className="px-2 py-1 rounded-full bg-green-100">
                <Text className="text-xs text-green-700">
                  <Ionicons name="trending-up" size={10} /> Best Seller
                </Text>
              </View>
            )}
            {item.is_new_arrival && (
              <View className="px-2 py-1 rounded-full bg-blue-100">
                <Text className="text-xs text-blue-700">
                  <Ionicons name="newspaper" size={10} /> New Arrival
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
          <TouchableOpacity
            className="flex-1 bg-blue-50 py-2 rounded-lg flex-row items-center justify-center"
            onPress={() => router.push(`/cooperatives/Product?id=${item.id}`)}
          >
            <Ionicons name="create-outline" size={16} color="#3B82F6" />
            <Text className="text-blue-600 text-sm font-medium ml-1">Edit</Text>
          </TouchableOpacity>

          {isArchived ? (
            <TouchableOpacity
              className="flex-1 bg-green-50 py-2 rounded-lg flex-row items-center justify-center"
              onPress={() => handleRestore(item)}
            >
              <Ionicons name="refresh" size={16} color="#10B981" />
              <Text className="text-green-600 text-sm font-medium ml-1">
                Restore
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-1 bg-red-50 py-2 rounded-lg flex-row items-center justify-center"
              onPress={() => handleArchive(item)}
            >
              <Ionicons name="archive-outline" size={16} color="#EF4444" />
              <Text className="text-red-600 text-sm font-medium ml-1">
                Archive
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleArchive = (product: Product) => {
    Alert.alert(
      "Archive Product",
      `Are you sure you want to archive "${product.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: () => archiveProduct(product.id),
        },
      ]
    );
  };

  const handleRestore = (product: Product) => {
    Alert.alert(
      "Restore Product",
      `Are you sure you want to restore "${product.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          onPress: () => restoreProduct(product.id),
        },
      ]
    );
  };

  const archiveProduct = async (productId: string) => {
    try {
      await client.put(`/products/archive/${productId}`, {
        archive_reason: "Archived from mobile app",
      });
      Alert.alert("Success", "Product archived successfully");
      fetchData();
    } catch (error) {
      console.error("Error archiving product:", error);
      Alert.alert("Error", "Failed to archive product");
    }
  };

  const restoreProduct = async (productId: string) => {
    try {
      await client.put(`/products/unarchive/${productId}`);
      Alert.alert("Success", "Product restored successfully");
      fetchData();
    } catch (error) {
      console.error("Error restoring product:", error);
      Alert.alert("Error", "Failed to restore product");
    }
  };

  const renderStatsCard = (
    title: string,
    value: string | number,
    color: string,
    icon: string,
    subtitle?: string
  ) => (
    <View className="bg-white rounded-lg p-4 flex-1 mx-1 shadow-sm">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-sm font-medium text-gray-600">{title}</Text>
          <Text className={`text-2xl font-bold mt-1 ${color}`}>{value}</Text>
          {subtitle && (
            <Text className="text-xs text-gray-500 mt-1">{subtitle}</Text>
          )}
        </View>
        <Ionicons
          name={icon as any}
          size={24}
          color={
            color.includes("text-")
              ? color.split("text-")[1].split(" ")[0]
              : "#6B7280"
          }
        />
      </View>
    </View>
  );

  if (!cooperativeId) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="business" size={48} color="#6B7280" />
        <Text className="mt-4 text-lg text-gray-600">
          Cooperative not found
        </Text>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="mt-4 text-lg text-gray-600">Loading Inventory...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-green-600 pt-16 pb-4 px-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-2xl font-bold text-white">
            Product Management
          </Text>
          <TouchableOpacity
            className="bg-white/20 px-3 py-1 rounded-full"
            onPress={() => setShowArchived(!showArchived)}
          >
            <Text className="text-white text-sm font-medium">
              {showArchived ? "Active" : "Archived"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-green-100">
          {showArchived
            ? "Viewing archived products"
            : "Manage products and inventory"}
        </Text>
      </View>

      {/* Stats Cards - Simplified */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 mt-4"
      >
        <View className="flex-row space-x-2">
          {renderStatsCard(
            showArchived ? "Archived" : "Active",
            showArchived ? stats.archived : stats.active,
            showArchived ? "text-yellow-600" : "text-green-600",
            showArchived ? "archive" : "cube-outline",
            showArchived ? "Can be restored" : "Ready for sale"
          )}

          {!showArchived && (
            <>
              {renderStatsCard(
                "Low Stock",
                stats.lowStock,
                "text-yellow-600",
                "warning",
                "Needs attention"
              )}

              {renderStatsCard(
                "Out of Stock",
                stats.outOfStock,
                "text-red-600",
                "close-circle",
                "Restock needed"
              )}

              {renderStatsCard(
                "Total Value",
                `₱${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                "text-purple-600",
                "cash",
                "Inventory value"
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Search Bar */}
      <View className="mx-4 mt-4">
        <View className="bg-white p-3 rounded-xl shadow-sm flex-row items-center">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-2 text-gray-800 text-base"
            placeholder={
              showArchived
                ? "Search archived products..."
                : "Search products, SKUs, or attributes..."
            }
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Products Count */}
      <View className="mx-4 mt-4">
        <Text className="text-gray-600 font-medium">
          {filteredProducts.length} {showArchived ? "archived" : "active"}{" "}
          products found
        </Text>
      </View>

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
          <View className="items-center justify-center py-20 px-4">
            <Ionicons
              name={showArchived ? "archive-outline" : "cube-outline"}
              size={64}
              color="#9CA3AF"
            />
            <Text className="mt-4 text-lg text-gray-500 font-medium text-center">
              {showArchived
                ? "No archived products found"
                : "No products found"}
            </Text>
            <Text className="text-gray-400 text-center mt-2 px-8">
              {showArchived
                ? "All archived products are restored or no products have been archived yet"
                : "Try adjusting your search or add your first product"}
            </Text>
            {searchQuery.length > 0 && (
              <TouchableOpacity
                className="mt-4 bg-gray-600 px-4 py-2 rounded-lg"
                onPress={() => setSearchQuery("")}
              >
                <Text className="text-white">Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Add Product Button */}
      {!showArchived && (
        <TouchableOpacity
          className="absolute bottom-6 right-6 bg-green-600 flex-row items-center px-6 py-4 rounded-full shadow-xl"
          onPress={() => router.push("/cooperatives/Product")}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text className="text-white font-bold ml-2">Add Product</Text>
        </TouchableOpacity>
      )}

      {/* Product Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl max-h-[85%]">
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
                  {/* Product Images */}
                  {selectedProduct.images &&
                    selectedProduct.images.length > 0 && (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-4"
                      >
                        {selectedProduct.images.map((image, index) => (
                          <Image
                            key={index}
                            source={{ uri: image }}
                            className="w-64 h-64 rounded-lg mr-3"
                            resizeMode="cover"
                          />
                        ))}
                      </ScrollView>
                    )}

                  {/* Product Details */}
                  <View className="space-y-4">
                    <View>
                      <Text className="text-sm font-medium text-gray-500 mb-1">
                        Category
                      </Text>
                      <Text className="text-base text-gray-900">
                        {selectedProduct.category?.name || "Uncategorized"}
                      </Text>
                    </View>

                    {selectedProduct.description && (
                      <View>
                        <Text className="text-sm font-medium text-gray-500 mb-1">
                          Description
                        </Text>
                        <Text className="text-base text-gray-900">
                          {selectedProduct.description}
                        </Text>
                      </View>
                    )}

                    {/* Price Information */}
                    <View>
                      <Text className="text-sm font-medium text-gray-500 mb-2">
                        Price Information
                      </Text>
                      <View className="space-y-2">
                        <View className="flex-row justify-between">
                          <Text className="text-base text-gray-700">
                            Regular Price:
                          </Text>
                          <Text className="text-lg font-bold text-green-600">
                            {getPriceRange(selectedProduct).display}
                          </Text>
                        </View>
                        {/* Add member price range if available */}
                      </View>
                    </View>

                    {/* Stock Information */}
                    <View>
                      <Text className="text-sm font-medium text-gray-500 mb-2">
                        Stock Information
                      </Text>
                      <View className="space-y-2">
                        <View className="flex-row justify-between">
                          <Text className="text-base text-gray-700">
                            Total Stock:
                          </Text>
                          <Text className="text-lg font-medium text-gray-900">
                            {getTotalStock(selectedProduct)}{" "}
                            {selectedProduct.unit_type}
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-base text-gray-700">
                            Inventory Value:
                          </Text>
                          <Text className="text-lg font-bold text-purple-600">
                            ₱{getTotalValue(selectedProduct).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Attributes */}
                    {selectedProduct.products_attributes &&
                      selectedProduct.products_attributes.length > 0 && (
                        <View>
                          <Text className="text-sm font-medium text-gray-500 mb-2">
                            Attributes (
                            {selectedProduct.products_attributes.length})
                          </Text>
                          <View className="space-y-2">
                            {selectedProduct.products_attributes.map(
                              (attr, index) => (
                                <View
                                  key={attr.id || index}
                                  className="bg-gray-50 p-3 rounded-lg"
                                >
                                  <View className="flex-row justify-between items-center mb-2">
                                    <Text className="font-medium text-gray-800">
                                      {attr.attribute?.name ||
                                        `Attribute ${index + 1}`}
                                    </Text>
                                    <Text className="text-sm text-gray-600">
                                      {attr.attribute_value}
                                    </Text>
                                  </View>
                                  <View className="flex-row justify-between text-sm">
                                    <Text className="text-gray-600">
                                      SKU: {attr.SKU || "N/A"}
                                    </Text>
                                    <Text className="text-green-600 font-medium">
                                      ₱{(attr.price || 0).toFixed(2)}
                                    </Text>
                                  </View>
                                  <View className="flex-row justify-between text-sm mt-1">
                                    <Text className="text-gray-600">
                                      Stock: {attr.stock || 0}
                                    </Text>
                                    {attr.member_price && (
                                      <Text className="text-blue-600">
                                        Member: ₱
                                        {(attr.member_price || 0).toFixed(2)}
                                      </Text>
                                    )}
                                  </View>
                                </View>
                              )
                            )}
                          </View>
                        </View>
                      )}

                    {/* Special Tags */}
                    {(selectedProduct.is_featured ||
                      selectedProduct.is_best_seller ||
                      selectedProduct.is_new_arrival) && (
                      <View>
                        <Text className="text-sm font-medium text-gray-500 mb-2">
                          Special Tags
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                          {selectedProduct.is_featured && (
                            <View className="px-3 py-2 rounded-full bg-yellow-100">
                              <Text className="text-sm text-yellow-700 flex-row items-center">
                                <Ionicons name="star" size={14} /> Featured
                              </Text>
                            </View>
                          )}
                          {selectedProduct.is_best_seller && (
                            <View className="px-3 py-2 rounded-full bg-green-100">
                              <Text className="text-sm text-green-700 flex-row items-center">
                                <Ionicons name="trending-up" size={14} /> Best
                                Seller
                              </Text>
                            </View>
                          )}
                          {selectedProduct.is_new_arrival && (
                            <View className="px-3 py-2 rounded-full bg-blue-100">
                              <Text className="text-sm text-blue-700 flex-row items-center">
                                <Ionicons name="newspaper" size={14} /> New
                                Arrival
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Archive Status */}
                    {selectedProduct.is_archived === 1 && (
                      <View className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                        <Text className="text-sm font-medium text-yellow-800">
                          Archived Product
                        </Text>
                        {selectedProduct.archive_reason && (
                          <Text className="text-sm text-yellow-700 mt-1 italic">
                            Reason: "{selectedProduct.archive_reason}"
                          </Text>
                        )}
                        {selectedProduct.archived_at && (
                          <Text className="text-xs text-yellow-600 mt-1">
                            Date:{" "}
                            {new Date(
                              selectedProduct.archived_at
                            ).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    )}
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

                  <TouchableOpacity
                    className="flex-1 py-3 bg-green-600 rounded-lg ml-2"
                    onPress={() => {
                      setModalVisible(false);
                      router.push(
                        `/cooperatives/Product?id=${selectedProduct.id}`
                      );
                    }}
                  >
                    <Text className="text-center font-bold text-white">
                      Edit Product
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
