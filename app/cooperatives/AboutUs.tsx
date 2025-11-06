import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutUs() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with Back Button */}
      <View className="flex-row items-center px-4 pt-3  bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <Ionicons name="arrow-back" size={24} color="#166534" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Our Story Section */}
        <View className="px-6 py-8 bg-white">
          <Text className="text-3xl font-bold text-green-800 text-center mb-6">
            Our Story
          </Text>
          <View className="items-center mb-6">
            <Image
              source={{
                uri: "https://xcbgiyiklnoigcixjdxa.supabase.co/storage/v1/object/sign/bayancoop_assets/Our_story.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZmZkNmJiZC1hZWZhLTRkZGQtODllZS1kYzhjYzQ0ZGFjNDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiYXlhbmNvb3BfYXNzZXRzL091cl9zdG9yeS5qcGciLCJpYXQiOjE3NjE4NjY2NjIsImV4cCI6MTc5MzQwMjY2Mn0.ZBghlkygRBJvUGVZoIkfJeY5P-rbEwVWuE2XYJ-4jmE",
              }}
              className="w-full h-64 rounded-2xl"
              resizeMode="cover"
            />
          </View>
          <Text className="text-gray-700 text-base leading-7 mb-4">
            Our cooperative was founded to bridge the gap between local farmers
            and the community by offering fresh vegetables, fruits, and rice
            grains at fair and affordable prices.
          </Text>
          <Text className="text-gray-700 text-base leading-7">
            By shopping with us, you are not just buying produce — you are
            helping sustain livelihoods, promote sustainable farming practices,
            and strengthen community ties.
          </Text>
        </View>

        {/* Mission Vision Values Section */}
        <View className="bg-amber-50 py-8 px-6">
          <Text className="text-3xl font-bold text-green-800 text-center mb-8">
            Mission, Vision & Values
          </Text>

          {/* Mission Card */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <View className="items-center mb-4">
              <Image
                source={{
                  uri: "https://xcbgiyiklnoigcixjdxa.supabase.co/storage/v1/object/sign/bayancoop_assets/mission.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZmZkNmJiZC1hZWZhLTRkZGQtODllZS1kYzhjYzQ0ZGFjNDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiYXlhbmNvb3BfYXNzZXRzL21pc3Npb24ucG5nIiwiaWF0IjoxNzYxODY4Nzc3LCJleHAiOjE3OTM0MDQ3Nzd9.ZoxxO3kg42hpv-Eg0wp0eimK4ULXePU4JMXHOsTMylw",
                }}
                className="w-20 h-20"
                resizeMode="contain"
              />
            </View>
            <Text className="text-xl font-bold text-green-700 text-center mb-3">
              Mission
            </Text>
            <Text className="text-gray-700 text-center leading-6">
              Empowering farmers and communities with fresh, affordable produce
              built on fairness, sustainability, and cooperation.
            </Text>
          </View>

          {/* Vision Card */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <View className="items-center mb-4">
              <Image
                source={{
                  uri: "https://xcbgiyiklnoigcixjdxa.supabase.co/storage/v1/object/sign/bayancoop_assets/vision.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZmZkNmJiZC1hZWZhLTRkZGQtODllZS1kYzhjYzQ0ZGFjNDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiYXlhbmNvb3BfYXNzZXRzL3Zpc2lvbi5wbmciLCJpYXQiOjE3NjE4Njg2MzUsImV4cCI6MTc5MzQwNDYzNX0.HEpPpe_XQlJ3Vo5UNOjMjSDzTh7xHwsKkPkhn2FGpjA",
                }}
                className="w-24 h-20"
                resizeMode="contain"
              />
            </View>
            <Text className="text-xl font-bold text-green-700 text-center mb-3">
              Vision
            </Text>
            <Text className="text-gray-700 text-center leading-6">
              A community where farmers thrive, families enjoy fresh food, and
              cooperatives build a sustainable future.
            </Text>
          </View>

          {/* Values Card */}
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <View className="items-center mb-4">
              <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center">
                <Text className="text-3xl font-bold text-green-700">✓</Text>
              </View>
            </View>
            <Text className="text-xl font-bold text-green-700 text-center mb-3">
              Values
            </Text>
            <Text className="text-gray-700 text-center leading-6">
              Community, fairness, sustainability, integrity, quality,
              empowerment, and cooperation.
            </Text>
          </View>
        </View>

        {/* Our History Section */}
        <View className="bg-amber-50 py-8 px-6">
          <Text className="text-3xl font-bold text-green-800 text-center mb-8">
            Our History
          </Text>

          {/* Timeline Item 1 */}
          <View className="flex-row mb-8">
            <View className="w-1/12 items-center">
              <View className="w-10 h-10 bg-green-700 rounded-full items-center justify-center">
                <Text className="text-white font-bold text-lg">1</Text>
              </View>
              <View className="w-1 bg-green-300 flex-1 mt-2" />
            </View>
            <View className="w-11/12 pl-4">
              <Text className="text-lg font-bold text-green-700 mb-2">
                Founded with a Purpose (2020)
              </Text>
              <Text className="text-gray-700 leading-6 mb-4">
                The cooperative was formed by local farmers and community
                members with a shared vision of bringing fresh, affordable
                produce directly to households.
              </Text>
              <Image
                source={{
                  uri: "https://xcbgiyiklnoigcixjdxa.supabase.co/storage/v1/object/sign/bayancoop_assets/hPurpose.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZmZkNmJiZC1hZWZhLTRkZGQtODllZS1kYzhjYzQ0ZGFjNDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiYXlhbmNvb3BfYXNzZXRzL2hQdXJwb3NlLnBuZyIsImlhdCI6MTc2MTg3NDU4OSwiZXhwIjoxNzkzNDEwNTg5fQ.Efl8Au4aFmUa1F7uDeU4opwr83kCCELKMyqgpcPaGAQ",
                }}
                className="w-full h-48 rounded-2xl"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Timeline Item 2 */}
          <View className="flex-row mb-8">
            <View className="w-1/12 items-center">
              <View className="w-10 h-10 bg-green-700 rounded-full items-center justify-center">
                <Text className="text-white font-bold text-lg">2</Text>
              </View>
              <View className="w-1 bg-green-300 flex-1 mt-2" />
            </View>
            <View className="w-11/12 pl-4">
              <Text className="text-lg font-bold text-green-700 mb-2">
                Growing Together (2023)
              </Text>
              <Text className="text-gray-700 leading-6 mb-4">
                Expanded services to include rice milling and delivery,
                strengthening farmer support and making farm-to-table living
                more accessible.
              </Text>
              <Image
                source={{
                  uri: "https://xcbgiyiklnoigcixjdxa.supabase.co/storage/v1/object/sign/bayancoop_assets/hTogether.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZmZkNmJiZC1hZWZhLTRkZGQtODllZS1kYzhjYzQ0ZGFjNDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiYXlhbmNvb3BfYXNzZXRzL2hUb2dldGhlci5wbmciLCJpYXQiOjE3NjE4NzQ2MTcsImV4cCI6MTc5MzQxMDYxN30.xUBPhV0vtmqfvdl7PT5XTv3sGampN5sjpnO8yeVLqJg",
                }}
                className="w-full h-48 rounded-2xl"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Timeline Item 3 */}
          <View className="flex-row">
            <View className="w-1/12 items-center">
              <View className="w-10 h-10 bg-green-700 rounded-full items-center justify-center">
                <Text className="text-white font-bold text-lg">3</Text>
              </View>
            </View>
            <View className="w-11/12 pl-4">
              <Text className="text-lg font-bold text-green-700 mb-2">
                Sustaining the Future (2025)
              </Text>
              <Text className="text-gray-700 leading-6 mb-4">
                Serving the community with fresh vegetables, fruits, and rice
                grains while continuing to promote sustainability and
                cooperation.
              </Text>
              <Image
                source={{
                  uri: "https://xcbgiyiklnoigcixjdxa.supabase.co/storage/v1/object/sign/bayancoop_assets/hFuture.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZmZkNmJiZC1hZWZhLTRkZGQtODllZS1kYzhjYzQ0ZGFjNDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiYXlhbmNvb3BfYXNzZXRzL2hGdXR1cmUucG5nIiwiaWF0IjoxNzYyMzQ2NTc4LCJleHAiOjMxNTUzNjIzNDY1Nzh9.RVTkuT19MOnPwFZqv2_midYSXOG2SfM9mqB9LYu69v8",
                }}
                className="w-full h-48 rounded-2xl"
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View className="bg-white py-8 px-6">
          <Text className="text-3xl font-bold text-green-800 text-center mb-6">
            Get in Touch
          </Text>
          <View className="bg-green-50 rounded-2xl p-6">
            <Text className="text-lg font-semibold text-green-800 text-center mb-4">
              We&apos;d love to hear from you!
            </Text>
            <Text className="text-gray-700 text-center leading-6">
              Have questions about our cooperative or want to join our
              community? Reach out to us through our contact channels.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/users/Contact")}
              className="bg-green-700 rounded-xl py-4 px-6 flex-row items-center justify-center mt-4"
            >
              <Ionicons
                name="mail"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white text-lg font-semibold">
                Contact Us
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
