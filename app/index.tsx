import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Image, ImageBackground, Text } from "react-native";

export default function SplashScreenPage() {
  const router = useRouter();

  useEffect(() => {
    const prepare = async () => {
      try {
        // Prevent auto-hide
        await SplashScreen.preventAutoHideAsync();

        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Hide splash manually after delay
        await SplashScreen.hideAsync();

        // Navigate to login
        router.replace("/login");
      } catch (err) {
        console.warn("Splash screen error:", err);
        router.replace("/login");
      }
    };

    prepare();
  }, []);

  return (
    <ImageBackground
      source={require("../assets/images/deckedBackground.jpg")}
      resizeMode="cover"
      className="flex-1 justify-center items-center"
    >
      <Image
        source={require("../assets/images/logo.png")}
        className="h-[200px] w-[200px] mb-0"
        resizeMode="cover"
      />
      <Text className="font-bold text-[#FFFFFF] mt-0 text-center text-2xl">
        Your Digital home for naughty Games?
      </Text>
    </ImageBackground>
  );
}
