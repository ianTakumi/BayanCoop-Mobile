import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const slides = [
  {
    id: 1,
    image: require("../assets/images/onboarding/onboard1.png"),
    title: "Together, we",
    highlight: "grow stronger!",
    description:
      "Everyone can create cooperatives, farms, and connections across Layon – building a sustainable local economy through cooperation and shared growth.",
  },
  {
    id: 2,
    image: require("../assets/images/onboarding/onboard2.png"),
    title: "Support our",
    highlight: "local farmers",
    description:
      "Farmers are the heart of our community. Everyone helps them grow more, sell their products fairly, and thrive sustainably.",
  },
  {
    id: 3,
    image: require("../assets/images/onboarding/onboard3.png"),
    title: "Cooperation",
    highlight: "builds progress",
    description:
      "Cooperatives can bridge the gap between farmers and consumers. Let’s promote collaboration, increase local trade, and strengthen livelihoods.",
  },
  {
    id: 4,
    image: require("../assets/images/onboarding/onboard4.png"),
    title: "Be a part of",
    highlight: "the movement",
    description:
      "Every person can make Layon thrive. Sign up and help grow awareness, trade, and trust in your local area.",
  },
];

const Onboarding: React.FC = () => {
  const [index, setIndex] = useState<number>(0);
  const router = useRouter();
  const current = slides[index];

  const nextSlide = () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else {
      router.push("/RegisterScreen");
    }
  };

  const prevSlide = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Top Section */}
      <View className="bg-green-500 w-full h-[65%] rounded-b-3xl justify-center items-center px-6 pt-10">
        <Image
          source={current.image}
          className="w-72 h-72 mb-6"
          resizeMode="contain"
        />
        <Text className="text-3xl font-bold text-white text-center">
          {current.title}{" "}
          <Text className="text-yellow-300">{current.highlight}</Text>
        </Text>
      </View>

      {/* Bottom Section */}
      <View className="flex-1 justify-between px-6 pb-10 pt-8">
        <Text className="text-gray-600 text-center text-base leading-6">
          {current.description}
        </Text>

        {/* Progress Dots */}
        <View className="flex-row justify-center mt-6 space-x-2">
          {slides.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${
                i === index ? "bg-green-500 w-6" : "bg-gray-300 w-2"
              }`}
            />
          ))}
        </View>

        {/* Buttons */}
        <View className="flex-row justify-between mt-8">
          {index > 0 ? (
            <TouchableOpacity
              onPress={prevSlide}
              className="bg-yellow-400 px-8 py-3 rounded-xl shadow-md"
            >
              <Text className="text-white font-semibold text-base">Back</Text>
            </TouchableOpacity>
          ) : (
            <View className="w-[40%]" /> // placeholder for symmetry
          )}

          <TouchableOpacity
            onPress={nextSlide}
            className="bg-green-500 px-8 py-3 rounded-xl shadow-md"
          >
            <Text className="text-white font-semibold text-base">
              {index === slides.length - 1 ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Onboarding;
