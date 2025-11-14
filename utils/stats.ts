import AsyncStorage from "@react-native-async-storage/async-storage";
import { Decks } from "@/assets/games/Decks";

const STATS_KEY = "@deckedOut:gameStats";

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
    const statsData = await AsyncStorage.getItem(STATS_KEY);
    if (statsData) {
      return JSON.parse(statsData);
    }
  } catch (error) {
    console.error("Error loading stats:", error);
  }

  // Return default stats
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

export const saveStats = async (stats: GameStats): Promise<void> => {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error("Error saving stats:", error);
  }
};

export const updateGameStats = async (
  categorySlug: string,
  deckSlug: string,
  cardsSeen: number
): Promise<void> => {
  try {
    const stats = await loadStats();

    // Update totals
    stats.totalGames += 1;
    stats.totalCardsSeen += cardsSeen;
    stats.lastPlayed = new Date().toLocaleDateString();

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
      (a, b) => (stats.cardsByCategory[a[0]] > stats.cardsByCategory[b[0]] ? a : b),
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

    stats.favoriteCategory = category?.name || "None";
    stats.favoriteDeck = deck?.name || "None";

    await saveStats(stats);
  } catch (error) {
    console.error("Error updating stats:", error);
  }
};

export const resetStats = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STATS_KEY);
  } catch (error) {
    console.error("Error resetting stats:", error);
  }
};

