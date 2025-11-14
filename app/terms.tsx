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

const TERMS_ACCEPTED_KEY = "@deckedOut:termsAccepted";

const Terms = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    try {
      await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, "true");
      router.replace("/login");
    } catch (error) {
      Alert.alert("Error", "Failed to save acceptance. Please try again.");
      setLoading(false);
    }
  };

  const handleDecline = () => {
    Alert.alert(
      "Terms Required",
      "You must accept the Terms of Service and Privacy Policy to use this app.",
      [{ text: "OK" }]
    );
  };

  return (
    <ImageBackground
      source={require("../assets/images/deckedBackground.jpg")}
      resizeMode="cover"
      className="h-full w-full"
    >
      <View className="absolute inset-0 bg-black/60" />

      <View className="flex-1 px-6 py-8">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            className="rounded-3xl p-6 mb-6"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              borderWidth: 2,
              borderColor: "#9333ea",
            }}
          >
            <Text className="text-white text-3xl font-bold text-center mb-6">
              Terms of Service & Privacy Policy
            </Text>

            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">
                Terms of Service
              </Text>
              <Text className="text-white/80 text-sm mb-4 leading-6">
                By using Decked Out, you agree to the following terms:
              </Text>
              <Text className="text-white/80 text-sm mb-2 leading-6">
                • You are 18 years or older
              </Text>
              <Text className="text-white/80 text-sm mb-2 leading-6">
                • You will use the app responsibly and legally
              </Text>
              <Text className="text-white/80 text-sm mb-2 leading-6">
                • You understand the app contains adult content
              </Text>
              <Text className="text-white/80 text-sm mb-2 leading-6">
                • You will not share inappropriate content with minors
              </Text>
              <Text className="text-white/80 text-sm mb-2 leading-6">
                • We reserve the right to remove accounts that violate these
                terms
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">
                Privacy Policy
              </Text>
              <Text className="text-white/80 text-sm mb-2 leading-6">
                • We collect email addresses for authentication purposes only
              </Text>
              <Text className="text-white/80 text-sm mb-2 leading-6">
                • Game data and player information are stored locally on your
                device
              </Text>
              <Text className="text-white/80 text-sm mb-2 leading-6">
                • We do not share your personal information with third parties
              </Text>
              <Text className="text-white/80 text-sm mb-2 leading-6">
                • You can delete your account and data at any time
              </Text>
              <Text className="text-white/80 text-sm mb-2 leading-6">
                • We use Firebase for authentication and analytics (see Firebase
                Privacy Policy)
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">
                Content Warning
              </Text>
              <Text className="text-white/80 text-sm leading-6">
                This app contains explicit sexual content, adult language, and
                mature themes. All content is intended for adults only. Use
                discretion when playing with others.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View className="space-y-3">
          <TouchableOpacity
            onPress={handleAccept}
            disabled={loading}
            className="bg-green-600 py-4 rounded-xl"
            style={{
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text className="text-white text-center font-bold text-lg">
              I Accept
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDecline}
            disabled={loading}
            className="bg-red-600 py-4 rounded-xl mt-4"
            style={{
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text className="text-white text-center font-bold text-lg">
              Decline
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Terms;
