import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Contact() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "General Inquiry",
      message: "",
    },
  });
  const router = useRouter();

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
    Alert.alert(
      "Message Sent!",
      "Thank you for contacting us. We'll get back to you soon.",
      [{ text: "OK" }]
    );
    reset();
  };

  const subjects = [
    "General Inquiry",
    "Product Support",
    "Billing Issue",
    "Technical Support",
    "Partnership",
    "Other",
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with Back Arrow */}
        <View className="bg-green-600 px-6 pt-16 pb-12">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              className="w-10 h-10 bg-green-700 rounded-full items-center justify-center mr-3"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white text-center">
                Contact Us
              </Text>
            </View>
            <View className="w-10" /> {/* Spacer for balance */}
          </View>
          <Text className="text-green-100 text-center text-base mt-2">
            Get in touch with our team
          </Text>
        </View>

        {/* Contact Form */}
        <View className="px-6 py-8 -mt-6">
          <View className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Send us a message
            </Text>
            <Text className="text-gray-500 mb-6">
              Fill out the form below and we'll get back to you as soon as
              possible.
            </Text>

            {/* First Name */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2">
                First Name
              </Text>
              <Controller
                control={control}
                rules={{
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "First name must be at least 2 characters",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`border-2 rounded-xl px-4 py-4 bg-white ${
                      errors.firstName ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="Enter your first name"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="firstName"
              />
              {errors.firstName && (
                <Text className="text-red-500 text-sm mt-2 ml-1">
                  {errors.firstName.message}
                </Text>
              )}
            </View>

            {/* Last Name */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2">
                Last Name
              </Text>
              <Controller
                control={control}
                rules={{
                  required: "Last name is required",
                  minLength: {
                    value: 2,
                    message: "Last name must be at least 2 characters",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`border-2 rounded-xl px-4 py-4 bg-white ${
                      errors.lastName ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="Enter your last name"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="lastName"
              />
              {errors.lastName && (
                <Text className="text-red-500 text-sm mt-2 ml-1">
                  {errors.lastName.message}
                </Text>
              )}
            </View>

            {/* Email */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2">
                Email Address
              </Text>
              <Controller
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Enter a valid email address",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`border-2 rounded-xl px-4 py-4 bg-white ${
                      errors.email ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="your.email@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="email"
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mt-2 ml-1">
                  {errors.email.message}
                </Text>
              )}
            </View>

            {/* Phone */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2">
                Phone Number
              </Text>
              <Controller
                control={control}
                rules={{
                  pattern: {
                    value: /^[0-9+\-\s()]*$/,
                    message: "Enter a valid phone number",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`border-2 rounded-xl px-4 py-4 bg-white ${
                      errors.phone ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="phone"
              />
              {errors.phone && (
                <Text className="text-red-500 text-sm mt-2 ml-1">
                  {errors.phone.message}
                </Text>
              )}
            </View>

            {/* Subject */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2">Subject</Text>
              <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                  <View className="border-2 border-gray-200 rounded-xl bg-white">
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="p-3"
                    >
                      <View className="flex-row space-x-3">
                        {subjects.map((subject) => (
                          <TouchableOpacity
                            key={subject}
                            onPress={() => onChange(subject)}
                            className={`px-5 py-3 rounded-xl ${
                              value === subject
                                ? "bg-green-500 shadow-sm"
                                : "bg-gray-50"
                            }`}
                          >
                            <Text
                              className={`font-semibold ${
                                value === subject
                                  ? "text-white"
                                  : "text-gray-700"
                              }`}
                            >
                              {subject}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}
                name="subject"
              />
            </View>

            {/* Message */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">Message</Text>
              <Controller
                control={control}
                rules={{
                  required: "Message is required",
                  minLength: {
                    value: 10,
                    message: "Message must be at least 10 characters",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`border-2 rounded-xl px-4 py-4 bg-white min-h-[140px] text-left align-top ${
                      errors.message ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="Type your message here..."
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="message"
              />
              {errors.message && (
                <Text className="text-red-500 text-sm mt-2 ml-1">
                  {errors.message.message}
                </Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              className="bg-green-600 rounded-xl py-5 shadow-lg active:bg-green-700"
            >
              <Text className="text-white text-center font-bold text-lg">
                Send Message
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contact Information */}
          <View className="bg-gray-50 rounded-3xl p-6 mt-8 border border-gray-200">
            <Text className="text-xl font-bold text-gray-900 mb-6">
              Other Ways to Reach Us
            </Text>

            <View className="space-y-5">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-4">
                  <MaterialIcons name="email" size={24} color="#16a34a" />
                </View>
                <View>
                  <Text className="text-gray-500 text-sm">Email</Text>
                  <Text className="text-gray-900 font-semibold text-base">
                    support@cooperativefarming.com
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-4">
                  <FontAwesome name="phone" size={24} color="#16a34a" />
                </View>
                <View>
                  <Text className="text-gray-500 text-sm">Phone</Text>
                  <Text className="text-gray-900 font-semibold text-base">
                    +1 (555) 123-4567
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-4">
                  <Ionicons name="location" size={24} color="#16a34a" />
                </View>
                <View>
                  <Text className="text-gray-500 text-sm">Address</Text>
                  <Text className="text-gray-900 font-semibold text-base">
                    123 Farm Street, Agriculture City
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
