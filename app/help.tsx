import { useRouter } from "expo-router";
import React from "react";
import {
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Help = () => {
  const router = useRouter();

  const faqs = [
    {
      question: "How do I play?",
      answer:
        "Select a category, choose a deck, set up players (for multiplayer games), and start playing! Tap 'Reveal Card' to see your card, then tap 'Next Card' to continue.",
    },
    {
      question: "What is the gender filter?",
      answer:
        "When enabled, cards that require two players will automatically assign players of opposite genders. This ensures appropriate pairings for intimate dares.",
    },
    {
      question: "Can I skip cards?",
      answer:
        "Yes! After revealing a card, you'll see a 'Skip This Card' button. Use it if a card makes you uncomfortable.",
    },
    {
      question: "How do I add more players?",
      answer:
        "In the game setup screen, tap the '+ Add Player' button. You can add as many players as you want for multiplayer games.",
    },
    {
      question: "What do the timers mean?",
      answer:
        "Some cards have countdown timers. These indicate how long you have to complete a dare or how long an action should last.",
    },
    {
      question: "Can I play alone?",
      answer:
        "Yes! Some decks are single-player. Look for 'Never Have I Ever' decks which don't require multiple players.",
    },
    {
      question: "How do I logout?",
      answer:
        "Go to Settings (gear icon in the top right of the categories screen) and tap 'Logout'.",
    },
    {
      question: "Is my data private?",
      answer:
        "Yes! All game data is stored locally on your device. We only use your email for authentication. See our Privacy Policy in Settings for more details.",
    },
  ];

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

          <Text className="text-white text-4xl font-bold mb-2">Help & FAQ</Text>
          <View className="h-1 w-24 bg-purple-500 rounded-full" />
        </View>

        {/* FAQs */}
        {faqs.map((faq, index) => (
          <View
            key={index}
            className="rounded-2xl p-6 mb-4"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              borderWidth: 1,
              borderColor: "#9333ea",
            }}
          >
            <Text className="text-white text-lg font-bold mb-3">
              {faq.question}
            </Text>
            <Text className="text-white/80 text-base leading-6">
              {faq.answer}
            </Text>
          </View>
        ))}

        {/* Contact */}
        <View
          className="rounded-2xl p-6 mt-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderWidth: 1,
            borderColor: "#9333ea",
          }}
        >
          <Text className="text-white text-lg font-bold mb-3">
            Need More Help?
          </Text>
          <Text className="text-white/80 text-base mb-4">
            If you have more questions or need support, please use the Feedback
            feature in Settings to contact us.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/feedback")}
            className="bg-purple-600 py-3 rounded-xl mt-2"
          >
            <Text className="text-white text-center font-semibold">
              Send Feedback
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default Help;

