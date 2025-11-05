import { logout } from "@/redux/slices/authSlice";
import ActionSheetHelper from "@/utils/ActionSheetHelper";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Modal,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function Profile() {
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  const dispatch = useDispatch();

  // Mock user data
  const userData = {
    name: "Itunuoluwa Abidoye",
    username: "@itunuoluwa",
    email: "itunuoluwa@example.com",
  };

  const [faceIdEnabled, setFaceIdEnabled] = React.useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    dispatch(logout());
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleLogout = (): void => {
    ActionSheetHelper.showLogoutConfirmation(() => {
      dispatch(logout());
      router.push("/LoginScreen");
    });
  };

  if (!user) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 pt-5">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 ">
        <Text className="text-2xl font-bold text-gray-900 ">Profile</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-[#4CAF50] mx-4 py-8 items-center border-b border-gray-200 rounded-xl">
          <View className="bg-white w-20 h-20 rounded-full items-center justify-center mb-4">
            <Text className="text-black text-2xl font-bold">
              {userData.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>
          <Text className="text-xl font-bold text-white mb-1">
            {user.first_name + " " + user.last_name}
          </Text>
          <Text className="text-gray-500 text-base">{user.email}</Text>
        </View>

        {/* My Account Section */}
        <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              My Account
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Make changes to your account
            </Text>
          </View>

          {/* Account Items */}
          <TouchableOpacity className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200">
            <View className="flex-row items-center">
              <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="person-outline" size={20} color="#10B981" />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Personal Information
                </Text>
                <Text className="text-gray-500 text-sm">
                  Update your personal details
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200">
            <View className="flex-row items-center">
              <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#10B981"
                />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Change Password
                </Text>
                <Text className="text-gray-500 text-sm">
                  Update your password
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Security Section */}
        <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              Security
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Manage your account security
            </Text>
          </View>

          {/* Saved Beneficiary */}
          <TouchableOpacity className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200">
            <View className="flex-row items-center">
              <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <FontAwesome name="user-o" size={18} color="#10B981" />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Saved Beneficiary
                </Text>
                <Text className="text-gray-500 text-sm">
                  Manage your saved account
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Face ID / Touch ID */}
          <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200">
            <View className="flex-row items-center">
              <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons
                  name="finger-print-outline"
                  size={20}
                  color="#10B981"
                />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Face ID / Touch ID
                </Text>
                <Text className="text-gray-500 text-sm">
                  Manage your device security
                </Text>
              </View>
            </View>
            <Switch
              value={faceIdEnabled}
              onValueChange={setFaceIdEnabled}
              trackColor={{ false: "#D1D5DB", true: "#10B981" }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Two-Factor Authentication */}
          <View className="px-6 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <MaterialIcons name="security" size={20} color="#10B981" />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Two-Factor Authentication
                </Text>
                <Text className="text-gray-500 text-sm">
                  Further secure your account for safety
                </Text>
              </View>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: "#D1D5DB", true: "#10B981" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Log Out */}
        <TouchableOpacity
          className="bg-white mt-6 mx-4 rounded-2xl px-6 py-4 flex-row items-center justify-between border border-gray-200"
          onPress={handleLogout} // Pwedeng palitan ng handleLogoutWithAlert para mas simple
        >
          <View className="flex-row items-center">
            <View className="bg-red-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <View>
              <Text className="text-red-600 font-medium">Log out</Text>
              <Text className="text-gray-500 text-sm">
                Further secure your account for safety
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* More Section */}
        <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200 mb-8">
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">More</Text>
          </View>

          {/* Help & Support */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.replace("/users/Contact")}
          >
            <View className="flex-row items-center">
              <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color="#10B981"
                />
              </View>
              <Text className="text-gray-900 font-medium">Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* About App */}
          <TouchableOpacity className="px-6 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#10B981"
                />
              </View>
              <Text className="text-gray-900 font-medium">About App</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutModal}
        onRequestClose={cancelLogout}
      >
        <TouchableWithoutFeedback onPress={cancelLogout}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-2xl p-6 mx-4 w-80">
                <Text className="text-xl font-bold text-gray-900 text-center mb-2">
                  Confirm Logout
                </Text>
                <Text className="text-gray-600 text-center mb-6">
                  Are you sure you want to logout?
                </Text>
                <View className="flex-row justify-between space-x-3">
                  <TouchableOpacity
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
                    onPress={cancelLogout}
                  >
                    <Text className="text-gray-700 font-medium text-center">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 py-3 px-4 bg-red-600 rounded-xl"
                    onPress={confirmLogout}
                  >
                    <Text className="text-white font-medium text-center">
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
