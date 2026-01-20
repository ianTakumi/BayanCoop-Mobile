import React, { useState, useEffect } from "react";
import client from "@/utils/axiosInstance";
import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from "react-native";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Tag,
  Archive,
} from "lucide-react-native";
import { useRouter } from "expo-router";

export default function Article() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticleBasedOnSlug = async () => {
    try {
      const res = await client.get(`/articles/${params.slug}`);
      if (res.status === 200) {
        setArticle(res.data.data);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching article:", err);
      setError("Article not found or failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.slug) {
      fetchArticleBasedOnSlug();
    }
  }, [params.slug]);

  // Format date without date-fns
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const day = date.getDate();
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return `${monthNames[monthIndex]} ${day}, ${year} at ${hours}:${minutes}`;
    } catch (error) {
      return "Invalid date";
    }
  };

  const renderContent = () => {
    if (!article?.content) return null;

    // Simple HTML content rendering (basic support)
    const content = article.content
      .replace(/<h1>/g, "\n## ")
      .replace(/<\/h1>/g, "\n")
      .replace(/<h2>/g, "\n### ")
      .replace(/<\/h2>/g, "\n")
      .replace(/<p>/g, "\n")
      .replace(/<\/p>/g, "\n")
      .replace(/<strong>/g, "**")
      .replace(/<\/strong>/g, "**")
      .replace(/<em>/g, "*")
      .replace(/<\/em>/g, "*")
      .replace(/<ul>/g, "\n")
      .replace(/<\/ul>/g, "\n")
      .replace(/<li>/g, "• ")
      .replace(/<\/li>/g, "\n")
      .replace(/<ol>/g, "\n")
      .replace(/<\/ol>/g, "\n")
      .replace(/<table>/g, "\n[Table]")
      .replace(/<\/table>/g, "\n")
      .replace(/<[^>]*>/g, "") // Remove any remaining HTML tags
      .trim();

    return content.split("\n").map((line, index) => {
      if (line.startsWith("## ")) {
        return (
          <Text
            key={index}
            className="text-2xl font-bold text-gray-900 mt-6 mb-3"
          >
            {line.replace("## ", "")}
          </Text>
        );
      } else if (line.startsWith("### ")) {
        return (
          <Text
            key={index}
            className="text-xl font-bold text-gray-800 mt-4 mb-2"
          >
            {line.replace("### ", "")}
          </Text>
        );
      } else if (line.startsWith("• ")) {
        return (
          <Text key={index} className="text-gray-700 ml-4 mb-1">
            {line}
          </Text>
        );
      } else if (line.includes("**")) {
        // Handle bold text
        const parts = line.split("**");
        return (
          <Text key={index} className="text-gray-700 mb-2">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <Text key={i} className="font-bold">
                  {part}
                </Text>
              ) : (
                part
              )
            )}
          </Text>
        );
      } else if (line.trim() === "[Table]") {
        return (
          <View key={index} className="bg-gray-100 p-3 rounded-lg my-2">
            <Text className="text-gray-600 italic">
              Table content - View on web for better display
            </Text>
          </View>
        );
      } else if (line.trim()) {
        return (
          <Text key={index} className="text-gray-700 text-base leading-6 mb-3">
            {line}
          </Text>
        );
      }
      return null;
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Loading article...</Text>
      </View>
    );
  }

  if (error || !article) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="px-4 pt-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-6"
          >
            <ArrowLeft size={24} color="#4b5563" />
            <Text className="text-gray-600 ml-2">Back</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Article Not Found
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            {error || "The article you're looking for doesn't exist."}
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View className="px-4 pt-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-4"
          >
            <ArrowLeft size={24} color="#4b5563" />
            <Text className="text-gray-600 ml-2">Back to Articles</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Image */}
        {article.featured_image_url && (
          <Image
            source={{ uri: article.featured_image_url }}
            className="w-full h-64"
            resizeMode="cover"
          />
        )}

        {/* Article Content */}
        <View className="p-4">
          {/* Category and Status */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="bg-blue-50 px-3 py-1.5 rounded-full">
                <Text className="text-blue-700 text-sm font-semibold uppercase">
                  {article.category_label || article.category}
                </Text>
              </View>
              {article.archived_at && (
                <View className="bg-red-50 px-3 py-1.5 rounded-full ml-2 flex-row items-center">
                  <Archive size={12} color="#dc2626" />
                  <Text className="text-red-700 text-sm font-semibold ml-1">
                    Archived
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Title */}
          <Text className="text-3xl font-bold text-gray-900 mb-4 leading-10">
            {article.title}
          </Text>

          {/* Excerpt */}
          <Text className="text-lg text-gray-600 mb-6 leading-7">
            {article.excerpt}
          </Text>

          {/* Meta Information */}
          <View className="flex-row flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            <View className="flex-row items-center">
              <Calendar size={16} color="#6b7280" />
              <Text className="text-gray-500 text-sm ml-1.5">
                {formatDate(article.published_at)}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Clock size={16} color="#6b7280" />
              <Text className="text-gray-500 text-sm ml-1.5">
                {article.read_time} min read
              </Text>
            </View>

            <View className="flex-row items-center">
              <Eye size={16} color="#6b7280" />
              <Text className="text-gray-500 text-sm ml-1.5">
                {article.views} views
              </Text>
            </View>
          </View>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Tag size={16} color="#6b7280" />
                <Text className="text-gray-600 font-medium ml-1.5">Tags:</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <View
                    key={index}
                    className="bg-gray-100 px-3 py-1.5 rounded-lg"
                  >
                    <Text className="text-gray-700 text-sm">#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Article Content */}
          <View className="mb-8">{renderContent()}</View>

          {/* Last Updated */}
          {article.updated_at && article.updated_at !== article.created_at && (
            <View className="mt-8 pt-6 border-t border-gray-200">
              <Text className="text-gray-500 text-sm italic">
                Last updated: {formatDate(article.updated_at)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
