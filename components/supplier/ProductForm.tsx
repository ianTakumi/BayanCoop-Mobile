import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  Ionicons,
  Feather,
  MaterialIcons,
  FontAwesome5,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import client from "@/utils/axiosInstance";
import { Category, SupplierProduct, SupplierProductAttribute } from "@/types";

interface ProductFormProps {
  formData: SupplierProduct;
  setFormData: React.Dispatch<React.SetStateAction<SupplierProduct>>;
  categories: Category[];
  loading?: boolean;
}

interface AttributeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierProductAttribute) => void;
  filteredAttributes: any[];
  existingAttributes: SupplierProductAttribute[];
  isEditing: boolean;
  editingAttribute?: SupplierProductAttribute;
}

const AttributeModal: React.FC<AttributeModalProps> = ({
  visible,
  onClose,
  onSubmit,
  filteredAttributes,
  existingAttributes,
  isEditing,
  editingAttribute,
}) => {
  const [selectedAttribute, setSelectedAttribute] = useState<string>(
    editingAttribute?.attribute_id || ""
  );
  const [attributeValue, setAttributeValue] = useState<string>(
    editingAttribute?.attribute_value || ""
  );
  const [price, setPrice] = useState<string>(editingAttribute?.price || "");
  const [stock, setStock] = useState<string>(
    editingAttribute?.stock_quantity || "0"
  );
  const [sku, setSku] = useState<string>(editingAttribute?.sku || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedAttribute) {
      newErrors.attribute = "Please select an attribute";
    }
    if (!attributeValue.trim()) {
      newErrors.attributeValue = "Attribute value is required";
    }
    if (!price.trim()) {
      newErrors.price = "Price is required";
    } else if (parseFloat(price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (!stock.trim()) {
      newErrors.stock = "Stock quantity is required";
    } else if (parseInt(stock) < 0) {
      newErrors.stock = "Stock quantity cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const attributeData: SupplierProductAttribute = {
      attribute_id: selectedAttribute,
      attribute_value: attributeValue.trim(),
      price,
      stock_quantity: stock,
      sku: sku.trim() || undefined,
      ...(editingAttribute?.id && { id: editingAttribute.id }),
      ...(editingAttribute?.product_id && {
        product_id: editingAttribute.product_id,
      }),
    };

    onSubmit(attributeData);
    resetForm();
  };

  const resetForm = () => {
    setSelectedAttribute("");
    setAttributeValue("");
    setPrice("");
    setStock("0");
    setSku("");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-3/4">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">
              {isEditing ? "Edit Variation" : "Add Variation"}
            </Text>
            <TouchableOpacity onPress={handleClose} className="p-2">
              <Feather name="x" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
            {/* Attribute Selection */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Attribute Type *
              </Text>
              <View
                className={`border border-gray-300 rounded-lg bg-white overflow-hidden ${errors.attribute ? "border-red-500" : ""}`}
              >
                <Picker
                  selectedValue={selectedAttribute}
                  onValueChange={(value) => {
                    setSelectedAttribute(value);
                    setAttributeValue("");
                    if (errors.attribute) {
                      setErrors({ ...errors, attribute: "" });
                    }
                  }}
                  enabled={!isEditing}
                  style={{ height: 50 }}
                >
                  <Picker.Item label="Select Attribute Type" value="" />
                  {filteredAttributes.map((attr) => (
                    <Picker.Item
                      key={attr.attribute_id}
                      label={attr.name}
                      value={attr.attribute_id}
                    />
                  ))}
                </Picker>
              </View>
              {errors.attribute && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.attribute}
                </Text>
              )}
            </View>

            {/* Attribute Value */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Attribute Value *
              </Text>
              <TextInput
                className={`border border-gray-300 rounded-lg px-4 py-3 text-black bg-white ${errors.attributeValue ? "border-red-500" : ""}`}
                placeholder="e.g., Red, Large, 1kg"
                value={attributeValue}
                onChangeText={(text) => {
                  setAttributeValue(text);
                  if (errors.attributeValue) {
                    setErrors({ ...errors, attributeValue: "" });
                  }
                }}
              />
              {errors.attributeValue && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.attributeValue}
                </Text>
              )}
            </View>

            {/* Price */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Price (₱) *
              </Text>
              <View
                className={`flex-row items-center border border-gray-300 rounded-lg bg-white ${errors.price ? "border-red-500" : ""}`}
              >
                <Text className="text-gray-700 font-bold pl-4">₱</Text>
                <TextInput
                  className="flex-1 px-3 py-3"
                  placeholder="0.00"
                  value={price}
                  onChangeText={(text) => {
                    setPrice(text.replace(/[^0-9.]/g, ""));
                    if (errors.price) {
                      setErrors({ ...errors, price: "" });
                    }
                  }}
                  keyboardType="decimal-pad"
                />
              </View>
              {errors.price && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.price}
                </Text>
              )}
            </View>

            {/* Stock Quantity */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </Text>
              <TextInput
                className={`border border-gray-300 rounded-lg px-4 py-3 bg-white ${errors.stock ? "border-red-500" : ""}`}
                placeholder="0"
                value={stock}
                onChangeText={(text) => {
                  setStock(text.replace(/[^0-9]/g, ""));
                  if (errors.stock) {
                    setErrors({ ...errors, stock: "" });
                  }
                }}
                keyboardType="number-pad"
              />
              {errors.stock && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.stock}
                </Text>
              )}
            </View>

            {/* SKU (Optional) */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                SKU
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                placeholder="e.g., PROD-RED-001"
                value={sku}
                onChangeText={setSku}
              />
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View className="flex-row border-t border-gray-200 p-4">
            <TouchableOpacity
              className="flex-1 bg-gray-100 rounded-xl py-4 mr-2"
              onPress={handleClose}
            >
              <Text className="text-center font-medium text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-green-600 rounded-xl py-4 ml-2"
              onPress={handleSubmit}
            >
              <Text className="text-center font-medium text-white">
                {isEditing ? "Update Variation" : "Add Variation"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ProductForm: React.FC<ProductFormProps> = ({
  formData,
  setFormData,
  categories,
  loading = false,
}) => {
  const [uploadingImages, setUploadingImages] = useState(false);
  const [filteredAttributes, setFilteredAttributes] = useState<any[]>([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [editingAttributeIndex, setEditingAttributeIndex] = useState<
    number | null
  >(null);

  // Unit types - FIXED: using array of objects with label/value
  const unitTypes = [
    { label: "kg", value: "kg" },
    { label: "g", value: "g" },
    { label: "L", value: "L" },
    { label: "ml", value: "ml" },
    { label: "pcs", value: "pcs" },
    { label: "pack", value: "pack" },
    { label: "box", value: "box" },
    { label: "bundle", value: "bundle" },
    { label: "dozen", value: "dozen" },
    { label: "case", value: "case" },
  ];

  // Fetch attributes when category changes
  useEffect(() => {
    if (formData.category_id) {
      fetchAttributesByCategory(formData.category_id);
    } else {
      setFilteredAttributes([]);
    }
  }, [formData.category_id]);

  const fetchAttributesByCategory = async (categoryId: string) => {
    setLoadingAttributes(true);
    try {
      const response = await client.get(`/attributes/category/${categoryId}`);
      if (response.status === 200) {
        setFilteredAttributes(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching attributes:", error);
      Alert.alert("Error", "Failed to load attributes for this category");
      setFilteredAttributes([]);
    } finally {
      setLoadingAttributes(false);
    }
  };

  // Transform categories for the Picker
  const getPickerCategories = () => {
    const pickerCategories: { label: string; value: string }[] = [];

    // Add placeholder
    pickerCategories.push({ label: "Select Category", value: "" });

    // Group categories by parent
    const parentCategories = categories.filter((cat) => cat.parent_id === null);

    parentCategories.forEach((parent) => {
      // Check if this parent has subcategories
      const subCategories = categories.filter(
        (cat) => cat.parent_id === parent.id
      );

      if (subCategories.length > 0) {
        // Add subcategories with parent name
        subCategories.forEach((subcat) => {
          pickerCategories.push({
            label: `${parent.name} - ${subcat.name}`,
            value: subcat.id,
          });
        });
      } else {
        // Add parent category directly
        pickerCategories.push({
          label: parent.name,
          value: parent.id,
        });
      }
    });

    return pickerCategories;
  };

  // Get category name by ID for display
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  // Get grouped attributes for display
  const getGroupedAttributes = () => {
    const attributes = formData.attributes || [];
    const grouped: Record<string, any> = {};

    attributes.forEach((attr) => {
      if (!grouped[attr.attribute_id]) {
        const attributeInfo = filteredAttributes.find(
          (a) => a.attribute_id === attr.attribute_id
        );
        grouped[attr.attribute_id] = {
          attribute_id: attr.attribute_id,
          attribute_name: attributeInfo?.name || "Unknown Attribute",
          values: [],
        };
      }
      grouped[attr.attribute_id].values.push(attr);
    });

    return Object.values(grouped);
  };

  // Handle image picker
  const pickImage = async () => {
    if ((formData.images?.length || 0) >= 5) {
      Alert.alert("Limit Reached", "Maximum 5 images allowed");
      return;
    }

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to upload images."
        );
        return;
      }

      // Use MediaTypeOptions (deprecated but works in your other code)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // This works in your other code
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: true, // Optional: enable multiple selection
        selectionLimit: 5 - (formData.images?.length || 0),
      });

      if (!result.canceled) {
        setUploadingImages(true);

        // Upload each image
        for (const asset of result.assets) {
          try {
            const uploadedUrl = await uploadSingleImage(asset.uri);

            // Add to formData
            const currentImages = formData.images || [];
            setFormData({
              ...formData,
              images: [...currentImages, uploadedUrl],
            });
          } catch (uploadError) {
            console.error("Failed to upload image:", uploadError);
            Alert.alert("Warning", "One image failed to upload");
          }
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", error.message || "Failed to pick image");
    } finally {
      setUploadingImages(false);
    }
  };

  // Single image upload function (same as your working version)
  const uploadSingleImage = async (uri: string): Promise<string> => {
    const formData = new FormData();

    // Get filename
    const filename = uri.split("/").pop() || `product_${Date.now()}.jpg`;

    // Detect file type using regex (same as your working code)
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";

    // Handle URI for different platforms
    let processedUri = uri;
    if (Platform.OS === "ios") {
      processedUri = uri.replace("file://", "");
    }

    // Append file - CAST AS ANY (key difference!)
    formData.append("image", {
      uri: processedUri,
      name: filename,
      type: type,
    } as any); // <-- THIS IS CRITICAL!

    formData.append("folder", "products");

    console.log("📤 Uploading:", {
      filename,
      type,
      uri: processedUri.substring(0, 50) + "...",
    });

    const response = await client.post("/upload/single", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000,
    });

    if (response.data.success) {
      console.log("✅ Uploaded:", response.data.data.url);
      return response.data.data.url;
    } else {
      throw new Error(response.data.error || "Upload failed");
    }
  };

  const removeImage = (index: number) => {
    console.log("Removing image at index:", index);
    console.log("Current images:", formData.images);
    // Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
    //   { text: "Cancel", style: "cancel" },
    //   {
    //     text: "Remove",
    //     style: "destructive",
    //     onPress: () => {
    //       const newImages = [...(formData.images || [])];
    //       newImages.splice(index, 1);
    //       setFormData({ ...formData, images: newImages });
    //     },
    //   },
    // ]);
  };

  // Attribute management
  const handleAddAttribute = () => {
    if (!formData.category_id) {
      Alert.alert("Category Required", "Please select a category first");
      return;
    }

    if (filteredAttributes.length === 0) {
      Alert.alert("No Attributes", "No attributes available for this category");
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
      "Delete Variation",
      "Are you sure you want to delete this variation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedAttributes = [...(formData.attributes || [])];
            updatedAttributes.splice(index, 1);
            setFormData({ ...formData, attributes: updatedAttributes });
            Alert.alert("Success", "Variation deleted");
          },
        },
      ]
    );
  };

  const handleAttributeSubmit = (attributeData: SupplierProductAttribute) => {
    const updatedAttributes = [...(formData.attributes || [])];

    if (editingAttributeIndex !== null) {
      // Update existing
      updatedAttributes[editingAttributeIndex] = attributeData;
      Alert.alert("Success", "Variation updated");
    } else {
      // Add new
      updatedAttributes.push(attributeData);
      Alert.alert("Success", "Variation added");
    }

    setFormData({ ...formData, attributes: updatedAttributes });
    setShowAttributeModal(false);
    setEditingAttributeIndex(null);
  };

  // Calculate totals
  const totalStock = (formData.attributes || []).reduce(
    (sum, attr) => sum + (parseInt(attr.stock_quantity) || 0),
    0
  );

  const prices = (formData.attributes || []).map(
    (attr) => parseFloat(attr.price) || 0
  );
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const avgPrice =
    prices.length > 0
      ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)
      : "0.00";

  const pickerCategories = getPickerCategories();
  const groupedAttributes = getGroupedAttributes();

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
    >
      {/* Basic Information */}
      <View className="bg-white rounded-2xl p-6 mb-5 shadow-sm border border-gray-200">
        <View className="flex-row items-center gap-3 mb-6">
          <View className="p-2 bg-blue-100 rounded-lg">
            <Feather name="info" size={20} color="#2563eb" />
          </View>
          <Text className="text-lg font-semibold text-gray-800">
            Basic Information
          </Text>
        </View>

        <View className="mb-5">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 bg-white text-black"
            placeholder="e.g., Premium Organic Brown Rice"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            editable={!loading}
          />
        </View>

        <View className="mb-5">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Category *
          </Text>
          <View className="border border-gray-300 rounded-xl bg-white overflow-hidden">
            <Picker
              selectedValue={formData.category_id}
              onValueChange={(value) => {
                setFormData({
                  ...formData,
                  category_id: value,
                  attributes: [], // Clear attributes when category changes
                });
              }}
              enabled={!loading}
              style={{ height: 50 }}
            >
              {pickerCategories.map((cat) => (
                <Picker.Item
                  key={cat.value || "empty"}
                  label={cat.label}
                  value={cat.value}
                  color="black"
                />
              ))}
            </Picker>
          </View>
          {loadingAttributes && (
            <View className="flex-row items-center mt-2">
              <ActivityIndicator size="small" color="#2563eb" />
              <Text className="text-blue-600 text-sm ml-2">
                Loading attributes...
              </Text>
            </View>
          )}
          {formData.category_id && (
            <Text className="text-green-600 text-sm mt-2">
              Selected: {getCategoryName(formData.category_id)}
            </Text>
          )}
        </View>

        <View className="mb-5">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Description *
          </Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 bg-white h-32 text-black"
            placeholder="Describe your product in detail..."
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!loading}
          />
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Unit Type *
            </Text>
            <View className="border border-gray-300 rounded-xl bg-white overflow-hidden text-black">
              <Picker
                selectedValue={formData.unit_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, unit_type: value })
                }
                enabled={!loading}
                style={{ height: 50 }}
              >
                <Picker.Item label="Select Unit" value="" />
                {unitTypes.map((unit) => (
                  <Picker.Item
                    key={unit.value}
                    label={unit.label}
                    value={unit.value}
                    color="black"
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Min Order Qty *
            </Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 bg-white"
              placeholder="e.g., 10"
              value={formData.min_order_quantity}
              onChangeText={(text) =>
                setFormData({ ...formData, min_order_quantity: text })
              }
              keyboardType="number-pad"
              editable={!loading}
            />
          </View>
        </View>
      </View>

      {/* Product Variations Section */}
      <View className="bg-white rounded-2xl p-6 mb-5 shadow-sm border border-gray-200">
        <View className="bg-purple-50 p-5 rounded-2xl border border-purple-200 mb-6">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="p-2 bg-purple-100 rounded-lg">
              <FontAwesome5 name="boxes" size={18} color="#7c3aed" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                Product Variations *
              </Text>
              <Text className="text-purple-600 text-sm">
                Add multiple variations with same/different attribute types
              </Text>
            </View>
          </View>
          <View className="bg-white px-4 py-2 rounded-lg border border-purple-300 self-start">
            <Text className="text-sm font-medium text-purple-700">
              {formData.attributes?.length || 0} variation(s) added
            </Text>
          </View>
        </View>

        {!formData.category_id ? (
          <View className="items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
            <FontAwesome5 name="boxes" size={48} color="#9ca3af" />
            <Text className="text-gray-700 font-medium text-lg mt-4 mb-2">
              Select a category first
            </Text>
            <Text className="text-gray-500 text-center px-8">
              Choose a category above to see available attributes for your
              product
            </Text>
          </View>
        ) : filteredAttributes.length === 0 ? (
          <View className="items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
            <FontAwesome5 name="boxes" size={48} color="#9ca3af" />
            <Text className="text-gray-700 font-medium text-lg mt-4 mb-2">
              No attributes available
            </Text>
            <Text className="text-gray-500 text-center px-8">
              This category doesn't have predefined attributes. Contact
              administrator.
            </Text>
          </View>
        ) : (
          <View className="gap-6">
            {/* Add Variation Button */}
            <TouchableOpacity
              className="bg-green-600  rounded-xl py-4 flex-row items-center justify-center"
              onPress={handleAddAttribute}
              disabled={filteredAttributes.length === 0}
            >
              <Feather name="plus" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Add Variation</Text>
            </TouchableOpacity>

            {/* Grouped Attributes Display */}
            {groupedAttributes.length > 0 ? (
              <View className="gap-6">
                {groupedAttributes.map((group, groupIndex) => (
                  <View
                    key={groupIndex}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <View className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 border-b border-gray-200">
                      <View className="flex-row items-center gap-4">
                        <View className="p-3 bg-white rounded-lg shadow-sm">
                          <FontAwesome5 name="tag" size={20} color="#4b5563" />
                        </View>
                        <View>
                          <Text className="font-semibold text-gray-900 text-lg">
                            {group.attribute_name}
                          </Text>
                          <View className="flex-row items-center gap-2 mt-1">
                            <Text className="text-sm text-gray-600">
                              {group.values.length} variation(s)
                            </Text>
                            <Text className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                              Can add more
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View className="p-4">
                      <FlatList
                        data={group.values}
                        keyExtractor={(item, index) =>
                          `${item.attribute_id}-${item.attribute_value}-${index}`
                        }
                        numColumns={1}
                        scrollEnabled={false}
                        renderItem={({ item: attr, index: attrIndex }) => {
                          const globalIndex = formData.attributes.findIndex(
                            (a) =>
                              a.attribute_id === attr.attribute_id &&
                              a.attribute_value === attr.attribute_value &&
                              a.price === attr.price
                          );

                          return (
                            <View className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-3">
                              <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-1">
                                  <Text className="font-semibold text-gray-900 text-lg">
                                    {attr.attribute_value}
                                  </Text>
                                  <Text className="text-sm text-gray-600 mb-2">
                                    {group.attribute_name}
                                  </Text>
                                  {attr.sku && (
                                    <Text className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded self-start">
                                      SKU: {attr.sku}
                                    </Text>
                                  )}
                                </View>
                                <View className="flex-row gap-2">
                                  <TouchableOpacity
                                    onPress={() =>
                                      handleEditAttribute(globalIndex)
                                    }
                                    className="p-2 bg-blue-50 rounded-lg"
                                  >
                                    <Feather
                                      name="edit-2"
                                      size={16}
                                      color="#3b82f6"
                                    />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() =>
                                      handleDeleteAttribute(globalIndex)
                                    }
                                    className="p-2 bg-red-50 rounded-lg"
                                  >
                                    <Feather
                                      name="trash-2"
                                      size={16}
                                      color="#ef4444"
                                    />
                                  </TouchableOpacity>
                                </View>
                              </View>

                              <View className="flex-row gap-4">
                                <View className="flex-1 bg-white p-3 rounded-lg border border-gray-200">
                                  <Text className="text-xs text-gray-500 mb-1">
                                    Price
                                  </Text>
                                  <Text className="font-bold text-green-600 text-xl">
                                    ₱{parseFloat(attr.price || 0).toFixed(2)}
                                  </Text>
                                  <Text className="text-xs text-gray-500 mt-1">
                                    per unit
                                  </Text>
                                </View>
                                <View
                                  className={`flex-1 p-3 rounded-lg border ${
                                    (parseInt(attr.stock_quantity) || 0) <= 10
                                      ? "border-yellow-200 bg-yellow-50"
                                      : "border-green-200 bg-green-50"
                                  }`}
                                >
                                  <Text className="text-xs text-gray-500 mb-1">
                                    Stock
                                  </Text>
                                  <Text
                                    className={`font-bold text-xl ${
                                      (parseInt(attr.stock_quantity) || 0) <= 10
                                        ? "text-yellow-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {attr.stock_quantity || 0}
                                  </Text>
                                  <Text className="text-xs text-gray-500 mt-1">
                                    available
                                  </Text>
                                </View>
                              </View>
                            </View>
                          );
                        }}
                      />
                    </View>
                  </View>
                ))}

                {/* Summary Stats */}
                <View className="bg-gray-100  rounded-xl p-6 border border-gray-300">
                  <Text className="font-semibold text-gray-800 text-lg mb-4">
                    Variation Summary
                  </Text>
                  <View className="flex-row flex-wrap justify-between">
                    <View className="items-center w-1/2 mb-4">
                      <Text className="text-gray-600 text-sm mb-2">
                        Total Variations
                      </Text>
                      <Text className="font-bold text-2xl text-gray-900">
                        {formData.attributes?.length || 0}
                      </Text>
                    </View>
                    <View className="items-center w-1/2 mb-4">
                      <Text className="text-gray-600 text-sm mb-2">
                        Total Stock
                      </Text>
                      <Text className="font-bold text-2xl text-gray-900">
                        {totalStock}
                      </Text>
                    </View>
                    <View className="items-center w-1/2">
                      <Text className="text-gray-600 text-sm mb-2">
                        Avg Price
                      </Text>
                      <Text className="font-bold text-2xl text-green-600">
                        ₱{avgPrice}
                      </Text>
                    </View>
                    <View className="items-center w-1/2">
                      <Text className="text-gray-600 text-sm mb-2">
                        Price Range
                      </Text>
                      <Text className="font-bold text-2xl text-blue-600">
                        ₱{minPrice.toFixed(2)} - ₱{maxPrice.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View className="items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
                <FontAwesome5 name="boxes" size={48} color="#9ca3af" />
                <Text className="text-gray-700 font-medium text-lg mt-4 mb-2">
                  No variations added yet
                </Text>
                <Text className="text-gray-500 text-center px-8 mb-6">
                  Add variations with different sizes, weights, colors, flavors,
                  etc.
                </Text>
                <TouchableOpacity
                  className="bg-green-600  rounded-xl py-3 px-6 flex-row items-center"
                  onPress={handleAddAttribute}
                  disabled={filteredAttributes.length === 0}
                >
                  <Feather name="plus" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    Add Your First Variation
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Product Images Section */}
      <View className="bg-white rounded-2xl p-6 mb-5 shadow-sm border border-gray-200">
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center gap-3">
            <View className="p-2 bg-orange-100 rounded-lg">
              <Feather name="image" size={20} color="#f97316" />
            </View>
            <Text className="text-lg font-semibold text-gray-800">
              Product Images
            </Text>
          </View>
          <Text className="text-sm text-gray-500">
            {formData.images?.length || 0}/5 images
          </Text>
        </View>

        {/* File Upload Area */}
        <TouchableOpacity
          className="border-2 border-dashed border-gray-300 rounded-2xl p-8 items-center justify-center active:border-green-500 active:bg-green-50"
          onPress={pickImage}
          disabled={uploadingImages || (formData.images?.length || 0) >= 5}
        >
          <Feather name="upload-cloud" size={48} color="#9ca3af" />
          <Text className="text-lg font-medium text-gray-700 mt-4 mb-2">
            Tap to Upload Images
          </Text>
          <Text className="text-gray-500 text-center mb-4">
            or browse files from your gallery
          </Text>
          <Text className="text-sm text-gray-400">
            Supports JPG, PNG, GIF • Max 5MB per image
          </Text>
        </TouchableOpacity>

        {/* Image Preview Grid */}
        {formData.images && formData.images.length > 0 && (
          <View className="mt-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">
              Preview ({formData.images.length} images)
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="pb-2"
            >
              {formData.images.map((image, index) => (
                <View key={index} className="mr-3 relative">
                  <Image
                    source={{ uri: image }}
                    className="w-24 h-24 rounded-xl"
                  />
                  <TouchableOpacity
                    className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
                    onPress={() => removeImage(index)}
                  >
                    <Feather name="x" size={14} color="white" />
                  </TouchableOpacity>
                  {index === 0 && (
                    <View className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                      <Text className="text-white text-xs">Main</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
            <Text className="text-xs text-gray-500 mt-3">
              First image will be used as the main product image.
            </Text>
          </View>
        )}

        {/* No Images State */}
        {(!formData.images || formData.images.length === 0) &&
          !uploadingImages && (
            <View className="items-center justify-center py-8 border-2 border-dashed border-gray-300 rounded-2xl mt-4">
              <Feather name="image" size={48} color="#9ca3af" />
              <Text className="text-gray-600 font-medium mt-4 mb-2">
                No images added yet
              </Text>
              <Text className="text-gray-500 text-center px-8">
                Upload product images to make your listing more attractive to
                buyers
              </Text>
            </View>
          )}
      </View>

      {/* Additional Product Details */}
      <View className="bg-white rounded-2xl p-6 m-4 shadow-sm border border-gray-200 mb-8">
        <View className="flex-row items-center gap-3 mb-6">
          <View className="p-2 bg-indigo-100 rounded-lg">
            <Feather name="package" size={20} color="#4f46e5" />
          </View>
          <Text className="text-lg font-semibold text-gray-800">
            Additional Details
          </Text>
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Storage Requirements
          </Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 bg-white h-24"
            placeholder="e.g., Store in a cool, dry place. Keep away from direct sunlight."
            value={formData.storage_requirements}
            onChangeText={(text) =>
              setFormData({ ...formData, storage_requirements: text })
            }
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!loading}
          />
          <Text className="text-xs text-gray-500 mt-2">
            Important storage instructions for cooperatives.
          </Text>
        </View>
      </View>

      {/* Attribute Modal */}
      <AttributeModal
        visible={showAttributeModal}
        onClose={() => {
          setShowAttributeModal(false);
          setEditingAttributeIndex(null);
        }}
        onSubmit={handleAttributeSubmit}
        filteredAttributes={filteredAttributes}
        existingAttributes={formData.attributes || []}
        isEditing={editingAttributeIndex !== null}
        editingAttribute={
          editingAttributeIndex !== null
            ? formData.attributes[editingAttributeIndex]
            : undefined
        }
      />
    </ScrollView>
  );
};

// Initial form data
export const initialFormData: SupplierProduct = {
  supplier_id: "", // Will be set from auth
  name: "",
  description: "",
  category_id: "",
  unit_type: "",
  images: [],
  min_order_quantity: "1",
  storage_requirements: "",
  attributes: [],
  status: "active",
};

export default ProductForm;
export type { ProductFormProps, SupplierProduct, Category };
