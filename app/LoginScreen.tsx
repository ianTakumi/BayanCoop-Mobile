import { login, setOnboarded } from "@/redux/slices/authSlice";
import client from "@/utils/axiosInstance";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

const LoginScreen: React.FC = () => {
  const router = useRouter();
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

  const onSubmit = async (data) => {
    await client
      .post("/auth/user-login", data)
      .then((res) => {
        if (res.status === 200 && res.data.user.role === "user") {
          dispatch(
            login({
              user: {
                id: res.data.user.id,
                first_name: res.data.user.first_name,
                last_name: res.data.user.last_name,
                email: res.data.user.email,
                phone: res.data.user.phone,
                role: res.data.user.role,
              },
              token: res.data.session.access_token,
            })
          );

          dispatch(setOnboarded());

          router.replace("/users/(drawers)/(tabs)");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Invalid email or password. Please try again.");
      });
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-16">
      <Image
        source={require("../assets/images/login.png")}
        className="w-full h-56 mb-8"
        resizeMode="contain"
      />

      <Text className="text-2xl font-semibold text-gray-800 mb-1">
        Getting Started
      </Text>
      <Text className="text-gray-400 mb-6">
        Let&apos;s login for explore continues
      </Text>

      {/* Email */}
      <Text className="text-gray-700 mb-2">Email</Text>
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
            onChangeText={onChange}
            placeholder="example@gmail.com"
            keyboardType="email-address"
            className={`border rounded-xl px-4 py-3 mb-1 ${
              errors.email ? "border-red-400" : "border-gray-300"
            }`}
          />
        )}
      />

      {errors.email && (
        <Text className="text-red-500 text-sm mb-3">
          {errors.email.message}
        </Text>
      )}

      <Text className="text-gray-700 mb-2">Password</Text>
      <Controller
        control={control}
        name="password"
        rules={{
          required: "Password is required",
          minLength: {
            value: 8,
            message: "Password must be atleast 8 characters",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Enter your password"
            secureTextEntry
            className={`border rounded-xl px-4 py-3 mb-1 ${
              errors.password ? "border-red-400" : "border-gray-300"
            }`}
          />
        )}
      />

      {errors.password && (
        <Text className="text-red-500 text-sm mb-3">
          {errors.password.message}
        </Text>
      )}

      <TouchableOpacity
        className="mb-6 self-end"
        onPress={() => router.push("/ForgotPassword")}
      >
        <Text className="text-green-600 text-sm font-medium">
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        className={`rounded-xl py-3 ${
          isSubmitting ? "bg-green-300" : "bg-green-500"
        }`}
      >
        <Text className="text-white text-center font-semibold text-base">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-6">
        <Text className="text-gray-500">Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/RegisterScreen")}>
          {/* ✅ Expo Router navigation */}
          <Text className="text-green-600 font-medium">Sign up here</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;
