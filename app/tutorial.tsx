import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const TUTORIAL_COMPLETED_KEY = "@deckedOut:tutorialCompleted";

const Tutorial = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Decked Out! 🎴",
      content:
        "Your digital home for naughty games. Choose from different intensity levels and play with friends or solo.",
      icon: "🎮",
    },
    {
      title: "Select a Category",
      content:
        "Pick from Mild Mischief (light & playful), Risky Business (medium intensity), or Sin City (most extreme).",
      icon: "📂",
    },
    {
      title: "Choose a Deck",
      content:
        "Each category has different game types like Truth or Dare and Never Have I Ever. Select what you're in the mood for!",
      icon: "🃏",
    },
    {
      title: "Set Up Players",
      content:
        "For multiplayer games, add players and select their genders. Enable the gender filter to ensure appropriate pairings.",
      icon: "👥",
    },
    {
      title: "Play & Have Fun!",
      content:
        "Reveal cards, complete challenges, and rotate through players. You can skip cards if needed. Enjoy responsibly!",
      icon: "🎉",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_COMPLETED_KEY, "true");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/categories");
    } catch (error) {
      router.replace("/categories");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/deckedBackground.jpg")}
      resizeMode="cover"
      className="h-full w-full"
    >
      <View className="absolute inset-0 bg-black/60" />

      <View className="flex-1 justify-between px-8 py-16">
        {/* Content */}
        <View className="flex-1 justify-center">
          <View
            className="rounded-3xl p-8 items-center"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              borderWidth: 2,
              borderColor: "#9333ea",
            }}
          >
            <Text className="text-6xl mb-6">{steps[currentStep].icon}</Text>
            <Text className="text-white text-3xl font-bold text-center mb-6">
              {steps[currentStep].title}
            </Text>
            <Text className="text-white/80 text-lg text-center leading-7">
              {steps[currentStep].content}
            </Text>
          </View>

          {/* Progress Dots */}
          <View className="flex-row justify-center mt-8 space-x-2">
            {steps.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === currentStep ? "bg-purple-500 w-8" : "bg-white/30 w-2"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Buttons */}
        <View className="space-y-3">
          <TouchableOpacity
            onPress={handleNext}
            className="bg-purple-600 py-4 rounded-xl"
          >
            <Text className="text-white text-center font-bold text-lg">
              {currentStep < steps.length - 1 ? "Next →" : "Get Started!"}
            </Text>
          </TouchableOpacity>

          {currentStep < steps.length - 1 && (
            <TouchableOpacity
              onPress={handleSkip}
              className="bg-white/10 py-3 rounded-xl"
            >
              <Text className="text-white/70 text-center font-semibold">
                Skip Tutorial
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ImageBackground>
  );
};

export default Tutorial;

