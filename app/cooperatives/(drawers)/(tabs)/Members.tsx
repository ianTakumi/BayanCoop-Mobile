import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Types
type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: "active" | "inactive" | "pending";
  shares: number;
};

type MemberStats = {
  total: number;
  active: number;
  pending: number;
  inactive: number;
};

// Mock data
const mockMembers: Member[] = [
  {
    id: "1",
    name: "Juan Dela Cruz",
    email: "juan.delacruz@email.com",
    phone: "+63 912 345 6789",
    joinDate: "2023-01-15",
    status: "active",
    shares: 5000,
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "+63 917 890 1234",
    joinDate: "2023-02-20",
    status: "active",
    shares: 7500,
  },
  {
    id: "3",
    name: "Pedro Reyes",
    email: "pedro.reyes@email.com",
    phone: "+63 918 567 8901",
    joinDate: "2023-03-10",
    status: "pending",
    shares: 0,
  },
  {
    id: "4",
    name: "Ana Lopez",
    email: "ana.lopez@email.com",
    phone: "+63 919 234 5678",
    joinDate: "2022-11-05",
    status: "active",
    shares: 12000,
  },
  {
    id: "5",
    name: "Miguel Garcia",
    email: "miguel.garcia@email.com",
    phone: "+63 920 876 5432",
    joinDate: "2023-04-01",
    status: "inactive",
    shares: 2500,
  },
  {
    id: "6",
    name: "Sofia Martinez",
    email: "sofia.martinez@email.com",
    phone: "+63 921 345 6789",
    joinDate: "2023-05-12",
    status: "active",
    shares: 15000,
  },
];

export default function MembersScreen() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | Member["status"]
  >("all");
  const [refreshing, setRefreshing] = useState(false);

  // Calculate statistics
  const stats: MemberStats = {
    total: members.length,
    active: members.filter((m) => m.status === "active").length,
    pending: members.filter((m) => m.status === "pending").length,
    inactive: members.filter((m) => m.status === "inactive").length,
  };

  // Filter members based on search and status
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || member.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert("Success", "Members list updated!");
    }, 1500);
  };

  const handleMemberPress = (member: Member) => {
    Alert.alert(
      "Member Details",
      `Name: ${member.name}\nEmail: ${member.email}\nPhone: ${member.phone}\nStatus: ${member.status}\nShares: ₱${member.shares.toLocaleString()}`,
      [{ text: "OK" }]
    );
  };

  const getStatusColor = (status: Member["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 border-green-500";
      case "pending":
        return "bg-amber-100 border-amber-500";
      case "inactive":
        return "bg-red-100 border-red-500";
      default:
        return "bg-gray-100 border-gray-500";
    }
  };

  const getStatusTextColor = (status: Member["status"]) => {
    switch (status) {
      case "active":
        return "text-green-800";
      case "pending":
        return "text-amber-800";
      case "inactive":
        return "text-red-800";
      default:
        return "text-gray-800";
    }
  };

  return (
    <View className="flex-1 bg-green-50">
      {/* Header with Green Theme */}
      <View className="bg-green-600 px-6 pt-12 pb-6 shadow-lg">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">Members</Text>
            <Text className="text-green-100 mt-1">
              Manage cooperative members
            </Text>
          </View>
          <View className="bg-green-400 p-2 rounded-full">
            <Ionicons name="people" size={24} color="white" />
          </View>
        </View>
      </View>

      {/* Statistics Cards with Green Theme */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-4 -mt-3"
        contentContainerStyle={{ paddingRight: 16 }}
      >
        <View className="flex-row space-x-3">
          <View className="bg-white rounded-2xl p-4 shadow-lg min-w-[110px] border border-green-100">
            <View className="flex-row items-center">
              <View className="bg-green-100 p-2 rounded-lg">
                <Ionicons name="people" size={20} color="#16a34a" />
              </View>
              <Text className="text-2xl font-bold text-green-600 ml-2">
                {stats.total}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm mt-2">Total Members</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-lg min-w-[110px] border border-green-100">
            <View className="flex-row items-center">
              <View className="bg-green-100 p-2 rounded-lg">
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
              </View>
              <Text className="text-2xl font-bold text-green-600 ml-2">
                {stats.active}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm mt-2">Active</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-lg min-w-[110px] border border-green-100">
            <View className="flex-row items-center">
              <View className="bg-amber-100 p-2 rounded-lg">
                <Ionicons name="time" size={20} color="#d97706" />
              </View>
              <Text className="text-2xl font-bold text-amber-600 ml-2">
                {stats.pending}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm mt-2">Pending</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-lg min-w-[110px] border border-green-100">
            <View className="flex-row items-center">
              <View className="bg-red-100 p-2 rounded-lg">
                <Ionicons name="close-circle" size={20} color="#dc2626" />
              </View>
              <Text className="text-2xl font-bold text-red-600 ml-2">
                {stats.inactive}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm mt-2">Inactive</Text>
          </View>
        </View>
      </ScrollView>

      {/* Search and Filter Section */}
      <View className="px-4 py-3 bg-white mx-4 rounded-2xl shadow-sm border border-green-100">
        {/* Search Bar */}
        <View className="flex-row items-center bg-green-50 rounded-xl px-4 py-3 border border-green-200">
          <Ionicons name="search-outline" size={20} color="#16a34a" />
          <TextInput
            placeholder="Search members by name or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <View className="flex-row space-x-3">
            {[
              { key: "all", label: "All Members", icon: "people" },
              { key: "active", label: "Active", icon: "checkmark-circle" },
              { key: "pending", label: "Pending", icon: "time" },
              { key: "inactive", label: "Inactive", icon: "close-circle" },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => setSelectedStatus(item.key as any)}
                className={`flex-row items-center px-4 py-2 rounded-full border ${
                  selectedStatus === item.key
                    ? "bg-green-500 border-green-600"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <Ionicons
                  name={item.icon as any}
                  size={16}
                  color={selectedStatus === item.key ? "white" : "#16a34a"}
                />
                <Text
                  className={`ml-2 font-medium ${
                    selectedStatus === item.key
                      ? "text-white"
                      : "text-green-700"
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Members List */}
      <ScrollView
        className="flex-1 px-4 mt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#16a34a"]}
            tintColor="#16a34a"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-green-800 font-medium">
            Showing {filteredMembers.length} of {members.length} members
          </Text>
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-green-600 text-sm font-medium">Sort by</Text>
            <Ionicons name="chevron-down" size={16} color="#16a34a" />
          </TouchableOpacity>
        </View>

        {filteredMembers.map((member) => (
          <TouchableOpacity
            key={member.id}
            onPress={() => handleMemberPress(member)}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-green-100"
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center">
                      <Text className="text-green-600 font-bold text-sm">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </Text>
                    </View>
                    <View className="ml-3">
                      <Text className="text-lg font-semibold text-gray-900">
                        {member.name}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Ionicons
                          name="mail-outline"
                          size={14}
                          color="#6B7280"
                        />
                        <Text className="text-gray-600 text-sm ml-1">
                          {member.email}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    className={`px-3 py-1 rounded-full border ${getStatusColor(member.status)}`}
                  >
                    <Text
                      className={`text-xs font-bold ${getStatusTextColor(member.status)}`}
                    >
                      {member.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center mt-4 justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="call-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2">
                      {member.phone}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text className="text-gray-500 text-xs ml-1">
                      {new Date(member.joinDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-green-50">
                  <Text className="text-gray-500 text-sm">Share Capital</Text>
                  <Text className="text-green-600 font-bold text-lg">
                    ₱{member.shares.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredMembers.length === 0 && (
          <View className="items-center justify-center py-16">
            <View className="bg-green-100 p-6 rounded-full mb-4">
              <Ionicons name="people-outline" size={48} color="#16a34a" />
            </View>
            <Text className="text-gray-500 text-xl font-medium mt-4">
              No members found
            </Text>
            <Text className="text-gray-400 text-center mt-2 px-8">
              Try adjusting your search or filter criteria to find members
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Member FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-green-500 w-16 h-16 rounded-full items-center justify-center shadow-xl border border-green-600"
        onPress={() =>
          Alert.alert(
            "Add Member",
            "Add new member functionality would go here"
          )
        }
      >
        <Ionicons name="person-add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
