import "@/app/globals.css";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import CustomSplash from "@/components/CustomSplash";
import { PremiumProvider } from "@/context/PremiumContext";
import { AuthProvider, useAuth } from "@/context/SupabaseAuthContext";

SplashScreen.preventAutoHideAsync();

const AGE_VERIFICATION_KEY = "@deckedOut:ageVerified";
const TERMS_ACCEPTED_KEY = "@deckedOut:termsAccepted";

export default function RootLayout() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        if (loading) return;

        const [ageVerified, termsAccepted] = await Promise.all([
          AsyncStorage.getItem(AGE_VERIFICATION_KEY),
          AsyncStorage.getItem(TERMS_ACCEPTED_KEY),
        ]);

        if (!ageVerified) router.replace("/ageVerification");
        else if (!termsAccepted) router.replace("/terms");
        else if (user) router.replace("/categories");
        else router.replace("/login");

        await SplashScreen.hideAsync();
      } catch (err) {
        console.warn("Splash error:", err);
      } finally {
        // ✅ Always hide splash after 3s just in case
        setTimeout(() => setReady(true), 3000);
      }
    }

    prepare();
  }, [loading, user]);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <CustomSplash />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PremiumProvider>
          <Slot />
        </PremiumProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
