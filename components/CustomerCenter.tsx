import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { supabase } from "@/lib/supabase";
import { restorePurchases } from "@/services/paymentService";

interface CustomerCenterProps {
  visible: boolean;
  onClose: () => void;
}

export const CustomerCenter: React.FC<CustomerCenterProps> = ({
  visible,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadSubscriptionStatus();
    }
  }, [visible]);

  const loadSubscriptionStatus = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setHasAccess(false);
        setExpiresAt(null);
        return;
      }

      const { data, error } = await supabase
        .from("premium_status")
        .select("is_premium, expires_at")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setHasAccess(false);
        setExpiresAt(null);
        return;
      }

      setHasAccess(data.is_premium);
      setExpiresAt(data.expires_at);
    } catch (error) {
      console.error("Error loading subscription status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not logged in");
      }

      const result = await restorePurchases(user.id);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "✅ Purchases Restored",
          "Your purchases have been successfully restored."
        );
        await loadSubscriptionStatus();
      } else {
        throw new Error("No purchases found");
      }
    } catch (error: any) {
      console.error("Restore error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Restore Failed",
        error.message || "Unable to restore purchases"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const url =
        Platform.OS === "ios"
          ? "https://apps.apple.com/account/subscriptions"
          : "https://play.google.com/store/account/subscriptions";

      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Manage Subscription",
          "Please open your app store account settings to manage your subscription."
        );
      }
    } catch (error) {
      console.error("Manage subscription error:", error);
      Alert.alert("Error", "Unable to open subscription management.");
    }
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSubscriptionStatus = (): string => {
    if (!hasAccess) return "Inactive";
    return "Active";
  };

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
          <Text className="text-white text-lg font-bold">
            Account & Subscription
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="bg-gray-800 px-3 py-2 rounded-lg"
            disabled={loading}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#fbbf24" />
            <Text className="text-white mt-4">Loading...</Text>
          </View>
        ) : (
          <ScrollView className="flex-1 px-6 py-4">
            {/* Subscription Status */}
            <View className="bg-gray-900 rounded-2xl p-6 mb-4">
              <View className="flex-row items-center mb-4">
                <Ionicons
                  name={hasAccess ? "checkmark-circle" : "close-circle"}
                  size={32}
                  color={hasAccess ? "#10b981" : "#ef4444"}
                />
                <Text className="text-white text-xl font-bold ml-3">
                  {hasAccess
                    ? "DeckedOut Pro Active"
                    : "No Active Subscription"}
                </Text>
              </View>

              <Text className="text-gray-400 text-sm mb-2">
                Status: {getSubscriptionStatus()}
              </Text>

              {hasAccess && expiresAt && (
                <Text className="text-gray-400 text-sm">
                  Expires: {formatDate(new Date(expiresAt))}
                </Text>
              )}
            </View>

            {/* Actions */}
            <View className="space-y-3">
              {hasAccess && (
                <TouchableOpacity
                  onPress={handleManageSubscription}
                  className="bg-blue-600 rounded-xl p-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="settings" size={24} color="white" />
                    <Text className="text-white font-bold text-base ml-3">
                      Manage Subscription
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="white" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleRestorePurchases}
                disabled={loading}
                className="bg-gray-800 rounded-xl p-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Ionicons name="refresh" size={24} color="white" />
                  <Text className="text-white font-bold text-base ml-3">
                    Restore Purchases
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={loadSubscriptionStatus}
                disabled={loading}
                className="bg-gray-800 rounded-xl p-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Ionicons name="reload" size={24} color="white" />
                  <Text className="text-white font-bold text-base ml-3">
                    Refresh Status
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View className="mt-6 bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#fbbf24" />
                <Text className="text-yellow-200 text-xs ml-2 flex-1">
                  Subscriptions are managed through{" "}
                  {Platform.OS === "ios" ? "Apple" : "Google"}. You can cancel
                  or modify your subscription at any time through your account
                  settings.
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};
