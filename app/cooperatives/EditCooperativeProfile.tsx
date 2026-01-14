import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import * as Location from "expo-location";
import client from "@/utils/axiosInstance";
import { updateCooperativeLoggedIn } from "@/redux/slices/coopSlice";

// Import address data
import regionsData from "../../assets/data/refregion.json";
import provinceData from "../../assets/data/refprovince.json";
import cityMunData from "../../assets/data/refcitymun.json";
import brgyData from "../../assets/data/refbrgy.json";

export default function EditCooperativeProfile() {
  const router = useRouter();
  const cooperative = useSelector(
    (state) => state.cooperative.cooperativeLoggedIn
  );
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
      name: cooperative?.name || "",
      email: cooperative?.email || "",
      phone: cooperative?.phone || "",
      address: cooperative?.address || "",
      barangay: cooperative?.barangay || "",
      city: cooperative?.city || "",
      province: cooperative?.province || "",
      region: cooperative?.region || "",
      postalCode: cooperative?.postalCode || "",
      latitude: cooperative?.latitude || "",
      longitude: cooperative?.longitude || "",
    },
  });

  // Main initialization effect
  useEffect(() => {
    if (regions.length === 0 || provinces.length === 0 || isInitialized) return;

    console.log("Initializing with cooperative data:", cooperative);

    // Check if cooperative has existing data
    if (cooperative?.region) {
      // Use existing data
      const existingRegion = regions.find(
        (r) => r.regDesc === cooperative.region
      );
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
        if (cooperative?.province) {
          const existingProvince = provincesInRegion.find(
            (p) => p.provDesc === cooperative.province
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
  }, [regions, provinces, cooperative, setValue, isInitialized]);

  // Filter cities by province
  useEffect(() => {
    if (selectedProvince && filteredProvinces.length > 0) {
      const citiesInProvince = cities.filter(
        (city) => city.provCode === selectedProvince
      );
      setFilteredCities(citiesInProvince);

      // If cooperative has existing city, set it
      if (cooperative?.city && !isInitialized) {
        const existingCity = citiesInProvince.find(
          (c) => c.citymunDesc === cooperative.city
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
    cooperative,
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

      // If cooperative has existing barangay, set it
      if (cooperative?.barangay && !isInitialized) {
        const existingBarangay = barangaysInCity.find(
          (b) => b.brgyDesc === cooperative.barangay
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
    cooperative,
    setValue,
    isInitialized,
  ]);

  const handleBack = () => {
    router.back();
  };

  const handleSave = async (data) => {
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

      // Create complete address string
      const completeAddress = [
        data.address,
        barangayObj?.brgyDesc || "",
        cityObj?.citymunDesc || "",
        provinceObj?.provDesc || "",
        regionObj?.regDesc || "",
        data.postalCode,
      ]
        .filter(Boolean)
        .join(", ");

      const updateData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        completeAddress: completeAddress,
        postalCode: data.postalCode,
        barangay: barangayObj?.brgyDesc || "",
        city: cityObj?.citymunDesc || "",
        province: provinceObj?.provDesc || "",
        region: regionObj?.regDesc || "",
        latitude: data.latitude || "0",
        longitude: data.longitude || "0",
      };

      console.log("Update data:", updateData);

      // Send update request
      await client.put(`/coops/${cooperative.id}`, updateData).then((res) => {
        if (res.status === 200) {
          console.log("Cooperative updated successfully");
          dispatch(updateCooperativeLoggedIn(res.data.coop));
          router.back();
        }
      });
    } catch (error) {
      console.error("Error updating cooperative:", error);
      // Handle error here
    } finally {
      setLoading(false);
    }
  };

  // Get current location for map
  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Location permission required");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setValue("latitude", latitude.toString());
      setValue("longitude", longitude.toString());

      alert(`Location set: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Failed to get location");
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

  // For debugging
  console.log("Current state:", {
    selectedRegion,
    selectedProvince,
    filteredProvinces: filteredProvinces.length,
    isInitialized,
  });

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-green-600 pt-16 pb-5 px-4">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={handleBack}
            className="p-2"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-white">Edit Profile</Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit(handleSave)}
            className="p-2"
            activeOpacity={0.7}
            disabled={loading}
          >
            <Ionicons name="checkmark" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Form Content */}
      <ScrollView
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Information Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-4">
            <View className="w-1 h-5 bg-green-500 rounded-full mr-3" />
            <Text className="text-lg font-bold text-gray-800">
              Basic Information
            </Text>
          </View>

          <View className="">
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Cooperative Name
              </Text>
              <View className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <TextInput
                  defaultValue={watch("name")}
                  placeholder="Enter cooperative name"
                  className="text-gray-800 text-base"
                  onChangeText={(text) => setValue("name", text)}
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email Address
              </Text>
              <View className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 flex-row items-center">
                <MaterialIcons
                  name="email"
                  size={20}
                  color="#6b7280"
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  defaultValue={watch("email")}
                  placeholder="cooperative@email.com"
                  className="text-gray-800 text-base flex-1"
                  keyboardType="email-address"
                  onChangeText={(text) => setValue("email", text)}
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </Text>
              <View className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 flex-row items-center">
                <MaterialIcons
                  name="phone"
                  size={20}
                  color="#6b7280"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-gray-500">+63</Text>
                <TextInput
                  defaultValue={watch("phone")?.replace("+63", "") || ""}
                  placeholder="9123456789"
                  className="text-gray-800 text-base flex-1 ml-2"
                  keyboardType="phone-pad"
                  onChangeText={(text) => setValue("phone", `+63${text}`)}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Address Information Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-4">
            <View className="w-1 h-5 bg-blue-500 rounded-full mr-3" />
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
                disabled={true}
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
                disabled={true}
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

            {/* Barangay Picker - ADDED THIS SECTION */}
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

            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </Text>
              <View className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <TextInput
                  defaultValue={watch("postalCode")}
                  placeholder="XXXX"
                  className="text-gray-800 text-base text-center"
                  maxLength={4}
                  keyboardType="number-pad"
                  onChangeText={(text) => setValue("postalCode", text)}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Location Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-1 h-5 bg-purple-500 rounded-full mr-3" />
              <Text className="text-lg font-bold text-gray-800">Location</Text>
            </View>
          </View>

          <View>
            {/* Map Preview Placeholder */}
            <View className="bg-gray-100 rounded-xl h-40 items-center justify-center border border-gray-300 mb-5">
              <Ionicons name="location" size={48} color="#8b5cf6" />
              <Text className="text-gray-600 mt-2">Map Coordinates</Text>
              <Text className="text-gray-500 text-sm">
                Lat: {watch("latitude") || "0.0000"}
              </Text>
              <Text className="text-gray-500 text-sm">
                Lng: {watch("longitude") || "0.0000"}
              </Text>
            </View>

            {/* Coordinates */}
            <View className="flex-row mb-5">
              <View className="flex-1 mr-3">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </Text>
                <View className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                  <TextInput
                    defaultValue={watch("latitude")}
                    placeholder="0.000000"
                    className="text-gray-800 text-base"
                    keyboardType="decimal-pad"
                    onChangeText={(text) => setValue("latitude", text)}
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </Text>
                <View className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                  <TextInput
                    defaultValue={watch("longitude")}
                    placeholder="0.000000"
                    className="text-gray-800 text-base"
                    keyboardType="decimal-pad"
                    onChangeText={(text) => setValue("longitude", text)}
                  />
                </View>
              </View>
            </View>

            {/* Get Location Button */}
            <TouchableOpacity
              className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex-row items-center justify-center"
              onPress={getCurrentLocation}
            >
              <Ionicons name="locate" size={20} color="#8b5cf6" />
              <Text className="text-purple-700 font-semibold ml-2">
                Get Current Location
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button at Bottom */}
        <TouchableOpacity
          onPress={handleSubmit(handleSave)}
          className="bg-green-600 rounded-xl p-4 mb-8"
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text className="text-white font-bold text-center text-lg">
            {loading ? "Saving..." : "Save Changes"}
          </Text>
          <Text className="text-green-100 text-center text-sm mt-1">
            Update your cooperative profile information
          </Text>
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
    </View>
  );
}
