import { Decks } from "@/assets/games/Decks";
import { trackCategoryView } from "@/utils/analytics";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as React from "react";
import {
  Animated,
  FlatList,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Separate component for category card to properly use hooks
const CategoryCard = ({
  item,
  index,
  onPress,
}: {
  item: (typeof Decks)[0];
  index: number;
  onPress: () => void;
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // Get gradient colors for each category
  const getCategoryGradient = (index: number) => {
    const gradients = [
      { start: "#667eea", end: "#764ba2" }, // Purple to purple
      { start: "#f093fb", end: "#f5576c" }, // Pink to red
      { start: "#4facfe", end: "#00f2fe" }, // Blue to cyan
    ];
    return gradients[index % gradients.length];
  };

  const getCategoryIcon = (name: string) => {
    if (name.toLowerCase().includes("mild")) return "😏";
    if (name.toLowerCase().includes("risky")) return "🔥";
    if (name.toLowerCase().includes("sin")) return "😈";
    return "🎴";
  };

  const gradient = getCategoryGradient(index);
  const icon = getCategoryIcon(item.name);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        marginBottom: 20,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <View
          className="rounded-3xl overflow-hidden"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            shadowColor: gradient.start,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          {/* Gradient overlay */}
          <View
            className="absolute inset-0"
            style={{
              backgroundColor: gradient.start,
              opacity: 0.3,
            }}
          />

          {/* Content */}
          <View className="flex-row items-center p-6">
            {/* Icon Container */}
            <View
              className="w-20 h-20 rounded-2xl items-center justify-center mr-4"
              style={{
                backgroundColor: `rgba(255, 255, 255, 0.2)`,
                borderWidth: 2,
                borderColor: gradient.start,
              }}
            >
              <Text className="text-4xl">{icon}</Text>
            </View>

            {/* Text Content */}
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold mb-2">
                {item.name}
              </Text>
              {item.description && (
                <Text className="text-white/80 text-base">
                  {item.description}
                </Text>
              )}
              <View className="flex-row items-center mt-3">
                <Text className="text-white/60 text-sm">
                  {item.decks.length} deck
                  {item.decks.length !== 1 ? "s" : ""}
                </Text>
                <View className="w-1 h-1 bg-white/40 rounded-full mx-2" />
                <Text className="text-white/60 text-sm">Tap to explore →</Text>
              </View>
            </View>

            {/* Arrow Icon */}
            <View className="ml-2">
              <Text className="text-white/60 text-2xl">›</Text>
            </View>
          </View>

          {/* Bottom accent line */}
          <View
            className="h-1"
            style={{
              backgroundColor: gradient.end,
              opacity: 0.8,
            }}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const index = () => {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("@/assets/images/deckedBackground.jpg")}
      resizeMode="cover"
      className="h-full"
    >
      {/* Dark overlay for better text readability */}
      <View className="absolute inset-0 bg-black/40" />

      <View className="flex-1 px-6 pt-16 pb-8">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <View className="flex-1 items-center">
            <Text className="text-white text-4xl font-bold text-center mb-2">
              What are we in the mood for?
            </Text>
            <View className="h-1 w-24 bg-purple-500 rounded-full" />
          </View>
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            className="bg-black/50 px-4 py-2 rounded-xl ml-4"
          >
            <Text className="text-white text-xl">⚙️</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          contentContainerStyle={{
            paddingBottom: 20,
          }}
          data={Decks}
          keyExtractor={(item) => item.slug}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <CategoryCard
              item={item}
              index={index}
              onPress={() => {
                trackCategoryView(item.slug);
                router.push({
                  pathname: "/categories/[category]",
                  params: { category: item.slug },
                });
              }}
            />
          )}
        />
      </View>
    </ImageBackground>
  );
};

export default index;
