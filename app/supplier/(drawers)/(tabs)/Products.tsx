import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from "react-native";
import {
  Ionicons,
  Feather,
  MaterialIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { useSelector } from "react-redux";
import client from "@/utils/axiosInstance";
import ProductForm, {
  FormData as ProductFormData,
  initialFormData,
} from "@/components/supplier/ProductForm";

// Generic Modal Component
const CustomModal = ({ isVisible, onClose, title, children, actionButton }) => {
  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center p-4">
        <View className="bg-white rounded-2xl max-h-[90%]">
          {/* Header */}
          <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>

          {/* Footer */}
          {actionButton && (
            <View className="flex-row justify-end gap-5 p-6 border-t border-gray-200">
              <TouchableOpacity
                onPress={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg"
              >
                <Text className="text-gray-700">Cancel</Text>
              </TouchableOpacity>
              {actionButton}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Price Range Component
const PriceRangeDisplay = ({ product }) => {
  // Extract all prices from supplier_product_attributes
  const extractPrices = () => {
    if (
      !product.supplier_product_attributes ||
      product.supplier_product_attributes.length === 0
    ) {
      return { minPrice: 0, maxPrice: 0, hasRange: false };
    }

    const prices = product.supplier_product_attributes
      .map((attr) => parseFloat(attr.price) || 0)
      .filter((price) => price > 0);

    if (prices.length === 0) {
      return { minPrice: 0, maxPrice: 0, hasRange: false };
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const hasRange = minPrice !== maxPrice && prices.length > 1;

    return { minPrice, maxPrice, hasRange };
  };

  const { minPrice, maxPrice, hasRange } = extractPrices();

  if (minPrice === 0 && maxPrice === 0) {
    return (
      <View className="flex-row items-center">
        <Text className="text-sm text-gray-500">No price set</Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center">
      {hasRange ? (
        <View className="flex-row items-center">
          <View className="bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
            <Text className="text-green-700 text-sm font-bold">
              ₱
              {minPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <Text className="mx-2 text-gray-400">to</Text>
          <View className="bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
            <Text className="text-green-700 text-sm font-bold">
              ₱
              {maxPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View className="ml-2 px-2 py-1 bg-blue-100 rounded-full">
            <Text className="text-blue-700 text-xs font-medium">
              {product.supplier_product_attributes?.length || 0} var
            </Text>
          </View>
        </View>
      ) : (
        <View className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
          <Text className="text-green-700 text-lg font-bold">
            ₱{minPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        </View>
      )}
    </View>
  );
};

// Product Item Component
const ProductItem = ({ item, onEdit, onArchive, onUnarchive, categories }) => {
  const getCategoryName = () => {
    if (!item.category) return "Uncategorized";
    const category = categories.find((cat) => cat.id === item.category?.id);
    return category ? category.name : "Uncategorized";
  };

  // Calculate stock status
  const getStockStatus = () => {
    if (item.status !== "active") return { text: "Archived", color: "gray" };

    // Calculate total stock from attributes
    const totalStock =
      item.supplier_product_attributes?.reduce(
        (sum, attr) => sum + (parseInt(attr.stock_quantity) || 0),
        0
      ) || 0;

    const minStockLevel = 10; // Configurable threshold

    if (totalStock === 0) {
      return { text: "Out of Stock", color: "red" };
    } else if (totalStock <= minStockLevel) {
      return { text: "Low Stock", color: "yellow" };
    } else {
      return { text: "In Stock", color: "green" };
    }
  };

  const stockStatus = getStockStatus();
  const isArchived = item.status === "archived";

  // Get color classes
  const getStatusColorClasses = (color) => {
    const colorMap = {
      red: "bg-red-100 text-red-700 border-red-200",
      yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
      green: "bg-green-100 text-green-700 border-green-200",
      gray: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colorMap[color] || colorMap.gray;
  };

  // Calculate total stock
  const totalStock =
    item.supplier_product_attributes?.reduce(
      (sum, attr) => sum + (parseInt(attr.stock_quantity) || 0),
      0
    ) || 0;

  // Get variation count
  const variationCount = item.supplier_product_attributes?.length || 0;

  return (
    <View
      className={`bg-white rounded-xl p-4 mb-3 mx-4 shadow-sm border ${
        isArchived ? "border-gray-300 bg-gray-50" : "border-gray-100"
      }`}
    >
      <View className="flex-row">
        {/* Product Image */}
        <View className="w-20 h-20 rounded-lg overflow-hidden relative">
          {item.images?.[0] ? (
            <Image
              source={{ uri: item.images[0] }}
              className="w-full h-full"
              style={isArchived ? { opacity: 0.7 } : {}}
            />
          ) : (
            <View
              className={`flex-1 justify-center items-center ${
                isArchived ? "bg-gray-200" : "bg-gray-100"
              }`}
            >
              <MaterialIcons
                name="inventory"
                size={32}
                color={isArchived ? "#9CA3AF" : "#6B7280"}
              />
            </View>
          )}

          {/* Variation badge */}
          {variationCount > 0 && (
            <View className="absolute top-2 right-2 bg-purple-600 px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">
                {variationCount}
              </Text>
            </View>
          )}

          {/* Archived overlay */}
          {isArchived && (
            <View className="absolute inset-0 bg-gray-800/30 items-center justify-center">
              <View className="bg-gray-800/80 px-3 py-1 rounded-lg">
                <Text className="text-white text-xs font-bold">ARCHIVED</Text>
              </View>
            </View>
          )}
        </View>

        {/* Product Details */}
        <View className="flex-1 ml-4">
          <View className="flex-row justify-between">
            <Text
              className={`font-bold text-base flex-1 ${
                isArchived ? "text-gray-600" : "text-gray-800"
              }`}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <View className="flex-row gap-5">
              <TouchableOpacity onPress={() => onEdit(item)}>
                <Feather name="edit" size={18} color="#3B82F6" />
              </TouchableOpacity>
              {item.status === "active" ? (
                <TouchableOpacity onPress={() => onArchive(item)}>
                  <FontAwesome name="archive" size={18} color="#EF4444" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => onUnarchive(item.id)}>
                  <FontAwesome name="undo" size={18} color="#059669" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text
            className={`text-sm mt-1 ${
              isArchived ? "text-gray-500" : "text-gray-600"
            }`}
            numberOfLines={2}
          >
            {item.description || "No description"}
          </Text>

          {/* Category */}
          <View className="flex-row items-center mt-2">
            <MaterialIcons name="category" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-1">
              {getCategoryName()}
            </Text>
          </View>

          {/* Price Range */}
          <View className="mt-2">
            <PriceRangeDisplay product={item} />
          </View>

          {/* Stock and Status */}
          <View className="flex-row justify-between items-center mt-3">
            <View className="flex-row items-center">
              <MaterialIcons name="inventory" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">
                Stock: {totalStock} {item.unit_type || "units"}
              </Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-full border ${getStatusColorClasses(
                stockStatus.color
              )}`}
            >
              <Text
                className={`text-xs font-medium ${
                  stockStatus.color === "red"
                    ? "text-red-700"
                    : stockStatus.color === "yellow"
                      ? "text-yellow-700"
                      : stockStatus.color === "green"
                        ? "text-green-700"
                        : "text-gray-700"
                }`}
              >
                {stockStatus.text}
              </Text>
            </View>
          </View>

          {/* Quick Info Row */}
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <View className="flex-row items-center">
              <Feather name="package" size={12} color="#6B7280" />
              <Text className="text-xs text-gray-500 ml-1">
                MOQ: {item.min_order_quantity || 1}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Feather name="layers" size={12} color="#6B7280" />
              <Text className="text-xs text-gray-500 ml-1">
                {variationCount} variation{variationCount !== 1 ? "s" : ""}
              </Text>
            </View>
            {item.archived_at && (
              <Text className="text-xs text-gray-400">
                Archived: {new Date(item.archived_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const Products = () => {
  const supplier = useSelector((state) => state.supplier.supplier);

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    archivedProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);

  // Fetch data
  const fetchCategories = async () => {
    try {
      const res = await client.get("/categories/dropdown");
      if (res.status === 200) {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await client.get(
        `/supplier-products/supplier/${supplier?.id}`,
        {
          params: {
            search: searchTerm,
            is_active: showArchived ? undefined : true,
          },
        }
      );
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch products"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await client.get(`/supplier-products/stats/${supplier?.id}`);
      if (res.data.success) setStats(res.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    if (supplier?.id) {
      fetchCategories();
      fetchProducts();
      fetchStats();
    }
  }, [supplier?.id, searchTerm, showArchived]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
    fetchStats();
  };

  // Filter products
  const displayedProducts = showArchived
    ? products
    : products.filter((p) => p.status === "active");

  // Handlers
  const handleAddProduct = async () => {
    try {
      setLoading(true);
      // Build attributes array in the format backend expects
      const attributes = (formData.attributes || []).map((attr) => ({
        attribute_id: attr.attribute_id,
        attribute_value: attr.attribute_value,
        price: parseFloat(attr.price) || 0,
        stock_quantity: parseInt(attr.stock_quantity) || 0,
        sku: attr.sku || null,
      }));

      const payload = {
        supplier_id: supplier?.id,
        name: formData.name,
        description: formData.description || null,
        category_id: formData.category_id,
        unit_type: formData.unit_type,
        images: formData.images || [],
        min_order_quantity: parseInt(formData.min_order_quantity) || 1,
        moq_unit: formData.moq_unit || "pcs",
        storage_requirements: formData.storage_requirements || null,
        attributes: attributes,
      };

      const res = await client.post("/supplier-products", payload);
      if (res.data.success) {
        Alert.alert("Success", "Product added successfully");
        setShowAddModal(false);
        resetForm();
        fetchProducts();
        fetchStats();
      }
    } catch (error) {
      console.error("Create product error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create product"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        unit_type: formData.unit_type,
        images: formData.images || [],
        base_price: parseFloat(formData.base_price) || 0,
        min_order_quantity: parseInt(formData.min_order_quantity) || 1,
        moq_unit: formData.moq_unit || "pcs",
        storage_requirements: formData.storage_requirements || null,
      };

      const res = await client.put(
        `/supplier-products/${selectedProduct.id}`,
        payload
      );

      if (res.data.success) {
        Alert.alert("Success", "Product updated successfully");
        setShowEditModal(false);
        fetchProducts();
      }
    } catch (error) {
      console.error("Update product error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update product"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveProduct = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      const res = await client.delete(
        `/supplier-products/${selectedProduct.id}`,
        {
          data: { reason: archiveReason },
        }
      );
      if (res.data.success) {
        Alert.alert("Success", "Product archived successfully");
        setShowArchiveModal(false);
        setArchiveReason("");
        fetchProducts();
        fetchStats();
      }
    } catch (error) {
      console.error("Archive error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to archive product"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchiveProduct = async (productId) => {
    try {
      setLoading(true);
      const res = await client.put(`/supplier-products/${productId}/unarchive`);
      if (res.data.success) {
        Alert.alert("Success", "Product restored successfully");
        fetchProducts();
        fetchStats();
      }
    } catch (error) {
      console.error("Unarchive error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to restore product"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    console.log(product.supplier_product_attributes);

    const editFormData: ProductFormData = {
      name: product.name || "",
      description: product.description || "",
      category_id: product.category.id || "",
      unit_type: product.unit_type || "",
      images: product.images || [],
      min_order_quantity: product.min_order_quantity
        ? product.min_order_quantity.toString()
        : "1",
      moq_unit: product.moq_unit || "pcs",
      storage_requirements: product.storage_requirements || "",
      attributes: product.supplier_product_attributes || [],
    };

    setSelectedProduct(product);
    setFormData(editFormData);
    setShowEditModal(true);
  };

  const openArchiveModal = (product) => {
    setSelectedProduct(product);
    setShowArchiveModal(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white pb-4">
        <View className="bg-green-600 px-6 pt-14 pb-8">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-emerald-400 text-sm font-medium uppercase tracking-wider">
                Inventory
              </Text>
              <Text className="text-white text-3xl font-bold mt-1">
                Product Management
              </Text>
              <View className="flex-row items-center mt-3 gap-5">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></View>
                  <Text className="text-white/70 text-sm">
                    {stats.activeProducts || 0} Active
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></View>
                  <Text className="text-white/70 text-sm">
                    {stats.lowStockCount || 0} Low Stock
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-gray-400 rounded-full mr-2"></View>
                  <Text className="text-white/70 text-sm">
                    {stats.archivedProducts || 0} Archived
                  </Text>
                </View>
              </View>
            </View>
            <View className="bg-emerald-500/20 p-3 rounded-xl">
              <MaterialIcons name="inventory" size={28} color="#10B981" />
            </View>
          </View>
        </View>

        {/* Search and Filter */}
        <View className="bg-white rounded-xl p-6 -mt-4 mx-4 border border-gray-100 shadow-sm">
          {/* Search */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Search Products
            </Text>
            <View className="flex-row items-center bg-gray-50 rounded-lg px-4 border border-gray-200">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 py-3.5 text-gray-800"
                placeholder="Search by product name, description..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                clearButtonMode="while-editing"
                placeholderTextColor={"#F5F5F5"}
              />
              {searchTerm ? (
                <TouchableOpacity onPress={() => setSearchTerm("")}>
                  <Feather name="x" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Archived Products Toggle */}
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-gray-700">
              Show Archived Products
            </Text>
            <TouchableOpacity
              onPress={() => setShowArchived(!showArchived)}
              className={`relative w-14 h-7 rounded-full flex items-center justify-center ${
                showArchived ? "bg-gray-800" : "bg-gray-300"
              }`}
              activeOpacity={0.7}
            >
              <View
                className={`absolute w-6 h-6 rounded-full bg-white transform transition-transform ${
                  showArchived ? "translate-x-4" : "-translate-x-4"
                }`}
              />
              {showArchived ? (
                <Feather
                  name="eye"
                  size={12}
                  color="white"
                  className="absolute left-2"
                />
              ) : (
                <Feather
                  name="eye-off"
                  size={12}
                  color="white"
                  className="absolute right-2"
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Selected Filters Summary */}
          <View className="flex-row flex-wrap gap-2 mt-4">
            {showArchived && (
              <View className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-full">
                <FontAwesome name="archive" size={14} color="#374151" />
                <Text className="text-gray-700 text-sm font-medium ml-1">
                  Showing Archived
                </Text>
                <TouchableOpacity
                  onPress={() => setShowArchived(false)}
                  className="ml-2"
                >
                  <Feather name="x" size={14} color="#374151" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Products Count */}
      <View className="px-6 py-4">
        <Text className="text-gray-600">
          Showing{" "}
          <Text className="font-bold text-gray-800">
            {displayedProducts.length}
          </Text>{" "}
          product{displayedProducts.length !== 1 ? "s" : ""}
          {showArchived && (
            <Text className="font-bold text-gray-800">
              {" "}
              (including archived)
            </Text>
          )}
        </Text>
      </View>

      {/* Products List */}
      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#059669" />
          <Text className="text-gray-500 mt-4">Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={displayedProducts}
          renderItem={({ item }) => (
            <ProductItem
              item={item}
              onEdit={openEditModal}
              onArchive={openArchiveModal}
              onUnarchive={handleUnarchiveProduct}
              categories={categories}
            />
          )}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#059669"
            />
          }
          ListEmptyComponent={
            <View className="items-center py-12 px-4">
              <MaterialIcons name="inventory" size={60} color="#D1D5DB" />
              <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                {showArchived
                  ? "No products found"
                  : "No active products found"}
              </Text>
              <Text className="text-gray-500 text-center mb-6">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : showArchived
                    ? "You don't have any archived products"
                    : "No active products found. Try showing archived products."}
              </Text>
              {!showArchived && (
                <TouchableOpacity
                  onPress={() => setShowArchived(true)}
                  className="bg-blue-600 px-6 py-3 rounded-lg flex-row items-center"
                >
                  <FontAwesome name="eye" size={16} color="white" />
                  <Text className="text-white font-medium ml-2">
                    Show Archived Products
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Circular Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openAddModal}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Modals */}
      <CustomModal
        isVisible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Product"
        actionButton={
          <TouchableOpacity
            onPress={handleAddProduct}
            disabled={
              loading ||
              !formData.name ||
              !formData.category_id ||
              !formData.unit_type
            }
            className={`px-6 py-3 rounded-lg flex-row items-center ${
              loading ||
              !formData.name ||
              !formData.category_id ||
              !formData.unit_type
                ? "bg-green-400"
                : "bg-green-600"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="add" size={20} color="white" />
                <Text className="text-white font-medium ml-2">Add Product</Text>
              </>
            )}
          </TouchableOpacity>
        }
      >
        <ProductForm
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          loading={loading}
        />
      </CustomModal>

      <CustomModal
        isVisible={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Product"
        actionButton={
          <TouchableOpacity
            onPress={handleUpdateProduct}
            disabled={loading}
            className={`px-6 py-3 rounded-lg flex-row items-center ${
              loading ? "bg-blue-400" : "bg-blue-600"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Feather name="edit" size={20} color="white" />
                <Text className="text-white font-medium ml-2">
                  Update Product
                </Text>
              </>
            )}
          </TouchableOpacity>
        }
      >
        <ProductForm
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          loading={loading}
        />
      </CustomModal>

      {/* Archive Modal */}
      <Modal visible={showArchiveModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center p-4">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Archive Product
            </Text>
            <Text className="text-gray-600 mb-4">
              Are you sure you want to archive "{selectedProduct?.name}"?
            </Text>

            <Text className="text-gray-700 mb-1">Archive reason</Text>
            <TextInput
              className="border border-gray-300 text-black rounded-lg p-3 mb-4"
              placeholder="Reason for archiving (optional)"
              value={archiveReason}
              onChangeText={setArchiveReason}
              multiline
            />
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowArchiveModal(false);
                  setArchiveReason("");
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg"
              >
                <Text className="text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleArchiveProduct}
                disabled={loading}
                className="px-6 py-3 bg-red-600 rounded-lg"
              >
                <Text className="text-white">
                  {loading ? "Archiving..." : "Archive Product"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles for Floating Action Button
const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 999,
  },
});

export default Products;
