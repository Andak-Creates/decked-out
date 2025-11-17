import { useAuth } from "@/context/AuthContext";
import { auth } from "@/firebaseConfig";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
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
  const [loading, setLoading] = useState(false);

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
            await signOut(auth);
            router.replace("/login");
          } catch (error: any) {
            Alert.alert("Error", "Failed to logout. Please try again.");
            setLoading(false);
          }
        },
      },
    ]);
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
          className="bg-red-600 py-4 rounded-xl"
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
