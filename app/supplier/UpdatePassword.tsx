import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import client from "../../utils/axiosInstance";

// Expo Icons
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

export default function UpdatePassword() {
  const user = useSelector((state: any) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const newPassword = watch("newPassword");

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const checkPasswordStrength = (password: string) => {
    if (!password) return { score: 0, message: "", color: "text-gray-500" };

    let score = 0;
    let message = "";
    let color = "text-red-500";

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        message = "Very Weak";
        color = "text-red-500";
        break;
      case 2:
        message = "Weak";
        color = "text-orange-500";
        break;
      case 3:
        message = "Good";
        color = "text-yellow-500";
        break;
      case 4:
        message = "Strong";
        color = "text-green-500";
        break;
      case 5:
        message = "Very Strong";
        color = "text-green-600";
        break;
      default:
        message = "";
        color = "text-gray-500";
    }

    return { score, message, color };
  };

  const passwordStrength = checkPasswordStrength(newPassword);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await client.put(`/auth/update-password/${user.id}`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (response.status === 200) {
        Alert.alert("Password changed successfully!");
        router.back();
      }
    } catch (error: any) {
      console.error("Password change error:", error);
      Alert.alert(
        error.response?.data?.message ||
          "Failed to change password. Please check your current password and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="bg-green-500 pt-16 pb-6 px-6 rounded-b-3xl shadow-lg">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={goBack} className="mr-4 p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">
              Change Password
            </Text>
            <Text className="text-green-100 mt-1 text-sm">
              Secure your account with a new password
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-8">
        <View className="max-w-md mx-auto w-full">
          {/* Security Card */}
          <View className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 bg-green-100 rounded-full justify-center items-center mr-4">
                <MaterialIcons name="lock" size={24} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800">
                  Password Security
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  Create a strong password to protect your account
                </Text>
              </View>
            </View>

            {/* Current Password */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Current Password
              </Text>
              <Controller
                control={control}
                rules={{
                  required: "Current password is required",
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="relative">
                    <TextInput
                      secureTextEntry={!showPassword.current}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      className={`w-full px-4 py-3 border rounded-xl text-base ${
                        errors.currentPassword
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-green-500"
                      }`}
                      placeholder="Enter your current password"
                      placeholderTextColor="#9ca3af"
                      style={{ color: "#000000" }}
                    />
                    <TouchableOpacity
                      onPress={() => togglePasswordVisibility("current")}
                      className="absolute right-3 top-3"
                    >
                      {showPassword.current ? (
                        <Ionicons name="eye-off" size={20} color="#6b7280" />
                      ) : (
                        <Ionicons name="eye" size={20} color="#6b7280" />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
                name="currentPassword"
              />
              {errors.currentPassword && (
                <Text className="text-red-500 text-xs mt-2">
                  {errors.currentPassword.message}
                </Text>
              )}
            </View>

            {/* New Password */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                New Password
              </Text>
              <Controller
                control={control}
                rules={{
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message:
                      "Must include uppercase, lowercase, number & special character",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="relative">
                    <TextInput
                      secureTextEntry={!showPassword.new}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      className={`w-full px-4 py-3 border rounded-xl text-base ${
                        errors.newPassword
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-green-500"
                      }`}
                      placeholder="Create a new password"
                      placeholderTextColor="#9ca3af"
                      style={{ color: "#000000" }}
                    />
                    <TouchableOpacity
                      onPress={() => togglePasswordVisibility("new")}
                      className="absolute right-3 top-3"
                    >
                      {showPassword.new ? (
                        <Ionicons name="eye-off" size={20} color="#6b7280" />
                      ) : (
                        <Ionicons name="eye" size={20} color="#6b7280" />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
                name="newPassword"
              />
              {errors.newPassword && (
                <Text className="text-red-500 text-xs mt-2">
                  {errors.newPassword.message}
                </Text>
              )}

              {/* Password Strength Indicator */}
              {newPassword && (
                <View className="mt-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm text-gray-600">
                      Password Strength:
                    </Text>
                    <Text
                      className={`text-sm font-medium ${passwordStrength.color}`}
                    >
                      {passwordStrength.message}
                    </Text>
                  </View>
                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <View
                      className={`h-full ${
                        passwordStrength.score === 1
                          ? "bg-red-500 w-1/5"
                          : passwordStrength.score === 2
                            ? "bg-orange-500 w-2/5"
                            : passwordStrength.score === 3
                              ? "bg-yellow-500 w-3/5"
                              : passwordStrength.score === 4
                                ? "bg-green-500 w-4/5"
                                : passwordStrength.score === 5
                                  ? "bg-green-600 w-full"
                                  : "w-0"
                      }`}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View className="mb-8">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </Text>
              <Controller
                control={control}
                rules={{
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === newPassword || "Passwords do not match",
                }}
                render={({ field: { onChange, onBlur, value } }) => {
                  const hasError = errors.confirmPassword;
                  const isValid = value && value === newPassword;

                  return (
                    <View className="relative">
                      <TextInput
                        secureTextEntry={!showPassword.confirm}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        className={`w-full px-4 py-3 border rounded-xl text-base ${
                          hasError
                            ? "border-red-500 focus:border-red-500"
                            : isValid
                              ? "border-green-500 focus:border-green-500"
                              : "border-gray-300 focus:border-green-500"
                        }`}
                        placeholder="Confirm your new password"
                        placeholderTextColor="#9ca3af"
                        style={{ color: "#000000" }}
                      />
                      <TouchableOpacity
                        onPress={() => togglePasswordVisibility("confirm")}
                        className="absolute right-3 top-3"
                      >
                        {showPassword.confirm ? (
                          <Ionicons name="eye-off" size={20} color="#6b7280" />
                        ) : (
                          <Ionicons name="eye" size={20} color="#6b7280" />
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                }}
                name="confirmPassword"
              />
              {errors.confirmPassword ? (
                <Text className="text-red-500 text-xs mt-2">
                  {errors.confirmPassword.message}
                </Text>
              ) : watch("confirmPassword") &&
                watch("confirmPassword") === newPassword ? (
                <Text className="text-green-600 text-sm mt-2 flex-row items-center">
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    className="mr-1"
                  />
                  Passwords match
                </Text>
              ) : null}
            </View>

            {/* Password Requirements */}
            <View className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
              <Text className="font-medium text-blue-800 mb-3">
                Password Requirements:
              </Text>
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <MaterialIcons
                    name={
                      newPassword?.length >= 8
                        ? "check-circle"
                        : "radio-button-unchecked"
                    }
                    size={16}
                    color={newPassword?.length >= 8 ? "#22c55e" : "#1e3a8a"}
                    className="mr-2"
                  />
                  <Text
                    className={`text-sm ${newPassword?.length >= 8 ? "text-green-600" : "text-blue-900"}`}
                  >
                    At least 8 characters long
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MaterialIcons
                    name={
                      /[A-Z]/.test(newPassword)
                        ? "check-circle"
                        : "radio-button-unchecked"
                    }
                    size={16}
                    color={/[A-Z]/.test(newPassword) ? "#22c55e" : "#1e3a8a"}
                    className="mr-2"
                  />
                  <Text
                    className={`text-sm ${/[A-Z]/.test(newPassword) ? "text-green-600" : "text-blue-900"}`}
                  >
                    Contains uppercase letters
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MaterialIcons
                    name={
                      /[a-z]/.test(newPassword)
                        ? "check-circle"
                        : "radio-button-unchecked"
                    }
                    size={16}
                    color={/[a-z]/.test(newPassword) ? "#22c55e" : "#1e3a8a"}
                    className="mr-2"
                  />
                  <Text
                    className={`text-sm ${/[a-z]/.test(newPassword) ? "text-green-600" : "text-blue-900"}`}
                  >
                    Contains lowercase letters
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MaterialIcons
                    name={
                      /[0-9]/.test(newPassword)
                        ? "check-circle"
                        : "radio-button-unchecked"
                    }
                    size={16}
                    color={/[0-9]/.test(newPassword) ? "#22c55e" : "#1e3a8a"}
                    className="mr-2"
                  />
                  <Text
                    className={`text-sm ${/[0-9]/.test(newPassword) ? "text-green-600" : "text-blue-900"}`}
                  >
                    Contains numbers
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MaterialIcons
                    name={
                      /[^A-Za-z0-9]/.test(newPassword)
                        ? "check-circle"
                        : "radio-button-unchecked"
                    }
                    size={16}
                    color={
                      /[^A-Za-z0-9]/.test(newPassword) ? "#22c55e" : "#1e3a8a"
                    }
                    className="mr-2"
                  />
                  <Text
                    className={`text-sm ${/[^A-Za-z0-9]/.test(newPassword) ? "text-green-600" : "text-blue-900"}`}
                  >
                    Contains special characters (!@#$%^&*)
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={goBack}
                className="flex-1 bg-gray-100 py-3 rounded-xl"
              >
                <Text className="text-center text-gray-700 font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                className={`flex-1 py-3 rounded-xl ${
                  loading ? "bg-gray-400" : "bg-[#008321]"
                }`}
              >
                {loading ? (
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name="refresh"
                      size={20}
                      color="white"
                      className="mr-2"
                    />
                    <Text className="text-center text-white font-medium">
                      Changing...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-center text-white font-medium">
                    Change Password
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Security Tips */}
          <View className="bg-white rounded-3xl shadow-lg p-6 mb-10">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              🔒 Security Tips
            </Text>
            <View className="space-y-4">
              <View className="flex-row items-start">
                <View className="w-6 h-6 bg-green-100 rounded-full justify-center items-center mr-3 mt-1">
                  <Text className="text-green-600 text-xs font-bold">1</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-800 mb-1">
                    Use a Unique Password
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Don't reuse passwords from other accounts
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <View className="w-6 h-6 bg-green-100 rounded-full justify-center items-center mr-3 mt-1">
                  <Text className="text-green-600 text-xs font-bold">2</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-800 mb-1">
                    Update Regularly
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Change your password every 3-6 months
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <View className="w-6 h-6 bg-green-100 rounded-full justify-center items-center mr-3 mt-1">
                  <Text className="text-green-600 text-xs font-bold">3</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-800 mb-1">
                    Enable Two-Factor Auth
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Add an extra layer of security to your account
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
