import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { TextInput } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import client from "@/utils/axiosInstance";

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPassword() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      await client.post("/auth/forgot-password", {
        email: data.email,
      });

      alert("Password reset email sent! Please check your inbox.");
      router.back();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to send reset email");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-12">
        {/* Header with Icon */}
        <View className="mb-12 items-center">
          <View className="bg-green-100 p-4 rounded-full mb-4">
            <Ionicons name="key" size={32} color="#16a34a" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Forgot Password
          </Text>
          <Text className="text-lg text-gray-600 text-center">
            Enter your email address and we&apos;ll send you a reset link
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-6">
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Email Address
            </Text>
            <View className="relative">
              <Controller
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      className={`border-2 rounded-lg px-4 py-4 text-base pl-12 ${
                        errors.email
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-green-500"
                      }`}
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={errors.email ? "#ef4444" : "#9ca3af"}
                      className="absolute left-4 top-4"
                    />
                  </View>
                )}
                name="email"
              />
            </View>
            {errors.email && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="warning" size={16} color="#ef4444" />
                <Text className="text-red-500 text-sm ml-1">
                  {errors.email.message}
                </Text>
              </View>
            )}
          </View>

          {/* Submit Button with Icon */}
          <TouchableOpacity
            className={`bg-green-600 rounded-lg py-4 flex-row justify-center items-center ${
              isSubmitting ? "opacity-50" : ""
            }`}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Ionicons
                name="refresh"
                size={20}
                color="white"
                className="mr-2"
              />
            ) : (
              <Ionicons name="send" size={20} color="white" className="mr-2" />
            )}
            <Text className="text-white text-lg font-semibold">
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Text>
          </TouchableOpacity>

          {/* Back to Login with Icon */}
          <TouchableOpacity
            className="py-4 flex-row justify-center items-center"
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color="#16a34a"
              className="mr-2"
            />
            <Text className="text-green-600 text-base font-medium">
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Box with Icon */}
        <View className="mt-8 bg-green-50 rounded-lg p-4 border border-green-200">
          <View className="flex-row items-start">
            <Ionicons
              name="information-circle"
              size={20}
              color="#166534"
              className="mr-2 mt-0.5"
            />
            <Text className="text-green-800 text-sm flex-1">
              You&apos;ll receive an email with a password reset link. Click the
              link to create a new password.
            </Text>
          </View>
        </View>

        {/* Success/Error Icons for different states */}
        {isSubmitting && (
          <View className="mt-6 flex-row justify-center items-center">
            <Ionicons name="time" size={24} color="#16a34a" className="mr-2" />
            <Text className="text-green-600 text-sm">
              Sending reset link...
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
