import { supabase } from "@/lib/supabase";
import { Platform } from "react-native";

export const trackEvent = async (
  eventName: string,
  params?: { [key: string]: any }
) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("analytics_events").insert({
      user_id: user?.id,
      event_name: eventName,
      event_params: params || {},
      platform: Platform.OS,
    });

    console.log(`[Analytics] ${eventName}`, params);
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
