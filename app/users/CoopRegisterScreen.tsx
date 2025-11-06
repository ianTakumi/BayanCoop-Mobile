import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import brgyData from "../../assets/data/refbrgy.json";
import cityMunData from "../../assets/data/refcitymun.json";
import provinceData from "../../assets/data/refprovince.json";
import regionsData from "../../assets/data/refregion.json";

const CoopRegisterScreen = () => {
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  // Address state
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Map state
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);

  // Filtered lists
  const [filteredProvinces, setFilteredProvinces] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredBarangays, setFilteredBarangays] = useState([]);

  // Modal states for custom pickers
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showBarangayPicker, setShowBarangayPicker] = useState(false);

  // Extract the actual data from RECORDS array
  const regions = regionsData.RECORDS || [];
  const provinces = provinceData.RECORDS || [];
  const cities = cityMunData.RECORDS || [];
  const barangays = brgyData.RECORDS || [];

  // Sample postal code data (you might want to import this from a JSON file)
  const postalCodeData = {
    // Metro Manila Postal Codes
    Manila: [
      "0900",
      "0901",
      "0902",
      "0903",
      "0904",
      "0905",
      "0906",
      "0907",
      "0908",
      "0909",
      "0910",
      "0911",
      "0912",
      "0913",
      "0914",
      "0915",
      "0916",
      "0917",
      "0918",
      "0919",
      "0920",
      "0921",
      "0922",
      "0923",
      "0924",
      "0925",
      "0926",
      "0927",
      "0928",
      "0929",
      "0930",
      "0931",
      "0932",
      "0933",
      "0934",
      "0935",
      "0936",
      "0937",
      "0938",
      "0939",
      "0940",
      "0941",
      "0942",
      "0943",
      "0944",
      "0945",
      "0946",
      "0947",
      "0948",
      "0949",
      "0950",
      "0951",
      "0952",
      "0953",
      "0954",
      "0955",
      "0956",
      "0957",
      "0958",
      "0959",
      "0960",
      "0961",
      "0962",
      "0963",
      "0964",
      "0965",
      "0966",
      "0967",
      "0968",
      "0969",
      "0970",
      "0971",
      "0972",
      "0973",
      "0974",
      "0975",
      "0976",
      "0977",
      "0978",
      "0979",
      "0980",
      "0981",
      "0982",
      "0983",
      "0984",
      "0985",
      "0986",
      "0987",
      "0988",
      "0989",
      "0990",
      "0991",
      "0992",
      "0993",
      "0994",
      "0995",
      "0996",
      "0997",
      "0998",
      "0999",
      "1000",
      "1001",
      "1002",
      "1003",
      "1004",
      "1005",
      "1006",
      "1007",
      "1008",
      "1009",
      "1010",
      "1011",
      "1012",
      "1013",
      "1014",
      "1015",
      "1016",
      "1017",
      "1018",
      "1019",
      "1020",
      "1021",
      "1022",
      "1023",
      "1024",
      "1025",
      "1026",
      "1027",
      "1028",
      "1029",
      "1030",
      "1031",
      "1032",
      "1033",
      "1034",
      "1035",
      "1036",
      "1037",
      "1038",
      "1039",
      "1040",
      "1041",
      "1042",
      "1043",
      "1044",
      "1045",
      "1046",
      "1047",
      "1048",
      "1049",
      "1050",
      "1051",
      "1052",
      "1053",
      "1054",
      "1055",
      "1056",
      "1057",
      "1058",
      "1059",
      "1060",
      "1061",
      "1062",
      "1063",
      "1064",
      "1065",
      "1066",
      "1067",
      "1068",
      "1069",
      "1070",
      "1071",
      "1072",
      "1073",
      "1074",
      "1075",
      "1076",
      "1077",
      "1078",
      "1079",
      "1080",
      "1081",
      "1082",
      "1083",
      "1084",
      "1085",
      "1086",
      "1087",
      "1088",
      "1089",
      "1090",
      "1091",
      "1092",
      "1093",
      "1094",
      "1095",
      "1096",
      "1097",
      "1098",
      "1099",
      "1100",
      "1101",
      "1102",
      "1103",
      "1104",
      "1105",
      "1106",
      "1107",
      "1108",
      "1109",
      "1110",
      "1111",
      "1112",
      "1113",
      "1114",
      "1115",
      "1116",
      "1117",
      "1118",
      "1119",
      "1120",
      "1121",
      "1122",
      "1123",
      "1124",
      "1125",
      "1126",
      "1127",
      "1128",
      "1129",
      "1130",
      "1131",
      "1132",
      "1133",
      "1134",
      "1135",
      "1136",
      "1137",
      "1138",
      "1139",
      "1140",
      "1141",
      "1142",
      "1143",
      "1144",
      "1145",
      "1146",
      "1147",
      "1148",
      "1149",
      "1150",
      "1151",
      "1152",
      "1153",
      "1154",
      "1155",
      "1156",
      "1157",
      "1158",
      "1159",
      "1160",
      "1161",
      "1162",
      "1163",
      "1164",
      "1165",
      "1166",
      "1167",
      "1168",
      "1169",
      "1170",
      "1171",
      "1172",
      "1173",
      "1174",
      "1175",
      "1176",
      "1177",
      "1178",
      "1179",
      "1180",
      "1181",
      "1182",
      "1183",
      "1184",
      "1185",
      "1186",
      "1187",
      "1188",
      "1189",
      "1190",
      "1191",
      "1192",
      "1193",
      "1194",
      "1195",
      "1196",
      "1197",
      "1198",
      "1199",
      "1200",
    ],
    // Add more cities and their postal codes as needed
    "Quezon City": [
      "1100",
      "1101",
      "1102",
      "1103",
      "1104",
      "1105",
      "1106",
      "1107",
      "1108",
      "1109",
      "1110",
      "1111",
      "1112",
      "1113",
      "1114",
      "1115",
      "1116",
      "1117",
      "1118",
      "1119",
      "1120",
      "1121",
      "1122",
      "1123",
      "1124",
      "1125",
      "1126",
      "1127",
      "1128",
      "1129",
      "1130",
      "1131",
      "1132",
      "1133",
      "1134",
      "1135",
      "1136",
      "1137",
      "1138",
      "1139",
      "1140",
      "1141",
      "1142",
      "1143",
      "1144",
      "1145",
      "1146",
      "1147",
      "1148",
      "1149",
      "1150",
      "1151",
      "1152",
      "1153",
      "1154",
      "1155",
      "1156",
      "1157",
      "1158",
      "1159",
      "1160",
      "1161",
      "1162",
      "1163",
      "1164",
      "1165",
      "1166",
      "1167",
      "1168",
      "1169",
      "1170",
      "1171",
      "1172",
      "1173",
      "1174",
      "1175",
      "1176",
      "1177",
      "1178",
      "1179",
      "1180",
      "1181",
      "1182",
      "1183",
      "1184",
      "1185",
      "1186",
      "1187",
      "1188",
      "1189",
      "1190",
      "1191",
      "1192",
      "1193",
      "1194",
      "1195",
      "1196",
      "1197",
      "1198",
      "1199",
      "1200",
    ],
  };

  useEffect(() => {
    console.log("Regions:", regions.length);
    console.log("Provinces:", provinces.length);
    console.log("Cities/Municipalities:", cities.length);
    console.log("Barangays:", barangays.length);
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      coopName: "",
      email: "",
      phone: "",
      address: "",
      region: "",
      province: "",
      city: "",
      barangay: "",
      postalCode: "",
      latitude: "",
      longitude: "",
    },
  });

  // Get user's current location for initial map view
  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please enable location services to pinpoint your cooperative location on the map.",
          [{ text: "OK" }]
        );
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return location.coords;
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  };

  // Open map with current location
  const openMapPicker = async () => {
    setMapLoading(true);

    const coords = await getCurrentLocation();

    if (coords) {
      setInitialRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      // Pre-select current location
      setSelectedLocation(coords);
    } else {
      // Default to Manila if location not available
      setInitialRegion({
        latitude: 14.5995,
        longitude: 120.9842,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }

    setMapLoading(false);
    setMapVisible(true);
  };

  // Handle map press to select precise location
  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
  };

  // Confirm selected location
  const confirmLocation = () => {
    if (selectedLocation) {
      setValue("latitude", selectedLocation.latitude.toString());
      setValue("longitude", selectedLocation.longitude.toString());
      setMapVisible(false);

      Alert.alert("Location Set", `Cooperative location has been set!`, [
        { text: "OK" },
      ]);
    } else {
      Alert.alert(
        "No Location Selected",
        "Please tap on the map to select your cooperative location."
      );
    }
  };

  // ✅ Filter provinces by region (using regCode)
  useEffect(() => {
    if (selectedRegion) {
      const provincesInRegion = provinces.filter(
        (prov) => prov.regCode === selectedRegion
      );
      setFilteredProvinces(provincesInRegion);
      setFilteredCities([]);
      setFilteredBarangays([]);
      setSelectedProvince("");
      setSelectedCity("");
      setSelectedBarangay("");
      setPostalCode("");
      setValue("province", "");
      setValue("city", "");
      setValue("barangay", "");
      setValue("postalCode", "");
    } else {
      setFilteredProvinces([]);
      setFilteredCities([]);
      setFilteredBarangays([]);
    }
  }, [selectedRegion]);

  // ✅ Filter cities by province (using provCode)
  useEffect(() => {
    if (selectedProvince) {
      const citiesInProvince = cities.filter(
        (city) => city.provCode === selectedProvince
      );
      setFilteredCities(citiesInProvince);
      setFilteredBarangays([]);
      setSelectedCity("");
      setSelectedBarangay("");
      setPostalCode("");
      setValue("city", "");
      setValue("barangay", "");
      setValue("postalCode", "");
    } else {
      setFilteredCities([]);
      setFilteredBarangays([]);
    }
  }, [selectedProvince]);

  // ✅ Filter barangays by city (using citymunCode)
  useEffect(() => {
    if (selectedCity) {
      const barangaysInCity = barangays.filter(
        (brgy) => brgy.citymunCode === selectedCity
      );
      setFilteredBarangays(barangaysInCity);
      setSelectedBarangay("");
      setPostalCode("");
      setValue("barangay", "");
      setValue("postalCode", "");
    } else {
      setFilteredBarangays([]);
    }
  }, [selectedCity]);

  // Auto-suggest postal code when city is selected
  useEffect(() => {
    if (selectedCity) {
      const cityObj = filteredCities.find(
        (c) => c.citymunCode === selectedCity
      );
      if (cityObj) {
        const cityName = cityObj.citymunDesc;
        // Get first postal code for the city (you can enhance this logic)
        const codes = postalCodeData[cityName];
        if (codes && codes.length > 0) {
          setPostalCode(codes[0]);
          setValue("postalCode", codes[0]);
        }
      }
    }
  }, [selectedCity]);

  // Format phone number as 09613886156
  const formatPhoneNumber = (text) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");

    // Limit to 11 digits (09XXXXXXXXX)
    const limited = cleaned.substring(0, 11);

    return limited;
  };

  // Format postal code (4 digits)
  const formatPostalCode = (text) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");

    // Limit to 4 digits
    const limited = cleaned.substring(0, 4);

    return limited;
  };

  // Validate phone number format
  const validatePhoneNumber = (phone) => {
    if (!phone) return false;

    // Should be 11 digits starting with 09
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Validate postal code format
  const validatePostalCode = (code) => {
    if (!code) return false;

    // Should be exactly 4 digits
    const postalRegex = /^\d{4}$/;
    return postalRegex.test(code);
  };

  const onSubmit = async (data) => {
    if (!data.latitude || !data.longitude) {
      Alert.alert(
        "Location Required",
        "Please pinpoint your cooperative location on the map."
      );
      return;
    }

    // Validate required fields
    if (
      !data.coopName ||
      !data.email ||
      !data.phone ||
      !data.address ||
      !data.postalCode
    ) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    // Validate phone number format
    if (!validatePhoneNumber(data.phone)) {
      Alert.alert(
        "Invalid Phone Number",
        "Please enter a valid 11-digit phone number starting with 09 (e.g., 09613886156)."
      );
      return;
    }

    // Validate postal code format
    if (!validatePostalCode(data.postalCode)) {
      Alert.alert(
        "Invalid Postal Code",
        "Please enter a valid 4-digit postal code."
      );
      return;
    }

    setLoading(true);
    try {
      // Get full names for display
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

      // Create complete address string with postal code
      const completeAddress = `${data.address}, ${barangayObj?.brgyDesc || ""}, ${cityObj?.citymunDesc || ""}, ${provinceObj?.provDesc || ""}, ${regionObj?.regDesc || ""} ${data.postalCode}`;

      const registrationData = {
        userId: user.id,
        coopName: data.coopName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        region: selectedRegion,
        province: selectedProvince,
        city: selectedCity,
        barangay: selectedBarangay,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        regionName: regionObj?.regDesc || "",
        provinceName: provinceObj?.provDesc || "",
        cityName: cityObj?.citymunDesc || "",
        barangayName: barangayObj?.brgyDesc || "",
        completeAddress: completeAddress,
      };

      await client.post("/coops", registrationData).then((res) => {
        if (res.status === 201) {
          router.push("/cooperatives/(drawers)/(tabs)/Index");
        }
      });
      console.log("Complete registration data:", registrationData);
      // await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      Alert.alert("Error", "Failed to register cooperative. Please try again.");
      setLoading(false);
    }
  };

  // Get display names for selected values
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

  // Check if location is set
  const isLocationSet = watch("latitude") && watch("longitude");

  // Check if phone number is valid
  const isPhoneValid = validatePhoneNumber(watch("phone"));

  // Check if postal code is valid
  const isPostalCodeValid = validatePostalCode(watch("postalCode"));

  // Check if address is filled
  const isAddressFilled =
    watch("address") && watch("address").trim().length > 0;

  // Check if all required fields are filled
  const isFormComplete =
    watch("coopName") &&
    watch("email") &&
    isPhoneValid &&
    isAddressFilled &&
    selectedRegion &&
    selectedProvince &&
    selectedCity &&
    selectedBarangay &&
    isPostalCodeValid &&
    isLocationSet;

  // Action Sheet Style Picker Modal Component
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

  // Map Picker Modal Component
  const MapPickerModal = () => (
    <Modal
      visible={mapVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">
              Pinpoint Cooperative Location
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Tap on the map to set exact location
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setMapVisible(false)}
            className="p-2"
          >
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Map */}
        <View className="flex-1">
          {mapLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="text-gray-500 mt-2">Loading map...</Text>
            </View>
          ) : initialRegion ? (
            <MapView
              style={{ flex: 1 }}
              initialRegion={initialRegion}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {selectedLocation && (
                <Marker
                  coordinate={selectedLocation}
                  title="Cooperative Location"
                  description="Tap map to change location"
                  pinColor="#16a34a"
                />
              )}
            </MapView>
          ) : (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500">Map not available</Text>
            </View>
          )}
        </View>

        {/* Location Info and Confirm Button */}
        <View className="p-4 bg-white border-t border-gray-200">
          <View className="mb-4">
            <Text className="text-gray-600 text-sm mb-1">
              Selected Coordinates:
            </Text>
            <Text className="text-gray-800 font-medium">
              {selectedLocation
                ? `Lat: ${selectedLocation.latitude.toFixed(6)}, Lng: ${selectedLocation.longitude.toFixed(6)}`
                : "Tap on the map to select location"}
            </Text>
          </View>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={getCurrentLocation}
              className="flex-1 bg-blue-500 rounded-xl py-3 items-center"
            >
              <Text className="text-white font-semibold">Use My Location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={confirmLocation}
              disabled={!selectedLocation}
              className={`flex-1 rounded-xl py-3 items-center ${
                selectedLocation ? "bg-green-600" : "bg-gray-400"
              }`}
            >
              <Text className="text-white font-semibold">Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="text-primary-600 text-xl font-bold mt-4">
          Registering...
        </Text>
        <Text className="text-gray-500 mt-2 text-center">
          Please wait while we process your registration
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 pt-3 mb-5 bg-white">
          <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
            <Ionicons name="arrow-back" size={24} color="#166534" />
          </TouchableOpacity>
          <Text className="text-center text-[#166534] text-lg font-bold">
            Cooperative Registration
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="px-6 py-6 -mt-6">
            {/* Cooperative Information Section */}
            <View className="bg-white rounded-3xl shadow-lg p-6 mb-6">
              <Text className="text-gray-700 font-semibold text-lg mb-4">
                Cooperative Information *
              </Text>

              {/* Cooperative Name */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  Cooperative Name *
                </Text>
                <TextInput
                  className="border-2 border-gray-300 rounded-xl p-4 bg-white text-gray-800 text-base"
                  placeholder="Enter cooperative name"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={(text) => setValue("coopName", text)}
                />
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  Email Address *
                </Text>
                <TextInput
                  className="border-2 border-gray-300 rounded-xl p-4 bg-white text-gray-800 text-base"
                  placeholder="cooperative@email.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={(text) => setValue("email", text)}
                />
              </View>

              {/* Phone Number */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  Phone Number *
                </Text>
                <TextInput
                  className={`border-2 rounded-xl p-4 bg-white text-gray-800 text-base ${
                    watch("phone")
                      ? isPhoneValid
                        ? "border-green-500"
                        : "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="09613886156"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={11}
                  onChangeText={(text) => {
                    const formatted = formatPhoneNumber(text);
                    setValue("phone", formatted);
                  }}
                  value={watch("phone")}
                />
                <Text className="text-xs text-gray-500 mt-1">
                  Format: 09XXXXXXXXX (11 digits)
                </Text>
                {watch("phone") && !isPhoneValid && (
                  <Text className="text-xs text-red-500 mt-1">
                    Please enter a valid 11-digit number starting with 09
                  </Text>
                )}
                {watch("phone") && isPhoneValid && (
                  <Text className="text-xs text-green-500 mt-1">
                    ✓ Valid phone number format
                  </Text>
                )}
              </View>
            </View>

            {/* Address Section */}
            <View className="bg-white rounded-3xl shadow-lg p-6 mb-6">
              <Text className="text-gray-700 font-semibold text-lg mb-4">
                Complete Address *
              </Text>

              {/* Specific Address Field */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  Block, Lot Number & Street *
                </Text>
                <TextInput
                  className={`border-2 rounded-xl p-4 bg-white text-gray-800 text-base ${
                    isAddressFilled ? "border-green-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Block 5, Lot 12, Mahogany Street"
                  placeholderTextColor="#9CA3AF"
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                  onChangeText={(text) => setValue("address", text)}
                />
                <Text className="text-xs text-gray-500 mt-1">
                  Enter specific location details like block number, lot number,
                  street name, subdivision, etc.
                </Text>
              </View>

              {/* Region Picker */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  Region *
                </Text>
                <TouchableOpacity
                  className={`border-2 rounded-xl p-4 flex-row justify-between items-center ${
                    selectedRegion
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-white"
                  }`}
                  onPress={() => setShowRegionPicker(true)}
                >
                  <Text
                    className={`text-base ${selectedRegion ? "text-gray-800 font-medium" : "text-gray-500"}`}
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
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  Province *
                </Text>
                <TouchableOpacity
                  className={`border-2 rounded-xl p-4 flex-row justify-between items-center ${
                    selectedProvince
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-white"
                  } ${!selectedRegion ? "opacity-50" : ""}`}
                  onPress={() => selectedRegion && setShowProvincePicker(true)}
                  disabled={!selectedRegion}
                >
                  <Text
                    className={`text-base ${selectedProvince ? "text-gray-800 font-medium" : "text-gray-500"}`}
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
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  City/Municipality *
                </Text>
                <TouchableOpacity
                  className={`border-2 rounded-xl p-4 flex-row justify-between items-center ${
                    selectedCity
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-white"
                  } ${!selectedProvince ? "opacity-50" : ""}`}
                  onPress={() => selectedProvince && setShowCityPicker(true)}
                  disabled={!selectedProvince}
                >
                  <Text
                    className={`text-base ${selectedCity ? "text-gray-800 font-medium" : "text-gray-500"}`}
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
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  Barangay *
                </Text>
                <TouchableOpacity
                  className={`border-2 rounded-xl p-4 flex-row justify-between items-center ${
                    selectedBarangay
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-white"
                  } ${!selectedCity ? "opacity-50" : ""}`}
                  onPress={() => selectedCity && setShowBarangayPicker(true)}
                  disabled={!selectedCity}
                >
                  <Text
                    className={`text-base ${selectedBarangay ? "text-gray-800 font-medium" : "text-gray-500"}`}
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

              {/* Postal Code */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  Postal Code *
                </Text>
                <TextInput
                  className={`border-2 rounded-xl p-4 bg-white text-gray-800 text-base ${
                    watch("postalCode")
                      ? isPostalCodeValid
                        ? "border-green-500"
                        : "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="e.g., 1000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={4}
                  onChangeText={(text) => {
                    const formatted = formatPostalCode(text);
                    setPostalCode(formatted);
                    setValue("postalCode", formatted);
                  }}
                  value={postalCode}
                />
                <Text className="text-xs text-gray-500 mt-1">
                  Format: 4-digit postal code (e.g., 1000 for Manila)
                </Text>
                {watch("postalCode") && !isPostalCodeValid && (
                  <Text className="text-xs text-red-500 mt-1">
                    Please enter a valid 4-digit postal code
                  </Text>
                )}
                {watch("postalCode") && isPostalCodeValid && (
                  <Text className="text-xs text-green-500 mt-1">
                    ✓ Valid postal code format
                  </Text>
                )}
              </View>

              {/* Map Location Picker */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  Pinpoint Location on Map *
                </Text>
                <TouchableOpacity
                  className={`border-2 rounded-xl p-4 flex-row justify-between items-center ${
                    isLocationSet
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-white"
                  }`}
                  onPress={openMapPicker}
                >
                  <View className="flex-1">
                    <Text
                      className={`text-base ${isLocationSet ? "text-gray-800 font-medium" : "text-gray-500"}`}
                    >
                      {isLocationSet
                        ? "Location Set ✓"
                        : "Tap to set location on map"}
                    </Text>
                    {isLocationSet && (
                      <Text className="text-sm text-gray-600 mt-1">
                        Latitude: {watch("latitude")?.substring(0, 10)}...,
                        Longitude: {watch("longitude")?.substring(0, 10)}...
                      </Text>
                    )}
                  </View>
                  <Ionicons
                    name="map"
                    size={20}
                    color={isLocationSet ? "#16a34a" : "#6b7280"}
                  />
                </TouchableOpacity>
                <Text className="text-xs text-gray-500 mt-1">
                  Required to pinpoint exact cooperative location
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={!isFormComplete}
              className={`flex-row items-center justify-center rounded-xl py-4 px-5 ${
                isFormComplete
                  ? "bg-green-600 active:bg-green-700"
                  : "bg-gray-400"
              }`}
            >
              <Ionicons name="pencil" size={20} color="white" />
              <Text className="text-white text-base font-semibold ml-2">
                Register Cooperative
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Action Sheet Picker Modals */}
        <ActionSheetPicker
          visible={showRegionPicker}
          onClose={() => setShowRegionPicker(false)}
          selectedValue={selectedRegion}
          onValueChange={(val) => {
            setSelectedRegion(val);
            setValue("region", val);
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
            setValue("province", val);
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
            setValue("city", val);
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
            setValue("barangay", val);
          }}
          items={filteredBarangays}
          title="Barangay"
          keyProp="brgyCode"
          labelProp="brgyDesc"
        />

        {/* Map Picker Modal */}
        <MapPickerModal />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CoopRegisterScreen;
