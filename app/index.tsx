import { useAuth } from "@/context/SupabaseAuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Image, ImageBackground, Text } from "react-native";

const AGE_VERIFICATION_KEY = "@deckedOut:ageVerified";
const TERMS_ACCEPTED_KEY = "@deckedOut:termsAccepted";

export default function SplashScreenPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checkingVerification, setCheckingVerification] = useState(true);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Keep splash screen visible
        await SplashScreen.preventAutoHideAsync();

        // Optional: simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (!loading) {
          // Check age verification and terms acceptance
          const [ageVerified, termsAccepted] = await Promise.all([
            AsyncStorage.getItem(AGE_VERIFICATION_KEY),
            AsyncStorage.getItem(TERMS_ACCEPTED_KEY),
          ]);

          setCheckingVerification(false);

          // Navigate based on verification status
          if (!ageVerified) {
            router.replace("/ageVerification");
          } else if (!termsAccepted) {
            router.replace("/terms");
          } else if (user) {
            router.replace("/categories"); // logged in → home
          } else {
            router.replace("/login"); // not logged in → login/signup
          }

          // Hide splash after navigation
          await SplashScreen.hideAsync();
        }
      } catch (err) {
        console.warn("Splash screen error:", err);
        await SplashScreen.hideAsync();
        router.replace("/ageVerification");
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
        className="h-[200px] w-[200px]"
        resizeMode="cover"
      />
      <Text className="font-bold text-[#FFFFFF] mt-0 text-center text-2xl w-[80%] mx-auto">
        Your Digital home for Spicy Games
      </Text>
    </ImageBackground>
  );
}
