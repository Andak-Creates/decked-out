import "@/app/globals.css";
import { PremiumProvider } from "@/context/PremiumContext";
import { AuthProvider } from "@/context/SupabaseAuthContext";
import { Stack } from "expo-router";

import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PremiumProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </PremiumProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
