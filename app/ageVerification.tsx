import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const AGE_VERIFICATION_KEY = "@deckedOut:ageVerified";

const AgeVerification = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleVerify = async (isOver18: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!isOver18) {
      Alert.alert(
        "Age Restriction",
        "You must be 18 or older to use this app. This app contains adult content.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);
    try {
      // Store age verification
      await AsyncStorage.setItem(AGE_VERIFICATION_KEY, "true");
      // Navigate to terms acceptance
      router.replace("/terms");
    } catch (error) {
      Alert.alert("Error", "Failed to save verification. Please try again.");
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/deckedBackground.jpg")}
      resizeMode="cover"
      className="h-full w-full"
    >
      <View className="absolute inset-0 bg-black/60" />

      <View className="flex-1 justify-center items-center px-8">
        <View
          className="rounded-3xl p-8 w-full max-w-md"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderWidth: 2,
            borderColor: "#9333ea",
          }}
        >
          <Text className="text-white text-4xl font-bold text-center mb-4">
            🔞 Age Verification
          </Text>

          <Text className="text-white text-xl text-center mb-6">
            You must be 18 years or older to use this app.
          </Text>

          <Text className="text-white/80 text-base text-center mb-8">
            This app contains adult content including sexual themes, explicit
            language, and mature subject matter. By continuing, you confirm that
            you are of legal age in your jurisdiction.
          </Text>

          <View className="space-y-4">
            <TouchableOpacity
              onPress={() => handleVerify(true)}
              disabled={loading}
              className="bg-green-600 py-4 rounded-xl"
              style={{
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text className="text-white text-center font-bold text-lg">
                I am 18 or older
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleVerify(false)}
              disabled={loading}
              className="bg-red-600 py-4 rounded-xl mt-4"
              style={{
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text className="text-white text-center font-bold text-lg">
                I am under 18
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default AgeVerification;
