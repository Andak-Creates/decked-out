import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { verifyPaystackPayment } from "@/services/paymentService";
import { useAuth } from "@/context/SupabaseAuthContext";
import * as Haptics from "expo-haptics";

interface PaystackPaymentProps {
  paymentUrl: string;
  packageIdentifier: string;
  onSuccess: () => void;
  onCancel: () => void;
  visible: boolean;
}

export const PaystackPayment: React.FC<PaystackPaymentProps> = ({
  paymentUrl,
  packageIdentifier,
  onSuccess,
  onCancel,
  visible,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  // Extract payment reference from URL
  useEffect(() => {
    if (paymentUrl) {
      const match = paymentUrl.match(/pay\/([^/?]+)/);
      if (match) {
        setPaymentReference(match[1]);
      }
    }
  }, [paymentUrl]);

  const handleNavigationStateChange = async (navState: any) => {
    const { url } = navState;

    // Check if payment was successful
    // Paystack redirects to a callback URL on success
    if (url.includes("callback") || url.includes("success") || url.includes("verify")) {
      setLoading(true);
      
      if (paymentReference && user) {
        const result = await verifyPaystackPayment(paymentReference, user.id);
        
        if (result.success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert(
            "🎉 Payment Successful!",
            "Your subscription has been activated. Enjoy premium access!",
            [{ text: "OK", onPress: onSuccess }]
          );
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert(
            "Payment Failed",
            result.error || "Unable to verify payment. Please contact support.",
            [{ text: "OK" }]
          );
        }
      }
      
      setLoading(false);
    }

    // Check if payment was cancelled
    if (url.includes("cancel") || url.includes("close")) {
      onCancel();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="bg-gray-900 px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
          <Text className="text-white text-lg font-bold">Complete Payment</Text>
          <TouchableOpacity
            onPress={onCancel}
            className="bg-gray-800 px-3 py-2 rounded-lg"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {loading && (
          <View className="absolute inset-0 bg-black/80 z-10 items-center justify-center">
            <ActivityIndicator size="large" color="#fbbf24" />
            <Text className="text-white mt-4 text-base">
              Processing payment...
            </Text>
          </View>
        )}

        {/* WebView for Paystack payment */}
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View className="flex-1 items-center justify-center bg-black">
              <ActivityIndicator size="large" color="#fbbf24" />
              <Text className="text-white mt-4">Loading payment page...</Text>
            </View>
          )}
        />

        {/* Info Banner */}
        <View className="bg-yellow-500/20 border-t border-yellow-500/50 px-4 py-3">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#fbbf24" />
            <Text className="text-yellow-200 text-xs ml-2 flex-1">
              You'll be redirected to Paystack to complete your payment securely.
              After payment, you'll be redirected back to the app.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

