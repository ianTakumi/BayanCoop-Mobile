import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { useSelector } from "react-redux";
import client from "../../../../utils/axiosInstance";
import Toast from "react-native-toast-message";

export default function Index() {
  const user = useSelector((state) => state.auth.user);
  const firstName = user?.first_name?.split(" ")[0] || "Guest";
  const [products, setProducts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const router = useRouter();

  // Articles state
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0,
  });

  const categories = [
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
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    await client
      .get(`/products`)
      .then((res) => {
        setProducts(res.data.data || []);
      })
      .catch((err) => {
        Toast.show({
          type: "error",
          text1: "Error fetching products",
          text2: err.message,
        });
      });
  };

  const fetchCommunities = async () => {
    await client
      .get("/communities")
      .then((res) => {
        if (res.status === 200) {
          setCommunities(res.data.data || []);
        }
      })
      .catch((err) => {
        Toast.show({
          type: "error",
          text1: "Error fetching communities",
          text2: err.message,
        });
      });
  };

  const fetchArticles = async (page = 1) => {
    try {
      if (page === 1) setLoading(true);

      const params = {
        page,
        limit: pagination.limit,
        status: "published",
      };

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
    fetchProducts();
    fetchCommunities();
  };

  const loadMore = () => {
    if (pagination.page < pagination.totalPages && !loading) {
      fetchArticles(pagination.page + 1);
    }
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
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
      onPress={() =>
        router.push({
          pathname: "/users/Article",
          params: { slug: item.slug },
        })
      }
    >
      {item.featured_image_url && (
        <Image
          source={{ uri: item.featured_image_url }}
          className="w-full h-48 rounded-xl mb-4"
          resizeMode="cover"
        />
      )}

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

      <Text className="text-lg font-bold text-gray-800 mb-2">{item.title}</Text>

      <Text className="text-gray-600 text-sm mb-4">
        {truncateText(item.excerpt, 120)}
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
          onPress={() =>
            router.push({
              pathname: "/users/Article",
              params: { slug: item.slug },
            })
          }
        >
          <Text className="text-green-600 font-medium text-sm mr-1">Read</Text>
          <Entypo name="chevron-right" size={16} color="#059669" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderArticlesSection = () => {
    if (loading && articles.length === 0) {
      return (
        <View className="py-8">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      );
    }

    if (articles.length === 0) {
      return (
        <View className="py-8 items-center">
          <FontAwesome name="newspaper-o" size={48} color="#D1D5DB" />
          <Text className="mt-4 text-lg font-medium text-gray-900">
            No articles found
          </Text>
          <Text className="mt-2 text-gray-500 text-center">
            Check back later for new content.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={articles}
        renderItem={renderArticleItem}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        ListFooterComponent={
          pagination.page < pagination.totalPages ? (
            <TouchableOpacity
              onPress={loadMore}
              className="bg-green-100 px-4 py-3 rounded-lg items-center mt-4"
            >
              <Text className="text-green-700 font-medium">
                Load More Articles
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="flex-1 p-5 bg-white">
        {/* Greeting */}
        <View className="flex-row items-center mb-4">
          <Text className="text-2xl text-gray-800">Hello </Text>
          <Text className="text-2xl font-bold text-green-500">
            {firstName}!
          </Text>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-[#F4F4F4] rounded-xl px-4 py-3 mb-6 shadow-sm border border-[#E5E7EB]">
          <Entypo name="magnifying-glass" size={20} color="#6B7280" />
          <TextInput
            placeholder="Search products, articles..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-base text-gray-700"
          />
        </View>

        {/* Image Section */}
        <View className="items-center mb-8">
          <Image
            source={require("@/assets/images/users/home/firstImage.png")}
            className="w-full h-60"
            resizeMode="contain"
          />
        </View>

        {/* Products Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-green-600">Products</Text>
            <TouchableOpacity
              className="bg-green-100 px-4 py-2 rounded-lg"
              onPress={() => router.push("/users/(drawers)/(tabs)/Shop")}
            >
              <Text className="text-green-700 font-medium">See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {/* Map through products data - max 5 products */}
            {products.slice(0, 5).map((product) => {
              // Get the first attribute as default for price display
              const defaultAttribute = product.products_attributes[0];
              const displayPrice = defaultAttribute
                ? `P${defaultAttribute.price.toFixed(2)}`
                : "P0.00";

              // Get the first image URL if available
              const productImageUrl =
                product.images && product.images.length > 0
                  ? product.images[0]
                  : null;

              return (
                <View
                  key={product.id}
                  className="bg-white rounded-2xl p-4 mr-4 shadow-sm border border-gray-100 w-36"
                >
                  <View className="bg-green-50 rounded-xl w-20 h-20 items-center justify-center mb-2 self-center overflow-hidden">
                    {productImageUrl ? (
                      <Image
                        source={{ uri: productImageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full bg-gray-200 items-center justify-center">
                        <Text className="text-gray-500">No Image</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-lg font-semibold text-gray-800 mb-1 truncate">
                    {product.name}
                  </Text>
                  <Text className="text-green-500 font-bold">
                    {displayPrice}
                  </Text>
                  {product.unit_type && (
                    <Text className="text-xs text-gray-500 mt-1">
                      per {product.unit_type}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Community Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-green-600">
              Communities
            </Text>
            <TouchableOpacity className="bg-green-100 px-4 py-2 rounded-lg">
              <Text className="text-green-700 font-medium">See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {/* Map through communities data */}
            {communities.slice(0, 5).map((community) => {
              return (
                <TouchableOpacity
                  key={community.id}
                  className="bg-white rounded-2xl p-4 mr-4 shadow-sm border border-gray-100 w-36"
                >
                  <View className="bg-green-50 rounded-xl w-20 h-20 items-center justify-center mb-2 self-center overflow-hidden">
                    {community.image_url ? (
                      <Image
                        source={{ uri: community.image_url }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full bg-gray-200 items-center justify-center">
                        <Text className="text-gray-500 text-2xl">👥</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-lg font-semibold text-gray-800 mb-1 truncate">
                    {community.name}
                  </Text>
                  <View className="flex-row items-center">
                    <View className="flex-row items-center mr-3">
                      <Text className="text-sm text-gray-600">👥</Text>
                      <Text className="text-xs text-gray-600 ml-1">
                        {community.member_count || 0}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-sm text-gray-600">📝</Text>
                      <Text className="text-xs text-gray-600 ml-1">
                        {community.post_count || 0}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-gray-500 mt-1 truncate">
                    {community.category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Articles for you Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-green-600">
              Articles for you
            </Text>
            <TouchableOpacity
              className="bg-green-100 px-4 py-2 rounded-lg"
              onPress={() => router.push("/users/Articles")}
            >
              <Text className="text-green-700 font-medium">See all</Text>
            </TouchableOpacity>
          </View>

          {renderArticlesSection()}
        </View>

        {/* Cooperative Registration Section */}
        <View className="mb-8">
          <View className="bg-green-500 rounded-2xl p-6 shadow-lg">
            <Text className="text-xl font-bold text-white mb-2 text-center">
              Do you own a cooperative?
            </Text>
            <Text className="text-green-100 text-center mb-4">
              Does your cooperative want to take part in our platform and reach
              more customers?
            </Text>
            <TouchableOpacity
              className="bg-white px-6 py-3 rounded-lg self-center"
              onPress={() => router.push("/users/CoopRegisterScreen")}
            >
              <Text className="text-green-600 font-bold text-lg">
                Register Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
