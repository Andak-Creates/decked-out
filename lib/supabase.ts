import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Get Supabase credentials with fallbacks
const supabaseUrl =
  process.env.EXPO_PUBLIC_PROJECT_URL ||
  Constants.expoConfig?.extra?.supabaseUrl ||
  "";

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_ANON_KEY ||
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  "";

// Log for debugging (remove in production)
console.log("🔧 Supabase Config:", {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? supabaseUrl.substring(0, 20) + "..." : "MISSING",
});

// Validate credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase credentials!", {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey,
  });
  throw new Error(
    "Supabase configuration is missing. Please check your app.json or environment variables."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log("✅ Supabase client initialized");
