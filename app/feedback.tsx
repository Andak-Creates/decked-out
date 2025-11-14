import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import * as Haptics from "expo-haptics";

type FeedbackForm = {
  type: "bug" | "suggestion" | "other";
  message: string;
  email?: string;
};

const Feedback = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FeedbackForm>({
    defaultValues: {
      type: "suggestion",
      message: "",
      email: "",
    },
  });

  const onSubmit = async (data: FeedbackForm) => {
    setSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // In a real app, you would send this to your backend
    // For now, we'll just show a success message
    setTimeout(() => {
      Alert.alert(
        "Thank You!",
        "Your feedback has been submitted. We appreciate your input!",
        [
          {
            text: "OK",
            onPress: () => {
              reset();
              router.back();
            },
          },
        ]
      );
      setSubmitting(false);
    }, 1000);
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

          <Text className="text-white text-4xl font-bold mb-2">Send Feedback</Text>
          <View className="h-1 w-24 bg-purple-500 rounded-full" />
        </View>

        <View
          className="rounded-2xl p-6"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderWidth: 1,
            borderColor: "#9333ea",
          }}
        >
          <Text className="text-white/80 text-base mb-6">
            We'd love to hear from you! Share your thoughts, report bugs, or
            suggest new features.
          </Text>

          {/* Feedback Type */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-3">
              Feedback Type
            </Text>
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row space-x-3">
                  {(["bug", "suggestion", "other"] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => onChange(type)}
                      className={`flex-1 py-3 rounded-xl ${
                        value === type ? "bg-purple-600" : "bg-white/10"
                      }`}
                    >
                      <Text className="text-white text-center font-semibold capitalize">
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          {/* Message */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-3">
              Your Message
            </Text>
            <Controller
              control={control}
              name="message"
              rules={{ required: "Please enter your feedback" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Tell us what's on your mind..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={6}
                  className="bg-white/10 text-white text-base p-4 rounded-xl"
                  style={{
                    textAlignVertical: "top",
                    minHeight: 120,
                  }}
                />
              )}
            />
            {errors.message && (
              <Text className="text-red-400 text-sm mt-2">
                {errors.message.message}
              </Text>
            )}
          </View>

          {/* Email (Optional) */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-3">
              Email (Optional)
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="your@email.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="bg-white/10 text-white text-base p-4 rounded-xl"
                />
              )}
            />
            <Text className="text-white/60 text-sm mt-2">
              Optional: Include your email if you'd like us to respond
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={submitting}
            className="bg-green-600 py-4 rounded-xl"
            style={{
              opacity: submitting ? 0.6 : 1,
            }}
          >
            <Text className="text-white text-center font-bold text-lg">
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default Feedback;

