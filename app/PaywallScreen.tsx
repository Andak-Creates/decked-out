import { CustomerCenter } from "@/components/CustomerCenter";
import { PaystackPayment } from "@/components/PaystackPayment";
import { RevenueCatPaywall } from "@/components/RevenueCatPaywall";
import { usePremium } from "@/context/PremiumContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PaywallScreen() {
  const router = useRouter();
  const {
    packages,
    purchasePackage,
    restorePurchases,
    isPremium,
    timeRemaining,
    premiumType,
    isRevenueCatInitialized,
  } = usePremium();
  const [loading, setLoading] = useState<string | null>(null);
  const [paystackVisible, setPaystackVisible] = useState(false);
  const [paystackUrl, setPaystackUrl] = useState<string>("");
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [showRevenueCatPaywall, setShowRevenueCatPaywall] = useState(false);
  const [showCustomerCenter, setShowCustomerCenter] = useState(false);

  const formatTimeRemaining = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const handlePurchase = async (pkg: any) => {
    setLoading(pkg.identifier);
    setSelectedPackage(pkg.identifier);

    try {
      const result = await purchasePackage(pkg);
      setLoading(null);

      if (result.success) {
        // Android: Show Paystack payment modal
        if (Platform.OS === "android" && result.paymentUrl) {
          setPaystackUrl(result.paymentUrl);
          setPaystackVisible(true);
        } else {
          // iOS: Purchase completed (or mock)
          const message =
            Platform.OS === "ios" && !isRevenueCatInitialized
              ? "🧪 (MOCK MODE) You now have access to all spicy card decks! This is a test purchase."
              : "🎉 Welcome to Premium! You now have access to all spicy card decks!";

          Alert.alert("🎉 Welcome to Premium!", message, [
            { text: "Start Playing", onPress: () => router.back() },
          ]);
        }
      } else {
        Alert.alert(
          "Purchase Failed",
          result.error || "Unable to complete purchase. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      setLoading(null);
      Alert.alert(
        "Purchase Error",
        error.message || "An error occurred. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handlePaystackSuccess = () => {
    setPaystackVisible(false);
    setPaystackUrl("");
    Alert.alert(
      "🎉 Payment Successful!",
      "Your subscription has been activated. Enjoy premium access!",
      [{ text: "Start Playing", onPress: () => router.back() }]
    );
  };

  const handlePaystackCancel = () => {
    setPaystackVisible(false);
    setPaystackUrl("");
  };

  const handleRestore = async () => {
    setLoading("restore");
    const success = await restorePurchases();
    setLoading(null);

    if (success) {
      Alert.alert(
        "✅ Purchases Restored",
        "(MOCK MODE) Your premium access has been restored!"
      );
    } else {
      Alert.alert(
        "No Purchases Found",
        "(MOCK MODE) We couldn't find any previous purchases to restore."
      );
    }
  };

  const getPackagePrice = (pkg: any): string => {
    return pkg.priceString || pkg.product?.priceString || "$0.00";
  };

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

  const isPopular = (identifier: string) => identifier.includes("monthly");
  const isBestValue = (identifier: string) => identifier.includes("annual");

  if (isPremium && premiumType === "temporary" && timeRemaining) {
    return (
      <ImageBackground
        source={require("@/assets/images/deckedBackground.jpg")}
        resizeMode="cover"
        className="flex-1"
      >
        <View className="absolute inset-0 bg-black/60" />
        <View className="flex-1 px-6 pt-16">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-8 bg-black/50 px-4 py-2 rounded-xl self-start"
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          <View className="items-center justify-center flex-1">
            <Text className="text-6xl mb-4">⏰</Text>
            <Text className="text-white text-2xl font-bold mb-2">
              Premium Active
            </Text>
            <Text className="text-gray-400 text-base mb-8">Time Remaining</Text>
            <Text className="text-red-500 text-5xl font-bold">
              {formatTimeRemaining(timeRemaining)}
            </Text>
            <Text className="text-gray-500 text-sm mt-8">
              Enjoy your premium access!
            </Text>
            <Text className="text-yellow-500 text-xs mt-4 bg-yellow-500/20 px-4 py-2 rounded-lg">
              🧪 TEST MODE
            </Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  if (isPremium && premiumType === "subscription") {
    return (
      <ImageBackground
        source={require("@/assets/images/deckedBackground.jpg")}
        resizeMode="cover"
        className="flex-1"
      >
        <View className="absolute inset-0 bg-black/60" />
        <View className="flex-1 px-6 pt-16">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-8 bg-black/50 px-4 py-2 rounded-xl self-start"
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          <View className="items-center justify-center flex-1">
            <Text className="text-6xl mb-4">👑</Text>
            <Text className="text-white text-2xl font-bold mb-2">
              Premium Member
            </Text>
            <Text className="text-gray-400 text-base">
              You have unlimited access to all decks
            </Text>
            <Text className="text-yellow-500 text-xs mt-8 bg-yellow-500/20 px-4 py-2 rounded-lg">
              🧪 TEST MODE
            </Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/deckedBackground.jpg")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="absolute inset-0 bg-black/60" />
      <ScrollView className="flex-1">
        <View className="px-6 pt-16 pb-8">
          {/* Close button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-8 bg-black/50 px-4 py-2 rounded-xl self-start"
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          {/* Platform-specific Banner */}
          {Platform.OS === "ios" && !isRevenueCatInitialized && (
            <View className="mb-6 bg-red-500/20 border-2 border-red-500 rounded-2xl p-4">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-2">⚠️</Text>
                <View className="flex-1">
                  <Text className="text-red-400 font-bold text-base">
                    RevenueCat Not Initialized
                  </Text>
                  <Text className="text-red-200 text-sm">
                    Please check your RevenueCat configuration. See
                    APPLE_IAP_SETUP.md for setup instructions.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {Platform.OS === "ios" && isRevenueCatInitialized && (
            <View className="mb-6 bg-green-500/20 border-2 border-green-500 rounded-2xl p-4">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-2">✅</Text>
                <View className="flex-1">
                  <Text className="text-green-400 font-bold text-base">
                    Apple IAP Ready
                  </Text>
                  <Text className="text-green-200 text-sm">
                    Real Apple In-App Purchases are enabled. Purchases will be
                    processed through Apple.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {Platform.OS === "android" && (
            <View className="mb-6 bg-yellow-500/20 border-2 border-yellow-500 rounded-2xl p-4">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-2">🧪</Text>
                <View className="flex-1">
                  <Text className="text-yellow-400 font-bold text-base">
                    Android Test Mode
                  </Text>
                  <Text className="text-yellow-200 text-sm">
                    Android subscriptions are simulated for testing. Premium
                    access is granted immediately.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Header */}
          <View className="items-center mb-12">
            <Text className="text-6xl mb-4">🔥</Text>
            <Text className="text-white text-3xl font-bold text-center mb-3">
              Unlock Premium Decks
            </Text>
            <Text className="text-gray-400 text-base text-center">
              Get access to Risky Business & Sin City
            </Text>
          </View>

          {/* Features */}
          <View className="mb-8 space-y-4">
            {[
              "Risky Business deck",
              "Sin City deck",
              "All future premium decks",
              "No ads",
              "Unlimited plays",
            ].map((feature, index) => (
              <View key={index} className="flex-row items-center mb-3">
                <Ionicons name="checkmark-circle" size={24} color="#ef4444" />
                <Text className="text-white text-base ml-3">{feature}</Text>
              </View>
            ))}
          </View>

          {/* Packages */}
          <View className="space-y-3 mb-6">
            {packages.map((pkg: any) => {
              const identifier = pkg.identifier;
              const isLoadingThis = loading === identifier;

              return (
                <TouchableOpacity
                  key={identifier}
                  onPress={() => handlePurchase(pkg)}
                  disabled={!!loading}
                  className={`border-2 rounded-2xl p-5 mb-2 ${
                    isPopular(identifier)
                      ? "border-red-500 bg-red-500/10"
                      : isBestValue(identifier)
                      ? "border-yellow-500 bg-yellow-500/10"
                      : "border-gray-700 bg-gray-900/50"
                  }`}
                >
                  {isPopular(identifier) && (
                    <View className="absolute -top-3 right-4 bg-red-500 px-3 py-1 rounded-full">
                      <Text className="text-white text-xs font-bold">
                        POPULAR
                      </Text>
                    </View>
                  )}
                  {isBestValue(identifier) && (
                    <View className="absolute -top-3 right-4 bg-yellow-500 px-3 py-1 rounded-full">
                      <Text className="text-black text-xs font-bold">
                        BEST VALUE
                      </Text>
                    </View>
                  )}

                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="text-white text-xl font-bold">
                        {getPackageTitle(identifier)}
                      </Text>
                      <Text className="text-gray-400 text-sm mt-1">
                        {getPackageDescription(identifier)}
                      </Text>
                    </View>

                    {isLoadingThis ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-white text-xl font-bold">
                        {getPackagePrice(pkg)}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View className="space-y-3 mb-4">
            {/* Use RevenueCat Paywall for iOS if initialized */}
            {Platform.OS === "ios" && isRevenueCatInitialized && (
              <TouchableOpacity
                onPress={() => setShowRevenueCatPaywall(true)}
                className="bg-yellow-500 rounded-xl p-4 items-center"
              >
                <Text className="text-black font-bold text-base">
                  View All Subscription Options
                </Text>
              </TouchableOpacity>
            )}

            {/* Restore button */}
            <TouchableOpacity
              onPress={handleRestore}
              disabled={!!loading}
              className="items-center py-4"
            >
              {loading === "restore" ? (
                <ActivityIndicator size="small" color="#9ca3af" />
              ) : (
                <Text className="text-gray-400 text-sm">Restore Purchases</Text>
              )}
            </TouchableOpacity>

            {/* Customer Center */}
            <TouchableOpacity
              onPress={() => setShowCustomerCenter(true)}
              className="items-center py-2"
            >
              <Text className="text-gray-500 text-xs">Manage Subscription</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text className="text-gray-600 text-xs text-center mt-4 mb-8">
            {Platform.OS === "ios"
              ? "Subscriptions auto-renew unless cancelled. Terms apply."
              : "Subscriptions are managed through Paystack. Terms apply."}
          </Text>
        </View>
      </ScrollView>

      {/* Paystack Payment Modal */}
      {Platform.OS === "android" && (
        <PaystackPayment
          visible={paystackVisible}
          paymentUrl={paystackUrl}
          packageIdentifier={selectedPackage}
          onSuccess={handlePaystackSuccess}
          onCancel={handlePaystackCancel}
        />
      )}

      {/* RevenueCat Paywall Modal */}
      <RevenueCatPaywall
        visible={showRevenueCatPaywall}
        onClose={() => setShowRevenueCatPaywall(false)}
        onPurchaseSuccess={() => {
          router.back();
        }}
      />

      {/* Customer Center Modal */}
      <CustomerCenter
        visible={showCustomerCenter}
        onClose={() => setShowCustomerCenter(false)}
      />
    </ImageBackground>
  );
}
