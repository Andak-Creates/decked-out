/**
 * RevenueCat Paywall Component
 * Uses RevenueCat's built-in Paywall UI
 */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Purchases, { PurchasesOffering } from "react-native-purchases";

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

  useEffect(() => {
    if (visible) {
      loadOfferings();
    }
  }, [visible]);

  const loadOfferings = async () => {
    setLoading(true);
    try {
      const offerings = await Purchases.getOfferings();

      if (offerings.current) {
        setOffering(offerings.current);
      } else {
        Alert.alert(
          "No Subscriptions Found",
          "No active offerings are configured in RevenueCat."
        );
      }
    } catch (error: any) {
      console.error("Error loading offerings:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to load subscription options"
      );
    } finally {
      setLoading(false);
    }
  };

  const presentPaywall = async () => {
    try {
      if (offering?.availablePackages.length) {
        const package_ = offering.availablePackages[0];
        await Purchases.purchasePackage(package_);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onPurchaseSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error("Paywall error:", error);
      Alert.alert("Error", error.message || "Failed to complete purchase");
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
          <Text className="text-white text-lg font-bold">Upgrade to Pro</Text>
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
              Loading subscription options...
            </Text>
          </View>
        ) : offering ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-white text-xl font-bold mb-4 text-center">
              Choose Your Plan
            </Text>
            <TouchableOpacity
              onPress={presentPaywall}
              className="bg-yellow-500 px-6 py-3 rounded-xl"
            >
              <Text className="text-black font-bold text-base">View Plans</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="alert-circle" size={64} color="#ef4444" />
            <Text className="text-white text-xl font-bold mt-4 text-center">
              Unable to Load Subscriptions
            </Text>
            <Text className="text-gray-400 text-base mt-2 text-center">
              Please check your RevenueCat dashboard and try again.
            </Text>

            <TouchableOpacity
              onPress={loadOfferings}
              className="bg-yellow-500 px-6 py-3 rounded-xl mt-6"
            >
              <Text className="text-black font-bold text-base">Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};
