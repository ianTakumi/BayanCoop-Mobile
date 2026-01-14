import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Mock data for cooperatives/conversations
const mockCooperatives = [
  {
    id: "1",
    name: "Bayanihan Farmers Cooperative",
    lastMessage: "We'd like to order 50kg of organic rice",
    lastMessageTime: "10:30 AM",
    unreadCount: 3,
    avatar: "https://via.placeholder.com/150/4CAF50/FFFFFF?text=BF",
    status: "active",
    productType: "Rice & Grains",
    orderCount: 15,
    rating: 4.5,
  },
  {
    id: "2",
    name: "Green Valley Cooperative",
    lastMessage: "When will the next batch of carrots be available?",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    avatar: "https://via.placeholder.com/150/2196F3/FFFFFF?text=GV",
    status: "active",
    productType: "Vegetables",
    orderCount: 8,
    rating: 4.8,
  },
  {
    id: "3",
    name: "Mountain Fresh Producers",
    lastMessage: "Payment for last order has been sent",
    lastMessageTime: "Dec 2",
    unreadCount: 0,
    avatar: "https://via.placeholder.com/150/FF9800/FFFFFF?text=MF",
    status: "active",
    productType: "Fruits",
    orderCount: 23,
    rating: 4.2,
  },
  {
    id: "4",
    name: "Organic Harvest Coop",
    lastMessage: "Can we schedule delivery for Friday?",
    lastMessageTime: "Nov 30",
    unreadCount: 1,
    avatar: "https://via.placeholder.com/150/9C27B0/FFFFFF?text=OH",
    status: "away",
    productType: "All Produce",
    orderCount: 42,
    rating: 4.9,
  },
  {
    id: "5",
    name: "Sunrise Agriculture Coop",
    lastMessage: "We received damaged goods in the last shipment",
    lastMessageTime: "Nov 28",
    unreadCount: 0,
    avatar: "https://via.placeholder.com/150/E91E63/FFFFFF?text=SA",
    status: "active",
    productType: "Root Crops",
    orderCount: 12,
    rating: 3.8,
  },
];

// Mock conversation messages
const mockConversation = [
  {
    id: "1",
    text: "Hi, we'd like to order 50kg of your premium organic brown rice",
    sender: "cooperative",
    time: "10:25 AM",
    read: true,
    type: "text",
  },
  {
    id: "2",
    text: "Hello! Yes, we have that in stock. Would you like it in 25kg bags or 50kg sacks?",
    sender: "supplier",
    time: "10:26 AM",
    read: true,
    type: "text",
  },
  {
    id: "3",
    text: "Two 25kg bags would be perfect for us. What's the price per bag?",
    sender: "cooperative",
    time: "10:28 AM",
    read: true,
    type: "text",
  },
  {
    id: "4",
    text: "25kg bags are ₱1,250 each. Total would be ₱2,500 for both bags.",
    sender: "supplier",
    time: "10:29 AM",
    read: true,
    type: "text",
  },
  {
    id: "5",
    text: "Great! Can we schedule delivery for Friday morning?",
    sender: "cooperative",
    time: "10:30 AM",
    read: true,
    type: "text",
  },
  {
    id: "6",
    text: "Yes, Friday morning works. We deliver between 8AM-12PM. I'll create the order for you.",
    sender: "supplier",
    time: "10:31 AM",
    read: true,
    type: "text",
  },
  {
    id: "7",
    text: "Perfect! Please send the order details and we'll make payment upon delivery.",
    sender: "cooperative",
    time: "10:32 AM",
    read: false,
    type: "text",
  },
  {
    id: "8",
    text: "I've created the order #ORD-2024-0012. You can view it here: [Order Link]",
    sender: "supplier",
    time: "10:33 AM",
    read: false,
    type: "text",
  },
];

export default function MessagesScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("conversations");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCooperative, setSelectedCooperative] = useState(null);
  const [messages, setMessages] = useState(mockConversation);
  const [newMessage, setNewMessage] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [filteredCooperatives, setFilteredCooperatives] =
    useState(mockCooperatives);
  const flatListRef = useRef(null);

  // Search filter
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCooperatives(mockCooperatives);
    } else {
      const filtered = mockCooperatives.filter(
        (coop) =>
          coop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coop.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coop.productType.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCooperatives(filtered);
    }
  }, [searchQuery]);

  // Auto-scroll to bottom when new messages
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMsg = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "supplier",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
      type: "text",
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");

    // Simulate reply after 2 seconds
    setTimeout(() => {
      const replies = [
        "Thanks for the quick response!",
        "We'll check the order details.",
        "Looking forward to the delivery.",
        "Can we add 10kg of carrots as well?",
        "Payment will be made upon delivery.",
      ];

      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const replyMsg = {
        id: (Date.now() + 1).toString(),
        text: randomReply,
        sender: "cooperative",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: false,
        type: "text",
      };

      setMessages((prev) => [...prev, replyMsg]);
    }, 2000);
  };

  const handleQuickAction = (action) => {
    const quickMessages = {
      "Hi, how can I help you?": "Hi, how can I help you?",
      "Order confirmed, delivery scheduled.":
        "Order confirmed, delivery scheduled.",
      "Invoice sent, please check.": "Invoice sent, please check.",
      "Stock is available, ready to ship.":
        "Stock is available, ready to ship.",
      "Delivery will be there in 30 mins.":
        "Delivery will be there in 30 mins.",
    };

    setNewMessage(quickMessages[action]);
    setShowActions(false);
  };

  const openConversation = (cooperative) => {
    setSelectedCooperative(cooperative);
    setActiveTab("chat");
    // In real app, you would fetch messages for this cooperative
  };

  const renderMessageItem = ({ item }) => (
    <View
      className={`my-1 ${item.sender === "supplier" ? "items-end" : "items-start"}`}
    >
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          item.sender === "supplier"
            ? "bg-green-100 rounded-tr-none"
            : "bg-white border border-gray-200 rounded-tl-none"
        }`}
      >
        <Text
          className={`text-base ${item.sender === "supplier" ? "text-gray-800" : "text-gray-800"}`}
        >
          {item.text}
        </Text>
        <View className="flex-row items-center justify-end mt-1">
          <Text className="text-xs text-gray-500 mr-2">{item.time}</Text>
          {item.sender === "supplier" && (
            <Ionicons
              name={item.read ? "checkmark-done" : "checkmark"}
              size={14}
              color={item.read ? "#4CAF50" : "#9CA3AF"}
            />
          )}
        </View>
      </View>
    </View>
  );

  const renderCooperativeItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => openConversation(item)}
      className="flex-row items-center p-4 border-b border-gray-100 bg-white"
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View className="relative">
        <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center overflow-hidden">
          <Text className="text-lg font-bold text-white">
            {item.avatar.includes("placeholder")
              ? item.name.substring(0, 2)
              : ""}
          </Text>
          {item.avatar && !item.avatar.includes("placeholder") && (
            <Image source={{ uri: item.avatar }} className="w-full h-full" />
          )}
        </View>
        <View
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            item.status === "active" ? "bg-green-500" : "bg-yellow-500"
          }`}
        />
      </View>

      {/* Info */}
      <View className="flex-1 ml-4">
        <View className="flex-row justify-between items-center">
          <Text className="font-bold text-gray-900 text-lg" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-xs text-gray-500">{item.lastMessageTime}</Text>
        </View>

        <Text className="text-gray-600 text-sm mt-1" numberOfLines={1}>
          {item.lastMessage}
        </Text>

        <View className="flex-row items-center mt-2">
          <View className="flex-row items-center mr-4">
            <Ionicons name="cube-outline" size={12} color="#6B7280" />
            <Text className="text-xs text-gray-500 ml-1">
              {item.productType}
            </Text>
          </View>
          <View className="flex-row items-center mr-4">
            <Ionicons name="cart-outline" size={12} color="#6B7280" />
            <Text className="text-xs text-gray-500 ml-1">
              {item.orderCount} orders
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text className="text-xs text-gray-500 ml-1">{item.rating}</Text>
          </View>
        </View>
      </View>

      {/* Unread Badge */}
      {item.unreadCount > 0 && (
        <View className="bg-green-500 w-6 h-6 rounded-full items-center justify-center ml-2">
          <Text className="text-white text-xs font-bold">
            {item.unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Chat Header
  const ChatHeader = () => (
    <View className="bg-white border-b border-gray-200 px-4 py-3">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => setActiveTab("conversations")}
          className="mr-4"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        {selectedCooperative && (
          <>
            <View className="relative">
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center overflow-hidden">
                <Text className="font-bold text-white">
                  {selectedCooperative.avatar.includes("placeholder")
                    ? selectedCooperative.name.substring(0, 2)
                    : ""}
                </Text>
              </View>
              <View
                className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${
                  selectedCooperative.status === "active"
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              />
            </View>

            <View className="ml-3 flex-1">
              <Text className="font-bold text-gray-900 text-lg">
                {selectedCooperative.name}
              </Text>
              <Text className="text-gray-500 text-sm">
                {selectedCooperative.status === "active" ? "Online" : "Away"} •{" "}
                {selectedCooperative.productType}
              </Text>
            </View>

            <View className="flex-row items-center">
              <TouchableOpacity
                className="p-2"
                onPress={() => Alert.alert("Call", "Calling cooperative...")}
              >
                <Ionicons name="call-outline" size={22} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity
                className="p-2 ml-2"
                onPress={() =>
                  navigation.navigate("CooperativeProfile", {
                    cooperative: selectedCooperative,
                  })
                }
              >
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color="#374151"
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );

  // Quick Actions Modal
  const QuickActionsModal = () => (
    <View className="absolute bottom-20 left-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 z-10">
      <View className="p-4 border-b border-gray-200">
        <Text className="font-bold text-gray-900">Quick Replies</Text>
        <Text className="text-gray-500 text-sm mt-1">
          Select a quick message to send
        </Text>
      </View>

      <ScrollView className="max-h-48">
        {[
          "Hi, how can I help you?",
          "Order confirmed, delivery scheduled.",
          "Invoice sent, please check.",
          "Stock is available, ready to ship.",
          "Delivery will be there in 30 mins.",
          "Payment received, thank you!",
          "We'll check stock availability.",
          "Can you send the order details?",
        ].map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleQuickAction(action)}
            className="px-4 py-3 border-b border-gray-100"
          >
            <Text className="text-gray-800">{action}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={() => setShowActions(false)}
        className="p-4 items-center border-t border-gray-200"
      >
        <Text className="text-red-600 font-medium">Close</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {activeTab === "conversations" ? (
        <>
          {/* Header */}
          <View className="bg-white px-4 pt-4 pb-2">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-gray-800">Messages</Text>
              <TouchableOpacity className="p-2">
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#374151"
                />
                <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Search cooperatives..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-3 text-gray-800"
                placeholderTextColor="#9CA3AF"
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Stats */}
            <View className="flex-row mt-4 space-x-4">
              <View className="flex-1 bg-green-50 rounded-lg p-3">
                <Text className="text-green-800 text-sm font-medium">
                  Active Chats
                </Text>
                <Text className="text-gray-900 font-bold text-xl">8</Text>
              </View>
              <View className="flex-1 bg-blue-50 rounded-lg p-3">
                <Text className="text-blue-800 text-sm font-medium">
                  New Orders
                </Text>
                <Text className="text-gray-900 font-bold text-xl">3</Text>
              </View>
              <View className="flex-1 bg-purple-50 rounded-lg p-3">
                <Text className="text-purple-800 text-sm font-medium">
                  Unread
                </Text>
                <Text className="text-gray-900 font-bold text-xl">12</Text>
              </View>
            </View>
          </View>

          {/* Cooperatives List */}
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text className="text-gray-500 mt-4">
                Loading conversations...
              </Text>
            </View>
          ) : filteredCooperatives.length === 0 ? (
            <View className="flex-1 justify-center items-center p-8">
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={80}
                color="#D1D5DB"
              />
              <Text className="text-xl font-bold text-gray-500 mt-4">
                No conversations found
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Start a conversation with your cooperative partners"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredCooperatives}
              renderItem={renderCooperativeItem}
              keyExtractor={(item) => item.id}
              className="flex-1"
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      ) : (
        /* Chat Interface */
        <View className="flex-1">
          <ChatHeader />

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            className="flex-1 px-4 pt-4"
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={<View className="h-4" />}
            ListFooterComponent={<View className="h-4" />}
          />

          {/* Message Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          >
            <View className="bg-white border-t border-gray-200 px-4 py-3">
              {showActions && <QuickActionsModal />}

              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setShowActions(!showActions)}
                  className="p-3 bg-gray-100 rounded-full mr-2"
                >
                  <MaterialIcons name="flash-on" size={22} color="#4CAF50" />
                </TouchableOpacity>

                <TouchableOpacity className="p-3 bg-gray-100 rounded-full mr-2">
                  <Ionicons name="attach-outline" size={22} color="#6B7280" />
                </TouchableOpacity>

                <View className="flex-1 bg-gray-100 rounded-full px-4 py-2">
                  <TextInput
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                    className="text-gray-800"
                    multiline
                    maxLength={500}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className={`ml-3 p-3 rounded-full ${newMessage.trim() ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <Ionicons
                    name="send"
                    size={22}
                    color={newMessage.trim() ? "white" : "#9CA3AF"}
                  />
                </TouchableOpacity>
              </View>

              {/* Quick Order Actions */}
              <View className="flex-row mt-3 space-x-2">
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("CreateOrder", {
                      cooperative: selectedCooperative,
                    })
                  }
                  className="flex-1 bg-green-50 rounded-lg px-4 py-2 flex-row items-center justify-center"
                >
                  <Ionicons name="cart-outline" size={16} color="#10B981" />
                  <Text className="text-green-700 font-medium ml-2">
                    Create Order
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("SendInvoice", {
                      cooperative: selectedCooperative,
                    })
                  }
                  className="flex-1 bg-blue-50 rounded-lg px-4 py-2 flex-row items-center justify-center"
                >
                  <MaterialIcons
                    name="receipt-long"
                    size={16}
                    color="#3B82F6"
                  />
                  <Text className="text-blue-700 font-medium ml-2">
                    Send Invoice
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ScheduleDelivery", {
                      cooperative: selectedCooperative,
                    })
                  }
                  className="flex-1 bg-amber-50 rounded-lg px-4 py-2 flex-row items-center justify-center"
                >
                  <MaterialCommunityIcons
                    name="truck-delivery-outline"
                    size={16}
                    color="#F59E0B"
                  />
                  <Text className="text-amber-700 font-medium ml-2">
                    Schedule Delivery
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* Bottom Tab Bar */}
      <View className="bg-white border-t border-gray-200 flex-row py-2 px-6">
        <TouchableOpacity
          onPress={() => setActiveTab("conversations")}
          className={`flex-1 items-center py-2 ${activeTab === "conversations" ? "border-t-2 border-green-500" : ""}`}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={24}
            color={activeTab === "conversations" ? "#4CAF50" : "#9CA3AF"}
          />
          <Text
            className={`text-xs mt-1 ${activeTab === "conversations" ? "text-green-600 font-medium" : "text-gray-500"}`}
          >
            Chats
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("NewMessage")}
          className="flex-1 items-center py-2"
        >
          <View className="bg-green-500 w-12 h-12 rounded-full items-center justify-center -mt-4">
            <Ionicons name="add" size={28} color="white" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Notifications")}
          className="flex-1 items-center py-2"
        >
          <View className="relative">
            <Ionicons name="notifications-outline" size={24} color="#9CA3AF" />
            <View className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </View>
          <Text className="text-xs mt-1 text-gray-500">Alerts</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
