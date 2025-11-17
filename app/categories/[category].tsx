import { Decks } from "@/assets/games/Decks";
import { trackDeckSelect } from "@/utils/analytics";
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
}: {
  item: (typeof Decks)[0]["decks"][0];
  index: number;
  category: string;
  onPress: () => void;
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

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
        onPress={onPress}
      >
        <View
          className="rounded-3xl overflow-hidden"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderWidth: 2,
            borderColor: style.gradient.start,
            shadowColor: style.gradient.start,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {/* Gradient background */}
          <View
            className="absolute inset-0"
            style={{
              backgroundColor: style.gradient.start,
              opacity: 0.15,
            }}
          />

          {/* Content */}
          <View className="p-6">
            {/* Header Row */}
            <View className="flex-row items-center mb-4">
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                style={{
                  backgroundColor: style.bgColor,
                  borderWidth: 2,
                  borderColor: style.gradient.start,
                }}
              >
                <Text className="text-3xl">{style.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-2xl font-bold mb-1">
                  {item.name}
                </Text>
                <Text className="text-white/80 text-base">
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
                    backgroundColor: style.gradient.start,
                    opacity: 0.3,
                  }}
                >
                  <Text className="text-white text-sm font-semibold">
                    {cardCount} {cardCount === 1 ? "card" : "cards"}
                  </Text>
                </View>
                {isMultiplayer && (
                  <View
                    className="px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: "#10b981",
                      opacity: 0.3,
                    }}
                  >
                    <Text className="text-white text-sm font-semibold">
                      👥 Multiplayer
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center">
                <Text className="text-white/60 text-sm mr-2">Play now</Text>
                <Text className="text-white/60 text-xl">→</Text>
              </View>
            </View>
          </View>

          {/* Bottom accent */}
          <View
            className="h-1.5"
            style={{
              backgroundColor: style.gradient.end,
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

  const currentCategory = Decks.find((item) => item.slug === category);

  if (!category || !currentCategory) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-xl">Category Not Found</Text>
      </View>
    );
  }

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
        <View className="flex-row items-center mb-6 mt-[30px] pt-[30px] ">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-black/50 px-4 py-2 rounded-xl mr-4 absolute top-0 left-0"
          >
            <Text className="text-white text-lg">←</Text>
          </TouchableOpacity>
          <View className="flex-1 mt-[30px]">
            <Text className="text-white text-[40px] font-bold">
              {currentCategory.name}
            </Text>
            <Text className="text-white/70 text-sm text-[16px] mt-1">
              {currentCategory.description}
            </Text>
          </View>
        </View>

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
            />
          )}
        />
      </View>
    </ImageBackground>
  );
};

export default CardCategory;
