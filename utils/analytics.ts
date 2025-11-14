import { analytics } from "@/firebaseConfig";
import { logEvent } from "firebase/analytics";
import { Platform } from "react-native";

// Analytics helper functions
export const trackEvent = (eventName: string, params?: { [key: string]: any }) => {
  try {
    // Only log on web for now (React Native requires additional native setup)
    if (Platform.OS === "web" && analytics) {
      logEvent(analytics, eventName, params);
    } else {
      // Log to console for React Native (can be replaced with native analytics later)
      console.log(`[Analytics] ${eventName}`, params);
    }
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Predefined event tracking functions
export const trackGameStart = (category: string, deck: string) => {
  trackEvent("game_start", { category, deck });
};

export const trackCardReveal = (cardType: string, category: string) => {
  trackEvent("card_reveal", { card_type: cardType, category });
};

export const trackCardSkip = (cardType: string) => {
  trackEvent("card_skip", { card_type: cardType });
};

export const trackGameComplete = (cardsSeen: number, category: string) => {
  trackEvent("game_complete", { cards_seen: cardsSeen, category });
};

export const trackCategoryView = (category: string) => {
  trackEvent("category_view", { category });
};

export const trackDeckSelect = (deck: string, category: string) => {
  trackEvent("deck_select", { deck, category });
};

