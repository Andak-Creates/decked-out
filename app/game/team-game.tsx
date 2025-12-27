import { Decks } from "@/assets/games/Decks";
import {
  trackCardReveal,
  trackCardSkip,
  trackGameComplete,
  trackGameStart,
} from "@/utils/supabaseAnalytics";
import { updateGameStats } from "@/utils/supabaseStats";
import { Audio } from "expo-av";
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
  difficulty?: string;
};

type Player = {
  name: string;
  gender?: "M" | "F";
};

type Team = {
  name: string;
  players: Player[];
  color: string;
  score: number;
};

const TeamGame = () => {
  const router = useRouter();
  const { deck, teams: teamsParam } = useLocalSearchParams();

  const findDeck = () => {
    for (const cat of Decks) {
      const foundDeck = cat.decks.find((d) => d.slug === deck);
      if (foundDeck) {
        return { deck: foundDeck, category: cat };
      }
    }
    return { deck: undefined, category: undefined };
  };

  const { deck: currentDeck, category: currentCategory } = findDeck();

  const [teams, setTeams] = useState<Team[]>([]);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [shuffledCards, setShuffledCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  // Track used players PER TEAM - when a team's set is full, reset it
  const [usedPlayersByTeam, setUsedPlayersByTeam] = useState<
    Map<number, Set<number>>
  >(new Map());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [showContentWarning, setShowContentWarning] = useState(true);
  const [roundComplete, setRoundComplete] = useState(false);

  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  //   sound ref
  const beepSound = useRef<Audio.Sound | null>(null);
  const buzzerSound = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const loadSounds = async () => {
      const beep = new Audio.Sound();
      const buzzer = new Audio.Sound();

      await beep.loadAsync(require("@/assets/sounds/tick.mp3"));
      await buzzer.loadAsync(require("@/assets/sounds/buzzer.mp3"));

      beepSound.current = beep;
      buzzerSound.current = buzzer;
    };

    loadSounds();

    return () => {
      beepSound.current?.unloadAsync();
      buzzerSound.current?.unloadAsync();
    };
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (!currentDeck) {
      Alert.alert("Error", "Deck not found", [
        { text: "OK", onPress: () => router.back() },
      ]);
      return;
    }

    if (!currentDeck.cards || currentDeck.cards.length === 0) {
      Alert.alert("Error", "This deck has no cards available.", [
        { text: "OK", onPress: () => router.back() },
      ]);
      return;
    }

    try {
      const parsedTeams = teamsParam ? JSON.parse(teamsParam as string) : [];

      if (parsedTeams.length < 2) {
        Alert.alert("Error", "Team games require at least 2 teams.", [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }

      // Initialize teams with scores
      const teamsWithScores = parsedTeams.map((team: Team) => ({
        ...team,
        score: 0,
      }));
      setTeams(teamsWithScores);

      const allCardsData = [...(currentDeck.cards as Card[])];
      setAllCards(allCardsData);

      const shuffled = shuffleArray([...allCardsData]);
      setShuffledCards(shuffled);

      if (currentCategory) {
        trackGameStart(currentCategory.slug, currentDeck.slug);
      }

      if (shuffled.length > 0 && shuffled[0].timer) {
        setTimeRemaining(shuffled[0].timer);
      }

      // Initialize used players tracking for each team
      const initialUsedPlayers = new Map<number, Set<number>>();

      teamsWithScores.forEach((_: Team, idx: number) => {
        initialUsedPlayers.set(idx, new Set<number>());
      });

      // Pick random player from first team
      if (teamsWithScores.length > 0 && teamsWithScores[0].players.length > 0) {
        const randomPlayerIdx = Math.floor(
          Math.random() * teamsWithScores[0].players.length
        );
        setCurrentPlayerIndex(randomPlayerIdx);
        initialUsedPlayers.get(0)?.add(randomPlayerIdx);
      }

      setUsedPlayersByTeam(initialUsedPlayers);
    } catch (error: any) {
      console.error("Game initialization error:", error);
      Alert.alert("Error", "Failed to initialize game.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timeRemaining !== null && timeRemaining > 0) {
      // 🔊 Beep for last 10 seconds
      if (timeRemaining <= 10) {
        beepSound.current?.replayAsync();
      }

      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isTimerRunning && timeRemaining === 0) {
      setIsTimerRunning(false);
      setRoundComplete(true);

      // 🔊 Final buzzer
      buzzerSound.current?.replayAsync();

      // Vibrate also
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [isTimerRunning, timeRemaining]);

  const flipCard = () => {
    if (cardFlipped) return;

    const cardToReveal = shuffledCards[currentCardIndex];
    setCardFlipped(true);
    setRoundComplete(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (cardToReveal && currentCategory) {
      trackCardReveal(cardToReveal.type, currentCategory.slug);
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

    if (cardToReveal?.timer && !isTimerRunning) {
      setIsTimerRunning(true);
    }
  };

  const handleCorrect = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Award point to current team
    const updatedTeams = [...teams];
    updatedTeams[currentTeamIndex].score += 1;
    setTeams(updatedTeams);

    nextTurn();
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const cardToSkip = shuffledCards[currentCardIndex];
    if (cardToSkip) {
      trackCardSkip(cardToSkip.type);
    }

    nextTurn();
  };

  const getNextPlayer = (nextTeamIdx: number): number => {
    const nextTeam = teams[nextTeamIdx];
    const usedPlayers = usedPlayersByTeam.get(nextTeamIdx) || new Set();

    // Get available players (not used yet)
    const availablePlayers = nextTeam.players
      .map((_, idx) => idx)
      .filter((idx) => !usedPlayers.has(idx));

    // If all players have been used, reset the used players for this team
    if (availablePlayers.length === 0) {
      usedPlayersByTeam.set(nextTeamIdx, new Set());
      // All players are now available again
      return Math.floor(Math.random() * nextTeam.players.length);
    }

    // Pick a random player from available ones
    const randomIdx = Math.floor(Math.random() * availablePlayers.length);
    return availablePlayers[randomIdx];
  };

  const nextTurn = () => {
    // Move to next team (round-robin)
    const nextTeamIdx = (currentTeamIndex + 1) % teams.length;

    // Get next player for that team
    const nextPlayerIdx = getNextPlayer(nextTeamIdx);

    // Update used players tracking
    const updatedUsedPlayers = new Map(usedPlayersByTeam);
    const teamUsedPlayers = updatedUsedPlayers.get(nextTeamIdx) || new Set();
    teamUsedPlayers.add(nextPlayerIdx);
    updatedUsedPlayers.set(nextTeamIdx, teamUsedPlayers);
    setUsedPlayersByTeam(updatedUsedPlayers);

    setCurrentTeamIndex(nextTeamIdx);
    setCurrentPlayerIndex(nextPlayerIdx);

    // Move to next card
    if (currentCardIndex < shuffledCards.length - 1) {
      const nextIdx = currentCardIndex + 1;
      setCurrentCardIndex(nextIdx);

      const nextCard = shuffledCards[nextIdx];
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
    setRoundComplete(false);

    // Check if game is over
    if (currentCardIndex >= shuffledCards.length - 1) {
      if (currentCategory && currentDeck) {
        trackGameComplete(currentCardIndex + 1, currentCategory.slug);
        updateGameStats(
          currentCategory.slug,
          currentDeck.slug,
          currentCardIndex + 1
        );
      }

      // Show final scores
      showFinalScores();
    }
  };

  const showFinalScores = () => {
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    const winner = sortedTeams[0];

    const scoresText = sortedTeams
      .map((team, idx) => `${idx + 1}. ${team.name}: ${team.score} points`)
      .join("\n");

    Alert.alert(`🏆 ${winner.name} Wins!`, `Final Scores:\n\n${scoresText}`, [
      {
        text: "Play Again",
        onPress: () => {
          const shuffled = shuffleArray([...allCards]);
          setShuffledCards(shuffled);
          setCurrentCardIndex(0);
          setCurrentTeamIndex(0);
          setCardFlipped(false);
          setRoundComplete(false);
          setIsTimerRunning(false);

          // Reset scores
          const resetTeams = teams.map((team) => ({ ...team, score: 0 }));
          setTeams(resetTeams);

          // Reset used players tracking
          const resetUsedPlayers = new Map<number, Set<number>>();
          teams.forEach((_, idx) => {
            resetUsedPlayers.set(idx, new Set());
          });

          // Pick random player from first team
          const randomPlayerIdx = Math.floor(
            Math.random() * teams[0].players.length
          );
          setCurrentPlayerIndex(randomPlayerIdx);
          resetUsedPlayers.get(0)?.add(randomPlayerIdx);
          setUsedPlayersByTeam(resetUsedPlayers);

          opacityAnimation.setValue(0);
          scaleAnimation.setValue(1);

          if (shuffled[0]?.timer) {
            setTimeRemaining(shuffled[0].timer);
          }
        },
      },
      {
        text: "Back to Categories",
        onPress: () => router.push("/categories"),
        style: "cancel",
      },
    ]);
  };

  const getCardTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "action":
        return "#3B82F6";
      case "movie":
        return "#EF4444";
      case "song":
        return "#10B981";
      case "animal":
        return "#F59E0B";
      case "profession":
        return "#8B5CF6";
      default:
        return "#9333EA";
    }
  };

  const currentCard = shuffledCards[currentCardIndex];
  const currentTeam = teams[currentTeamIndex];
  const currentPlayer = currentTeam?.players[currentPlayerIndex];

  if (!currentDeck || !currentCard || !currentTeam) {
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
        <View className="flex-row justify-between items-center mb-4 mt-[30px]">
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
        {showContentWarning && (
          <View className="items-center mb-4">
            <View
              className="bg-red-600/90 px-6 py-4 rounded-xl border-2 border-red-400"
              style={{ maxWidth: "90%" }}
            >
              <Text className="text-white text-lg font-bold text-center mb-2">
                ⚠️ Content Warning
              </Text>
              <Text className="text-white/90 text-sm text-center mb-3">
                This game contains adult content. Play responsibly.
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

        {/* Team Scores */}
        {!showContentWarning && (
          <View className="mb-4">
            <View className="flex-row justify-around">
              {teams.map((team, idx) => (
                <View
                  key={idx}
                  className={`px-4 py-3 rounded-xl ${
                    idx === currentTeamIndex ? "border-2" : ""
                  }`}
                  style={{
                    backgroundColor: `${team.color}80`,
                    borderColor:
                      idx === currentTeamIndex ? team.color : "transparent",
                  }}
                >
                  <Text className="text-white font-bold text-center">
                    {team.name}
                  </Text>
                  <Text className="text-white text-2xl font-bold text-center">
                    {team.score}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Current Turn */}
        {!showContentWarning && (
          <View className="items-center mb-4">
            <View
              className="px-6 py-3 rounded-xl"
              style={{ backgroundColor: currentTeam.color }}
            >
              <Text className="text-white text-lg font-bold text-center">
                {currentPlayer?.name}'s Turn ({currentTeam.name})
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
                  borderColor: cardFlipped
                    ? getCardTypeColor(currentCard.type)
                    : "#666666",
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
                    <View
                      className="px-4 py-2 rounded-full mb-6"
                      style={{
                        backgroundColor: getCardTypeColor(currentCard.type),
                      }}
                    >
                      <Text className="text-white font-bold text-lg uppercase">
                        {currentCard.type}
                      </Text>
                    </View>

                    <Text className="text-white text-3xl font-bold text-center leading-relaxed">
                      {currentCard.text}
                    </Text>

                    {timeRemaining !== null && isTimerRunning && (
                      <View className="mt-8 bg-red-600/80 px-6 py-3 rounded-full">
                        <Text className="text-white text-2xl font-bold">
                          ⏱ {timeRemaining}s
                        </Text>
                      </View>
                    )}

                    {roundComplete && (
                      <View className="mt-6 bg-red-600/80 px-6 py-3 rounded-xl">
                        <Text className="text-white text-lg font-bold">
                          Time's Up!
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
              <View className="space-y-3 flex flex-col gap-4">
                <TouchableOpacity
                  onPress={handleCorrect}
                  className="bg-green-600 py-4 rounded-xl"
                >
                  <Text className="text-white text-center text-xl font-bold">
                    ✓ Correct (+1 Point)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSkip}
                  className="bg-orange-600 py-3 rounded-xl"
                >
                  <Text className="text-white text-center text-lg font-semibold">
                    ⏭ Skip / Pass
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

export default TeamGame;
