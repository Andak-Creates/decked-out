import { Decks } from "@/assets/games/Decks";
import { isDeckPremium, usePremium } from "@/context/PremiumContext";
import { trackDeckSelect } from "@/utils/supabaseAnalytics";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Animated,
  FlatList,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Separate component for deck card to properly use hooks
const DeckCard = ({
  item,
  index,
  category,
  onPress,
  onPremiumPress,
}: {
  item: (typeof Decks)[0]["decks"][0];
  index: number;
  category: string;
  onPress: () => void;
  onPremiumPress: () => void;
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const { isPremium } = usePremium();
  const isLocked = isDeckPremium(category) && !isPremium;

  // Get deck type colors and icons
  const getDeckStyle = (deckName: string, index: number) => {
    const styles = [
      {
        gradient: { start: "#667eea", end: "#764ba2" },
        icon: "💬",
        bgColor: "rgba(102, 126, 234, 0.2)",
      },
      {
        gradient: { start: "#f093fb", end: "#f5576c" },
        icon: "🎯",
        bgColor: "rgba(240, 147, 251, 0.2)",
      },
      {
        gradient: { start: "#4facfe", end: "#00f2fe" },
        icon: "⚡",
        bgColor: "rgba(79, 172, 254, 0.2)",
      },
    ];
    return styles[index % styles.length];
  };

  const style = getDeckStyle(item.name, index);
  const cardCount = item.cards?.length || 0;
  const isMultiplayer =
    item.type === "multi-player" || item.type === "multiplayer-player";

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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
        marginBottom: 16,
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
              : "rgba(0, 0, 0, 0.6)",
            borderWidth: 2,
            borderColor: isLocked ? "#9ca3af" : style.gradient.start,
            shadowColor: isLocked ? "#000" : style.gradient.start,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isLocked ? 0.3 : 0.5,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {/* Gradient background */}
          <View
            className="absolute inset-0"
            style={{
              backgroundColor: isLocked ? "#374151" : style.gradient.start,
              opacity: isLocked ? 0.2 : 0.15,
            }}
          />

          {/* Lock Overlay */}
          {isLocked && (
            <View className="absolute inset-0 items-center justify-center z-10 bg-black/40">
              <View className="bg-black/80 rounded-2xl px-6 py-4 items-center">
                <Ionicons name="lock-closed" size={32} color="#fbbf24" />
                <Text className="text-yellow-400 text-lg font-bold mt-2">
                  PREMIUM
                </Text>
              </View>
            </View>
          )}

          {/* Content */}
          <View className="p-6" style={{ opacity: isLocked ? 0.6 : 1 }}>
            {/* Header Row */}
            <View className="flex-row items-center mb-4">
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                style={{
                  backgroundColor: style.bgColor,
                  borderWidth: 2,
                  borderColor: isLocked ? "#6b7280" : style.gradient.start,
                }}
              >
                <Text className="text-3xl">{style.icon}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: isLocked ? "#9ca3af" : "#ffffff" }}
                  >
                    {item.name}
                  </Text>
                  {isLocked && (
                    <View className="bg-yellow-500 px-2 py-0.5 rounded-full ml-2">
                      <Text className="text-black text-xs font-bold">PRO</Text>
                    </View>
                  )}
                </View>
                <Text
                  className="text-base"
                  style={{
                    color: isLocked ? "#6b7280" : "rgba(255, 255, 255, 0.8)",
                  }}
                >
                  {item.description}
                </Text>
              </View>
            </View>

            {/* Info Row */}
            <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-white/10">
              <View className="flex-row items-center">
                <View
                  className="px-3 py-1.5 rounded-full mr-3"
                  style={{
                    backgroundColor: isLocked
                      ? "#374151"
                      : style.gradient.start,
                    opacity: isLocked ? 1 : 0.3,
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: isLocked ? "#9ca3af" : "#ffffff" }}
                  >
                    {cardCount} {cardCount === 1 ? "card" : "cards"}
                  </Text>
                </View>
                {isMultiplayer && (
                  <View
                    className="px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: isLocked ? "#374151" : "#10b981",
                      opacity: isLocked ? 1 : 0.3,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: isLocked ? "#9ca3af" : "#ffffff" }}
                    >
                      👥 Multiplayer
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center">
                {isLocked ? (
                  <>
                    <Text className="text-yellow-400 text-sm mr-2 font-semibold">
                      Unlock
                    </Text>
                    <Ionicons name="lock-closed" size={16} color="#fbbf24" />
                  </>
                ) : (
                  <>
                    <Text className="text-white/60 text-sm mr-2">Play now</Text>
                    <Text className="text-white/60 text-xl">→</Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Bottom accent */}
          <View
            className="h-1.5"
            style={{
              backgroundColor: isLocked ? "#6b7280" : style.gradient.end,
              opacity: 0.8,
            }}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CardCategory = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const { isPremium, timeRemaining, premiumType } = usePremium();

  const currentCategory = Decks.find((item) => item.slug === category);
  const isLockedCategory = isDeckPremium(category as string) && !isPremium;

  if (!category || !currentCategory) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-xl">Category Not Found</Text>
      </View>
    );
  }

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
      className="h-full w-full"
    >
      {/* Dark overlay */}
      <View className="absolute inset-0 bg-black/40" />

      <View className="flex-1 px-6 pt-16 pb-8">
        {/* Header with back button */}
        <View className="flex-row items-center mb-6 mt-[30px] pt-[30px]">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-black/50 px-4 py-2 rounded-xl mr-4 absolute top-0 left-0"
          >
            <Text className="text-white text-lg">←</Text>
          </TouchableOpacity>
          <View className="flex-1 mt-[30px]">
            <View className="flex-row items-center">
              <Text className="text-white text-[40px] font-bold">
                {currentCategory.name}
              </Text>
              {isLockedCategory && (
                <View className="ml-3 bg-yellow-500 px-3 py-1 rounded-full">
                  <Text className="text-black text-sm font-bold">PREMIUM</Text>
                </View>
              )}
            </View>
            <Text className="text-white/70 text-sm text-[16px] mt-1">
              {currentCategory.description}
            </Text>
          </View>
        </View>

        {/* Premium Status Banner */}
        {isPremium && premiumType === "temporary" && timeRemaining && (
          <View
            className="mb-4 rounded-2xl p-4"
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
                <Text className="text-red-200 text-sm">
                  Enjoy unlimited access
                </Text>
              </View>
              <View className="bg-red-600 px-4 py-2 rounded-xl">
                <Text className="text-white font-bold text-lg">
                  {formatTimeRemaining(timeRemaining)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {isPremium && premiumType === "subscription" && (
          <View
            className="mb-4 rounded-2xl p-4"
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
                  Unlimited access to all decks
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Locked Category Warning */}
        {isLockedCategory && (
          <TouchableOpacity
            onPress={navigateToPaywall}
            activeOpacity={0.8}
            className="mb-4 rounded-2xl p-5"
            style={{
              backgroundColor: "rgba(251, 191, 36, 0.15)",
              borderWidth: 2,
              borderColor: "#fbbf24",
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-yellow-400 text-lg font-bold mb-1">
                  🔥 Unlock This Spicy Content
                </Text>
                <Text className="text-yellow-100 text-sm">
                  Get premium to access all {currentCategory.decks.length} decks
                </Text>
              </View>
              <View className="bg-yellow-500 px-4 py-3 rounded-xl">
                <Text className="text-black font-bold">Upgrade</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Decks List */}
        <FlatList
          contentContainerStyle={{
            paddingBottom: 50,
            marginTop: 10,
          }}
          data={currentCategory.decks}
          keyExtractor={(deck) => deck.name}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <DeckCard
              item={item}
              index={index}
              category={category as string}
              onPress={() => {
                trackDeckSelect(item.slug, category as string);
                router.push({
                  pathname: "/categories/[categories]/[deck]",
                  params: {
                    categories: category as string,
                    deck: item.slug,
                  },
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

export default CardCategory;
