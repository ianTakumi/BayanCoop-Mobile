import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";

// Import address data
import brgyData from "../../assets/data/refbrgy.json";
import cityMunData from "../../assets/data/refcitymun.json";
import provinceData from "../../assets/data/refprovince.json";
import regionsData from "../../assets/data/refregion.json";

// Add your Redux actions here
// import { updateSupplier } from "@/redux/slices/supplierSlice";

export default function EditBusinessProfile() {
  const router = useRouter();
  const supplier = useSelector((state) => state.supplier.supplier);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Filtered lists
  const [filteredProvinces, setFilteredProvinces] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredBarangays, setFilteredBarangays] = useState([]);

  // Modal states for pickers
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showBarangayPicker, setShowBarangayPicker] = useState(false);

  // Extract the actual data from RECORDS array
  const regions = regionsData.RECORDS || [];
  const provinces = provinceData.RECORDS || [];
  const cities = cityMunData.RECORDS || [];
  const barangays = brgyData.RECORDS || [];

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: supplier?.name || "",
      business_name: supplier?.business_name || "",
      business_type: supplier?.business_type || "individual",
      email: supplier?.email || "",
      phone: supplier?.phone || "",
      address: supplier?.address || "",
      barangay: supplier?.barangay || "",
      city: supplier?.city || "",
      province: supplier?.province || "",
      region: supplier?.region || "",
    },
  });

  // Main initialization effect
  useEffect(() => {
    if (regions.length === 0 || provinces.length === 0 || isInitialized) return;

    console.log("Initializing with supplier data:", supplier);

    // Check if supplier has existing data
    if (supplier?.region) {
      // Use existing data
      const existingRegion = regions.find((r) => r.regDesc === supplier.region);
      if (existingRegion) {
        console.log("Setting existing region:", existingRegion.regDesc);
        setSelectedRegion(existingRegion.regCode);
        setValue("region", existingRegion.regDesc);

        // Filter provinces for this region
        const provincesInRegion = provinces.filter(
          (prov) => prov.regCode === existingRegion.regCode
        );
        setFilteredProvinces(provincesInRegion);

        // Find and set existing province
        if (supplier?.province) {
          const existingProvince = provincesInRegion.find(
            (p) => p.provDesc === supplier.province
          );
          if (existingProvince) {
            console.log(
              "Setting existing province:",
              existingProvince.provDesc
            );
            setSelectedProvince(existingProvince.provCode);
            setValue("province", existingProvince.provDesc);
          }
        }
      }
    } else {
      // Set default to CALABARZON (Region IV-A)
      const calabarzonRegion = regions.find((r) => r.regCode === "04");
      if (calabarzonRegion) {
        console.log("Setting default CALABARZON region");
        setSelectedRegion("04");
        setValue("region", calabarzonRegion.regDesc);

        // Filter provinces for CALABARZON
        const provincesInCalabarzon = provinces.filter(
          (prov) => prov.regCode === "04"
        );
        setFilteredProvinces(provincesInCalabarzon);
        console.log("Calabarzon provinces:", provincesInCalabarzon);

        // Find and set Laguna province
        const lagunaProvince = provincesInCalabarzon.find(
          (p) => p.provCode === "0434"
        );
        if (lagunaProvince) {
          console.log(
            "Setting default Laguna province:",
            lagunaProvince.provDesc
          );
          setSelectedProvince("0434");
          setValue("province", lagunaProvince.provDesc);
        } else {
          console.error("Laguna province not found in Calabarzon");
        }
      }
    }

    setIsInitialized(true);
  }, [regions, provinces, supplier, setValue, isInitialized]);

  // Filter cities by province
  useEffect(() => {
    if (selectedProvince && filteredProvinces.length > 0) {
      const citiesInProvince = cities.filter(
        (city) => city.provCode === selectedProvince
      );
      setFilteredCities(citiesInProvince);

      // If supplier has existing city, set it
      if (supplier?.city && !isInitialized) {
        const existingCity = citiesInProvince.find(
          (c) => c.citymunDesc === supplier.city
        );
        if (existingCity) {
          setSelectedCity(existingCity.citymunCode);
          setValue("city", existingCity.citymunDesc);
        }
      }
    } else {
      setFilteredCities([]);
    }
  }, [
    selectedProvince,
    filteredProvinces,
    cities,
    supplier,
    setValue,
    isInitialized,
  ]);

  // Filter barangays by city
  useEffect(() => {
    if (selectedCity && filteredCities.length > 0) {
      const barangaysInCity = barangays.filter(
        (brgy) => brgy.citymunCode === selectedCity
      );
      setFilteredBarangays(barangaysInCity);

      // If supplier has existing barangay, set it
      if (supplier?.barangay && !isInitialized) {
        const existingBarangay = barangaysInCity.find(
          (b) => b.brgyDesc === supplier.barangay
        );
        if (existingBarangay) {
          setSelectedBarangay(existingBarangay.brgyCode);
          setValue("barangay", existingBarangay.brgyDesc);
        }
      }
    } else {
      setFilteredBarangays([]);
    }
  }, [
    selectedCity,
    filteredCities,
    barangays,
    supplier,
    setValue,
    isInitialized,
  ]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Get display names for selected values
      const regionObj = regions.find((r) => r.regCode === selectedRegion);
      const provinceObj = filteredProvinces.find(
        (p) => p.provCode === selectedProvince
      );
      const cityObj = filteredCities.find(
        (c) => c.citymunCode === selectedCity
      );
      const barangayObj = filteredBarangays.find(
        (b) => b.brgyCode === selectedBarangay
      );

      const updateData = {
        name: data.name,
        business_name: data.business_name,
        business_type: data.business_type,
        email: data.email,
        phone: data.phone,
        address: data.address,
        barangay: barangayObj?.brgyDesc || "",
        city: cityObj?.citymunDesc || "",
        province: provinceObj?.provDesc || "",
        region: regionObj?.regDesc || "",
      };

      console.log("Update data:", updateData);

      // Add your API call here
      // Example:
      // await client.put(`/suppliers/${supplier.id}`, updateData);
      // dispatch(updateSupplier(updateData));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Profile updated successfully");
      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to get display names
  const getRegionName = () => {
    if (!selectedRegion) return "Select Region";
    const region = regions.find((r) => r.regCode === selectedRegion);
    return region ? region.regDesc : "Select Region";
  };

  const getProvinceName = () => {
    if (!selectedProvince)
      return selectedRegion ? "Select Province" : "Select Region First";
    const province = filteredProvinces.find(
      (p) => p.provCode === selectedProvince
    );
    return province ? province.provDesc : "Select Province";
  };

  const getCityName = () => {
    if (!selectedCity)
      return selectedProvince
        ? "Select City/Municipality"
        : "Select Province First";
    const city = filteredCities.find((c) => c.citymunCode === selectedCity);
    return city ? city.citymunDesc : "Select City/Municipality";
  };

  const getBarangayName = () => {
    if (!selectedBarangay)
      return selectedCity ? "Select Barangay" : "Select City First";
    const barangay = filteredBarangays.find(
      (b) => b.brgyCode === selectedBarangay
    );
    return barangay ? barangay.brgyDesc : "Select Barangay";
  };

  // Action Sheet Picker Component
  const ActionSheetPicker = ({
    visible,
    onClose,
    selectedValue,
    onValueChange,
    items,
    title,
    keyProp = "code",
    labelProp = "name",
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
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-800">
                {title}
              </Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96">
              {safeItems.length === 0 ? (
                <View className="p-4 items-center">
                  <Text className="text-gray-500 text-center">
                    {title === "Region"
                      ? "Loading regions..."
                      : `Please select ${title === "Barangay" ? "City" : title.toLowerCase()} first`}
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />

      {/* Improved Header */}
      <View className="bg-green-600">
        <SafeAreaView edges={["top"]}>
          <View className="px-6 pb-5 pt-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="mr-4 p-2 rounded-full bg-white/20 active:bg-white/30"
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                <View className="flex-1">
                  <Text className="text-white text-2xl font-bold">
                    Edit Business Profile
                  </Text>
                  <Text className="text-white/90 text-sm mt-1">
                    Update your business information
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  className="p-2 rounded-lg bg-white/20 active:bg-white/30"
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="checkmark" size={24} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Business Information Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-4">
            <View className="w-1 h-5 bg-green-500 rounded-full mr-3" />
            <Text className="text-lg font-bold text-gray-800">
              Business Information
            </Text>
          </View>

          <View>
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Supplier Name
              </Text>
              <View className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <TextInput
                  defaultValue={watch("name")}
                  placeholder="Enter supplier name"
                  className="text-gray-800 text-base"
                  onChangeText={(text) => setValue("name", text)}
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Business Name (Optional)
              </Text>
              <View className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <TextInput
                  defaultValue={watch("business_name")}
                  placeholder="Enter business name"
                  className="text-gray-800 text-base"
                  onChangeText={(text) => setValue("business_name", text)}
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Business Type
              </Text>
              <View className="flex-row">
                <TouchableOpacity
                  className={`flex-1 mr-2 border rounded-xl px-4 py-3 ${
                    watch("business_type") === "individual"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                  onPress={() => setValue("business_type", "individual")}
                >
                  <Text
                    className={`text-center font-medium ${
                      watch("business_type") === "individual"
                        ? "text-green-700"
                        : "text-gray-700"
                    }`}
                  >
                    Individual
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 ml-2 border rounded-xl px-4 py-3 ${
                    watch("business_type") === "company"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                  onPress={() => setValue("business_type", "company")}
                >
                  <Text
                    className={`text-center font-medium ${
                      watch("business_type") === "company"
                        ? "text-green-700"
                        : "text-gray-700"
                    }`}
                  >
                    Company
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Information Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-4">
            <View className="w-1 h-5 bg-blue-500 rounded-full mr-3" />
            <Text className="text-lg font-bold text-gray-800">
              Contact Information
            </Text>
          </View>

          <View>
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email Address
              </Text>
              <View className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <TextInput
                  defaultValue={watch("email")}
                  placeholder="supplier@email.com"
                  className="text-gray-800 text-base"
                  keyboardType="email-address"
                  onChangeText={(text) => setValue("email", text)}
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </Text>
              <View className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <TextInput
                  defaultValue={watch("phone")}
                  placeholder="09123456789"
                  className="text-gray-800 text-base"
                  keyboardType="phone-pad"
                  onChangeText={(text) => setValue("phone", text)}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Address Information Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-4">
            <View className="w-1 h-5 bg-purple-500 rounded-full mr-3" />
            <Text className="text-lg font-bold text-gray-800">
              Address Information
            </Text>
          </View>

          <View>
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Address
              </Text>
              <View className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <TextInput
                  defaultValue={watch("address")}
                  placeholder="Street, Building, House No."
                  className="text-gray-800 text-base"
                  multiline
                  numberOfLines={2}
                  onChangeText={(text) => setValue("address", text)}
                />
              </View>
            </View>

            {/* Region Picker */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Region
              </Text>
              <TouchableOpacity
                className={`border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 flex-row justify-between items-center ${
                  selectedRegion ? "border-green-500" : ""
                }`}
                onPress={() => setShowRegionPicker(true)}
              >
                <Text
                  className={`text-base ${
                    selectedRegion ? "text-gray-800" : "text-gray-500"
                  }`}
                >
                  {getRegionName()}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={selectedRegion ? "#16a34a" : "#6b7280"}
                />
              </TouchableOpacity>
            </View>

            {/* Province Picker */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Province
              </Text>
              <TouchableOpacity
                className={`border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 flex-row justify-between items-center ${
                  selectedProvince ? "border-green-500" : ""
                } ${!selectedRegion ? "opacity-50" : ""}`}
                onPress={() => selectedRegion && setShowProvincePicker(true)}
                disabled={!selectedRegion}
              >
                <Text
                  className={`text-base ${
                    selectedProvince ? "text-gray-800" : "text-gray-500"
                  }`}
                >
                  {getProvinceName()}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={selectedProvince ? "#16a34a" : "#6b7280"}
                />
              </TouchableOpacity>
            </View>

            {/* City Picker */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                City/Municipality
              </Text>
              <TouchableOpacity
                className={`border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 flex-row justify-between items-center ${
                  selectedCity ? "border-green-500" : ""
                } ${!selectedProvince ? "opacity-50" : ""}`}
                onPress={() => selectedProvince && setShowCityPicker(true)}
                disabled={!selectedProvince}
              >
                <Text
                  className={`text-base ${
                    selectedCity ? "text-gray-800" : "text-gray-500"
                  }`}
                >
                  {getCityName()}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={selectedCity ? "#16a34a" : "#6b7280"}
                />
              </TouchableOpacity>
            </View>

            {/* Barangay Picker */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Barangay
              </Text>
              <TouchableOpacity
                className={`border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 flex-row justify-between items-center ${
                  selectedBarangay ? "border-green-500" : ""
                } ${!selectedCity ? "opacity-50" : ""}`}
                onPress={() => selectedCity && setShowBarangayPicker(true)}
                disabled={!selectedCity}
              >
                <Text
                  className={`text-base ${
                    selectedBarangay ? "text-gray-800" : "text-gray-500"
                  }`}
                >
                  {getBarangayName()}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={selectedBarangay ? "#16a34a" : "#6b7280"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className="bg-green-600 rounded-xl p-4 mb-8"
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold text-center text-lg">
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Picker Modals */}
      <ActionSheetPicker
        visible={showRegionPicker}
        onClose={() => setShowRegionPicker(false)}
        selectedValue={selectedRegion}
        onValueChange={(val) => {
          setSelectedRegion(val);
          const regionObj = regions.find((r) => r.regCode === val);
          if (regionObj) setValue("region", regionObj.regDesc);
        }}
        items={regions}
        title="Region"
        keyProp="regCode"
        labelProp="regDesc"
      />

      <ActionSheetPicker
        visible={showProvincePicker}
        onClose={() => setShowProvincePicker(false)}
        selectedValue={selectedProvince}
        onValueChange={(val) => {
          setSelectedProvince(val);
          const provinceObj = filteredProvinces.find((p) => p.provCode === val);
          if (provinceObj) setValue("province", provinceObj.provDesc);
        }}
        items={filteredProvinces}
        title="Province"
        keyProp="provCode"
        labelProp="provDesc"
      />

      <ActionSheetPicker
        visible={showCityPicker}
        onClose={() => setShowCityPicker(false)}
        selectedValue={selectedCity}
        onValueChange={(val) => {
          setSelectedCity(val);
          const cityObj = filteredCities.find((c) => c.citymunCode === val);
          if (cityObj) setValue("city", cityObj.citymunDesc);
        }}
        items={filteredCities}
        title="City/Municipality"
        keyProp="citymunCode"
        labelProp="citymunDesc"
      />

      <ActionSheetPicker
        visible={showBarangayPicker}
        onClose={() => setShowBarangayPicker(false)}
        selectedValue={selectedBarangay}
        onValueChange={(val) => {
          setSelectedBarangay(val);
          const barangayObj = filteredBarangays.find((b) => b.brgyCode === val);
          if (barangayObj) setValue("barangay", barangayObj.brgyDesc);
        }}
        items={filteredBarangays}
        title="Barangay"
        keyProp="brgyCode"
        labelProp="brgyDesc"
      />
    </KeyboardAvoidingView>
  );
}
