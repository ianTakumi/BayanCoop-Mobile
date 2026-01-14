import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Entypo, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import client from "@/utils/axiosInstance";

export default function ArticlesScreen() {
  const router = useRouter();

  // Articles state
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const categories = [
    { value: "all", label: "All Articles", color: "#4CAF50" },
    { value: "cooperative-news", label: "Cooperative News", color: "#3B82F6" },
    { value: "member-stories", label: "Member Stories", color: "#8B5CF6" },
    {
      value: "financial-updates",
      label: "Financial Updates",
      color: "#10B981",
    },
    { value: "community-events", label: "Community Events", color: "#EF4444" },
    {
      value: "agricultural-tips",
      label: "Agricultural Tips",
      color: "#F59E0B",
    },
    {
      value: "training-programs",
      label: "Training Programs",
      color: "#6366F1",
    },
    { value: "success-stories", label: "Success Stories", color: "#EC4899" },
    { value: "announcements", label: "Announcements", color: "#6B7280" },
  ];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async (
    page = 1,
    category = selectedCategory,
    query = searchQuery
  ) => {
    try {
      if (page === 1) setLoading(true);

      const params = {
        page,
        limit: pagination.limit,
        status: "published",
      };

      if (category !== "all") {
        params.category = category;
      }

      if (query.trim() !== "") {
        params.search = query;
      }

      const response = await client.get("/articles", { params });
      const data = response.data;

      if (data.success) {
        if (page === 1) {
          setArticles(data.data || []);
        } else {
          setArticles((prev) => [...prev, ...(data.data || [])]);
        }
        setPagination({
          ...pagination,
          page,
          total: data.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchArticles(1);
  };

  const loadMore = () => {
    if (pagination.page < pagination.totalPages && !loading) {
      fetchArticles(pagination.page + 1);
    }
  };

  const handleSearch = () => {
    fetchArticles(1, selectedCategory, searchQuery);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchArticles(1, category, searchQuery);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not published";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const truncateText = (text, length = 100) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  const getCategoryColor = (category) => {
    const categoryObj = categories.find((c) => c.value === category);
    return categoryObj ? categoryObj.color : "#6B7280";
  };

  const getCategoryLabel = (category) => {
    const categoryObj = categories.find((c) => c.value === category);
    return categoryObj ? categoryObj.label : category;
  };

  const renderArticleItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100 overflow-hidden"
      onPress={() => router.push(`/articles/${item.slug}`)}
      activeOpacity={0.9}
    >
      {item.featured_image_url && (
        <Image
          source={{ uri: item.featured_image_url }}
          className="w-full h-48"
          resizeMode="cover"
        />
      )}

      <View className="p-4">
        <View className="flex-row items-center mb-2">
          <View
            className="px-3 py-1 rounded-full mr-2"
            style={{ backgroundColor: `${getCategoryColor(item.category)}20` }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: getCategoryColor(item.category) }}
            >
              {getCategoryLabel(item.category)}
            </Text>
          </View>
          <Text className="text-xs text-gray-500">
            {formatDate(item.published_at || item.created_at)}
          </Text>
        </View>

        <Text className="text-lg font-bold text-gray-800 mb-2">
          {item.title}
        </Text>

        <Text className="text-gray-600 text-sm mb-4">
          {truncateText(item.excerpt || item.content, 150)}
        </Text>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <FontAwesome name="user" size={12} color="#6B7280" />
            <Text className="text-xs text-gray-500 ml-1">
              By {item.author_name || "BayanCoop"}
            </Text>
            <Text className="text-xs text-gray-500 mx-2">•</Text>
            <Text className="text-xs text-gray-500">
              {item.read_time || 5} min read
            </Text>
          </View>

          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => router.push(`/articles/${item.slug}`)}
          >
            <Text className="text-green-600 font-medium text-sm mr-1">
              Read
            </Text>
            <Entypo name="chevron-right" size={16} color="#059669" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View className="pb-4">
      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
        <Ionicons name="search-outline" size={20} color="#666" />
        <TextInput
          placeholder="Search articles..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-2 text-base text-gray-700"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              fetchArticles(1, selectedCategory, "");
            }}
          >
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.value}
            className={`mr-2 px-4 py-2 rounded-full ${selectedCategory === category.value ? "border-2" : "border"}`}
            style={{
              backgroundColor:
                selectedCategory === category.value
                  ? category.color + "20"
                  : "transparent",
              borderColor:
                selectedCategory === category.value
                  ? category.color
                  : "#E5E7EB",
            }}
            onPress={() => handleCategorySelect(category.value)}
          >
            <Text
              className="text-sm font-medium"
              style={{
                color:
                  selectedCategory === category.value
                    ? category.color
                    : "#6B7280",
              }}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <Text className="text-gray-600 text-sm mb-2">
        {pagination.total} {pagination.total === 1 ? "article" : "articles"}{" "}
        found
      </Text>
    </View>
  );

  const renderContent = () => {
    if (loading && articles.length === 0) {
      return (
        <View className="py-8">
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      );
    }

    if (articles.length === 0) {
      return (
        <View className="py-8 items-center">
          <Ionicons name="newspaper-outline" size={60} color="#D1D5DB" />
          <Text className="mt-4 text-lg font-medium text-gray-900">
            No articles found
          </Text>
          <Text className="mt-2 text-gray-500 text-center px-10">
            {searchQuery || selectedCategory !== "all"
              ? "Try different search terms or categories"
              : "Check back later for new content."}
          </Text>
          {(searchQuery || selectedCategory !== "all") && (
            <TouchableOpacity
              className="mt-4 bg-green-100 px-6 py-3 rounded-lg"
              onPress={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                fetchArticles(1, "all", "");
              }}
            >
              <Text className="text-green-700 font-medium">Reset Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <FlatList
        data={articles}
        renderItem={renderArticleItem}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          pagination.page < pagination.totalPages ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text className="text-gray-500 text-sm mt-2">
                Loading more...
              </Text>
            </View>
          ) : articles.length > 5 ? (
            <Text className="text-center text-gray-400 py-4">
              You've reached the end
            </Text>
          ) : null
        }
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-900">Articles</Text>
          <Text className="text-gray-600 mt-1">
            Stay updated with the latest news and insights
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1">
          {renderHeader()}
          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {renderContent()}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
