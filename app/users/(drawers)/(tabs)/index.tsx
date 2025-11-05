import Entypo from "@expo/vector-icons/Entypo";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

export default function Index() {
  const user = useSelector((state) => state.auth.user);
  const firstName = user?.first_name?.split(" ")[0] || "Guest";
  const hasOnboarded = useSelector((state) => state.auth.hasOnboarded);

  console.log(hasOnboarded);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 p-8 bg-white">
        {/* Greeting */}
        <View className="flex-row items-center mb-4">
          <Text className="text-2xl text-gray-800">Hello </Text>
          <Text className="text-2xl font-bold text-green-500">
            {firstName}!
          </Text>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-[#F4F4F4] rounded-xl px-4 py-3 mb-6 shadow-sm border border-[#E5E7EB]">
          <Entypo name="magnifying-glass" size={20} color="#6B7280" />
          <TextInput
            placeholder="Search products, categories..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-base text-gray-700"
          />
        </View>

        {/* Image Section */}
        <View className="items-center mb-8">
          <Image
            source={require("@/assets/images/users/home/firstImage.png")}
            className="w-[310px] h-[250px]"
            resizeMode="contain"
          />
        </View>

        {/* New Products Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-green-600">
              New Products
            </Text>
            <TouchableOpacity className="bg-green-100 px-4 py-2 rounded-lg">
              <Text className="text-green-700 font-medium">See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {/* Product 1 - Apple */}
            <View className="bg-white rounded-2xl p-4 mr-4 shadow-sm border border-gray-100 w-36">
              <View className="bg-green-50 rounded-xl w-20 h-20 items-center justify-center mb-2 self-center">
                <Text>🍎</Text>
              </View>
              <Text className="text-lg font-semibold text-gray-800 mb-1">
                Apple
              </Text>
              <Text className="text-green-500 font-bold">P57.00</Text>
            </View>

            {/* Product 2 - Rice Sack */}
            <View className="bg-white rounded-2xl p-4 mr-4 shadow-sm border border-gray-100 w-36">
              <View className="bg-green-50 rounded-xl w-20 h-20 items-center justify-center mb-2 self-center">
                <Text>🍚</Text>
              </View>
              <Text className="text-lg font-semibold text-gray-800 mb-1">
                Rice Sack
              </Text>
              <Text className="text-green-500 font-bold">P105.00</Text>
            </View>

            {/* Product 3 - Mango */}
            <View className="bg-white rounded-2xl p-4 mr-4 shadow-sm border border-gray-100 w-36">
              <View className="bg-green-50 rounded-xl w-20 h-20 items-center justify-center mb-2 self-center">
                <Text>🥭</Text>
              </View>
              <Text className="text-lg font-semibold text-gray-800 mb-1">
                Mango
              </Text>
              <Text className="text-green-500 font-bold">P15</Text>
            </View>
          </ScrollView>
        </View>

        {/* Popular Products Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-green-600">
              Popular Products
            </Text>
            <TouchableOpacity className="bg-green-100 px-4 py-2 rounded-lg">
              <Text className="text-green-700 font-medium">See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {/* Product 1 - Potato */}
            <View className="bg-white rounded-2xl p-4 mr-4 shadow-sm border border-gray-100 w-36">
              <View className="bg-green-50 rounded-xl w-20 h-20 items-center justify-center mb-2 self-center">
                <Text>🥔</Text>
              </View>
              <Text className="text-lg font-semibold text-gray-800 mb-1">
                Potato
              </Text>
              <Text className="text-green-500 font-bold">P15</Text>
            </View>

            {/* Product 2 - Bangus */}
            <View className="bg-white rounded-2xl p-4 mr-4 shadow-sm border border-gray-100 w-36">
              <View className="bg-green-50 rounded-xl w-20 h-20 items-center justify-center mb-2 self-center">
                <Text>🐟</Text>
              </View>
              <Text className="text-lg font-semibold text-gray-800 mb-1">
                Bangus
              </Text>
              <Text className="text-green-500 font-bold">P15</Text>
            </View>

            {/* Product 3 - Shrimp */}
            <View className="bg-white rounded-2xl p-4 mr-4 shadow-sm border border-gray-100 w-36">
              <View className="bg-green-50 rounded-xl w-20 h-20 items-center justify-center mb-2 self-center">
                <Text>🦐</Text>
              </View>
              <Text className="text-lg font-semibold text-gray-800 mb-1">
                Shrimp
              </Text>
              <Text className="text-green-500 font-bold">P15</Text>
            </View>
          </ScrollView>
        </View>

        {/* Articles for you Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-green-600">
              Articles for you
            </Text>
            <TouchableOpacity className="bg-green-100 px-4 py-2 rounded-lg">
              <Text className="text-green-700 font-medium">See all</Text>
            </TouchableOpacity>
          </View>

          {/* Article Card */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Extraordinary Team on Peak!
            </Text>

            <View className="mb-4">
              <Text className="text-gray-600 mb-2">
                • Calaguise team successfully launched their first product
                introducing more benefits to give to farmers.
              </Text>
            </View>

            <TouchableOpacity className="bg-green-500 px-4 py-3 rounded-lg self-start">
              <Text className="text-white font-medium">Read More</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="border-t border-gray-200 my-4"></View>

            <Text className="text-lg font-bold text-gray-800">
              JTSTANDING FARMER ASSOCIATION
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
