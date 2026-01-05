import { supabase } from "@/lib/supabase";
import {
  getAvailablePackages,
  initializeRevenueCat,
  purchasePackage as purchasePackageService,
  restorePurchases as restorePurchasesService,
  SubscriptionPackage,
} from "@/services/paymentService";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { useAuth } from "./SupabaseAuthContext";

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  packages: SubscriptionPackage[];
  purchasePackage: (
    pkg: SubscriptionPackage
  ) => Promise<{ success: boolean; paymentUrl?: string; error?: string }>;
  restorePurchases: () => Promise<boolean>;
  timeRemaining: number | null;
  premiumType: "subscription" | "temporary" | null;
  isRevenueCatInitialized: boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [premiumType, setPremiumType] = useState<
    "subscription" | "temporary" | null
  >(null);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isRevenueCatInitialized, setIsRevenueCatInitialized] = useState(false);

  // Initialize RevenueCat and set up listeners
  useEffect(() => {
    const initialize = async () => {
      console.log("🚀 PremiumContext: Starting initialization...");

      // CRITICAL: Set maximum timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        console.error("⏰ PremiumContext timeout - forcing completion");
        setIsLoading(false);
      }, 10000); // 10 second maximum

      try {
        if (user) {
          console.log("👤 User found:", user.id);

          // Initialize RevenueCat with timeout
          console.log("🔧 Initializing RevenueCat...");
          const result = await Promise.race([
            initializeRevenueCat(user.id),
            new Promise<any>((_, reject) =>
              setTimeout(
                () => reject(new Error("RevenueCat init timeout")),
                3000
              )
            ),
          ]).catch((error) => {
            console.warn("RevenueCat initialization failed:", error);
            return { isMock: true };
          });

          console.log("✅ RevenueCat result:", result);
          setIsRevenueCatInitialized(!result.isMock);

          // Load available packages with timeout
          console.log("📦 Loading packages...");
          const availablePackages = await Promise.race([
            getAvailablePackages(),
            new Promise<SubscriptionPackage[]>((_, reject) =>
              setTimeout(() => reject(new Error("Packages timeout")), 3000)
            ),
          ]).catch((error) => {
            console.warn("Failed to load packages:", error);
            return [];
          });

          console.log("✅ Packages loaded:", availablePackages.length);
          setPackages(availablePackages);

          // Load initial premium status with timeout
          console.log("💎 Loading premium status...");
          await Promise.race([
            loadPremiumStatus(),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Premium status timeout")),
                3000
              )
            ),
          ]).catch((error) => {
            console.warn("Failed to load premium status:", error);
            setIsLoading(false); // Ensure loading is set to false on error
          });

          console.log("✅ Premium status loaded");
        } else {
          console.log("⚠️ No user found, skipping initialization");
        }
      } catch (error) {
        console.error("❌ Error initializing payment service:", error);
      } finally {
        // CRITICAL: Always clear timeout and set loading to false
        clearTimeout(timeoutId);
        setIsLoading(false);
        console.log("✅ PremiumContext initialization complete");
      }
    };

    initialize();
  }, [user]);

  // Timer for temporary passes
  useEffect(() => {
    if (timeRemaining && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev && prev > 0) {
            return prev - 1;
          }
          return null;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeRemaining === 0) {
      handleTemporaryPassExpired();
    }
  }, [timeRemaining]);

  const loadPremiumStatus = async () => {
    if (!user) {
      console.log("⚠️ No user in loadPremiumStatus");
      return;
    }

    try {
      console.log("📡 Fetching premium status from Supabase...");

      // Fallback to Supabase if RevenueCat not initialized or no active entitlement
      const { data, error } = await supabase
        .from("premium_status")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned" which is fine
        console.error("❌ Error loading premium status from Supabase:", error);
        throw error;
      }

      console.log("📊 Premium status from Supabase:", {
        data,
        error: error?.code,
      });

      if (data) {
        console.log("✅ Setting premium status:", {
          isPremium: data.is_premium,
          premiumType: data.premium_type,
          expiresAt: data.expires_at,
        });
        setIsPremium(data.is_premium);
        setPremiumType(data.premium_type);

        // Calculate time remaining for temporary passes
        if (data.premium_type === "temporary" && data.expires_at) {
          const remaining = Math.floor(
            (new Date(data.expires_at).getTime() - Date.now()) / 1000
          );
          if (remaining > 0) {
            setTimeRemaining(remaining);
          } else {
            await handleTemporaryPassExpired();
          }
        } else {
          setTimeRemaining(null);
        }
      } else {
        console.log("ℹ️ No premium status data found");
        setIsPremium(false);
        setPremiumType(null);
        setTimeRemaining(null);
      }
    } catch (error) {
      console.error("Error loading premium status:", error);
      // Don't throw - let it fail gracefully
      setIsPremium(false);
      setPremiumType(null);
      setTimeRemaining(null);
    }
    // Note: setIsLoading is handled in the main initialize function's finally block
  };

  const handleTemporaryPassExpired = async () => {
    if (!user) return;

    try {
      await supabase
        .from("premium_status")
        .update({
          is_premium: false,
          premium_type: null,
          expires_at: null,
        })
        .eq("user_id", user.id);

      setTimeRemaining(null);
      setPremiumType(null);
      setIsPremium(false);
    } catch (error) {
      console.error("Error expiring temporary pass:", error);
    }
  };

  const purchasePackage = async (
    pkg: SubscriptionPackage
  ): Promise<{ success: boolean; paymentUrl?: string; error?: string }> => {
    if (!user || !user.email) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      const result = await purchasePackageService(pkg, user.id, user.email);

      if (result.success) {
        // If Android and Paystack payment URL is returned, return it
        if (Platform.OS === "android" && result.paymentUrl) {
          return { success: true, paymentUrl: result.paymentUrl };
        }

        // For iOS or successful mock purchases, reload premium status
        console.log("🔄 Reloading premium status after purchase...");
        await loadPremiumStatus();
        console.log(
          "✅ Premium status reloaded. Current isPremium:",
          isPremium
        );
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      return { success: false, error: error.message || "Purchase failed" };
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const result = await restorePurchasesService(user.id);
      if (result.success) {
        await loadPremiumStatus();
      }
      return result.success;
    } catch (error) {
      console.error("Restore error:", error);
      return false;
    }
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        isLoading,
        packages,
        purchasePackage,
        restorePurchases,
        timeRemaining,
        premiumType,
        isRevenueCatInitialized,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error("usePremium must be used within PremiumProvider");
  }
  return context;
};

// Helper function to check if a deck is premium
export const isDeckPremium = (deckSlug: string): boolean => {
  const premiumDecks = ["risky-business", "sin-city"];
  return premiumDecks.includes(deckSlug);
};
