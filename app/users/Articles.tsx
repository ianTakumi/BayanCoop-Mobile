import React, { useState, useEffect } from "react";
import client from "@/utils/axiosInstance";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { format } from "date-fns";

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchArticles = async () => {
    try {
      const res = await client.get("/articles");
      if (res.status === 200) {
        setArticles(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchArticles();
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatReadTime = (minutes) => {
    return `${minutes} min read`;
  };

  const renderArticleItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white mx-4 mt-4 rounded-xl overflow-hidden shadow-lg shadow-black/10"
      activeOpacity={0.8}
    >
      {item.featured_image_url && (
        <Image
          source={{ uri: item.featured_image_url }}
          className="w-full h-48"
          resizeMode="cover"
        />
      )}

      <View className="p-4">
        <View className="flex-row justify-between items-center mb-3">
          <View className="bg-blue-50 px-3 py-1.5 rounded-full">
            <Text className="text-blue-700 text-xs font-semibold uppercase">
              {item.category_label}
            </Text>
          </View>
          {item.archived_at && (
            <View className="bg-red-50 px-2.5 py-1 rounded-lg">
              <Text className="text-red-700 text-xs font-semibold">
                Archived
              </Text>
            </View>
          )}
        </View>

        <Text className="text-xl font-bold text-gray-900 mb-2 leading-7">
          {item.title}
        </Text>
        <Text className="text-gray-600 text-sm leading-5 mb-4">
          {item.excerpt}
        </Text>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-gray-500 text-xs">
            {formatDate(item.published_at)}
          </Text>
          <Text className="text-gray-500 text-xs">
            {formatReadTime(item.read_time)}
          </Text>
          <Text className="text-gray-500 text-xs">{item.views} views</Text>
        </View>

        {item.tags && item.tags.length > 0 && (
          <View className="flex-row flex-wrap items-center gap-2">
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} className="bg-gray-100 px-2.5 py-1 rounded-lg">
                <Text className="text-gray-600 text-xs">#{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text className="text-gray-400 text-xs">
                +{item.tags.length - 3} more
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-xl font-semibold text-gray-800 mb-2">
        No articles found
      </Text>
      <Text className="text-gray-500 text-center mb-6">
        Check back later for new articles and updates.
      </Text>
      <TouchableOpacity
        className="bg-blue-500 px-6 py-3 rounded-lg"
        onPress={fetchArticles}
      >
        <Text className="text-white font-medium">Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Loading articles...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-green-500 px-5 pt-10 pb-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-white mb-3">Articles</Text>
        <Text className="text-white text-base">
          Latest updates and news from BayanCoop
        </Text>
      </View>

      {articles.length > 0 ? (
        <FlatList
          data={articles}
          renderItem={renderArticleItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <View className="bg-white px-4 py-3 border-b border-gray-200">
              <Text className="text-gray-500 text-sm">
                Showing {articles.length} of {articles.length} articles
              </Text>
            </View>
          }
          ListFooterComponent={<View className="h-8" />}
          className="flex-1"
        />
      ) : (
        <ScrollView
          contentContainerClassName="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3b82f6"]}
            />
          }
        >
          {renderEmptyState()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
