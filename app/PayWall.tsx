import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { formatTimeRemaining } from '../utils/formatTime';
import { Ionicons } from '@expo/vector-icons';
import { usePremium } from '@/context/PremiumContext';

export const PaywallScreen = ({ navigation }: any) => {
  const { packages, purchasePackage, restorePurchases, isPremium, timeRemaining, premiumType } = usePremium();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (pkg: any) => {
    setLoading(pkg.identifier);
    const success = await purchasePackage(pkg);
    setLoading(null);
    
    if (success) {
      Alert.alert(
        '🎉 Welcome to Premium!',
        'You now have access to all spicy card decks!',
        [{ text: 'Start Playing', onPress: () => navigation.goBack() }]
      );
    }
  };

  const handleRestore = async () => {
    setLoading('restore');
    const success = await restorePurchases();
    setLoading(null);
    
    if (success) {
      Alert.alert('✅ Purchases Restored', 'Your premium access has been restored!');
    } else {
      Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases to restore.');
    }
  };

  const getPackagePrice = (pkg: any): string => {
    return pkg.product.priceString;
  };

  const getPackageTitle = (identifier: string): string => {
    if (identifier.includes('3hour')) return '3 Hour Pass';
    if (identifier.includes('6hour')) return '6 Hour Pass';
    if (identifier.includes('weekly')) return 'Weekly';
    if (identifier.includes('monthly')) return 'Monthly';
    if (identifier.includes('annual')) return 'Yearly';
    return identifier;
  };

  const getPackageDescription = (identifier: string): string => {
    if (identifier.includes('3hour')) return 'Perfect for a party';
    if (identifier.includes('6hour')) return 'All night access';
    if (identifier.includes('weekly')) return 'One week of spice';
    if (identifier.includes('monthly')) return 'Most popular';
    if (identifier.includes('annual')) return 'Best value - save 40%';
    return '';
  };

  const isPopular = (identifier: string) => identifier.includes('monthly');
  const isBestValue = (identifier: string) => identifier.includes('annual');

  if (isPremium && premiumType === 'temporary' && timeRemaining) {
    return (
      <View className="flex-1 bg-black px-6 pt-16">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="mb-8"
        >
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        <View className="items-center justify-center flex-1">
          <Text className="text-6xl mb-4">⏰</Text>
          <Text className="text-white text-2xl font-bold mb-2">Premium Active</Text>
          <Text className="text-gray-400 text-base mb-8">Time Remaining</Text>
          <Text className="text-red-500 text-5xl font-bold">
            {formatTimeRemaining(timeRemaining)}
          </Text>
          <Text className="text-gray-500 text-sm mt-8">
            Enjoy your premium access!
          </Text>
        </View>
      </View>
    );
  }

  if (isPremium && premiumType === 'subscription') {
    return (
      <View className="flex-1 bg-black px-6 pt-16">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="mb-8"
        >
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        <View className="items-center justify-center flex-1">
          <Text className="text-6xl mb-4">👑</Text>
          <Text className="text-white text-2xl font-bold mb-2">Premium Member</Text>
          <Text className="text-gray-400 text-base">
            You have unlimited access to all decks
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="px-6 pt-16 pb-8">
        {/* Close button */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="mb-8"
        >
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

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
          {['Risky Business deck', 'Sin City deck', 'All future premium decks', 'No ads', 'Unlimited plays'].map((feature, index) => (
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
                className={`border-2 rounded-2xl p-5 ${
                  isPopular(identifier) 
                    ? 'border-red-500 bg-red-500/10' 
                    : isBestValue(identifier)
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-gray-700 bg-gray-900'
                }`}
              >
                {isPopular(identifier) && (
                  <View className="absolute -top-3 right-4 bg-red-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">POPULAR</Text>
                  </View>
                )}
                {isBestValue(identifier) && (
                  <View className="absolute -top-3 right-4 bg-yellow-500 px-3 py-1 rounded-full">
                    <Text className="text-black text-xs font-bold">BEST VALUE</Text>
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

        {/* Restore button */}
        <TouchableOpacity
          onPress={handleRestore}
          disabled={!!loading}
          className="items-center py-4"
        >
          {loading === 'restore' ? (
            <ActivityIndicator size="small" color="#9ca3af" />
          ) : (
            <Text className="text-gray-400 text-sm">Restore Purchases</Text>
          )}
        </TouchableOpacity>

        {/* Terms */}
        <Text className="text-gray-600 text-xs text-center mt-4 mb-8">
          Subscriptions auto-renew unless cancelled. Terms apply.
        </Text>
      </View>
    </ScrollView>
  );
};