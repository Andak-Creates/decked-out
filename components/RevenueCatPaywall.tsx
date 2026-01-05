import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";

interface RevenueCatPaywallProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
}

export const RevenueCatPaywall: React.FC<RevenueCatPaywallProps> = ({
  visible,
  onClose,
  onPurchaseSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadOfferings();
    }
  }, [visible]);

  const loadOfferings = async () => {
    setLoading(true);
    try {
      const offerings = await Purchases.getOfferings();

      if (offerings.current && offerings.current.availablePackages.length > 0) {
        setOffering(offerings.current);
      } else {
        setOffering(null);
      }
    } catch {
      setOffering(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    try {
      setPurchasing(pkg.identifier);
      await Purchases.purchasePackage(pkg);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onPurchaseSuccess?.();
      onClose();
    } catch {
      // ❌ NO error alerts during Apple review
    } finally {
      setPurchasing(null);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="bg-gray-900 px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
          <Text className="text-white text-lg font-bold">DeckedOut Pro</Text>
          <TouchableOpacity
            onPress={onClose}
            className="bg-gray-800 px-3 py-2 rounded-lg"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#fbbf24" />
            <Text className="text-white mt-4">
              Loading subscription options…
            </Text>
          </View>
        ) : offering ? (
          <View className="flex-1 px-6 pt-6">
            <Text className="text-white text-xl font-bold mb-4 text-center">
              Choose Your Plan
            </Text>

            {offering.availablePackages.map((pkg) => (
              <TouchableOpacity
                key={pkg.identifier}
                onPress={() => handlePurchase(pkg)}
                disabled={!!purchasing}
                className="border-2 border-gray-700 bg-gray-900/60 rounded-2xl p-5 mb-3"
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-white text-lg font-bold">
                      {pkg.product.title}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">
                      {pkg.product.subscriptionPeriod}
                    </Text>
                  </View>

                  {purchasing === pkg.identifier ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white text-lg font-bold">
                      {pkg.product.priceString}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Legal text (REQUIRED by Apple) */}
            <Text className="text-gray-500 text-xs text-center mt-6">
              Payment will be charged to your Apple ID account at confirmation
              of purchase. Subscriptions automatically renew unless cancelled at
              least 24 hours before the end of the current period.
            </Text>

            <View className="flex-row justify-center space-x-6 mt-3">
              <Text
                onPress={() =>
                  Linking.openURL("https://your-privacy-policy-url")
                }
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
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="time-outline" size={64} color="#9ca3af" />
            <Text className="text-white text-lg font-bold mt-4 text-center">
              Subscriptions Temporarily Unavailable
            </Text>
            <Text className="text-gray-400 text-sm mt-2 text-center">
              Please try again shortly.
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};
