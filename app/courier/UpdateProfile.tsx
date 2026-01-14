import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-native-date-picker";
import brgyData from "../../assets/data/refbrgy.json";
import cityMunData from "../../assets/data/refcitymun.json";
import provinceData from "../../assets/data/refprovince.json";
import regionsData from "../../assets/data/refregion.json";
import {
  validatePhone,
  validateEmail,
  formatPhoneNumber,
} from "@/utils/helpers";
import client from "@/utils/axiosInstance";
import { updateProfile } from "@/redux/slices/authSlice";

export default function UpdateProfile() {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  // Address state
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [address, setAddress] = useState("");

  // DOB & Gender state
  const [dob, setDob] = useState(user?.dob ? new Date(user.dob) : null);
  const [gender, setGender] = useState(user?.gender || "");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Modal states for custom pickers
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showBarangayPicker, setShowBarangayPicker] = useState(false);

  // Filtered lists
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredBarangays, setFilteredBarangays] = useState([]);

  // Gender options
  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
  ];

  // Extract the actual data from RECORDS array
  const regions = regionsData.RECORDS || [];
  const provinces = provinceData.RECORDS || [];
  const cities = cityMunData.RECORDS || [];
  const barangays = brgyData.RECORDS || [];

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm({
    defaultValues: {
      email: user?.email || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      region: user?.region || "",
      province: user?.province || "",
      city: user?.city || "",
      barangay: user?.barangay || "",
      dob: user?.dob || "",
      gender: user?.gender || "",
    },
  });

  // Set default values for Calabarzon and Laguna on component mount
  useEffect(() => {
    // Find Calabarzon region (Region IV-A)
    const calabarzon = regions.find(
      (region) =>
        region.regDesc.includes("CALABARZON") || region.regCode === "0400000000"
    );

    // Find Laguna province
    const laguna = provinces.find(
      (province) =>
        province.provDesc.includes("LAGUNA") ||
        province.provCode === "043400000"
    );

    if (calabarzon) {
      setSelectedRegion(calabarzon.regCode);
      setValue("region", calabarzon.regCode);
    }

    if (laguna) {
      setSelectedProvince(laguna.provCode);
      setValue("province", laguna.provCode);

      // Filter cities for Laguna
      const citiesInLaguna = cities.filter(
        (city) => city.provCode === laguna.provCode
      );
      setFilteredCities(citiesInLaguna);
    }

    // Set user's existing address data if available
    if (user?.city) {
      setSelectedCity(user.city);
      setValue("city", user.city);
    }
    if (user?.barangay) {
      setSelectedBarangay(user.barangay);
      setValue("barangay", user.barangay);
    }
    if (user?.address) {
      setAddress(user.address);
      setValue("address", user.address);
    }

    // Set DOB if available
    if (user?.dob) {
      const dobDate = new Date(user.dob);
      setDob(dobDate);
      setValue("dob", user.dob);
    }

    // Set gender if available
    if (user?.gender) {
      setGender(user.gender);
      setValue("gender", user.gender);
    }
  }, [user, regions, provinces, cities]);

  // Filter barangays by city (using citymunCode)
  useEffect(() => {
    if (selectedCity) {
      const barangaysInCity = barangays.filter(
        (brgy) => brgy.citymunCode === selectedCity
      );
      setFilteredBarangays(barangaysInCity);
      setValue("city", selectedCity);
      trigger("city");
    } else {
      setFilteredBarangays([]);
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedBarangay) {
      setValue("barangay", selectedBarangay);
      trigger("barangay");
    }
  }, [selectedBarangay]);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "Select Date of Birth";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get gender label
  const getGenderLabel = (value) => {
    const gender = genderOptions.find((g) => g.value === value);
    return gender ? gender.label : "Select Gender";
  };

  // Calculate age from DOB
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Validate DOB
  const validateDOB = (date) => {
    if (!date) return true; // Allow empty DOB (not required)

    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 100); // 100 years ago

    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() - 13); // Must be at least 13 years old

    return date >= minDate && date <= maxDate;
  };

  // Validate address fields
  const validateAddressFields = (data) => {
    if (!data.city) {
      alert("Please select your city/municipality.");
      return false;
    }
    if (!data.barangay) {
      alert("Please select your barangay.");
      return false;
    }
    if (!data.address || data.address.trim().length === 0) {
      alert("Please enter your street address.");
      return false;
    }
    return true;
  };

  const onSubmit = async (data) => {
    console.log("Updated profile data:", data);

    // Validate required personal fields
    if (!data.first_name || !data.last_name || !data.email || !data.phone) {
      alert("Please fill in all required personal information fields.");
      return;
    }

    // Validate phone number format
    if (!validatePhone(data.phone)) {
      alert(
        "Please enter a valid 11-digit phone number starting with 09 (e.g., 09613886156)."
      );
      return;
    }

    // Validate email format
    if (!validateEmail(data.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Validate DOB if provided
    if (dob && !validateDOB(dob)) {
      const age = calculateAge(dob);
      if (age < 13) {
        alert("You must be at least 13 years old to use this service.");
        return;
      }
      if (age > 100) {
        alert("Please enter a valid date of birth.");
        return;
      }
    }

    // Validate address fields
    if (!validateAddressFields(data)) {
      return;
    }

    try {
      await client.put(`/users/profile-update/${user.id}`, data).then((res) => {
        if (res.status === 200) {
          alert("Profile updated successfully!");
          dispatch(updateProfile(res.data.user));
          router.back();
        }
      });
    } catch (error) {
      alert("Failed to update profile. Please try again.");
      console.error("Update profile error:", error);
    }
  };

  // Get display names for selected values
  const getRegionName = () => {
    if (!selectedRegion) return "Calabarzon (Region IV-A)";
    const region = regions.find((r) => r.regCode === selectedRegion);
    return region ? region.regDesc : "Calabarzon (Region IV-A)";
  };

  const getProvinceName = () => {
    if (!selectedProvince) return "Laguna";
    const province = provinces.find((p) => p.provCode === selectedProvince);
    return province ? province.provDesc : "Laguna";
  };

  const getCityName = () => {
    if (!selectedCity) return "Select City/Municipality *";
    const city = filteredCities.find((c) => c.citymunCode === selectedCity);
    return city ? city.citymunDesc : "Select City/Municipality *";
  };

  const getBarangayName = () => {
    if (!selectedBarangay) return "Select Barangay *";
    const barangay = filteredBarangays.find(
      (b) => b.brgyCode === selectedBarangay
    );
    return barangay ? barangay.brgyDesc : "Select Barangay *";
  };

  // Check if phone number is valid
  const isPhoneValid = validatePhone(watch("phone"));

  // Check if all required address fields are filled
  const isAddressComplete =
    selectedCity && selectedBarangay && address && address.trim().length > 0;

  // Action Sheet Style Picker Modal Component
  const ActionSheetPicker = ({
    visible,
    onClose,
    selectedValue,
    onValueChange,
    items,
    title,
    keyProp = "value",
    labelProp = "label",
  }) => {
    const safeItems = Array.isArray(items) ? items : [];

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl max-h-3/4">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-800">
                {title}
              </Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Searchable List */}
            <ScrollView className="max-h-96">
              {safeItems.length === 0 ? (
                <View className="p-4 items-center">
                  <Text className="text-gray-500 text-center">
                    No options available
                  </Text>
                </View>
              ) : (
                safeItems.map((item) => (
                  <TouchableOpacity
                    key={item[keyProp]}
                    className={`p-4 border-b border-gray-100 ${
                      selectedValue === item[keyProp]
                        ? "bg-green-50"
                        : "bg-white"
                    }`}
                    onPress={() => {
                      onValueChange(item[keyProp]);
                      onClose();
                    }}
                  >
                    <Text
                      className={`text-base ${
                        selectedValue === item[keyProp]
                          ? "text-green-600 font-semibold"
                          : "text-gray-800"
                      }`}
                    >
                      {item[labelProp]}
                    </Text>
                    {selectedValue === item[keyProp] && (
                      <View className="absolute right-4 top-4">
                        <Ionicons name="checkmark" size={20} color="#16a34a" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={onClose}
              className="mx-4 my-4 bg-gray-200 rounded-xl py-3 items-center"
            >
              <Text className="text-gray-700 font-semibold text-base">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View className="bg-green-500 pt-12 pb-4 px-6 rounded-b-3xl shadow-lg">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-white/20 rounded-lg"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-1 items-center justify-center">
            <Text className="text-lg font-semibold text-white">
              Update Profile
            </Text>
          </View>

          <View className="w-10" />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="py-6">
            {/* Personal Information Section */}
            <View className="bg-white rounded-2xl p-4 mb-6 border border-gray-200">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Personal Information
              </Text>

              {/* First Name */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </Text>
                <Controller
                  control={control}
                  rules={{
                    required: "First name is required",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`border rounded-lg px-4 py-3 ${
                        errors.first_name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter first name"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="first_name"
                />
                {errors.first_name && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.first_name.message}
                  </Text>
                )}
              </View>

              {/* Last Name */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </Text>
                <Controller
                  control={control}
                  rules={{
                    required: "Last name is required",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`border rounded-lg px-4 py-3 ${
                        errors.last_name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter last name"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="last_name"
                />
                {errors.last_name && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.last_name.message}
                  </Text>
                )}
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email *
                </Text>
                <Controller
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email format",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`border rounded-lg px-4 py-3 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter email"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  )}
                  name="email"
                />
                {errors.email && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              {/* Phone */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </Text>
                <Controller
                  control={control}
                  rules={{
                    required: "Phone number is required",
                    pattern: {
                      value: /^09\d{9}$/,
                      message: "Invalid phone number format (09XXXXXXXXX)",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`border rounded-lg px-4 py-3 ${
                        errors.phone
                          ? "border-red-500"
                          : value && isPhoneValid
                            ? "border-green-500"
                            : "border-gray-300"
                      }`}
                      placeholder="09613886156"
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        const formatted = formatPhoneNumber(text);
                        onChange(formatted);
                      }}
                      value={value}
                      keyboardType="phone-pad"
                      maxLength={11}
                    />
                  )}
                  name="phone"
                />
                {errors.phone && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </Text>
                )}
                <Text className="text-xs text-gray-500 mt-1">
                  Format: 09XXXXXXXXX
                </Text>
              </View>

              {/* Date of Birth */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </Text>
                <TouchableOpacity
                  className={`border rounded-lg p-4 flex-row justify-between items-center ${
                    dob ? "border-green-500 bg-green-50" : "border-gray-300"
                  }`}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text
                    className={
                      dob ? "text-gray-800 font-medium" : "text-gray-500"
                    }
                  >
                    {formatDate(dob)}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={dob ? "#16a34a" : "#6b7280"}
                  />
                </TouchableOpacity>
                {dob && (
                  <View className="mt-2 flex-row items-center">
                    <Ionicons
                      name="information-circle-outline"
                      size={16}
                      color="#3b82f6"
                    />
                    <Text className="text-blue-600 text-xs ml-1">
                      Age: {calculateAge(dob)} years old •{" "}
                      {dob.toLocaleDateString("en-US", { weekday: "long" })}
                    </Text>
                  </View>
                )}
                {!validateDOB(dob) && dob && (
                  <Text className="text-red-500 text-xs mt-1">
                    Must be at least 13 years old and not older than 100 years
                  </Text>
                )}
                <Controller
                  control={control}
                  render={({ field: { onChange } }) => null}
                  name="dob"
                />
              </View>

              {/* Gender */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Gender
                </Text>
                <TouchableOpacity
                  className={`border rounded-lg p-4 flex-row justify-between items-center ${
                    gender ? "border-green-500 bg-green-50" : "border-gray-300"
                  }`}
                  onPress={() => setShowGenderPicker(true)}
                >
                  <Text
                    className={
                      gender ? "text-gray-800 font-medium" : "text-gray-500"
                    }
                  >
                    {getGenderLabel(gender)}
                  </Text>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={gender ? "#16a34a" : "#6b7280"}
                  />
                </TouchableOpacity>
                <Controller
                  control={control}
                  render={({ field: { onChange } }) => null}
                  name="gender"
                />
              </View>
            </View>

            {/* Address Section */}
            <View className="bg-white rounded-2xl p-4 mb-6 border border-gray-200">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Address Information *
              </Text>

              {/* Region (Disabled - Fixed to Calabarzon) */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Region
                </Text>
                <View className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-100">
                  <Text className="text-gray-600">{getRegionName()}</Text>
                </View>
                <Text className="text-xs text-gray-500 mt-1">
                  Currently set to Calabarzon region
                </Text>
              </View>

              {/* Province (Disabled - Fixed to Laguna) */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Province
                </Text>
                <View className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-100">
                  <Text className="text-gray-600">{getProvinceName()}</Text>
                </View>
                <Text className="text-xs text-gray-500 mt-1">
                  Currently set to Laguna province
                </Text>
              </View>

              {/* City/Municipality Picker */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  City/Municipality *
                </Text>
                <TouchableOpacity
                  className={`border rounded-lg p-4 flex-row justify-between items-center ${
                    errors.city
                      ? "border-red-500"
                      : selectedCity
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 bg-white"
                  }`}
                  onPress={() => setShowCityPicker(true)}
                >
                  <Text
                    className={`${selectedCity ? "text-gray-800 font-medium" : "text-gray-500"}`}
                  >
                    {getCityName()}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={
                      errors.city
                        ? "#ef4444"
                        : selectedCity
                          ? "#16a34a"
                          : "#6b7280"
                    }
                  />
                </TouchableOpacity>
                {errors.city && (
                  <Text className="text-red-500 text-xs mt-1">
                    Please select a city/municipality
                  </Text>
                )}
                <Controller
                  control={control}
                  rules={{
                    required: "City is required",
                  }}
                  render={({ field: { value } }) => null}
                  name="city"
                />
              </View>

              {/* Barangay Picker */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Barangay *
                </Text>
                <TouchableOpacity
                  className={`border rounded-lg p-4 flex-row justify-between items-center ${
                    errors.barangay
                      ? "border-red-500"
                      : selectedBarangay
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 bg-white"
                  } ${!selectedCity ? "opacity-50" : ""}`}
                  onPress={() => selectedCity && setShowBarangayPicker(true)}
                  disabled={!selectedCity}
                >
                  <Text
                    className={`${selectedBarangay ? "text-gray-800 font-medium" : "text-gray-500"}`}
                  >
                    {getBarangayName()}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={
                      errors.barangay
                        ? "#ef4444"
                        : selectedBarangay
                          ? "#16a34a"
                          : "#6b7280"
                    }
                  />
                </TouchableOpacity>
                {errors.barangay && (
                  <Text className="text-red-500 text-xs mt-1">
                    Please select a barangay
                  </Text>
                )}
                {!selectedCity && (
                  <Text className="text-xs text-gray-500 mt-1">
                    Please select a city first
                  </Text>
                )}
                <Controller
                  control={control}
                  rules={{
                    required: "Barangay is required",
                  }}
                  render={({ field: { value } }) => null}
                  name="barangay"
                />
              </View>

              {/* Specific Address Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </Text>
                <Controller
                  control={control}
                  rules={{
                    required: "Street address is required",
                    minLength: {
                      value: 5,
                      message:
                        "Street address should be at least 5 characters long",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`border rounded-lg px-4 py-3 bg-white text-gray-800 ${
                        errors.address
                          ? "border-red-500"
                          : value && value.trim().length >= 5
                            ? "border-green-500"
                            : "border-gray-300"
                      }`}
                      placeholder="e.g., Block 5, Lot 12, Mahogany Street, Subdivision"
                      placeholderTextColor="#9CA3AF"
                      multiline={true}
                      numberOfLines={3}
                      textAlignVertical="top"
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        setAddress(text);
                        onChange(text);
                      }}
                      value={value}
                    />
                  )}
                  name="address"
                />
                {errors.address && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.address.message}
                  </Text>
                )}
                <Text className="text-xs text-gray-500 mt-1">
                  Enter specific location details like block number, lot number,
                  street name, etc.
                </Text>
              </View>

              {/* Address Validation Status */}
              <View className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Text className="text-blue-800 text-sm font-medium">
                  Address Completion:{" "}
                  {isAddressComplete ? "✓ Complete" : "Required fields missing"}
                </Text>
                <Text className="text-blue-600 text-xs mt-1">
                  • City/Municipality:{" "}
                  {selectedCity ? "✓ Selected" : "✗ Required"}
                </Text>
                <Text className="text-blue-600 text-xs">
                  • Barangay: {selectedBarangay ? "✓ Selected" : "✗ Required"}
                </Text>
                <Text className="text-blue-600 text-xs">
                  • Street Address:{" "}
                  {address && address.trim().length >= 5
                    ? "✓ Provided"
                    : "✗ Required"}
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              className={`rounded-lg py-4 flex-row items-center justify-center ${
                isAddressComplete ? "bg-green-600" : "bg-gray-400"
              }`}
              disabled={!isAddressComplete}
            >
              <Ionicons name="save-outline" size={20} color="white" />
              <Text className="text-white text-center font-semibold text-lg ml-2">
                Update Profile
              </Text>
            </TouchableOpacity>

            {/* Form Completion Status */}
            {!isAddressComplete && (
              <View className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Text className="text-yellow-800 text-sm text-center">
                  Please complete all required address fields to update your
                  profile
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold text-gray-800">
                  Select Date of Birth
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  className="p-2"
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <DatePicker
                date={dob || new Date()}
                onDateChange={(date) => {
                  setDob(date);
                  setValue("dob", date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
                }}
                mode="date"
                locale="en"
                theme="light"
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
                fadeToColor="none"
                androidVariant="nativeAndroid"
              />
              <View className="mt-4 p-3 bg-blue-50 rounded-lg">
                <Text className="text-blue-800 text-sm">
                  {dob ? (
                    <>
                      Selected: {formatDate(dob)}
                      {validateDOB(dob) ? (
                        <Text className="text-green-600">
                          {" "}
                          • Valid (Age: {calculateAge(dob)})
                        </Text>
                      ) : (
                        <Text className="text-red-600"> • Invalid age</Text>
                      )}
                    </>
                  ) : (
                    "Select your date of birth"
                  )}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (dob && !validateDOB(dob)) {
                    alert("Please select a valid date of birth (age 13-100).");
                    return;
                  }
                  setShowDatePicker(false);
                }}
                className="mt-4 bg-green-600 rounded-xl py-3 items-center"
              >
                <Text className="text-white font-semibold text-base">
                  Confirm Date
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Action Sheet Picker Modals */}
        <ActionSheetPicker
          visible={showGenderPicker}
          onClose={() => setShowGenderPicker(false)}
          selectedValue={gender}
          onValueChange={(val) => {
            setGender(val);
            setValue("gender", val);
          }}
          items={genderOptions}
          title="Select Gender"
          keyProp="value"
          labelProp="label"
        />

        <ActionSheetPicker
          visible={showCityPicker}
          onClose={() => setShowCityPicker(false)}
          selectedValue={selectedCity}
          onValueChange={(val) => {
            setSelectedCity(val);
            setSelectedBarangay(""); // Reset barangay when city changes
            setValue("barangay", ""); // Clear barangay value
            trigger("city");
            trigger("barangay");
          }}
          items={filteredCities}
          title="Select City/Municipality *"
          keyProp="citymunCode"
          labelProp="citymunDesc"
        />

        <ActionSheetPicker
          visible={showBarangayPicker}
          onClose={() => setShowBarangayPicker(false)}
          selectedValue={selectedBarangay}
          onValueChange={(val) => {
            setSelectedBarangay(val);
            trigger("barangay");
          }}
          items={filteredBarangays}
          title="Select Barangay *"
          keyProp="brgyCode"
          labelProp="brgyDesc"
        />
      </KeyboardAvoidingView>
    </View>
  );
}
