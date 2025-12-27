import { supabase } from "@/lib/supabase";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesPackage,
} from "react-native-purchases";

// RevenueCat API Keys - Replace with your actual keys
const REVENUECAT_API_KEY_IOS =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || "";

const REVENUECAT_API_KEY_ANDROID =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || "";

// Paystack configuration - Replace with your actual keys
const PAYSTACK_PUBLIC_KEY = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

// Backend API configuration - Replace with your backend URL
const BACKEND_API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "";

export interface SubscriptionPackage {
  identifier: string;
  title: string;
  description: string;
  priceString: string;
  price: number;
  duration: "6hour" | "24hour" | "weekly" | "monthly" | "annual";
}

// Initialize RevenueCat
export const initializeRevenueCat = async (userId: string) => {
  try {
    const apiKey =
      Platform.OS === "ios"
        ? REVENUECAT_API_KEY_IOS
        : REVENUECAT_API_KEY_ANDROID;

    // For now, use mock mode if keys are not set
    if (!apiKey || apiKey.length < 10) {
      console.log("🧪 RevenueCat in MOCK MODE - API key not configured");
      return { isMock: true };
    }

    await Purchases.configure({ apiKey });
    await Purchases.logIn(userId);

    console.log("✅ RevenueCat initialized for", Platform.OS);
    return { isMock: false };
  } catch (error) {
    console.error("Error initializing RevenueCat:", error);
    return { isMock: true };
  }
};

// Get available packages from RevenueCat (iOS) or return mock packages
export const getAvailablePackages = async (): Promise<
  SubscriptionPackage[]
> => {
  try {
    if (Platform.OS === "ios") {
      // Try to get real packages from RevenueCat
      const offerings = await Purchases.getOfferings();

      if (offerings.current && offerings.current.availablePackages.length > 0) {
        return offerings.current.availablePackages.map((pkg) => ({
          identifier: pkg.identifier,
          title: getPackageTitle(pkg.identifier),
          description: getPackageDescription(pkg.identifier),
          priceString: pkg.product.priceString,
          price: pkg.product.price,
          duration: getPackageDuration(pkg.identifier),
        }));
      }
    }

    // Return mock packages for iOS (when no Apple Developer account) or Android
    return getMockPackages();
  } catch (error) {
    console.error("Error getting packages:", error);
    return getMockPackages();
  }
};

// Mock packages for testing
const getMockPackages = (): SubscriptionPackage[] => [
  {
    identifier: "deckedout_6hour",
    title: "6 Hour Pass",
    description: "Perfect for a party",
    priceString: "₦1,200",
    price: 1200,
    duration: "6hour",
  },
  {
    identifier: "deckedout_24hour",
    title: "24 Hour Pass",
    description: "Full day access",
    priceString: "₦2,800",
    price: 2800,
    duration: "24hour",
  },
  {
    identifier: "deckedout_weekly",
    title: "Weekly",
    description: "One week of spice",
    priceString: "₦700",
    price: 700,
    duration: "weekly",
  },
  {
    identifier: "deckedout_monthly",
    title: "Monthly",
    description: "Most popular",
    priceString: "₦2,500",
    price: 2500,
    duration: "monthly",
  },
  {
    identifier: "deckedout_annual",
    title: "Yearly",
    description: "Best value - save 40%",
    priceString: "₦19,900",
    price: 19900,
    duration: "annual",
  },
];

// Purchase package - Platform specific
export const purchasePackage = async (
  pkg: SubscriptionPackage,
  userId: string,
  userEmail: string
): Promise<{ success: boolean; error?: string; paymentUrl?: string }> => {
  if (Platform.OS === "ios") {
    // iOS: Use RevenueCat with Apple IAP
    return await purchaseIOSPackage(pkg, userId);
  } else {
    // Android: Use mock payment (no real Paystack needed)
    return await purchaseAndroidPackageMock(pkg, userId);
  }
};

// iOS Purchase (RevenueCat + Apple IAP) - REAL IMPLEMENTATION
const purchaseIOSPackage = async (
  pkg: SubscriptionPackage,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get offerings from RevenueCat
    const offerings = await Purchases.getOfferings();

    if (!offerings.current) {
      return {
        success: false,
        error:
          "No subscription packages available. Please check your RevenueCat configuration.",
      };
    }

    // Find the matching package
    // Note: Package identifiers in RevenueCat might be different from your internal IDs
    // You may need to map: deckedout_monthly -> $rc_monthly, etc.
    let purchasesPackage: PurchasesPackage | null | undefined;

    // Try exact match first
    purchasesPackage = offerings.current.availablePackages.find(
      (p) => p.identifier === pkg.identifier
    );

    // If not found, try to match by product identifier
    if (!purchasesPackage) {
      purchasesPackage = offerings.current.availablePackages.find((p) => {
        const productId = p.product.identifier.toLowerCase();
        return (
          (productId.includes("monthly") &&
            pkg.identifier.includes("monthly")) ||
          (productId.includes("weekly") && pkg.identifier.includes("weekly")) ||
          (productId.includes("annual") && pkg.identifier.includes("annual")) ||
          (productId.includes("yearly") && pkg.identifier.includes("annual"))
        );
      });
    }

    // If still not found, use the first available package (fallback)
    if (!purchasesPackage && offerings.current.availablePackages.length > 0) {
      console.warn(
        `Package ${pkg.identifier} not found, using first available package`
      );
      purchasesPackage = offerings.current.availablePackages[0];
    }

    if (!purchasesPackage) {
      return {
        success: false,
        error: "Subscription package not available. Please try again later.",
      };
    }

    // Perform the actual purchase through RevenueCat/Apple IAP
    console.log("🍎 Purchasing iOS package:", purchasesPackage.identifier);
    const { customerInfo } = await Purchases.purchasePackage(purchasesPackage);

    // Sync to Supabase
    await syncSubscriptionToSupabase(customerInfo, userId);

    console.log("✅ iOS purchase successful!");
    return { success: true };
  } catch (error: any) {
    console.error("iOS purchase error:", error);

    // Handle specific error cases
    if (error.userCancelled) {
      return { success: false, error: "Purchase cancelled" };
    }

    if (error.code === "PURCHASE_CANCELLED") {
      return { success: false, error: "Purchase cancelled" };
    }

    if (error.code === "PAYMENT_PENDING") {
      return {
        success: false,
        error:
          "Payment is pending approval. Your subscription will activate once approved.",
      };
    }

    if (error.code === "STORE_PRODUCT_NOT_AVAILABLE") {
      return {
        success: false,
        error:
          "Product is not available in the App Store. Please try again later.",
      };
    }

    return {
      success: false,
      error: error.message || "Purchase failed. Please try again.",
    };
  }
};

// Android Purchase (Mock - No real payment)
const purchaseAndroidPackageMock = async (
  pkg: SubscriptionPackage,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("🧪 MOCK Android Purchase:", pkg.identifier);

    // Simulate payment delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Handle mock purchase
    await handleMockPurchase(pkg, userId);

    // Also sync to RevenueCat for tracking (optional, but good for analytics)
    try {
      await Purchases.logIn(userId);
      // Note: RevenueCat won't have real subscription, but user ID will be tracked
      console.log("📱 Android subscription synced to RevenueCat (mock)");
    } catch (error) {
      console.warn("Could not sync to RevenueCat:", error);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Android mock purchase error:", error);
    return { success: false, error: error.message || "Purchase failed" };
  }
};

// Create Paystack payment via backend
const createPaystackPayment = async (
  pkg: SubscriptionPackage,
  userId: string,
  userEmail: string
): Promise<string> => {
  try {
    // Get Supabase session for authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("User not authenticated");
    }

    // Call your backend API to create Paystack payment
    const response = await fetch(
      `${BACKEND_API_URL}/api/payments/paystack/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add your authentication header here
          // Example: "Authorization": `Bearer ${session.access_token}`,
          // Or: "X-API-Key": "your-api-key",
        },
        body: JSON.stringify({
          userId,
          userEmail,
          packageIdentifier: pkg.identifier,
          amount: pkg.price,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Backend error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.paymentUrl) {
      throw new Error(data.error || "Failed to create payment");
    }

    // Store payment reference in Supabase for local tracking
    if (data.paymentReference) {
      await supabase.from("paystack_payments").insert({
        user_id: userId,
        package_identifier: pkg.identifier,
        payment_reference: data.paymentReference,
        amount: Math.round(pkg.price * 100),
        status: "pending",
        created_at: new Date().toISOString(),
      });
    }

    return data.paymentUrl;
  } catch (error: any) {
    console.error("Error creating Paystack payment:", error);

    // Fallback to mock for testing if backend is not available
    if (BACKEND_API_URL.includes("your-backend-api.com")) {
      console.warn("⚠️ Using mock payment - configure BACKEND_API_URL");
      const paymentReference = `deckedout_${userId}_${Date.now()}`;
      await supabase.from("paystack_payments").insert({
        user_id: userId,
        package_identifier: pkg.identifier,
        payment_reference: paymentReference,
        amount: Math.round(pkg.price * 100),
        status: "pending",
        created_at: new Date().toISOString(),
      });
      return `https://paystack.com/pay/${paymentReference}`;
    }

    throw error;
  }
};

// Verify Paystack payment status via backend
export const verifyPaystackPayment = async (
  paymentReference: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get Supabase session for authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: "User not authenticated" };
    }

    // Call your backend API to verify payment status
    const response = await fetch(
      `${BACKEND_API_URL}/api/payments/paystack/verify/${paymentReference}`,
      {
        method: "GET",
        headers: {
          // Add your authentication header here
          // Example: "Authorization": `Bearer ${session.access_token}`,
          // Or: "X-API-Key": "your-api-key",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Verification failed: ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.success && data.status === "completed") {
      // Payment verified by backend
      // Backend has already:
      // 1. Verified with Paystack
      // 2. Updated Supabase premium_status
      // 3. Synced to RevenueCat

      // Update local payment record
      await supabase
        .from("paystack_payments")
        .update({ status: "completed", verified_at: new Date().toISOString() })
        .eq("payment_reference", paymentReference);

      return { success: true };
    }

    // Payment still pending or failed
    return {
      success: false,
      error:
        data.status === "pending"
          ? "Payment is still processing. Please wait a moment and try again."
          : "Payment verification failed",
    };
  } catch (error: any) {
    console.error("Payment verification error:", error);

    // Fallback: check local Supabase record
    if (BACKEND_API_URL.includes("your-backend-api.com")) {
      console.warn("⚠️ Using local verification - configure BACKEND_API_URL");
      const { data: paymentData } = await supabase
        .from("paystack_payments")
        .select("*")
        .eq("payment_reference", paymentReference)
        .eq("user_id", userId)
        .single();

      if (paymentData && paymentData.status === "completed") {
        return { success: true };
      }
    }

    return { success: false, error: error.message || "Verification failed" };
  }
};

// Sync Android subscription to RevenueCat
const syncAndroidSubscriptionToRevenueCat = async (
  packageIdentifier: string,
  userId: string,
  paymentReference: string
) => {
  try {
    // Create a subscription in RevenueCat for Android users
    // This allows RevenueCat to track Android subscriptions even though payment is via Paystack
    await Purchases.logIn(userId);

    // You can use RevenueCat's REST API to create a subscription
    // Or use their webhook system to sync Paystack payments
    // For now, we'll just log it
    console.log("📱 Syncing Android subscription to RevenueCat:", {
      userId,
      packageIdentifier,
      paymentReference,
    });

    // In production, you'd call RevenueCat's REST API:
    // POST https://api.revenuecat.com/v1/subscribers/{userId}/subscriptions
    // With the Paystack payment details
  } catch (error) {
    console.error("Error syncing to RevenueCat:", error);
  }
};

// Sync RevenueCat subscription to Supabase
const syncSubscriptionToSupabase = async (
  customerInfo: CustomerInfo,
  userId: string
) => {
  try {
    // Use "DeckedOut Pro" entitlement (matches revenueCatService)
    const isPremium =
      customerInfo.entitlements.active["DeckedOut Pro"] !== undefined;
    const activeSubscription =
      customerInfo.entitlements.active["DeckedOut Pro"];

    if (isPremium && activeSubscription) {
      const expiresAt = activeSubscription.expirationDate
        ? new Date(activeSubscription.expirationDate).toISOString()
        : null;

      // Check if it's a temporary pass or subscription
      const productIdentifier = activeSubscription.productIdentifier;
      const isTemporary =
        productIdentifier.includes("6hour") ||
        productIdentifier.includes("24hour");

      await supabase.from("premium_status").upsert({
        user_id: userId,
        is_premium: true,
        premium_type: isTemporary ? "temporary" : "subscription",
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error syncing subscription to Supabase:", error);
  }
};

// Handle mock purchase (for testing)
const handleMockPurchase = async (pkg: SubscriptionPackage, userId: string) => {
  const isTemporary = pkg.duration === "6hour" || pkg.duration === "24hour";
  let expiresAt: string | null = null;

  if (isTemporary) {
    const hours = pkg.duration === "6hour" ? 6 : 24;
    expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  }

  console.log("🛒 Updating premium status in Supabase:", {
    userId,
    package: pkg.identifier,
    isTemporary,
    expiresAt,
  });

  const { data, error } = await supabase
    .from("premium_status")
    .upsert(
      {
        user_id: userId,
        is_premium: true,
        premium_type: isTemporary ? "temporary" : "subscription",
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    )
    .select();

  if (error) {
    console.error("❌ Error updating premium status in Supabase:", error);
    throw new Error(`Failed to update premium status: ${error.message}`);
  }

  console.log("✅ Premium status updated successfully:", data);
};

// Restore purchases
export const restorePurchases = async (
  userId: string
): Promise<{ success: boolean }> => {
  try {
    if (Platform.OS === "ios") {
      // iOS: Restore from Apple/RevenueCat
      const customerInfo = await Purchases.restorePurchases();
      await syncSubscriptionToSupabase(customerInfo, userId);
      return { success: true };
    } else {
      // Android: Check Supabase for mock subscriptions
      const { data } = await supabase
        .from("premium_status")
        .select("*")
        .eq("user_id", userId)
        .eq("is_premium", true)
        .single();

      return { success: !!data };
    }
  } catch (error) {
    console.error("Error restoring purchases:", error);
    return { success: false };
  }
};

// Helper functions
const getPackageTitle = (identifier: string): string => {
  if (identifier.includes("6hour")) return "6 Hour Pass";
  if (identifier.includes("24hour")) return "24 Hour Pass";
  if (identifier.includes("weekly")) return "Weekly";
  if (identifier.includes("monthly")) return "Monthly";
  if (identifier.includes("annual")) return "Yearly";
  return identifier;
};

const getPackageDescription = (identifier: string): string => {
  if (identifier.includes("6hour")) return "Perfect for a party";
  if (identifier.includes("24hour")) return "Full day access";
  if (identifier.includes("weekly")) return "One week of spice";
  if (identifier.includes("monthly")) return "Most popular";
  if (identifier.includes("annual")) return "Best value - save 40%";
  return "";
};

const getPackageDuration = (
  identifier: string
): "6hour" | "24hour" | "weekly" | "monthly" | "annual" => {
  if (identifier.includes("6hour")) return "6hour";
  if (identifier.includes("24hour")) return "24hour";
  if (identifier.includes("weekly")) return "weekly";
  if (identifier.includes("monthly")) return "monthly";
  if (identifier.includes("annual")) return "annual";
  return "monthly";
};
