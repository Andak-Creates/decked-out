import { useAuth } from "@/context/AuthContext"; // 🔥 make sure this is correct
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Image, ImageBackground, Text } from "react-native";

export default function SplashScreenPage() {
  const router = useRouter();
  const { user, loading } = useAuth(); // ✅ Auth context

  useEffect(() => {
    const prepare = async () => {
      try {
        // Keep splash screen visible
        await SplashScreen.preventAutoHideAsync();

        // Simulate loading delay (optional)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (!loading) {
          // ✅ Redirect based on auth status
          if (user) {
            router.replace("/categories");
          } else {
            router.replace("/login"); // or /signUp
          }

          // Hide splash after navigation
          await SplashScreen.hideAsync();
        }
      } catch (err) {
        console.warn("Splash screen error:", err);
        await SplashScreen.hideAsync();
        router.replace("/login");
      }
    };

    prepare();
  }, [loading, user]);

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
      <Text className="font-bold text-[#FFFFFF] mt-0 text-center text-2xl w-[80%] mx-auto">
        Your Digital home for naughty Games?
      </Text>
    </ImageBackground>
  );
}
