export interface Card {
  type: string;
  text: string;
  timer: number | null;

  // Optional fields depending on card
  gender?: string | null;
  requiresOppositeGender?: boolean;
  difficulty?: "easy" | "medium" | "hard";
}

export interface GameDeck {
  name: string;
  description: string;
  genderCheck: boolean;
  slug: string;

  // multiplayer, single-player, team-based, etc.
  type: string;

  cards: Card[];
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  decks: GameDeck[];
}

export type DecksType = Category[];
