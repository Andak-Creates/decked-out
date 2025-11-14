import { Decks } from "@/assets/games/Decks";
import {
  trackCardReveal,
  trackCardSkip,
  trackGameComplete,
  trackGameStart,
} from "@/utils/analytics";
import { updateGameStats } from "@/utils/stats";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Card = {
  type: string;
  text: string;
  timer: number | null;
  requiresOppositeGender?: boolean; // If true, Player A and Player B must be opposite genders when filter is on
};

type Player = {
  name: string;
  gender?: "M" | "F";
};

const Game = () => {
  const router = useRouter();
  const { deck, players, filterByGender } = useLocalSearchParams();

  // Find the deck and category
  const findDeckAndCategory = () => {
    for (const category of Decks) {
      const foundDeck = category.decks.find((d) => d.slug === deck);
      if (foundDeck) {
        return { deck: foundDeck, category: category };
      }
    }
    return { deck: undefined, category: undefined };
  };

  const { deck: currentDeck, category: currentCategory } =
    findDeckAndCategory();

  const [parsedPlayers, setParsedPlayers] = useState<Player[]>([]);
  const [allCards, setAllCards] = useState<Card[]>([]); // All available cards
  const [shuffledCards, setShuffledCards] = useState<Card[]>([]); // Filtered cards for current player
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [shouldFilterByGender, setShouldFilterByGender] = useState(false);
  const [currentCardText, setCurrentCardText] = useState<string>(""); // Card text with player names filled in
  const [categorySlug, setCategorySlug] = useState<string>(""); // Track category for stats
  const [showContentWarning, setShowContentWarning] = useState(true); // Show content warning initially

  // Animation values
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  // Shuffle array function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Assign players to card roles based on gender filter
  const assignPlayersToCard = (card: Card): string => {
    if (!card || !card.text) {
      return "Card error - please try again";
    }

    let cardText = card.text;

    // Check if card has player placeholders
    const hasPlayerA =
      cardText.includes("{PlayerA}") || cardText.includes("{Player A}");
    const hasPlayerB =
      cardText.includes("{PlayerB}") || cardText.includes("{Player B}");

    if (!hasPlayerA && !hasPlayerB) {
      // No player placeholders, return as is
      return cardText;
    }

    if (parsedPlayers.length < 2) {
      // Not enough players, use generic names
      return cardText
        .replace(/{PlayerA}|{Player A}/g, "Player A")
        .replace(/{PlayerB}|{Player B}/g, "Player B");
    }

    let playerA: Player | null = null;
    let playerB: Player | null = null;

    if (shouldFilterByGender && card.requiresOppositeGender) {
      // Gender filter is ON and card requires opposite genders
      const currentPlayer = parsedPlayers[currentPlayerIndex];
      const currentPlayerGender = currentPlayer?.gender;

      if (currentPlayerGender) {
        // Find players with opposite gender
        const oppositeGenderPlayers = parsedPlayers.filter(
          (p, idx) =>
            idx !== currentPlayerIndex &&
            p.gender &&
            p.gender !== currentPlayerGender
        );

        if (oppositeGenderPlayers.length > 0) {
          // Assign current player as Player A, opposite gender as Player B
          playerA = currentPlayer;
          playerB =
            oppositeGenderPlayers[
              Math.floor(Math.random() * oppositeGenderPlayers.length)
            ];
        } else {
          // No opposite gender available - show warning but continue
          console.warn(
            "No opposite gender players available for gender filter requirement"
          );
          // Assign randomly but try to match requirement
          const availablePlayers = parsedPlayers.filter(
            (_, idx) => idx !== currentPlayerIndex
          );
          if (availablePlayers.length > 0) {
            playerA = currentPlayer;
            playerB =
              availablePlayers[
                Math.floor(Math.random() * availablePlayers.length)
              ];
          }
        }
      } else {
        // Current player has no gender, assign randomly
        const shuffled = shuffleArray([...parsedPlayers]);
        playerA = shuffled[0];
        playerB = shuffled[1];
      }
    } else {
      // Gender filter is OFF or card doesn't require opposite genders - assign randomly
      const shuffled = shuffleArray([...parsedPlayers]);
      playerA = shuffled[0];
      playerB = shuffled[1];
    }

    // Replace placeholders with actual player names
    if (hasPlayerA && playerA) {
      cardText = cardText.replace(
        /{PlayerA}|{Player A}/g,
        playerA.name || "Player A"
      );
    } else if (hasPlayerA) {
      cardText = cardText.replace(/{PlayerA}|{Player A}/g, "Player A");
    }

    if (hasPlayerB && playerB) {
      cardText = cardText.replace(
        /{PlayerB}|{Player B}/g,
        playerB.name || "Player B"
      );
    } else if (hasPlayerB) {
      cardText = cardText.replace(/{PlayerB}|{Player B}/g, "Player B");
    }

    return cardText;
  };

  // Initialize game
  useEffect(() => {
    if (!currentDeck) {
      Alert.alert("Error", "Deck not found", [
        { text: "OK", onPress: () => router.back() },
      ]);
      return;
    }

    // Validate deck has cards
    if (!currentDeck.cards || currentDeck.cards.length === 0) {
      Alert.alert(
        "Error",
        "This deck has no cards available. Please try another deck.",
        [{ text: "OK", onPress: () => router.back() }]
      );
      return;
    }

    // Parse players
    try {
      const playersData = players ? JSON.parse(players as string) : [];
      setParsedPlayers(playersData);

      // Validate players for multiplayer games
      if (
        (currentDeck.type === "multi-player" ||
          currentDeck.type === "multiplayer-player") &&
        playersData.length === 0
      ) {
        Alert.alert("Error", "Multiplayer games require at least one player.", [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }

      // Check if gender filtering should be enabled
      const filterEnabled =
        filterByGender === "true" && currentDeck.genderCheck;
      setShouldFilterByGender(filterEnabled);

      // Store category slug for stats
      if (currentCategory) {
        setCategorySlug(currentCategory.slug);
      }

      // Store all cards
      const allCardsData = [...(currentDeck.cards as Card[])];
      setAllCards(allCardsData);

      // Shuffle all cards
      const shuffled = shuffleArray([...allCardsData]);
      setShuffledCards(shuffled);

      // Track game start
      if (currentCategory) {
        trackGameStart(currentCategory.slug, currentDeck.slug);
      }

      // Initialize first card text with player assignments
      if (shuffled.length > 0) {
        const firstCardText = assignPlayersToCard(shuffled[0]);
        setCurrentCardText(firstCardText);

        if (shuffled[0].timer) {
          setTimeRemaining(shuffled[0].timer);
        }
      } else {
        Alert.alert(
          "Error",
          "No cards available after filtering. Please try again.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      console.error("Game initialization error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to initialize game. Please try again.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timeRemaining !== null && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isTimerRunning && timeRemaining === 0) {
      setIsTimerRunning(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [isTimerRunning, timeRemaining]);

  // Flip card animation
  const flipCard = () => {
    if (cardFlipped) return;

    const cardToReveal = shuffledCards[currentCardIndex];
    setCardFlipped(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Track card reveal
    if (cardToReveal && categorySlug) {
      trackCardReveal(cardToReveal.type, categorySlug);
    }

    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Start timer if card has one
    if (cardToReveal?.timer && !isTimerRunning) {
      setIsTimerRunning(true);
    }
  };

  // Skip current card
  const skipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Track card skip
    const cardToSkip = shuffledCards[currentCardIndex];
    if (cardToSkip) {
      trackCardSkip(cardToSkip.type);
    }

    nextCard();
  };

  // Get next card
  const nextCard = () => {
    // Rotate players for multiplayer games first
    let nextPlayerIndex = currentPlayerIndex;
    if (
      currentDeck?.type === "multi-player" ||
      currentDeck?.type === "multiplayer-player"
    ) {
      nextPlayerIndex = (currentPlayerIndex + 1) % parsedPlayers.length;
      setCurrentPlayerIndex(nextPlayerIndex);
    }

    // Move to next card
    if (currentCardIndex < shuffledCards.length - 1) {
      const nextIndex = currentCardIndex + 1;
      setCurrentCardIndex(nextIndex);

      // Assign players to the next card
      const nextCard = shuffledCards[nextIndex];
      const nextCardText = assignPlayersToCard(nextCard);
      setCurrentCardText(nextCardText);

      // Set timer if next card has one
      if (nextCard?.timer) {
        setTimeRemaining(nextCard.timer);
      } else {
        setTimeRemaining(null);
      }
    }

    // Reset animations
    opacityAnimation.setValue(0);
    scaleAnimation.setValue(1);
    setCardFlipped(false);
    setIsTimerRunning(false);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Check if we've run out of cards (only for non-filtered games)
    if (
      !shouldFilterByGender &&
      shuffledCards.length > 0 &&
      currentCardIndex >= shuffledCards.length - 1
    ) {
      // Track game completion and update stats
      if (currentCategory && currentDeck) {
        trackGameComplete(currentCardIndex + 1, currentCategory.slug);
        updateGameStats(
          currentCategory.slug,
          currentDeck.slug,
          currentCardIndex + 1
        );
      }

      // Game over
      Alert.alert("Game Over!", "You've gone through all the cards!", [
        {
          text: "Play Again",
          onPress: () => {
            // Reset game
            const cardsToUse =
              allCards.length > 0 ? allCards : currentDeck?.cards || [];
            const shuffled = shuffleArray([...cardsToUse]);
            setShuffledCards(shuffled);
            setCurrentCardIndex(0);
            setCurrentPlayerIndex(0);
            setCardFlipped(false);
            opacityAnimation.setValue(0);
            scaleAnimation.setValue(1);
            setIsTimerRunning(false);

            // Assign players to first card
            if (shuffled.length > 0) {
              const firstCardText = assignPlayersToCard(shuffled[0]);
              setCurrentCardText(firstCardText);

              if (shuffled[0].timer) {
                setTimeRemaining(shuffled[0].timer);
              } else {
                setTimeRemaining(null);
              }
            }
          },
        },
        {
          text: "Back to Categories",
          onPress: () => router.push("/categories"),
          style: "cancel",
        },
      ]);
    }
  };

  // Get current player name
  const getCurrentPlayerName = () => {
    if (
      currentDeck?.type === "multi-player" ||
      currentDeck?.type === "multiplayer-player"
    ) {
      if (parsedPlayers.length > 0) {
        return parsedPlayers[currentPlayerIndex]?.name || "Player";
      }
    }
    return null;
  };

  // Get card type color
  const getCardTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "truth":
        return "#3B82F6"; // Blue
      case "dare":
        return "#EF4444"; // Red
      case "challenge":
        return "#10B981"; // Green
      default:
        return "#9333EA"; // Purple
    }
  };

  const currentCard = shuffledCards[currentCardIndex];
  const currentPlayer = getCurrentPlayerName();
  const cardTypeColor = currentCard
    ? getCardTypeColor(currentCard.type)
    : "#9333EA";

  if (!currentDeck || !currentCard) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/deckedBackground.jpg")}
      resizeMode="cover"
      className="h-full w-full"
    >
      <View className="flex-1 justify-between px-6 py-8">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-black/50 px-4 py-2 rounded-lg"
          >
            <Text className="text-white">← Back</Text>
          </TouchableOpacity>

          <View className="bg-black/50 px-4 py-2 rounded-lg">
            <Text className="text-white">
              Card {currentCardIndex + 1} / {shuffledCards.length}
            </Text>
          </View>
        </View>

        {/* Content Warning */}
        {showContentWarning && currentCategory && (
          <View className="items-center mb-4">
            <View
              className="bg-red-600/90 px-6 py-4 rounded-xl border-2 border-red-400"
              style={{ maxWidth: "90%" }}
            >
              <Text className="text-white text-lg font-bold text-center mb-2">
                ⚠️ Content Warning
              </Text>
              <Text className="text-white/90 text-sm text-center mb-3">
                This game contains adult content including explicit language and
                mature themes. Play responsibly.
              </Text>
              <TouchableOpacity
                onPress={() => setShowContentWarning(false)}
                className="bg-white/20 px-4 py-2 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">
                  I Understand
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Current Player (for multiplayer) */}
        {currentPlayer && !showContentWarning && (
          <View className="items-center mb-4">
            <View className="bg-purple-600/80 px-6 py-3 rounded-xl">
              <Text className="text-white text-lg font-bold">
                {currentPlayer}'s Turn
              </Text>
            </View>
          </View>
        )}

        {/* Card Display */}
        {!showContentWarning && (
          <View className="flex-1 justify-center items-center">
            <TouchableOpacity
              onPress={flipCard}
              activeOpacity={0.9}
              disabled={cardFlipped}
              className="w-full"
            >
              <Animated.View
                className="bg-black/70 rounded-3xl p-8 min-h-[400px] justify-center items-center border-4"
                style={{
                  borderColor: cardTypeColor,
                  transform: [{ scale: scaleAnimation }],
                }}
              >
                {!cardFlipped ? (
                  <View className="items-center">
                    <Text className="text-white text-2xl font-bold mb-4">
                      {currentDeck.name}
                    </Text>
                    <Text className="text-white/70 text-lg">
                      Tap to reveal card
                    </Text>
                  </View>
                ) : (
                  <View className="items-center w-full">
                    {/* Card Type Badge */}
                    <View
                      className="px-4 py-2 rounded-full mb-6"
                      style={{ backgroundColor: cardTypeColor }}
                    >
                      <Text className="text-white font-bold text-lg uppercase">
                        {currentCard.type}
                      </Text>
                    </View>

                    {/* Card Text */}
                    <Text className="text-white text-3xl font-bold text-center leading-relaxed">
                      {currentCardText || currentCard.text}
                    </Text>

                    {/* Timer Display */}
                    {timeRemaining !== null && isTimerRunning && (
                      <View className="mt-8 bg-red-600/80 px-6 py-3 rounded-full">
                        <Text className="text-white text-2xl font-bold">
                          ⏱ {timeRemaining}s
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        {!showContentWarning && (
          <View className="mt-6 space-y-4">
            {!cardFlipped ? (
              <TouchableOpacity
                onPress={flipCard}
                className="bg-purple-600 py-4 rounded-xl"
              >
                <Text className="text-white text-center text-xl font-bold">
                  Reveal Card
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="space-y-3">
                <TouchableOpacity
                  onPress={nextCard}
                  className="bg-green-600 py-4 rounded-xl"
                >
                  <Text className="text-white text-center text-xl font-bold">
                    Next Card →
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={skipCard}
                  className="bg-orange-600 py-3 rounded-xl"
                >
                  <Text className="text-white text-center text-lg font-semibold">
                    ⏭ Skip This Card
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

export default Game;
