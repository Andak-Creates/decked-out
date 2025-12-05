import { GameStats, loadStats, resetStats } from "@/utils/supabaseStats";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Stats = () => {
  const router = useRouter();
  const [stats, setStats] = useState<GameStats | null>(null);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    const userStats = await loadStats();
    setStats(userStats);
  };

  const handleReset = async () => {
    await resetStats();
    await loadUserStats();
  };

  if (!stats) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white">Loading stats...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/images/deckedBackground.jpg")}
      resizeMode="cover"
      className="h-full w-full"
    >
      <View className="absolute inset-0 bg-black/40" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-black/50 px-4 py-2 rounded-xl self-start mb-4"
          >
            <Text className="text-white text-lg">← Back</Text>
          </TouchableOpacity>

          <Text className="text-white text-4xl font-bold mb-2">
            Game Statistics
          </Text>
          <View className="h-1 w-24 bg-purple-500 rounded-full" />
        </View>

        {/* Stats Cards */}
        <View
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderWidth: 1,
            borderColor: "#9333ea",
          }}
        >
          <Text className="text-white text-xl font-bold mb-4">Overview</Text>

          <View className="mb-4">
            <Text className="text-white/60 text-sm mb-1">
              Total Games Played
            </Text>
            <Text className="text-white text-3xl font-bold">
              {stats.totalGames}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-white/60 text-sm mb-1">Total Cards Seen</Text>
            <Text className="text-white text-3xl font-bold">
              {stats.totalCardsSeen}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-white/60 text-sm mb-1">Last Played</Text>
            <Text className="text-white text-xl font-semibold">
              {stats.lastPlayed}
            </Text>
          </View>
        </View>

        {/* Favorites */}
        <View
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderWidth: 1,
            borderColor: "#9333ea",
          }}
        >
          <Text className="text-white text-xl font-bold mb-4">Favorites</Text>

          <View className="mb-4">
            <Text className="text-white/60 text-sm mb-1">
              Favorite Category
            </Text>
            <Text className="text-white text-xl font-semibold">
              {stats.favoriteCategory}
            </Text>
          </View>

          <View>
            <Text className="text-white/60 text-sm mb-1">Favorite Deck</Text>
            <Text className="text-white text-xl font-semibold">
              {stats.favoriteDeck}
            </Text>
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          onPress={handleReset}
          className="bg-red-600 py-4 rounded-xl"
        >
          <Text className="text-white text-center font-bold text-lg">
            Reset Statistics
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

export default Stats;
