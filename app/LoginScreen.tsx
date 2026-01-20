import { login, setOnboarded } from "@/redux/slices/authSlice";
import client from "@/utils/axiosInstance";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { hasOnboarded } = useSelector((state: any) => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const dispatch = useDispatch();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const onSubmit = async (data: any) => {
    // Trim the data before sending to API
    const trimmedData = {
      email: data.email.trim(),
      password: data.password.trim(),
    };

    await client
      .post("/auth/user-login", trimmedData)
      .then((res) => {
        if (res.status === 200) {
          const user = res.data.user;
          dispatch(
            login({
              user: res.data.user,
              access_token: res.data.session.access_token,
              refresh_token: res.data.session.refresh_token,
            })
          );

          if (user.role === "user") {
            router.replace("/users/(drawers)/(tabs)");
          } else if (user.role === "supplier") {
            router.replace("/supplier/(drawers)/(tabs)/Index");
          }
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Invalid email or password. Please try again.");
      });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : 20,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustContentInsets={false}
        keyboardDismissMode="on-drag"
      >
        <View className="px-6 pt-10 pb-6">
          {/* Logo Section - Hide when keyboard is visible */}
          {!isKeyboardVisible && (
            <View className="items-center mb-8">
              <Image
                source={require("../assets/images/LogoWithName.png")}
                className="w-60 h-60"
                resizeMode="contain"
              />
            </View>
          )}

          {/* Welcome Section */}
          <View className={`${isKeyboardVisible ? "mb-4" : "mb-8"}`}>
            <Text className="text-3xl font-bold text-gray-800 mb-2">
              {hasOnboarded ? "Welcome Back!" : "Welcome!"}
            </Text>
            <Text className="text-gray-500 text-base">
              {hasOnboarded
                ? "Sign in to continue to your account."
                : "Sign in to continue to your account or sign up if you don't have one."}
            </Text>
          </View>

          {/* Form Section */}
          <View>
            {/* Email */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Email</Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Enter a valid email address",
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={(text) => onChange(text.replace(/\s/g, ""))}
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className={`border rounded-xl px-4 py-4 text-base ${
                      errors.email ? "border-red-400" : "border-gray-300"
                    }`}
                    style={{ color: "black" }}
                    returnKeyType="next"
                    enablesReturnKeyAutomatically
                    onFocus={() => {
                      // Scroll to input if needed
                    }}
                  />
                )}
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </Text>
              )}
            </View>

            {/* Password */}
            <View className="mb-2">
              <Text className="text-gray-700 mb-2 font-medium">Password</Text>
              <View className="relative">
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={(text) => onChange(text.replace(/\s/g, ""))}
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      className={`border rounded-xl px-4 py-4 text-base pr-12 ${
                        errors.password ? "border-red-400" : "border-gray-300"
                      }`}
                      style={{ color: "black" }}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(onSubmit)}
                      onFocus={() => {
                        // Scroll to input if needed
                      }}
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={toggleShowPassword}
                  className="absolute right-4 top-4"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </Text>
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              className="mb-6 self-end"
              onPress={() => router.push("/ForgotPassword")}
              activeOpacity={0.7}
            >
              <Text className="text-green-600 text-sm font-semibold">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
              className={`rounded-xl py-4 mb-6 ${
                isSubmitting ? "bg-green-300" : "bg-green-500"
              } flex-row justify-center items-center`}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white text-center font-bold text-base">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link - Hide when keyboard is visible */}
            {!isKeyboardVisible && (
              <View className="flex-row justify-center mt-4">
                <Text className="text-gray-500">
                  Don&apos;t have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/RegisterScreen")}
                  activeOpacity={0.7}
                >
                  <Text className="text-green-600 font-bold">Sign Up</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Add extra space at bottom when keyboard is visible */}
      {isKeyboardVisible && <View style={{ height: 20 }} />}
    </View>
  );
};

export default LoginScreen;
