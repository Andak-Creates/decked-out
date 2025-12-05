import { Decks } from "@/assets/games/Decks";
import { supabase } from "@/lib/supabase";

export type GameStats = {
  totalGames: number;
  totalCardsSeen: number;
  favoriteCategory: string;
  favoriteDeck: string;
  lastPlayed: string;
  cardsByCategory: {
    [key: string]: number;
  };
  decksPlayed: {
    [key: string]: number;
  };
};

export const loadStats = async (): Promise<GameStats> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No user");

    const { data, error } = await supabase
      .from("game_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) throw error;

    if (data) {
      return {
        totalGames: data.total_games,
        totalCardsSeen: data.total_cards_seen,
        favoriteCategory: data.favorite_category || "None",
        favoriteDeck: data.favorite_deck || "None",
        lastPlayed: data.last_played
          ? new Date(data.last_played).toLocaleDateString()
          : "Never",
        cardsByCategory: data.cards_by_category || {},
        decksPlayed: data.decks_played || {},
      };
    }
  } catch (error) {
    console.error("Error loading stats:", error);
  }

  return {
    totalGames: 0,
    totalCardsSeen: 0,
    favoriteCategory: "None",
    favoriteDeck: "None",
    lastPlayed: "Never",
    cardsByCategory: {},
    decksPlayed: {},
  };
};

export const updateGameStats = async (
  categorySlug: string,
  deckSlug: string,
  cardsSeen: number
): Promise<void> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const stats = await loadStats();

    // Update totals
    stats.totalGames += 1;
    stats.totalCardsSeen += cardsSeen;

    // Update category stats
    if (!stats.cardsByCategory[categorySlug]) {
      stats.cardsByCategory[categorySlug] = 0;
    }
    stats.cardsByCategory[categorySlug] += cardsSeen;

    // Update deck stats
    const deckKey = `${categorySlug}_${deckSlug}`;
    if (!stats.decksPlayed[deckKey]) {
      stats.decksPlayed[deckKey] = 0;
    }
    stats.decksPlayed[deckKey] += 1;

    // Find favorite category
    const favoriteCategory = Object.entries(stats.cardsByCategory).reduce(
      (a, b) =>
        stats.cardsByCategory[a[0]] > stats.cardsByCategory[b[0]] ? a : b,
      ["None", 0]
    )[0];

    // Find favorite deck
    const favoriteDeck = Object.entries(stats.decksPlayed).reduce(
      (a, b) => (a[1] > b[1] ? a : b),
      ["None", 0]
    )[0];

    // Get category and deck names
    const category = Decks.find((c) => c.slug === categorySlug);
    const deck = category?.decks.find((d) => d.slug === deckSlug);

    // Update in Supabase
    await supabase
      .from("game_stats")
      .update({
        total_games: stats.totalGames,
        total_cards_seen: stats.totalCardsSeen,
        favorite_category: category?.name || "None",
        favorite_deck: deck?.name || "None",
        last_played: new Date().toISOString(),
        cards_by_category: stats.cardsByCategory,
        decks_played: stats.decksPlayed,
      })
      .eq("user_id", user.id);
  } catch (error) {
    console.error("Error updating stats:", error);
  }
};

export const resetStats = async (): Promise<void> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("game_stats")
      .update({
        total_games: 0,
        total_cards_seen: 0,
        favorite_category: "None",
        favorite_deck: "None",
        last_played: null,
        cards_by_category: {},
        decks_played: {},
      })
      .eq("user_id", user.id);
  } catch (error) {
    console.error("Error resetting stats:", error);
  }
};
