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
  Linking,
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

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const handlePurchase = async (pkg: any) => {
    setLoading(pkg.identifier);
    setSelectedPackage(pkg.identifier);

    try {
      const result = await purchasePackage(pkg);
      setLoading(null);

      if (result.success) {
        if (Platform.OS === "android" && result.paymentUrl) {
          setPaystackUrl(result.paymentUrl);
          setPaystackVisible(true);
        } else {
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

  const getPackagePrice = (pkg: any): string =>
    pkg.priceString || pkg.product?.priceString || "$0.00";

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

  return (
    <ImageBackground
      source={require("@/assets/images/deckedBackground.jpg")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="absolute inset-0 bg-black/60" />
      <ScrollView className="flex-1">
        <View className="px-6 pt-16 pb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-8 bg-black/50 px-4 py-2 rounded-xl self-start"
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          {/* Packages */}
          <View className="space-y-3 mb-6">
            {packages.length > 0 ? (
              packages.map((pkg: any) => {
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
              })
            ) : (
              <Text className="text-gray-400 text-center mt-6">
                Subscription options are currently unavailable.
              </Text>
            )}
          </View>

          {/* Apple-required legal text */}
          <Text className="text-gray-500 text-xs text-center mt-4">
            Payment will be charged to your Apple ID account at confirmation of
            purchase. Subscriptions automatically renew unless cancelled at
            least 24 hours before the end of the current period.
          </Text>

          <View className="flex-row justify-center space-x-6 mt-2 mb-8">
            <Text
              onPress={() => Linking.openURL("https://your-privacy-policy-url")}
              className="text-blue-400 text-xs"
            >
              Privacy Policy
            </Text>
            <Text
              onPress={() =>
                Linking.openURL(
                  "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                )
              }
              className="text-blue-400 text-xs"
            >
              Terms of Use
            </Text>
          </View>
        </View>
      </ScrollView>

      {Platform.OS === "android" && (
        <PaystackPayment
          visible={paystackVisible}
          paymentUrl={paystackUrl}
          packageIdentifier={selectedPackage}
          onSuccess={handlePaystackSuccess}
          onCancel={handlePaystackCancel}
        />
      )}

      <RevenueCatPaywall
        visible={showRevenueCatPaywall}
        onClose={() => setShowRevenueCatPaywall(false)}
        onPurchaseSuccess={() => router.back()}
      />

      <CustomerCenter
        visible={showCustomerCenter}
        onClose={() => setShowCustomerCenter(false)}
      />
    </ImageBackground>
  );
}
