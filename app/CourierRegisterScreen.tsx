import React, { useState } from "react";
import client from "@/utils/axiosInstance";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import DatePicker from "react-native-date-picker";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import mime from "mime";

type FormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  vehicleType: string;
};

type UploadedImage = {
  uri: string;
  url: string | null;
  filename: string;
};

export default function CourierRegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  // For date picker
  const [dob, setDob] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // For image uploads - now storing both local URI and uploaded URL
  const [profileImage, setProfileImage] = useState<UploadedImage | null>(null);
  const [licenseFrontImage, setLicenseFrontImage] =
    useState<UploadedImage | null>(null);
  const [licenseBackImage, setLicenseBackImage] =
    useState<UploadedImage | null>(null);
  const [orImage, setOrImage] = useState<UploadedImage | null>(null);
  const [crImage, setCrImage] = useState<UploadedImage | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors,
  } = useForm<FormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      vehicleType: "",
    },
  });

  const vehicleTypes = ["Motorcycle", "Car/SUV", "Van", "E-Bike", "Truck"];

  const password = watch("password");

  // Upload image to server
  const uploadImage = async (
    imageUri: string,
    folder: string
  ): Promise<string> => {
    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      const filename = imageUri.split("/").pop() || `image_${Date.now()}.jpg`;
      const mimeType = mime.getType(imageUri) || "image/jpeg";

      // Create form data
      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        type: mimeType,
        name: filename,
      } as any);
      formData.append("folder", folder);

      // Upload to server
      const response = await client.post("/upload/single", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        return response.data.data.url;
      } else {
        throw new Error(response.data.error || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      throw new Error(error.message || "Failed to upload image");
    }
  };

  // Delete image from server
  const deleteImage = async (imageUrl: string) => {
    try {
      const response = await client.delete("/upload/single", {
        data: { imageUrl },
      });

      if (!response.data.success) {
        throw new Error(response.data.error || "Delete failed");
      }

      return true;
    } catch (error: any) {
      console.error("Delete error:", error);
      // Don't throw error - just log it
      return false;
    }
  };

  // Handle image selection
  const handleImageSelect = async (
    setImageFunction: (image: UploadedImage | null) => void,
    currentImage: UploadedImage | null,
    folder: string
  ) => {
    // If there's an existing uploaded image, delete it first
    if (currentImage?.url) {
      await deleteImage(currentImage.url);
    }

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "You need to allow access to your photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const filename = imageUri.split("/").pop() || `image_${Date.now()}.jpg`;

      // Set local URI first
      setImageFunction({
        uri: imageUri,
        url: null,
        filename,
      });
    }
  };

  const takePhoto = async (
    setImageFunction: (image: UploadedImage | null) => void,
    currentImage: UploadedImage | null,
    folder: string
  ) => {
    // If there's an existing uploaded image, delete it first
    if (currentImage?.url) {
      await deleteImage(currentImage.url);
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "You need to allow access to your camera."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const filename = imageUri.split("/").pop() || `image_${Date.now()}.jpg`;

      // Set local URI first
      setImageFunction({
        uri: imageUri,
        url: null,
        filename,
      });
    }
  };

  const showImageSourceOptions = (
    setImageFunction: (image: UploadedImage | null) => void,
    currentImage: UploadedImage | null,
    folder: string
  ) => {
    Alert.alert("Upload Image", "Choose image source", [
      {
        text: "Camera",
        onPress: () => takePhoto(setImageFunction, currentImage, folder),
      },
      {
        text: "Gallery",
        onPress: () =>
          handleImageSelect(setImageFunction, currentImage, folder),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // Remove image
  const removeImage = async (
    setImageFunction: (image: UploadedImage | null) => void,
    currentImage: UploadedImage | null
  ) => {
    if (currentImage?.url) {
      // Delete from server
      await deleteImage(currentImage.url);
    }
    // Remove from state
    setImageFunction(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const validateImages = () => {
    // Check if all required images have been selected
    if (
      !licenseFrontImage?.uri ||
      !licenseBackImage?.uri ||
      !orImage?.uri ||
      !crImage?.uri
    ) {
      Alert.alert("Error", "Please upload all required documents");
      return false;
    }
    return true;
  };

  const validateAge = () => {
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      if (age - 1 < 18) {
        Alert.alert("Error", "You must be at least 18 years old");
        return false;
      }
    } else if (age < 18) {
      Alert.alert("Error", "You must be at least 18 years old");
      return false;
    }
    return true;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasValidLength = password.length >= 8;

    return {
      valid: hasUpperCase && hasLowerCase && hasNumbers && hasValidLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasValidLength,
    };
  };

  const onSubmit = async (data: FormData) => {
    // Additional validation before submission
    if (!validateEmail(data.email)) {
      setError("email", {
        type: "manual",
        message: "Please enter a valid email address",
      });
      return;
    }

    if (!validatePhone(data.phone)) {
      setError("phone", {
        type: "manual",
        message: "Please enter a valid phone number (10-15 digits)",
      });
      return;
    }

    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      let message = "Password must contain:";
      if (!passwordValidation.hasUpperCase)
        message += "\n• At least one uppercase letter";
      if (!passwordValidation.hasLowerCase)
        message += "\n• At least one lowercase letter";
      if (!passwordValidation.hasNumbers) message += "\n• At least one number";
      if (!passwordValidation.hasValidLength)
        message += "\n• At least 8 characters";
      setError("password", { type: "manual", message });
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    if (!validateImages()) return;
    if (!validateAge()) return;

    setLoading(true);
    try {
      // Upload all images to Supabase
      setUploading("Uploading documents...");

      const uploadPromises = [];

      // Upload required documents
      if (licenseFrontImage?.uri) {
        uploadPromises.push(
          uploadImage(licenseFrontImage.uri, "licenses").then((url) => {
            licenseFrontImage.url = url;
          })
        );
      }

      if (licenseBackImage?.uri) {
        uploadPromises.push(
          uploadImage(licenseBackImage.uri, "licenses").then((url) => {
            licenseBackImage.url = url;
          })
        );
      }

      if (orImage?.uri) {
        uploadPromises.push(
          uploadImage(orImage.uri, "documents").then((url) => {
            orImage.url = url;
          })
        );
      }

      if (crImage?.uri) {
        uploadPromises.push(
          uploadImage(crImage.uri, "documents").then((url) => {
            crImage.url = url;
          })
        );
      }

      // Optional: Upload profile image
      if (profileImage?.uri) {
        uploadPromises.push(
          uploadImage(profileImage.uri, "profiles").then((url) => {
            profileImage.url = url;
          })
        );
      }

      await Promise.all(uploadPromises);
      setUploading(null);

      // Prepare data for submission
      const courierData = {
        ...data,
        dob: dob.toISOString().split("T")[0],
        profile_url: profileImage?.url || "",
        license_front_url: licenseFrontImage?.url || "",
        license_back_url: licenseBackImage?.url || "",
        or_url: orImage?.url || "",
        cr_url: crImage?.url || "",
        status: "pending", // Initial status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const response = await client.post("/courier/register", courierData);

      if (response.data.success) {
        Alert.alert(
          "Success",
          "Courier registration submitted successfully!\nYour application will be reviewed within 24-48 hours.",
          [
            {
              text: "OK",
              onPress: () => router.push("/(auth)/login"),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      // Clean up uploaded images if registration fails
      const cleanupPromises = [];
      if (licenseFrontImage?.url)
        cleanupPromises.push(deleteImage(licenseFrontImage.url));
      if (licenseBackImage?.url)
        cleanupPromises.push(deleteImage(licenseBackImage.url));
      if (orImage?.url) cleanupPromises.push(deleteImage(orImage.url));
      if (crImage?.url) cleanupPromises.push(deleteImage(crImage.url));
      if (profileImage?.url)
        cleanupPromises.push(deleteImage(profileImage.url));

      await Promise.allSettled(cleanupPromises);

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to register. Please try again."
      );
    } finally {
      setLoading(false);
      setUploading(null);
    }
  };

  const ImageUploadButton = ({
    label,
    onPress,
    onRemove,
    image,
    required = false,
  }: {
    label: string;
    onPress: () => void;
    onRemove: () => void;
    image: UploadedImage | null;
    required?: boolean;
  }) => (
    <View className="relative">
      <TouchableOpacity
        onPress={onPress}
        className={`border-2 ${image ? "border-green-500" : "border-dashed border-gray-300"} rounded-lg p-4 items-center justify-center min-h-[120px]`}
      >
        {image ? (
          <View className="items-center">
            <Image
              source={{ uri: image.uri }}
              className="w-20 h-20 rounded mb-2"
            />
            <Text className="text-green-600 text-xs">
              {image.url ? "✓ Uploaded" : "✓ Selected"}
            </Text>
          </View>
        ) : (
          <View className="items-center">
            <Text className="text-gray-500 text-2xl">+</Text>
            <Text className="text-gray-500 text-center mt-2 text-sm">
              {label}
            </Text>
            {required && (
              <Text className="text-red-500 text-xs mt-1">* Required</Text>
            )}
          </View>
        )}
      </TouchableOpacity>

      {image && (
        <TouchableOpacity
          onPress={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
        >
          <Ionicons name="close" size={16} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-green-500">
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      <View className="flex-1 bg-green-500">
        {/* Green Top Section */}
        <View className="bg-green-500 px-6 pt-4 pb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-4 self-start"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-white mb-3">
            Become a Courier
          </Text>
          <Text className="text-green-100 text-base">
            Complete the form below to join our delivery network
          </Text>
        </View>

        {/* White Content Area */}
        <ScrollView
          className="flex-1 bg-white rounded-t-3xl"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 py-8">
            {/* Loading Overlay for Upload */}
            {(loading || uploading) && (
              <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 z-50 items-center justify-center">
                <View className="bg-white p-6 rounded-2xl items-center">
                  <ActivityIndicator size="large" color="#10b981" />
                  <Text className="mt-4 text-gray-700 font-medium">
                    {uploading || "Processing..."}
                  </Text>
                </View>
              </View>
            )}

            {/* Personal Information */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-gray-700 mb-4">
                Personal Information
              </Text>

              <View className="flex-row mb-4">
                <View className="flex-1 mr-2">
                  <Text className="text-gray-600 mb-1">First Name *</Text>
                  <Controller
                    control={control}
                    name="firstName"
                    rules={{ required: "First name is required" }}
                    render={({ field: { onChange, value } }) => (
                      <>
                        <TextInput
                          className={`border rounded-lg p-3 bg-white ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
                          value={value}
                          onChangeText={onChange}
                          placeholder="Enter first name"
                        />
                        {errors.firstName && (
                          <Text className="text-red-500 text-xs mt-1">
                            {errors.firstName.message}
                          </Text>
                        )}
                      </>
                    )}
                  />
                </View>

                <View className="flex-1 ml-2">
                  <Text className="text-gray-600 mb-1">Last Name *</Text>
                  <Controller
                    control={control}
                    name="lastName"
                    rules={{ required: "Last name is required" }}
                    render={({ field: { onChange, value } }) => (
                      <>
                        <TextInput
                          className={`border rounded-lg p-3 bg-white ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
                          value={value}
                          onChangeText={onChange}
                          placeholder="Enter last name"
                        />
                        {errors.lastName && (
                          <Text className="text-red-500 text-xs mt-1">
                            {errors.lastName.message}
                          </Text>
                        )}
                      </>
                    )}
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-gray-600 mb-1">Date of Birth *</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="border border-gray-300 rounded-lg p-3 bg-white"
                >
                  <Text className={dob ? "text-gray-800" : "text-gray-400"}>
                    {dob ? formatDate(dob) : "Select date of birth"}
                  </Text>
                </TouchableOpacity>
                <DatePicker
                  modal
                  open={showDatePicker}
                  date={dob}
                  mode="date"
                  onConfirm={(date) => {
                    setShowDatePicker(false);
                    setDob(date);
                  }}
                  onCancel={() => setShowDatePicker(false)}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  theme="light"
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-600 mb-1">Phone Number *</Text>
                <Controller
                  control={control}
                  name="phone"
                  rules={{
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10,15}$/,
                      message:
                        "Please enter a valid phone number (10-15 digits)",
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <TextInput
                        className={`border rounded-lg p-3 bg-white ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                        value={value}
                        onChangeText={onChange}
                        placeholder="0912 345 6789"
                        keyboardType="phone-pad"
                      />
                      {errors.phone && (
                        <Text className="text-red-500 text-xs mt-1">
                          {errors.phone.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-600 mb-1">Email *</Text>
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <TextInput
                        className={`border rounded-lg p-3 bg-white ${errors.email ? "border-red-500" : "border-gray-300"}`}
                        value={value}
                        onChangeText={onChange}
                        placeholder="you@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      {errors.email && (
                        <Text className="text-red-500 text-xs mt-1">
                          {errors.email.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-600 mb-1">Password *</Text>
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    validate: (value) => {
                      const hasUpperCase = /[A-Z]/.test(value);
                      const hasLowerCase = /[a-z]/.test(value);
                      const hasNumbers = /\d/.test(value);

                      if (!hasUpperCase)
                        return "Password must contain at least one uppercase letter";
                      if (!hasLowerCase)
                        return "Password must contain at least one lowercase letter";
                      if (!hasNumbers)
                        return "Password must contain at least one number";
                      return true;
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <View className="relative">
                        <TextInput
                          className={`border rounded-lg p-3 text-black bg-white ${errors.password ? "border-red-500" : "border-gray-300"} pr-10`}
                          value={value}
                          onChangeText={onChange}
                          placeholder="Create a password"
                          secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                          className="absolute right-3 top-3"
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          <Ionicons
                            name={showPassword ? "eye-off" : "eye"}
                            size={24}
                            color="#6b7280"
                          />
                        </TouchableOpacity>
                      </View>
                      {errors.password && (
                        <Text className="text-red-500 text-xs mt-1">
                          {errors.password.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>

              <View className="mb-6">
                <Text className="text-gray-600 mb-1">Confirm Password *</Text>
                <Controller
                  control={control}
                  name="confirmPassword"
                  rules={{
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <View className="relative">
                        <TextInput
                          className={`border rounded-lg p-3 text-black bg-white ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} pr-10`}
                          value={value}
                          onChangeText={onChange}
                          placeholder="Confirm your password"
                          secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity
                          className="absolute right-3 top-3"
                          onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          <Ionicons
                            name={showConfirmPassword ? "eye-off" : "eye"}
                            size={24}
                            color="#6b7280"
                          />
                        </TouchableOpacity>
                      </View>
                      {errors.confirmPassword && (
                        <Text className="text-red-500 text-xs mt-1">
                          {errors.confirmPassword.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>

              {/* Profile Photo (Optional) */}
              <View className="mb-6">
                <Text className="text-gray-600 mb-2">
                  Profile Photo (Optional)
                </Text>
                <ImageUploadButton
                  label="Upload Profile Photo"
                  onPress={() =>
                    showImageSourceOptions(
                      setProfileImage,
                      profileImage,
                      "profiles"
                    )
                  }
                  onRemove={() => removeImage(setProfileImage, profileImage)}
                  image={profileImage}
                />
              </View>
            </View>

            {/* Vehicle Information */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-gray-700 mb-4">
                Vehicle Information
              </Text>

              <View className="mb-4">
                <Text className="text-gray-600 mb-1">Vehicle Type *</Text>
                <Controller
                  control={control}
                  name="vehicleType"
                  rules={{ required: "Please select a vehicle type" }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <View
                        className={`border rounded-lg bg-white ${errors.vehicleType ? "border-red-500" : "border-gray-300"}`}
                      >
                        <Picker
                          selectedValue={value}
                          onValueChange={onChange}
                          style={{ height: 50 }}
                        >
                          <Picker.Item label="Select vehicle type" value="" />
                          {vehicleTypes.map((type) => (
                            <Picker.Item key={type} label={type} value={type} />
                          ))}
                        </Picker>
                      </View>
                      {errors.vehicleType && (
                        <Text className="text-red-500 text-xs mt-1">
                          {errors.vehicleType.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>
            </View>

            {/* Required Documents */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-gray-700 mb-4">
                Required Documents
              </Text>
              <Text className="text-gray-500 mb-4 text-sm">
                Please upload clear photos of all required documents. Tap to
                upload from camera or gallery.
              </Text>

              <View className="grid grid-cols-2 gap-4 mb-4">
                <View>
                  <Text className="text-gray-600 mb-1">License Front *</Text>
                  <ImageUploadButton
                    label="License Front"
                    onPress={() =>
                      showImageSourceOptions(
                        setLicenseFrontImage,
                        licenseFrontImage,
                        "licenses"
                      )
                    }
                    onRemove={() =>
                      removeImage(setLicenseFrontImage, licenseFrontImage)
                    }
                    image={licenseFrontImage}
                    required={true}
                  />
                </View>

                <View>
                  <Text className="text-gray-600 mb-1">License Back *</Text>
                  <ImageUploadButton
                    label="License Back"
                    onPress={() =>
                      showImageSourceOptions(
                        setLicenseBackImage,
                        licenseBackImage,
                        "licenses"
                      )
                    }
                    onRemove={() =>
                      removeImage(setLicenseBackImage, licenseBackImage)
                    }
                    image={licenseBackImage}
                    required={true}
                  />
                </View>
              </View>

              <View className="grid grid-cols-2 gap-4">
                <View>
                  <Text className="text-gray-600 mb-1">
                    OR (Official Receipt) *
                  </Text>
                  <ImageUploadButton
                    label="Upload OR"
                    onPress={() =>
                      showImageSourceOptions(setOrImage, orImage, "documents")
                    }
                    onRemove={() => removeImage(setOrImage, orImage)}
                    image={orImage}
                    required={true}
                  />
                </View>

                <View>
                  <Text className="text-gray-600 mb-1">CR (Certificate) *</Text>
                  <ImageUploadButton
                    label="Upload CR"
                    onPress={() =>
                      showImageSourceOptions(setCrImage, crImage, "documents")
                    }
                    onRemove={() => removeImage(setCrImage, crImage)}
                    image={crImage}
                    required={true}
                  />
                </View>
              </View>
            </View>

            {/* Terms & Conditions */}
            <View className="mb-8 p-4 bg-gray-50 rounded-lg">
              <Text className="text-gray-700 mb-2 font-medium">
                Important Notes:
              </Text>
              <Text className="text-gray-500 text-sm mb-1">
                • Your application will be reviewed within 24-48 hours
              </Text>
              <Text className="text-gray-500 text-sm mb-1">
                • You'll receive an email once approved
              </Text>
              <Text className="text-gray-500 text-sm">
                • All documents must be valid and clearly visible
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              className={`bg-green-500 rounded-xl p-4 items-center mb-4 ${loading ? "opacity-50" : ""}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Submit Application
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              className="items-center py-3"
            >
              <Text className="text-gray-500">Cancel Registration</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
