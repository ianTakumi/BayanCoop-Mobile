import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Modal,
  FlatList,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import client from "@/utils/axiosInstance";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { Controller, useForm } from "react-hook-form";
import {
  ProductFormData,
  Category,
  Supplier,
  ProductWithDetails,
} from "@/types";

export default function ProductFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const productId = params.id as string | undefined;
  const isEditMode = !!productId;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [nestedCategories, setNestedCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );

  const coop = useSelector((state) => state.cooperative.cooperativeLoggedIn);
  const cooperativeId = coop?.id;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      unit_type: "pcs",
      package_size: "",
      weight_grams: "",
      dimensions_cm: "",
      brand: "",
      barcode: "",
      source_type: "supplier",
      supplier_id: "",
      storage_instructions: "",
      shelf_life_days: "",
      requires_refrigeration: false,
      is_fragile: false,
      tags: [],
      cost_price: "",
      selling_price: "",
      current_stock: "0",
      min_stock_level: "10",
      max_stock_level: "",
      expiry_date: "",
      location: "",
      batch_number: "",
    },
  });

  const sourceType = watch("source_type");

  // Organize categories into hierarchical structure
  const buildCategoryTree = (categories: Category[]): Category[] => {
    const categoryMap: Record<string, Category> = {};
    const rootCategories: Category[] = [];

    // First pass: create map and add level property
    categories.forEach((category) => {
      categoryMap[category.id] = { ...category, children: [], level: 0 };
    });

    // Second pass: build tree structure
    categories.forEach((category) => {
      const node = categoryMap[category.id];

      if (category.parent_id && categoryMap[category.parent_id]) {
        // This is a child category
        node.level = (categoryMap[category.parent_id].level || 0) + 1;
        categoryMap[category.parent_id].children!.push(node);
      } else {
        // This is a root category
        node.level = 0;
        rootCategories.push(node);
      }
    });

    return rootCategories;
  };

  // Flatten categories for display in modal
  const flattenCategories = (categories: Category[], level = 0): Category[] => {
    let result: Category[] = [];

    categories.forEach((category) => {
      result.push({
        ...category,
        level,
      });

      if (category.children && category.children.length > 0) {
        result = result.concat(flattenCategories(category.children, level + 1));
      }
    });

    return result;
  };

  // Fetch categories and suppliers
  useEffect(() => {
    if (cooperativeId) {
      fetchCategories();
      fetchSuppliers();
      if (isEditMode) {
        fetchProduct();
      }
    }
  }, [cooperativeId, isEditMode]);

  const fetchCategories = async () => {
    try {
      const response = await client.get(`/categories/dropdown`);
      if (response.data.success) {
        const fetchedCategories = response.data.data;
        setCategories(fetchedCategories);
        const tree = buildCategoryTree(fetchedCategories);
        setNestedCategories(tree);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await client.get(`/suppliers/dropdown`);
      if (response.data.success) {
        setSuppliers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await client.get<ProductWithDetails>(
        `/cooperatives/${cooperativeId}/products/${productId}`
      );

      if (response.data.success) {
        const productData = response.data.data;

        // Set product form values
        const formData: Partial<ProductFormData> = {
          name: productData.product.name || "",
          description: productData.product.description || "",
          category_id: productData.product.category_id || "",
          unit_type: productData.product.unit_type || "pcs",
          package_size: productData.product.package_size || "",
          weight_grams: productData.product.weight_grams?.toString() || "",
          dimensions_cm: productData.product.dimensions_cm || "",
          brand: productData.product.brand || "",
          barcode: productData.product.barcode || "",
          source_type: productData.product.source_type as any,
          supplier_id: productData.product.supplier_id || "",
          storage_instructions: productData.product.storage_instructions || "",
          shelf_life_days:
            productData.product.shelf_life_days?.toString() || "",
          requires_refrigeration:
            productData.product.requires_refrigeration || false,
          is_fragile: productData.product.is_fragile || false,
          tags: productData.product.tags || [],
        };

        // Set price values
        if (productData.current_price) {
          formData.cost_price = productData.current_price.cost_price.toString();
          formData.selling_price =
            productData.current_price.selling_price.toString();
        }

        // Set inventory values
        if (productData.inventory) {
          formData.current_stock =
            productData.inventory.current_stock.toString();
          formData.min_stock_level =
            productData.inventory.min_stock_level.toString();
          formData.max_stock_level =
            productData.inventory.max_stock_level?.toString();
          formData.expiry_date = productData.inventory.expiry_date || "";
          formData.location = productData.inventory.location || "";
          formData.batch_number = productData.inventory.batch_number || "";
        }

        reset(formData);

        // Set selected category
        if (productData.product.category_id) {
          const category = categories.find(
            (c) => c.id === productData.product.category_id
          );
          if (category) {
            setSelectedCategory(category);
          }
        }

        // Set selected supplier
        if (productData.product.supplier_id) {
          const supplier = suppliers.find(
            (s) => s.id === productData.product.supplier_id
          );
          if (supplier) {
            setSelectedSupplier(supplier);
          }
        }

        // Set images
        if (
          productData.product.images &&
          productData.product.images.length > 0
        ) {
          setImages(productData.product.images);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      Alert.alert("Error", "Failed to load product data");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setValue("category_id", category.id);
    setShowCategoryModal(false);
  };

  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setValue("supplier_id", supplier.id);
    setShowSupplierModal(false);
  };

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const paddingLeft = (item.level || 0) * 20 + 16;

    return (
      <TouchableOpacity
        onPress={() => handleCategorySelect(item)}
        style={{ paddingLeft }}
        className={`py-3 px-4 border-b border-gray-100 ${
          selectedCategory?.id === item.id ? "bg-green-50" : "bg-white"
        }`}
      >
        <View className="flex-row items-center">
          {item.level && item.level > 0 && (
            <View className="mr-2">
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </View>
          )}
          <Text
            className={`font-medium ${
              selectedCategory?.id === item.id
                ? "text-green-700"
                : "text-gray-700"
            }`}
          >
            {item.name}
          </Text>
          {item.parent_name && (
            <Text className="text-gray-400 text-sm ml-2">
              ({item.parent_name})
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSupplierItem = ({ item }: { item: Supplier }) => {
    return (
      <TouchableOpacity
        onPress={() => handleSupplierSelect(item)}
        className={`py-3 px-4 border-b border-gray-100 ${
          selectedSupplier?.id === item.id ? "bg-green-50" : "bg-white"
        }`}
      >
        <Text
          className={`font-medium ${
            selectedSupplier?.id === item.id
              ? "text-green-700"
              : "text-gray-700"
          }`}
        >
          {item.name}
        </Text>
        {item.contact_person && (
          <Text className="text-gray-500 text-sm">
            Contact: {item.contact_person}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission needed",
            "Sorry, we need camera roll permissions to make this work!"
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        const newImages = result.assets.map((asset) => asset.uri);
        setImages((prev) => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadImages = async (uris: string[]): Promise<string[]> => {
    try {
      setUploadingImage(true);
      const uploadedUrls: string[] = [];

      for (const uri of uris) {
        if (uri.startsWith("http")) {
          uploadedUrls.push(uri);
          continue;
        }

        const formData = new FormData();
        const filename = uri.split("/").pop() || "product_image.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("image", {
          uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
          name: filename,
          type,
        } as any);
        formData.append("folder", "uploads/products");

        const response = await client.post("/upload/single", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success) {
          uploadedUrls.push(response.data.data.url);
        }
      }

      return uploadedUrls;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!cooperativeId) {
      Alert.alert("Error", "Cooperative not found");
      return;
    }

    try {
      setLoading(true);

      // Upload images if needed
      let uploadedImages = images;
      const newImages = images.filter((img) => !img.startsWith("http"));
      if (newImages.length > 0) {
        uploadedImages = await uploadImages(images);
      }

      // Prepare product data for API
      const productPayload = {
        // Product data
        name: data.name.trim(),
        description: data.description?.trim(),
        category_id: data.category_id || null,
        unit_type: data.unit_type,
        package_size: data.package_size?.trim(),
        weight_grams: data.weight_grams ? parseFloat(data.weight_grams) : null,
        dimensions_cm: data.dimensions_cm?.trim(),
        brand: data.brand?.trim(),
        barcode: data.barcode?.trim(),
        source_type: data.source_type,
        supplier_id: data.source_type === "supplier" ? data.supplier_id : null,
        images: uploadedImages,
        storage_instructions: data.storage_instructions?.trim(),
        shelf_life_days: data.shelf_life_days
          ? parseInt(data.shelf_life_days)
          : null,
        requires_refrigeration: data.requires_refrigeration,
        is_fragile: data.is_fragile,
        tags: data.tags,

        // Price data
        cost_price: parseFloat(data.cost_price),
        selling_price: parseFloat(data.selling_price),

        // Inventory data
        current_stock: parseInt(data.current_stock),
        min_stock_level: parseInt(data.min_stock_level),
        max_stock_level: data.max_stock_level
          ? parseInt(data.max_stock_level)
          : null,
        expiry_date: data.expiry_date || null,
        location: data.location?.trim(),
        batch_number: data.batch_number?.trim(),
      };

      let response;
      if (isEditMode) {
        response = await client.put(
          `/cooperatives/${cooperativeId}/products/${productId}`,
          productPayload
        );
      } else {
        response = await client.post(
          `/cooperatives/${cooperativeId}/products`,
          productPayload
        );
      }

      if (response.data.success) {
        Alert.alert(
          "Success",
          isEditMode
            ? "Product updated successfully!"
            : "Product added successfully!",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Error saving product:", error);
      const errorMessage =
        error.response?.data?.message ||
        (isEditMode ? "Failed to update product" : "Failed to add product");
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!productId || !cooperativeId) return;

    Alert.alert(
      "Archive Product",
      "Are you sure you want to archive this product? You can restore it later.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Archive",
          style: "destructive",
          onPress: () => deleteProduct(),
        },
      ]
    );
  };

  const deleteProduct = async () => {
    try {
      setLoading(true);
      const response = await client.delete(
        `/cooperatives/${cooperativeId}/products/${productId}/archive`,
        {
          data: { archive_reason: "Archived by user" },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Product archived successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      console.error("Error archiving product:", error);
      Alert.alert("Error", "Failed to archive product");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading && isEditMode) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#22C55E" />
        <Text className="mt-4 text-gray-600">Loading product data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="bg-green-600 pt-16 pb-6 px-6">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-2 -ml-2"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">
              {isEditMode ? "Edit Product" : "Add Product"}
            </Text>
            <Text className="text-green-100 mt-1">
              {isEditMode
                ? "Update product details"
                : "Add new products to your inventory"}
            </Text>
          </View>

          {isEditMode && (
            <TouchableOpacity onPress={handleDelete} className="p-2">
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 p-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <View className="space-y-6">
          {/* Product Images */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Product Images
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {images.map((img, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri: img }}
                    className="w-20 h-20 rounded-lg"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                onPress={pickImage}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50"
                disabled={uploadingImage}
              >
                <Ionicons name="camera-outline" size={24} color="#9CA3AF" />
                <Text className="text-gray-500 text-xs mt-1">Add</Text>
              </TouchableOpacity>
            </View>
            {uploadingImage && (
              <View className="mt-2">
                <ActivityIndicator size="small" color="#22C55E" />
                <Text className="text-gray-500 text-sm text-center">
                  Uploading images...
                </Text>
              </View>
            )}
          </View>

          {/* Form Fields */}
          <View>
            {/* Product Name */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </Text>
              <Controller
                control={control}
                name="name"
                rules={{ required: "Product name is required" }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="e.g., Organic Tomatoes"
                    className={`border rounded-lg px-4 py-3 text-gray-900 ${
                      errors.name ? "border-red-400" : "border-gray-300"
                    }`}
                    style={{ color: "black" }}
                  />
                )}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </Text>
              )}
            </View>

            {/* Category */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Category
              </Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(true)}
                className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-between"
              >
                <Text className="text-gray-900">
                  {selectedCategory
                    ? selectedCategory.name +
                      (selectedCategory.parent_name
                        ? ` (${selectedCategory.parent_name})`
                        : "")
                    : "Select a category"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </TouchableOpacity>

              {selectedCategory && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory(null);
                    setValue("category_id", "");
                  }}
                  className="mt-2 flex-row items-center"
                >
                  <Ionicons name="close-circle" size={16} color="#EF4444" />
                  <Text className="text-red-500 text-sm ml-1">
                    Clear Selection
                  </Text>
                </TouchableOpacity>
              )}

              {/* Category Selection Modal */}
              <Modal
                visible={showCategoryModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCategoryModal(false)}
              >
                <View className="flex-1 bg-black/50 justify-end">
                  <View className="bg-white rounded-t-3xl max-h-3/4">
                    <View className="p-6 border-b border-gray-200">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xl font-bold text-gray-900">
                          Select Category
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowCategoryModal(false)}
                          className="p-2"
                        >
                          <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {nestedCategories.length > 0 ? (
                      <FlatList
                        data={flattenCategories(nestedCategories)}
                        renderItem={renderCategoryItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        className="max-h-96"
                      />
                    ) : (
                      <View className="p-6 items-center">
                        <Text className="text-gray-500">
                          No categories available
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Modal>
            </View>

            {/* Source Type */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Product Source *
              </Text>
              <View className="flex-row gap-2 mb-3">
                {[
                  { value: "supplier", label: "Supplier", icon: "🏢" },
                  {
                    value: "coop-produced",
                    label: "Coop Produced",
                    icon: "🏭",
                  },
                  { value: "member", label: "Member", icon: "👨‍🌾" },
                  { value: "donation", label: "Donation", icon: "🎁" },
                ].map((type) => (
                  <Controller
                    key={type.value}
                    control={control}
                    name="source_type"
                    render={({ field: { onChange, value } }) => (
                      <TouchableOpacity
                        onPress={() => {
                          onChange(type.value);
                          if (type.value !== "supplier") {
                            setSelectedSupplier(null);
                            setValue("supplier_id", "");
                          }
                        }}
                        className={`px-4 py-2 rounded-full border flex-row items-center ${
                          value === type.value
                            ? "bg-green-100 border-green-500"
                            : "bg-gray-100 border-gray-300"
                        }`}
                      >
                        <Text className="mr-1">{type.icon}</Text>
                        <Text
                          className={`font-medium ${
                            value === type.value
                              ? "text-green-700"
                              : "text-gray-700"
                          }`}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                ))}
              </View>

              {/* Supplier Selection (only for supplier source type) */}
              {sourceType === "supplier" && (
                <View className="mt-3">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Select Supplier *
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowSupplierModal(true)}
                    className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-between"
                  >
                    <Text className="text-gray-900">
                      {selectedSupplier?.name || "Select supplier..."}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </TouchableOpacity>
                  <Controller
                    control={control}
                    name="supplier_id"
                    rules={{
                      required:
                        sourceType === "supplier"
                          ? "Supplier is required"
                          : false,
                    }}
                    render={({ field: { onChange } }) => (
                      <TextInput style={{ display: "none" }} />
                    )}
                  />
                  {errors.supplier_id && (
                    <Text className="text-red-500 text-sm mt-1">
                      {errors.supplier_id.message}
                    </Text>
                  )}

                  {/* Supplier Selection Modal */}
                  <Modal
                    visible={showSupplierModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowSupplierModal(false)}
                  >
                    <View className="flex-1 bg-black/50 justify-end">
                      <View className="bg-white rounded-t-3xl max-h-3/4">
                        <View className="p-6 border-b border-gray-200">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-xl font-bold text-gray-900">
                              Select Supplier
                            </Text>
                            <TouchableOpacity
                              onPress={() => setShowSupplierModal(false)}
                              className="p-2"
                            >
                              <Ionicons
                                name="close"
                                size={24}
                                color="#6B7280"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {suppliers.length > 0 ? (
                          <FlatList
                            data={suppliers}
                            renderItem={renderSupplierItem}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            className="max-h-96"
                          />
                        ) : (
                          <View className="p-6 items-center">
                            <Text className="text-gray-500">
                              No suppliers available
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Modal>
                </View>
              )}
            </View>

            {/* Unit Type and Package Size */}
            <View className="flex-row gap-5 mb-5">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Unit Type *
                </Text>
                <Controller
                  control={control}
                  name="unit_type"
                  rules={{ required: "Unit type is required" }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="e.g., kg, pcs, box"
                      className={`border rounded-lg px-4 py-3 text-gray-900 ${
                        errors.unit_type ? "border-red-400" : "border-gray-300"
                      }`}
                      style={{ color: "black" }}
                    />
                  )}
                />
                {errors.unit_type && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.unit_type.message}
                  </Text>
                )}
              </View>

              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Package Size
                </Text>
                <Controller
                  control={control}
                  name="package_size"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="e.g., 250g, 1kg"
                      className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                      style={{ color: "black" }}
                    />
                  )}
                />
              </View>
            </View>

            {/* Price and Cost */}
            <View className="flex-row gap-5 mb-5">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Cost Price *
                </Text>
                <Controller
                  control={control}
                  name="cost_price"
                  rules={{
                    required: "Cost price is required",
                    pattern: {
                      value: /^\d+(\.\d{1,2})?$/,
                      message: "Enter a valid price",
                    },
                    validate: (value) => {
                      const sellingPrice = watch("selling_price");
                      if (
                        sellingPrice &&
                        parseFloat(value) > parseFloat(sellingPrice)
                      ) {
                        return "Cost price cannot be higher than selling price";
                      }
                      return true;
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      className={`border rounded-lg px-4 py-3 text-gray-900 ${
                        errors.cost_price ? "border-red-400" : "border-gray-300"
                      }`}
                      style={{ color: "black" }}
                    />
                  )}
                />
                {errors.cost_price && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.cost_price.message}
                  </Text>
                )}
              </View>

              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Selling Price *
                </Text>
                <Controller
                  control={control}
                  name="selling_price"
                  rules={{
                    required: "Selling price is required",
                    pattern: {
                      value: /^\d+(\.\d{1,2})?$/,
                      message: "Enter a valid price",
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      className={`border rounded-lg px-4 py-3 text-gray-900 ${
                        errors.selling_price
                          ? "border-red-400"
                          : "border-gray-300"
                      }`}
                      style={{ color: "black" }}
                    />
                  )}
                />
                {errors.selling_price && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.selling_price.message}
                  </Text>
                )}
              </View>
            </View>

            {/* Stock Levels */}
            <View className="flex-row gap-5 mb-5">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Current Stock *
                </Text>
                <Controller
                  control={control}
                  name="current_stock"
                  rules={{
                    required: "Current stock is required",
                    pattern: {
                      value: /^\d+$/,
                      message: "Enter a valid number",
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="0"
                      keyboardType="number-pad"
                      className={`border rounded-lg px-4 py-3 text-gray-900 ${
                        errors.current_stock
                          ? "border-red-400"
                          : "border-gray-300"
                      }`}
                      style={{ color: "black" }}
                    />
                  )}
                />
                {errors.current_stock && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.current_stock.message}
                  </Text>
                )}
              </View>

              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Min Stock Level *
                </Text>
                <Controller
                  control={control}
                  name="min_stock_level"
                  rules={{
                    required: "Minimum stock level is required",
                    pattern: {
                      value: /^\d+$/,
                      message: "Enter a valid number",
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="10"
                      keyboardType="number-pad"
                      className={`border rounded-lg px-4 py-3 text-gray-900 ${
                        errors.min_stock_level
                          ? "border-red-400"
                          : "border-gray-300"
                      }`}
                      style={{ color: "black" }}
                    />
                  )}
                />
                {errors.min_stock_level && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.min_stock_level.message}
                  </Text>
                )}
              </View>
            </View>

            {/* Max Stock and Expiry Date */}
            <View className="flex-row gap-5 mb-5">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Max Stock Level
                </Text>
                <Controller
                  control={control}
                  name="max_stock_level"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="Optional"
                      keyboardType="number-pad"
                      className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                      style={{ color: "black" }}
                    />
                  )}
                />
              </View>

              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </Text>
                <Controller
                  control={control}
                  name="expiry_date"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="YYYY-MM-DD"
                      className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                      style={{ color: "black" }}
                    />
                  )}
                />
              </View>
            </View>

            {/* Brand and Barcode */}
            <View className="flex-row gap-5 mb-5">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Brand
                </Text>
                <Controller
                  control={control}
                  name="brand"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="Brand name"
                      className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                      style={{ color: "black" }}
                    />
                  )}
                />
              </View>

              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Barcode/SKU
                </Text>
                <Controller
                  control={control}
                  name="barcode"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="Scan or enter barcode"
                      className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                      style={{ color: "black" }}
                    />
                  )}
                />
              </View>
            </View>

            {/* Location and Batch Number */}
            <View className="flex-row gap-5 mb-5">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Storage Location
                </Text>
                <Controller
                  control={control}
                  name="location"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="e.g., Warehouse A, Shelf B"
                      className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                      style={{ color: "black" }}
                    />
                  )}
                />
              </View>

              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Batch Number
                </Text>
                <Controller
                  control={control}
                  name="batch_number"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="Batch/Lot number"
                      className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                      style={{ color: "black" }}
                    />
                  )}
                />
              </View>
            </View>

            {/* Product Options */}
            <View className="mb-5 space-y-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-gray-700">
                  Requires Refrigeration
                </Text>
                <Controller
                  control={control}
                  name="requires_refrigeration"
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: "#D1D5DB", true: "#22C55E" }}
                    />
                  )}
                />
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-gray-700">
                  Is Fragile Product
                </Text>
                <Controller
                  control={control}
                  name="is_fragile"
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: "#D1D5DB", true: "#22C55E" }}
                    />
                  )}
                />
              </View>
            </View>

            {/* Description */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Description
              </Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Product description..."
                    multiline
                    numberOfLines={3}
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                    style={{ color: "black", textAlignVertical: "top" }}
                  />
                )}
              />
            </View>

            {/* Storage Instructions */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Storage Instructions
              </Text>
              <Controller
                control={control}
                name="storage_instructions"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Special storage instructions..."
                    multiline
                    numberOfLines={2}
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                    style={{ color: "black", textAlignVertical: "top" }}
                  />
                )}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={loading || uploadingImage}
            className={`py-4 rounded-lg mt-6 ${
              loading || uploadingImage ? "bg-green-300" : "bg-green-600"
            }`}
          >
            {loading || uploadingImage ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                {isEditMode ? "Update Product" : "Add Product"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={loading || uploadingImage}
            className="py-3 rounded-lg border border-gray-300 mt-2"
          >
            <Text className="text-gray-700 text-center font-medium">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
