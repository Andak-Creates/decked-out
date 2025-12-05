import { usePremium } from "@/context/PremiumContext";
import { useAuth } from "@/context/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Settings = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { isPremium, premiumType, timeRemaining } = usePremium();
  const [loading, setLoading] = useState(false);

  const formatTimeRemaining = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await supabase.auth.signOut();
            router.replace("/login");
          } catch (error: any) {
            Alert.alert("Error", "Failed to logout. Please try again.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // Debug function to reset premium (for testing)
  const handleResetPremium = () => {
    Alert.alert(
      "Reset Premium Status",
      "This will remove your premium access. (Test Mode Only)",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                "mock_premium_status",
                "temp_pass_end",
                "temp_pass_remaining",
              ]);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              Alert.alert(
                "Success",
                "Premium status reset. Restart the app to see changes."
              );
            } catch (error) {
              Alert.alert("Error", "Failed to reset premium status.");
            }
          },
        },
      ]
    );
  };

  const handleManageSubscription = () => {
    if (premiumType === "subscription") {
      Alert.alert(
        "Manage Subscription",
        "In production, this would open your App Store/Play Store subscription management.\n\n(Test Mode: Your subscription is simulated)",
        [
          {
            text: "Cancel Subscription (Test)",
            style: "destructive",
            onPress: handleResetPremium,
          },
          {
            text: "Close",
            style: "cancel",
          },
        ]
      );
    } else {
      router.push("/PaywallScreen");
    }
  };

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

          <Text className="text-white text-4xl font-bold mb-2">Settings</Text>
          <View className="h-1 w-24 bg-purple-500 rounded-full" />
        </View>

        {/* Premium Status Section */}
        <View
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: isPremium
              ? "rgba(251, 191, 36, 0.2)"
              : "rgba(0, 0, 0, 0.6)",
            borderWidth: 2,
            borderColor: isPremium ? "#fbbf24" : "#9333ea",
          }}
        >
          <Text className="text-white text-xl font-bold mb-4">
            Premium Status
          </Text>

          {isPremium ? (
            <>
              {/* Premium Active */}
              <View className="flex-row items-center mb-4">
                <Text className="text-4xl mr-3">
                  {premiumType === "subscription" ? "👑" : "⏰"}
                </Text>
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg mb-1">
                    {premiumType === "subscription"
                      ? "Premium Member"
                      : "Premium Pass Active"}
                  </Text>
                  <Text className="text-white/70 text-sm">
                    {premiumType === "subscription"
                      ? "Unlimited access to all decks"
                      : `Time remaining: ${formatTimeRemaining(
                          timeRemaining || 0
                        )}`}
                  </Text>
                </View>
              </View>

              {/* Test Mode Badge */}
              <View className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-3 mb-4">
                <View className="flex-row items-center">
                  <Text className="text-xl mr-2">🧪</Text>
                  <Text className="text-yellow-400 text-sm font-semibold">
                    Test Mode Active
                  </Text>
                </View>
              </View>

              {/* Manage Subscription Button */}
              <TouchableOpacity
                onPress={handleManageSubscription}
                className="bg-yellow-500 py-3 rounded-xl mb-2"
              >
                <Text className="text-black text-center font-bold text-base">
                  {premiumType === "subscription"
                    ? "Manage Subscription"
                    : "Upgrade to Unlimited"}
                </Text>
              </TouchableOpacity>

              {/* Reset Button (Test Mode Only) */}
              <TouchableOpacity
                onPress={handleResetPremium}
                className="bg-red-500/20 border border-red-500 py-3 rounded-xl"
              >
                <Text className="text-red-400 text-center font-bold text-sm">
                  Reset Premium (Test)
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Not Premium */}
              <View className="flex-row items-center mb-4">
                <Ionicons name="lock-closed" size={32} color="#9ca3af" />
                <View className="flex-1 ml-3">
                  <Text className="text-white font-bold text-lg mb-1">
                    Free Plan
                  </Text>
                  <Text className="text-white/70 text-sm">
                    Limited to Mild Mischief deck
                  </Text>
                </View>
              </View>

              {/* Upgrade Benefits */}
              <View className="mb-4">
                <Text className="text-white/80 text-sm font-semibold mb-2">
                  Upgrade to unlock:
                </Text>
                {[
                  "Risky Business deck",
                  "Sin City deck",
                  "All future premium decks",
                ].map((benefit, index) => (
                  <View key={index} className="flex-row items-center mb-2">
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#fbbf24"
                    />
                    <Text className="text-white/70 text-sm ml-2">
                      {benefit}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Upgrade Button */}
              <TouchableOpacity
                onPress={() => router.push("/PaywallScreen")}
                className="bg-yellow-500 py-4 rounded-xl"
              >
                <Text className="text-black text-center font-bold text-lg">
                  🔥 Upgrade to Premium
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* User Info */}
        <View
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderWidth: 1,
            borderColor: "#9333ea",
          }}
        >
          <Text className="text-white text-xl font-bold mb-2">Account</Text>
          <Text className="text-white/70 text-base">{user?.email}</Text>
        </View>

        {/* Settings Options */}
        <View
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderWidth: 1,
            borderColor: "#9333ea",
          }}
        >
          <Text className="text-white text-xl font-bold mb-4">Preferences</Text>

          <TouchableOpacity
            onPress={() => router.push("/help")}
            className="flex-row items-center justify-between py-4 border-b border-white/10"
          >
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">❓</Text>
              <Text className="text-white text-lg">Help & FAQ</Text>
            </View>
            <Text className="text-white/60 text-xl">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/feedback")}
            className="flex-row items-center justify-between py-4 border-b border-white/10"
          >
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">💬</Text>
              <Text className="text-white text-lg">Send Feedback</Text>
            </View>
            <Text className="text-white/60 text-xl">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/stats")}
            className="flex-row items-center justify-between py-4"
          >
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">📊</Text>
              <Text className="text-white text-lg">Game Statistics</Text>
            </View>
            <Text className="text-white/60 text-xl">›</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderWidth: 1,
            borderColor: "#9333ea",
          }}
        >
          <Text className="text-white text-xl font-bold mb-4">About</Text>
          <Text className="text-white/70 text-sm mb-2">Decked Out v1.0.0</Text>
          <Text className="text-white/70 text-sm">
            Your digital home for naughty games
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          disabled={loading}
          className="bg-red-600 py-4 rounded-xl mb-8"
          style={{
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text className="text-white text-center font-bold text-lg">
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

export default Settings;
