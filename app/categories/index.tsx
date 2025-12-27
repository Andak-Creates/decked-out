import { Decks } from "@/assets/games/Decks";
import { isDeckPremium, usePremium } from "@/context/PremiumContext";
import { trackCategoryView } from "@/utils/supabaseAnalytics";
import { Ionicons } from "@expo/vector-icons";
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
  onPremiumPress,
}: {
  item: (typeof Decks)[0];
  index: number;
  onPress: () => void;
  onPremiumPress: () => void;
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const { isPremium } = usePremium();
  const isLocked = isDeckPremium(item.slug) && !isPremium;

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

  const handlePress = () => {
    if (isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onPremiumPress();
    } else {
      onPress();
    }
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
        onPress={handlePress}
      >
        <View
          className="rounded-3xl overflow-hidden"
          style={{
            backgroundColor: isLocked
              ? "rgba(0, 0, 0, 0.7)"
              : "rgba(0, 0, 0, 0.5)",
            shadowColor: isLocked ? "#000" : gradient.start,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isLocked ? 0.3 : 0.4,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          {/* Gradient overlay */}
          <View
            className="absolute inset-0"
            style={{
              backgroundColor: isLocked ? "#374151" : gradient.start,
              opacity: isLocked ? 0.2 : 0.3,
            }}
          />

          {/* Lock Overlay */}
          {isLocked && (
            <View className="absolute inset-0 items-center justify-center z-10 bg-black/40">
              <View className="bg-black/80 rounded-2xl px-6 py-4 items-center">
                <Ionicons name="lock-closed" size={40} color="#fbbf24" />
                <Text className="text-yellow-400 text-xl font-bold mt-2">
                  PREMIUM
                </Text>
              </View>
            </View>
          )}

          {/* Content */}
          <View
            className="flex-row items-center p-6"
            style={{ opacity: isLocked ? 0.6 : 1 }}
          >
            {/* Icon Container */}
            <View
              className="w-20 h-20 rounded-2xl items-center justify-center mr-4"
              style={{
                backgroundColor: `rgba(255, 255, 255, 0.2)`,
                borderWidth: 2,
                borderColor: isLocked ? "#6b7280" : gradient.start,
              }}
            >
              <Text className="text-4xl">{icon}</Text>
            </View>

            {/* Text Content */}
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text
                  className="text-2xl font-bold"
                  style={{ color: isLocked ? "#9ca3af" : "#ffffff" }}
                >
                  {item.name}
                </Text>
                {isLocked && (
                  <View className="bg-yellow-500 px-2 py-1 rounded-full ml-2">
                    <Text className="text-black text-xs font-bold">PRO</Text>
                  </View>
                )}
              </View>
              {item.description && (
                <Text
                  className="text-base"
                  style={{
                    color: isLocked ? "#6b7280" : "rgba(255, 255, 255, 0.8)",
                  }}
                >
                  {item.description}
                </Text>
              )}
              <View className="flex-row items-center mt-3">
                <Text
                  className="text-sm"
                  style={{
                    color: isLocked ? "#6b7280" : "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  {item.decks.length} deck
                  {item.decks.length !== 1 ? "s" : ""}
                </Text>
                <View
                  className="w-1 h-1 rounded-full mx-2"
                  style={{
                    backgroundColor: isLocked
                      ? "#6b7280"
                      : "rgba(255, 255, 255, 0.4)",
                  }}
                />
                <Text
                  className="text-sm"
                  style={{
                    color: isLocked ? "#fbbf24" : "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  {isLocked ? "Tap to unlock" : "Tap to explore →"}
                </Text>
              </View>
            </View>

            {/* Arrow Icon */}
            <View className="ml-2">
              {isLocked ? (
                <Ionicons name="lock-closed" size={24} color="#fbbf24" />
              ) : (
                <Text className="text-white/60 text-2xl">›</Text>
              )}
            </View>
          </View>

          {/* Bottom accent line */}
          <View
            className="h-1"
            style={{
              backgroundColor: isLocked ? "#6b7280" : gradient.end,
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
  const { isPremium, timeRemaining, premiumType } = usePremium();

  const navigateToPaywall = () => {
    router.push("/PaywallScreen");
  };

  const formatTimeRemaining = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <ImageBackground
      source={require("@/assets/images/deckedBackground.jpg")}
      resizeMode="cover"
      className="h-full"
    >
      {/* Dark overlay for better text readability */}
      <View className="absolute inset-0 bg-black/40" />

      <View className="flex-1 px-6 pt-[60px] ">
        {/* Header */}
        <View className="flex-row items-center relative pt-[40px] justify-between mb-8 ">
          <View className="flex-1 items-center">
            <Text className="text-white text-4xl font-bold text-center mb-2">
              What are we in the mood for?
            </Text>
            <View className="h-1 w-24 bg-purple-500 rounded-full" />
          </View>

          {/* Settings button */}
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            className="bg-black/50 px-4 py-2 rounded-xl ml-4 absolute top-0 right-0"
          >
            <Text className="text-white text-xl">⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Status Banner */}
        {isPremium && premiumType === "temporary" && timeRemaining && (
          <TouchableOpacity
            onPress={navigateToPaywall}
            activeOpacity={0.8}
            className="mb-6 rounded-2xl p-4"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              borderWidth: 2,
              borderColor: "#ef4444",
            }}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white font-bold text-base">
                  ⏰ Premium Active
                </Text>
                <Text className="text-red-200 text-sm">All decks unlocked</Text>
              </View>
              <View className="bg-red-600 px-4 py-2 rounded-xl">
                <Text className="text-white font-bold text-lg">
                  {formatTimeRemaining(timeRemaining)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {isPremium && premiumType === "subscription" && (
          <View
            className="mb-6 rounded-2xl p-4"
            style={{
              backgroundColor: "rgba(251, 191, 36, 0.2)",
              borderWidth: 2,
              borderColor: "#fbbf24",
            }}
          >
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">👑</Text>
              <View>
                <Text className="text-white font-bold text-base">
                  Premium Member
                </Text>
                <Text className="text-yellow-100 text-sm">
                  Unlimited access to all content
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Not premium - show upgrade banner */}
        {!isPremium && (
          <TouchableOpacity
            onPress={navigateToPaywall}
            activeOpacity={0.8}
            className="mb-6 rounded-2xl p-4"
            style={{
              backgroundColor: "rgba(251, 191, 36, 0.15)",
              borderWidth: 2,
              borderColor: "#fbbf24",
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-yellow-400 text-lg font-bold mb-1">
                  🔥 Unlock All Spicy Decks
                </Text>
                <Text className="text-yellow-100 text-sm">
                  click to get premium access now!
                </Text>
              </View>
              <View className="bg-yellow-500 px-4 py-3 rounded-xl">
                <Text className="text-black font-bold">Upgrade</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        <FlatList
          contentContainerStyle={{
            paddingBottom: 50,
            paddingTop: 10,
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
              onPremiumPress={navigateToPaywall}
            />
          )}
        />
      </View>
    </ImageBackground>
  );
};

export default index;
