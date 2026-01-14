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
  Dimensions,
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
  Attribute,
  ProductAttribute,
} from "@/types";

// Add these types to your types file
type AttributeFormData = {
  attribute_id: string;
  attribute_value: string;
  SKU: string;
  price: string;
  member_price: string;
  stock: string;
};

const { width } = Dimensions.get("window");

export default function ProductFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const productId = params.id as string | undefined;
  const isEditMode = !!productId;
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nestedCategories, setNestedCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUnitTypeModal, setShowUnitTypeModal] = useState(false);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [productAttributes, setProductAttributes] = useState<
    ProductAttribute[]
  >([]);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [editingAttributeIndex, setEditingAttributeIndex] = useState<
    number | null
  >(null);
  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>(
    []
  );
  const [attributeValues, setAttributeValues] = useState<
    Record<string, string[]>
  >({});
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [showAttributeValueDropdown, setShowAttributeValueDropdown] =
    useState(false);
  const [customAttributeValue, setCustomAttributeValue] = useState("");

  const unitTypes = [
    { value: "piece", label: "Piece" },
    { value: "kg", label: "Kilogram (kg)" },
    { value: "g", label: "Gram (g)" },
    { value: "liter", label: "Liter" },
    { value: "ml", label: "Milliliter (ml)" },
    { value: "pack", label: "Pack" },
    { value: "bottle", label: "Bottle" },
    { value: "bag", label: "Bag" },
    { value: "bunch", label: "Bunch" },
    { value: "dozen", label: "Dozen" },
    { value: "box", label: "Box" },
  ];

  const coop = useSelector((state) => state.cooperative.cooperativeLoggedIn);
  console.log("Product ID", productId);
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
      unit_type: "piece",
      images: [],
      is_featured: false,
      is_best_seller: false,
      is_new_arrival: false,
      status: "active",
    },
  });

  const watchCategoryId = watch("category_id");

  // Fetch attributes when category changes
  useEffect(() => {
    if (watchCategoryId) {
      fetchAttributesByCategory(watchCategoryId);
    } else {
      setAttributes([]);
      setAvailableAttributes([]);
      setAttributeValues({});
      setProductAttributes([]);
    }
  }, [watchCategoryId]);

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

  useEffect(() => {
    if (cooperativeId) {
      const loadData = async () => {
        await fetchCategories();
        if (isEditMode && productId) {
          await fetchProduct();
        }
      };
      loadData();
    }
  }, [cooperativeId, isEditMode, productId]);

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
      Alert.alert("Error", "Failed to load categories");
    }
  };

  const fetchAttributesByCategory = async (categoryId: string) => {
    try {
      setLoadingAttributes(true);
      const response = await client.get(`/attributes/category/${categoryId}`);
      if (response.data.success) {
        const fetchedAttributes = response.data.data || [];
        setAttributes(fetchedAttributes);

        // All attributes are available for selection (can reuse types)
        setAvailableAttributes(fetchedAttributes);

        // Pre-fill attribute values for common attributes
        const defaultValues: Record<string, string[]> = {};
        fetchedAttributes.forEach((attr: Attribute) => {
          switch (attr.name.toLowerCase()) {
            case "size":
              defaultValues[attr.attribute_id] = [
                "Small",
                "Medium",
                "Large",
                "XL",
                "XXL",
              ];
              break;
            case "color":
              defaultValues[attr.attribute_id] = [
                "Red",
                "Blue",
                "Green",
                "Black",
                "White",
                "Yellow",
              ];
              break;
            case "weight":
              defaultValues[attr.attribute_id] = [
                "100g",
                "250g",
                "500g",
                "1kg",
                "2kg",
                "5kg",
              ];
              break;
            case "flavor":
              defaultValues[attr.attribute_id] = [
                "Original",
                "Chocolate",
                "Vanilla",
                "Strawberry",
                "Matcha",
              ];
              break;
            case "type":
              defaultValues[attr.attribute_id] = [
                "Regular",
                "Premium",
                "Organic",
                "Gluten-Free",
              ];
              break;
            default:
              defaultValues[attr.attribute_id] = [];
          }
        });
        setAttributeValues(defaultValues);
      }
    } catch (error) {
      console.error("Error fetching attributes:", error);
      setAttributes([]);
      setAvailableAttributes([]);
      setAttributeValues({});
    } finally {
      setLoadingAttributes(false);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await client.get<ProductWithDetails>(
        `/products/single/${productId}/`
      );

      if (response.data.success) {
        const productData = response.data.data;

        // Set product form values
        const formData: Partial<ProductFormData> = {
          name: productData.name || "",
          description: productData.description || "",
          category_id: productData.category_id || "",
          unit_type: productData.unit_type || "piece",
          images: productData.images || [],
          is_featured: productData.is_featured || false,
          is_best_seller: productData.is_best_seller || false,
          is_new_arrival: productData.is_new_arrival || false,
          status: productData.status || "active",
        };

        reset(formData);
        setImages(productData.images || []);

        // Set product attributes if they exist
        if (
          productData.products_attributes &&
          productData.products_attributes.length > 0
        ) {
          setProductAttributes(
            productData.products_attributes.map((attr) => ({
              ...attr,
              attribute_name: attr.attribute?.name || "Unknown",
              attribute_value: attr.attribute_value || "",
            }))
          );
        }

        // Set selected category
        if (productData.category_id) {
          const category = categories.find(
            (c) => c.id === productData.category_id
          );
          if (category) {
            setSelectedCategory(category);
          }

          // Fetch attributes for this category
          await fetchAttributesByCategory(productData.category_id);
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
    // Clear attributes when category changes
    setProductAttributes([]);
  };

  const handleAddAttribute = () => {
    if (!watchCategoryId) {
      Alert.alert("Error", "Please select a category first");
      return;
    }
    if (availableAttributes.length === 0) {
      Alert.alert("Error", "No attributes available for this category");
      return;
    }
    setEditingAttributeIndex(null);
    setShowAttributeModal(true);
  };

  const handleEditAttribute = (index: number) => {
    setEditingAttributeIndex(index);
    setShowAttributeModal(true);
  };

  const handleDeleteAttribute = (index: number) => {
    Alert.alert(
      "Delete Attribute",
      "Are you sure you want to delete this attribute?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const deletedAttr = productAttributes[index];
            setProductAttributes((prev) => prev.filter((_, i) => i !== index));

            // Note: We don't update availableAttributes since we allow reusing types
          },
        },
      ]
    );
  };

  const handleAttributeSubmit = (attributeData: AttributeFormData) => {
    const selectedAttribute = attributes.find(
      (attr) => attr.attribute_id === attributeData.attribute_id
    );

    // Use custom value if provided, otherwise use selected value
    const attributeValue =
      customAttributeValue || attributeData.attribute_value;

    const newAttribute: ProductAttribute = {
      id:
        editingAttributeIndex !== null
          ? productAttributes[editingAttributeIndex].id
          : undefined,
      attribute_id: attributeData.attribute_id,
      attribute_name: selectedAttribute?.name || "Unknown Attribute",
      attribute_value: attributeValue,
      SKU: attributeData.SKU.trim(),
      price: parseFloat(attributeData.price) || 0,
      member_price: parseFloat(attributeData.member_price) || 0,
      stock: parseInt(attributeData.stock) || 0,
      product_id: productId || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attribute: selectedAttribute,
    };

    if (editingAttributeIndex !== null) {
      // Update existing attribute
      const updatedAttributes = [...productAttributes];
      updatedAttributes[editingAttributeIndex] = newAttribute;
      setProductAttributes(updatedAttributes);
    } else {
      // Add new attribute - Check for duplicate combination (same type + same value)
      const isDuplicate = productAttributes.some(
        (attr) =>
          attr.attribute_id === attributeData.attribute_id &&
          attr.attribute_value === attributeValue
      );

      if (isDuplicate) {
        Alert.alert(
          "Duplicate Attribute",
          `"${attributeValue}" already exists for ${selectedAttribute?.name}. Please use a different value.`
        );
        return;
      }

      setProductAttributes([...productAttributes, newAttribute]);
    }

    setShowAttributeModal(false);
    setEditingAttributeIndex(null);
    setCustomAttributeValue("");
    setShowAttributeValueDropdown(false);
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
        selectionLimit: 5 - images.length, // Max 5 images
      });

      if (!result.canceled) {
        const newImages = result.assets.map((asset) => asset.uri);
        if (images.length + newImages.length > 5) {
          Alert.alert("Error", "Maximum 5 images allowed");
          return;
        }
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
        const filename = uri.split("/").pop() || `product_${Date.now()}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("image", {
          uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
          name: filename,
          type,
        } as any);
        formData.append("folder", "products");

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

    // Validate required fields
    if (!data.name.trim()) {
      Alert.alert("Error", "Product name is required");
      return;
    }

    if (!data.category_id) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    // Validate attributes
    if (productAttributes.length === 0) {
      Alert.alert("Error", "Products must have at least one attribute");
      return;
    }

    // Check for duplicate attribute combinations
    const attributeCombinations = new Set();
    for (const attr of productAttributes) {
      const key = `${attr.attribute_id}-${attr.attribute_value}`;
      if (attributeCombinations.has(key)) {
        Alert.alert(
          "Error",
          `Duplicate attribute combination found: ${attr.attribute_name} - ${attr.attribute_value}`
        );
        return;
      }
      attributeCombinations.add(key);
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
        name: data.name.trim(),
        description: data.description?.trim() || "",
        category_id: data.category_id,
        unit_type: data.unit_type,
        images: uploadedImages,
        is_featured: data.is_featured,
        is_best_seller: data.is_best_seller,
        is_new_arrival: data.is_new_arrival,
        status: data.status,
        products_attributes: productAttributes.map((attr) => ({
          id: attr.id, // For updates
          attribute_id: attr.attribute_id,
          attribute_value: attr.attribute_value,
          SKU: attr.SKU.trim(),
          price: parseFloat(attr.price.toString()) || 0,
          member_price: parseFloat(attr.member_price.toString()) || 0,
          stock: parseInt(attr.stock.toString()) || 0,
        })),
      };

      console.log("Sending product data:", productPayload);

      let response;
      if (isEditMode) {
        response = await client.put(
          `/cooperatives/${cooperativeId}/products/${productId}`,
          productPayload
        );
      } else {
        response = await client.post(
          `/products/${cooperativeId}/`,
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
      } else {
        Alert.alert("Error", response.data.message || "Failed to save product");
      }
    } catch (error: any) {
      console.error("Error saving product:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (isEditMode ? "Failed to update product" : "Failed to add product");
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to remove image
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Render function for category items
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

  // Unit Type Modal Component
  const UnitTypeModal = () => {
    const watchUnitType = watch("unit_type");

    return (
      <Modal
        visible={showUnitTypeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUnitTypeModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-3/4">
            <View className="p-6 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-900">
                  Select Unit Type
                </Text>
                <TouchableOpacity
                  onPress={() => setShowUnitTypeModal(false)}
                  className="p-2"
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={unitTypes}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setValue("unit_type", item.value);
                    setShowUnitTypeModal(false);
                  }}
                  className={`px-4 py-3 border-b border-gray-100 ${
                    watchUnitType === item.value ? "bg-green-50" : "bg-white"
                  }`}
                >
                  <Text
                    className={`${
                      watchUnitType === item.value
                        ? "text-green-700 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              className="max-h-96"
            />
          </View>
        </View>
      </Modal>
    );
  };

  // Attribute Modal Component - IMPROVED VERSION
  const AttributeModal = ({
    attribute,
    availableAttributes,
    attributeValues,
    onSubmit,
    onClose,
  }: {
    attribute: ProductAttribute | null;
    availableAttributes: Attribute[];
    attributeValues: Record<string, string[]>;
    onSubmit: (data: AttributeFormData) => void;
    onClose: () => void;
  }) => {
    const [formData, setFormData] = useState<AttributeFormData>({
      attribute_id: attribute?.attribute_id || "",
      attribute_value: attribute?.attribute_value || "",
      SKU: attribute?.SKU || "",
      price: attribute?.price?.toString() || "",
      member_price: attribute?.member_price?.toString() || "",
      stock: attribute?.stock?.toString() || "0",
    });

    const selectedAttribute = availableAttributes.find(
      (attr) => attr.attribute_id === formData.attribute_id
    );

    const possibleValues = attributeValues[formData.attribute_id] || [];
    const usedValues = productAttributes
      .filter((attr) => attr.attribute_id === formData.attribute_id)
      .map((attr) => attr.attribute_value);

    const handleSubmit = () => {
      if (!formData.attribute_id) {
        Alert.alert("Error", "Please select an attribute type");
        return;
      }

      if (!formData.SKU.trim()) {
        Alert.alert("Error", "Please enter SKU");
        return;
      }

      if (!formData.price) {
        Alert.alert("Error", "Please enter price");
        return;
      }

      const attributeValue = customAttributeValue || formData.attribute_value;
      if (!attributeValue.trim()) {
        Alert.alert("Error", "Please enter an attribute value");
        return;
      }

      // Check if this value is already used for the same attribute type (only for new attributes)
      if (!attribute && usedValues.includes(attributeValue.trim())) {
        Alert.alert(
          "Error",
          `"${attributeValue}" already exists for this attribute type. Please use a different value.`
        );
        return;
      }

      onSubmit({ ...formData, attribute_value: attributeValue });
    };

    // Generate SKU automatically when attribute and value are selected
    useEffect(() => {
      if (
        formData.attribute_id &&
        (customAttributeValue || formData.attribute_value) &&
        !attribute
      ) {
        const attr = availableAttributes.find(
          (a) => a.attribute_id === formData.attribute_id
        );
        if (attr && !formData.SKU) {
          const attrPrefix = attr.name.substring(0, 3).toUpperCase();
          const value = customAttributeValue || formData.attribute_value;
          const valuePrefix = value.substring(0, 3).toUpperCase();
          const randomNum = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0");
          setFormData((prev) => ({
            ...prev,
            SKU: `${attrPrefix}-${valuePrefix}-${randomNum}`,
          }));
        }
      }
    }, [formData.attribute_id, formData.attribute_value, customAttributeValue]);

    return (
      <Modal
        visible={true}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/50 justify-end"
        >
          <ScrollView
            className="bg-white rounded-t-3xl max-h-4/5"
            showsVerticalScrollIndicator={false}
          >
            <View className="p-6 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-900">
                  {attribute ? "Edit Attribute" : "Add Attribute"}
                </Text>
                <TouchableOpacity onPress={onClose} className="p-2">
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="p-6">
              <View className="space-y-4">
                {/* Attribute Type */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Attribute Type *
                  </Text>
                  <View className="border border-gray-300 rounded-lg">
                    {availableAttributes.map((attr) => (
                      <TouchableOpacity
                        key={attr.attribute_id}
                        onPress={() => {
                          setFormData({
                            ...formData,
                            attribute_id: attr.attribute_id,
                            attribute_value: "",
                          });
                          setCustomAttributeValue("");
                          setShowAttributeValueDropdown(false);
                        }}
                        className={`px-4 py-3 border-b border-gray-100 ${
                          formData.attribute_id === attr.attribute_id
                            ? "bg-green-50"
                            : "bg-white"
                        }`}
                      >
                        <View className="flex-row justify-between items-center">
                          <Text
                            className={`${
                              formData.attribute_id === attr.attribute_id
                                ? "text-green-700 font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            {attr.name}
                          </Text>
                          {usedValues.length > 0 &&
                            formData.attribute_id === attr.attribute_id && (
                              <Text className="text-xs text-blue-600">
                                Used: {usedValues.join(", ")}
                              </Text>
                            )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Attribute Value */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Attribute Value *
                    {selectedAttribute && possibleValues.length > 0 && (
                      <Text className="text-xs text-gray-500 ml-2">
                        (Suggested: {possibleValues.join(", ")})
                      </Text>
                    )}
                  </Text>

                  {possibleValues.length > 0 ? (
                    <>
                      <TouchableOpacity
                        onPress={() =>
                          setShowAttributeValueDropdown(
                            !showAttributeValueDropdown
                          )
                        }
                        className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
                      >
                        <Text className="text-gray-900">
                          {formData.attribute_value ||
                            customAttributeValue ||
                            "Select a value"}
                        </Text>
                        <Ionicons
                          name="chevron-down"
                          size={20}
                          color="#6B7280"
                        />
                      </TouchableOpacity>

                      {showAttributeValueDropdown && (
                        <View className="border border-gray-300 rounded-lg mt-1 max-h-40">
                          <FlatList
                            data={possibleValues}
                            renderItem={({ item }) => (
                              <TouchableOpacity
                                onPress={() => {
                                  setFormData({
                                    ...formData,
                                    attribute_value: item,
                                  });
                                  setCustomAttributeValue("");
                                  setShowAttributeValueDropdown(false);
                                }}
                                className="px-4 py-3 border-b border-gray-100 bg-white"
                              >
                                <Text className="text-gray-700">{item}</Text>
                              </TouchableOpacity>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                            scrollEnabled={true}
                          />
                          <TouchableOpacity
                            onPress={() => {
                              setFormData({ ...formData, attribute_value: "" });
                              setCustomAttributeValue("");
                              setShowAttributeValueDropdown(false);
                            }}
                            className="px-4 py-3 bg-gray-50"
                          >
                            <Text className="text-gray-700">
                              Custom value...
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {(!formData.attribute_value ||
                        showAttributeValueDropdown) && (
                        <TextInput
                          value={customAttributeValue}
                          onChangeText={setCustomAttributeValue}
                          placeholder="Or enter custom value"
                          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 mt-2"
                        />
                      )}
                    </>
                  ) : (
                    <TextInput
                      value={customAttributeValue || formData.attribute_value}
                      onChangeText={(value) => {
                        if (possibleValues.length > 0) {
                          setCustomAttributeValue(value);
                        } else {
                          setFormData({ ...formData, attribute_value: value });
                        }
                      }}
                      placeholder={`Enter ${selectedAttribute?.name?.toLowerCase() || "attribute"} value`}
                      className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                    />
                  )}

                  {usedValues.length > 0 && (
                    <Text className="text-xs text-blue-600 mt-1">
                      Note: You can use the same attribute type with different
                      values
                      {usedValues.length > 0 &&
                        `. Current values: ${usedValues.join(", ")}`}
                    </Text>
                  )}
                </View>

                {/* SKU */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    SKU *
                  </Text>
                  <TextInput
                    value={formData.SKU}
                    onChangeText={(value) =>
                      setFormData({ ...formData, SKU: value })
                    }
                    placeholder="e.g., SML-RED-001"
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                  />
                  <Text className="text-xs text-gray-500 mt-1">
                    {attribute
                      ? "Edit SKU if needed"
                      : "SKU will be auto-generated"}
                  </Text>
                </View>

                {/* Price and Member Price */}
                <View className="flex-row space-x-4">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Price (₱) *
                    </Text>
                    <TextInput
                      value={formData.price}
                      onChangeText={(value) =>
                        setFormData({
                          ...formData,
                          price: value.replace(/[^0-9.]/g, ""),
                        })
                      }
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Member Price (₱)
                    </Text>
                    <TextInput
                      value={formData.member_price}
                      onChangeText={(value) =>
                        setFormData({
                          ...formData,
                          member_price: value.replace(/[^0-9.]/g, ""),
                        })
                      }
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                    />
                  </View>
                </View>

                {/* Stock */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Initial Stock *
                  </Text>
                  <TextInput
                    value={formData.stock}
                    onChangeText={(value) =>
                      setFormData({
                        ...formData,
                        stock: value.replace(/[^0-9]/g, ""),
                      })
                    }
                    placeholder="0"
                    keyboardType="number-pad"
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                  />
                </View>
              </View>

              <View className="flex-row space-x-4 mt-6">
                <TouchableOpacity
                  onPress={onClose}
                  className="flex-1 border border-gray-300 rounded-lg py-3"
                >
                  <Text className="text-gray-700 text-center font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  className="flex-1 bg-blue-600 rounded-lg py-3"
                >
                  <Text className="text-white text-center font-medium">
                    {attribute ? "Update" : "Add"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  // Render function for attribute items
  const renderAttributeItem = ({
    item,
    index,
  }: {
    item: ProductAttribute;
    index: number;
  }) => (
    <View className="border border-gray-200 rounded-lg p-4 mb-3">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="font-medium text-gray-800">
            {item.attribute_name}
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            Value: <Text className="font-medium">{item.attribute_value}</Text>
          </Text>
        </View>
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => handleEditAttribute(index)}
            className="p-2"
          >
            <Ionicons name="create-outline" size={20} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteAttribute(index)}
            className="p-2"
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row flex-wrap mt-2">
        <View className="w-1/2 pr-2 mb-2">
          <Text className="text-xs text-gray-500">SKU</Text>
          <Text className="text-sm font-mono">{item.SKU}</Text>
        </View>
        <View className="w-1/2 pl-2 mb-2">
          <Text className="text-xs text-gray-500">Price</Text>
          <Text className="text-sm text-green-600">
            ₱{parseFloat(item.price.toString()).toFixed(2)}
          </Text>
        </View>
        <View className="w-1/2 pr-2">
          <Text className="text-xs text-gray-500">Member Price</Text>
          <Text className="text-sm text-blue-600">
            ₱{parseFloat(item.member_price.toString()).toFixed(2)}
          </Text>
        </View>
        <View className="w-1/2 pl-2">
          <Text className="text-xs text-gray-500">Stock</Text>
          <Text
            className={`text-sm ${item.stock <= 10 ? "text-yellow-600" : item.stock === 0 ? "text-red-600" : "text-green-600"}`}
          >
            {item.stock}
          </Text>
        </View>
      </View>
    </View>
  );

  // Calculate totals
  const totalStock = productAttributes.reduce(
    (sum, attr) => sum + (parseInt(attr.stock.toString()) || 0),
    0
  );
  const totalValue = productAttributes.reduce((sum, attr) => {
    return (
      sum +
      (parseFloat(attr.price.toString()) || 0) *
        (parseInt(attr.stock.toString()) || 0)
    );
  }, 0);

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
      <View className="bg-green-600 pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-2 -ml-2"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-white">
              {isEditMode ? "Edit Product" : "Add Product"}
            </Text>
            <Text className="text-green-100 text-sm mt-1">
              {isEditMode
                ? "Update product details"
                : "Add new products to your inventory"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View className="space-y-4 pt-4">
          {/* Product Images */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Product Images {images.length > 0 && `(${images.length}/5)`}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-2"
            >
              <View className="flex-row gap-3">
                {images.map((img, index) => (
                  <View key={index} className="relative">
                    <Image
                      source={{ uri: img }}
                      className="w-24 h-24 rounded-lg"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>
                    {index === 0 && (
                      <View className="absolute bottom-1 left-1 bg-green-600 rounded px-2 py-1">
                        <Text className="text-white text-xs">Main</Text>
                      </View>
                    )}
                  </View>
                ))}
                {images.length < 5 && (
                  <TouchableOpacity
                    onPress={pickImage}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50"
                    disabled={uploadingImage}
                  >
                    <Ionicons name="camera-outline" size={28} color="#9CA3AF" />
                    <Text className="text-gray-500 text-xs mt-1">
                      Add Image
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
            {uploadingImage && (
              <View className="mt-2 flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#22C55E" />
                <Text className="text-gray-500 text-sm ml-2">
                  Uploading images...
                </Text>
              </View>
            )}
            <Text className="text-xs text-gray-500 mt-1">
              First image will be used as main thumbnail. Maximum 5 images.
            </Text>
          </View>

          {/* Basic Information */}
          <View className="border border-gray-200 rounded-lg p-4">
            <Text className="font-medium text-gray-700 mb-4">
              Basic Information
            </Text>

            {/* Product Name */}
            <View className="mb-4">
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
                  />
                )}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </Text>
              )}
            </View>

            {/* Description */}
            <View className="mb-4">
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
                    style={{ textAlignVertical: "top", minHeight: 80 }}
                  />
                )}
              />
            </View>

            {/* Category */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Category *
              </Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(true)}
                className={`border rounded-lg px-4 py-3 flex-row items-center justify-between ${
                  errors.category_id ? "border-red-400" : "border-gray-300"
                }`}
              >
                <Text
                  className={`text-gray-900 ${!selectedCategory ? "text-gray-400" : ""}`}
                >
                  {selectedCategory
                    ? selectedCategory.name
                    : "Select a category"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </TouchableOpacity>
              {errors.category_id && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.category_id.message}
                </Text>
              )}

              {selectedCategory && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory(null);
                    setValue("category_id", "");
                    setProductAttributes([]);
                  }}
                  className="mt-2 flex-row items-center"
                >
                  <Ionicons name="close-circle" size={16} color="#EF4444" />
                  <Text className="text-red-500 text-sm ml-1">
                    Clear Selection
                  </Text>
                </TouchableOpacity>
              )}

              {watchCategoryId && attributes.length > 0 && (
                <View className="mt-2 flex-row items-center">
                  <Ionicons name="list" size={16} color="#3B82F6" />
                  <Text className="text-blue-500 text-sm ml-1">
                    {attributes.length} attributes available
                  </Text>
                </View>
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
                    <View className="p-4 border-b border-gray-200">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-lg font-bold text-gray-900">
                          Select Category
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowCategoryModal(false)}
                          className="p-2"
                        >
                          <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        placeholder="Search categories..."
                        className="border border-gray-300 rounded-lg px-4 py-2 mt-2"
                      />
                    </View>

                    {nestedCategories.length > 0 ? (
                      <FlatList
                        data={flattenCategories(nestedCategories)}
                        renderItem={renderCategoryItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        className="max-h-80"
                      />
                    ) : (
                      <View className="p-6 items-center">
                        <ActivityIndicator size="small" color="#22C55E" />
                        <Text className="text-gray-500 mt-2">
                          Loading categories...
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Modal>
            </View>

            {/* Unit Type */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Unit Type *
              </Text>
              <Controller
                control={control}
                name="unit_type"
                rules={{ required: "Unit type is required" }}
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    onPress={() => setShowUnitTypeModal(true)}
                    className={`border rounded-lg px-4 py-3 flex-row items-center justify-between ${
                      errors.unit_type ? "border-red-400" : "border-gray-300"
                    }`}
                  >
                    <Text className="text-gray-900">
                      {value
                        ? unitTypes.find((u) => u.value === value)?.label ||
                          value.charAt(0).toUpperCase() + value.slice(1)
                        : "Select unit type"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </TouchableOpacity>
                )}
              />
              {errors.unit_type && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.unit_type.message}
                </Text>
              )}
            </View>

            {/* Product Flags */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-3">
                Product Flags
              </Text>
              <View className="space-y-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></View>
                    <Text className="text-gray-700">Featured</Text>
                  </View>
                  <Controller
                    control={control}
                    name="is_featured"
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
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-blue-500 rounded-full mr-2"></View>
                    <Text className="text-gray-700">New Arrival</Text>
                  </View>
                  <Controller
                    control={control}
                    name="is_new_arrival"
                    render={({ field: { onChange, value } }) => (
                      <Switch
                        value={value}
                        onValueChange={onChange}
                        trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
                      />
                    )}
                  />
                </View>
                {isEditMode && (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 bg-green-500 rounded-full mr-2"></View>
                      <Text className="text-gray-700">Best Seller</Text>
                    </View>
                    <Controller
                      control={control}
                      name="is_best_seller"
                      render={({ field: { onChange, value } }) => (
                        <Switch
                          value={value}
                          onValueChange={onChange}
                          trackColor={{ false: "#D1D5DB", true: "#22C55E" }}
                        />
                      )}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Product Attributes Section */}
          <View className="border border-gray-200 rounded-lg p-4">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="font-medium text-gray-700">
                  Product Attributes
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Add variants like sizes, colors, etc.
                </Text>
              </View>
              {productAttributes.length > 0 && (
                <View className="bg-gray-100 px-3 py-1 rounded-full">
                  <Text className="text-sm text-gray-700">
                    {productAttributes.length} added
                  </Text>
                </View>
              )}
            </View>

            {!watchCategoryId ? (
              <View className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center">
                <Ionicons name="tag-outline" size={32} color="#9CA3AF" />
                <Text className="text-gray-600 font-medium mt-2">
                  Select a category first
                </Text>
                <Text className="text-sm text-gray-500 text-center mt-1">
                  Choose a category above to see available attributes
                </Text>
              </View>
            ) : attributes.length === 0 ? (
              <View className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center">
                <Ionicons name="tag-outline" size={32} color="#9CA3AF" />
                <Text className="text-gray-600 font-medium mt-2">
                  No attributes available
                </Text>
                <Text className="text-sm text-gray-500 text-center mt-1">
                  This category has no predefined attributes
                </Text>
              </View>
            ) : productAttributes.length === 0 ? (
              <View className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center">
                <Ionicons name="list-outline" size={32} color="#9CA3AF" />
                <Text className="text-gray-600 font-medium mt-2">
                  Add attributes for this product
                </Text>
                <Text className="text-sm text-gray-500 text-center mt-1">
                  {availableAttributes.length} attributes available
                </Text>
                <TouchableOpacity
                  onPress={handleAddAttribute}
                  className="mt-4 bg-blue-600 px-6 py-3 rounded-lg"
                  disabled={availableAttributes.length === 0}
                >
                  <Text className="text-white font-medium">
                    Add First Attribute
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <FlatList
                  data={productAttributes}
                  renderItem={renderAttributeItem}
                  keyExtractor={(item, index) => index.toString()}
                  scrollEnabled={false}
                />

                {/* Attribute Summary */}
                <View className="bg-gray-50 rounded-lg p-3 mb-4">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-gray-600">
                      Total Variants:
                    </Text>
                    <Text className="font-medium">
                      {productAttributes.length}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-gray-600">Total Stock:</Text>
                    <Text className="font-medium">{totalStock}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">Total Value:</Text>
                    <Text className="font-medium text-green-600">
                      ₱{totalValue.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleAddAttribute}
                  className="py-3 rounded-lg bg-blue-600 flex-row items-center justify-center space-x-2"
                >
                  <Ionicons name="add" size={20} color="white" />
                  <Text className="text-white font-medium">
                    Add Another Attribute
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={
              loading || uploadingImage || productAttributes.length === 0
            }
            className={`py-4 rounded-lg mt-4 ${
              loading || uploadingImage || productAttributes.length === 0
                ? "bg-green-300"
                : "bg-green-600"
            }`}
          >
            {loading || uploadingImage ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                {isEditMode ? "Update Product" : "Create Product"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={loading || uploadingImage}
            className="py-3 rounded-lg border border-gray-300"
          >
            <Text className="text-gray-700 text-center font-medium">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Attribute Modal */}
      {showAttributeModal && (
        <AttributeModal
          attribute={
            editingAttributeIndex !== null
              ? productAttributes[editingAttributeIndex]
              : null
          }
          availableAttributes={availableAttributes}
          attributeValues={attributeValues}
          onSubmit={handleAttributeSubmit}
          onClose={() => {
            setShowAttributeModal(false);
            setEditingAttributeIndex(null);
            setCustomAttributeValue("");
            setShowAttributeValueDropdown(false);
          }}
        />
      )}

      {/* Unit Type Modal */}
      <UnitTypeModal />
    </KeyboardAvoidingView>
  );
}
