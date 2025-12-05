import { supabase } from "@/lib/supabase";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./SupabaseAuthContext";

interface MockPackage {
  identifier: string;
  product: {
    priceString: string;
  };
}

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  packages: MockPackage[];
  purchasePackage: (pkg: MockPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  timeRemaining: number | null;
  premiumType: "subscription" | "temporary" | null;
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

  // Mock packages for testing
  const packages: MockPackage[] = [
    { identifier: "deckedout_3hour", product: { priceString: "$2.99" } },
    { identifier: "deckedout_6hour", product: { priceString: "$4.99" } },
    { identifier: "deckedout_weekly", product: { priceString: "$4.99" } },
    { identifier: "deckedout_monthly", product: { priceString: "$9.99" } },
    { identifier: "deckedout_annual", product: { priceString: "$59.99" } },
  ];

  useEffect(() => {
    if (user) {
      loadPremiumStatus();
    } else {
      setIsLoading(false);
    }
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
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("premium_status")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
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
        }
      }
    } catch (error) {
      console.error("Error loading premium status:", error);
    } finally {
      setIsLoading(false);
    }
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

  const purchasePackage = async (pkg: MockPackage): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log("🎉 MOCK PURCHASE:", pkg.identifier);

      // Simulate purchase delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if it's a temporary pass
      if (
        pkg.identifier.includes("3hour") ||
        pkg.identifier.includes("6hour")
      ) {
        const hours = pkg.identifier.includes("3hour") ? 3 : 6;
        const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

        await supabase
          .from("premium_status")
          .update({
            is_premium: true,
            premium_type: "temporary",
            expires_at: expiresAt.toISOString(),
          })
          .eq("user_id", user.id);

        setTimeRemaining(hours * 60 * 60);
        setIsPremium(true);
        setPremiumType("temporary");
        return true;
      }

      // Regular subscription
      await supabase
        .from("premium_status")
        .update({
          is_premium: true,
          premium_type: "subscription",
          expires_at: null,
        })
        .eq("user_id", user.id);

      setIsPremium(true);
      setPremiumType("subscription");
      return true;
    } catch (error) {
      console.error("Mock purchase error:", error);
      return false;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log("🔄 MOCK RESTORE PURCHASES");

      // Simulate restore delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await loadPremiumStatus();
      return isPremium;
    } catch (error) {
      console.error("Mock restore error:", error);
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
