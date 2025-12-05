import { Decks } from "@/assets/games/Decks";
import { usePremium } from "@/context/PremiumContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Player = { name: string; gender?: "M" | "F" };
type Team = { name: string; players: Player[]; color: string };

const TEAM_COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

// Regular Player Card (for non-team games)
const PlayerCard = ({
  player,
  index,
  colors,
  onUpdateName,
  onUpdateGender,
  onRemove,
  canRemove,
}: {
  player: Player;
  index: number;
  colors: { primary: string; secondary: string };
  onUpdateName: (text: string) => void;
  onUpdateGender: (gender: "M" | "F") => void;
  onRemove: () => void;
  canRemove: boolean;
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View
      style={{ transform: [{ scale: scaleAnim }], marginBottom: 12 }}
    >
      <View
        className="rounded-2xl p-4"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          borderWidth: 1,
          borderColor: colors.primary,
          opacity: 0.8,
        }}
      >
        <View className="flex-row items-center">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: colors.primary, opacity: 0.2 }}
          >
            <Text className="text-white font-bold">{index + 1}</Text>
          </View>

          <TextInput
            value={player.name}
            onChangeText={onUpdateName}
            placeholder={`Player ${index + 1} name`}
            placeholderTextColor="#999"
            className="flex-1 text-white text-base font-semibold px-4 py-3 rounded-xl"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
          />

          <View className="flex-row ml-2">
            <TouchableOpacity
              onPress={() => onUpdateGender("M")}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              className={`px-4 py-3 rounded-xl mr-2 ${
                player.gender === "M" ? "bg-blue-600" : "bg-white/10"
              }`}
            >
              <Text className="text-white font-bold">M</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onUpdateGender("F")}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              className={`px-4 py-3 rounded-xl ${
                player.gender === "F" ? "bg-pink-600" : "bg-white/10"
              }`}
            >
              <Text className="text-white font-bold">F</Text>
            </TouchableOpacity>
          </View>

          {canRemove && (
            <TouchableOpacity
              onPress={onRemove}
              className="ml-2 bg-red-600/80 px-3 py-3 rounded-xl"
            >
              <Text className="text-white font-bold text-lg">×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

// Team Card (for team-based games)
const TeamCard = ({
  team,
  teamIndex,
  onUpdateTeamName,
  onAddPlayer,
  onUpdatePlayerName,
  onUpdatePlayerGender,
  onRemovePlayer,
  onRemoveTeam,
  canRemove,
}: {
  team: Team;
  teamIndex: number;
  onUpdateTeamName: (text: string) => void;
  onAddPlayer: () => void;
  onUpdatePlayerName: (playerIndex: number, text: string) => void;
  onUpdatePlayerGender: (playerIndex: number, gender: "M" | "F") => void;
  onRemovePlayer: (playerIndex: number) => void;
  onRemoveTeam: () => void;
  canRemove: boolean;
}) => {
  return (
    <View
      className="rounded-2xl p-4 mb-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderWidth: 2,
        borderColor: team.color,
      }}
    >
      {/* Team Header */}
      <View className="flex-row items-center mb-4">
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: team.color }}
        >
          <Text className="text-white font-bold text-lg">{teamIndex + 1}</Text>
        </View>

        <TextInput
          value={team.name}
          onChangeText={onUpdateTeamName}
          placeholder={`Team ${teamIndex + 1} name`}
          placeholderTextColor="#999"
          className="flex-1 text-white text-lg font-bold px-4 py-2 rounded-xl"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
        />

        {canRemove && (
          <TouchableOpacity
            onPress={onRemoveTeam}
            className="ml-2 bg-red-600/80 px-3 py-2 rounded-xl"
          >
            <Ionicons name="trash-outline" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Players */}
      <View className="ml-4">
        <Text className="text-white/70 text-sm mb-2">
          👥 {team.players.length} player{team.players.length !== 1 ? "s" : ""}
        </Text>

        {team.players.map((player, playerIndex) => (
          <View key={playerIndex} className="flex-row items-center mb-2">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: team.color, opacity: 0.3 }}
            >
              <Text className="text-white text-xs font-bold">
                {playerIndex + 1}
              </Text>
            </View>

            <TextInput
              value={player.name}
              onChangeText={(text) => onUpdatePlayerName(playerIndex, text)}
              placeholder={`Player ${playerIndex + 1}`}
              placeholderTextColor="#999"
              className="flex-1 text-white text-sm px-3 py-2 rounded-lg"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            />

            <View className="flex-row ml-2">
              <TouchableOpacity
                onPress={() => onUpdatePlayerGender(playerIndex, "M")}
                className={`px-3 py-2 rounded-lg mr-1 ${
                  player.gender === "M" ? "bg-blue-600" : "bg-white/10"
                }`}
              >
                <Text className="text-white font-bold text-xs">M</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onUpdatePlayerGender(playerIndex, "F")}
                className={`px-3 py-2 rounded-lg mr-1 ${
                  player.gender === "F" ? "bg-pink-600" : "bg-white/10"
                }`}
              >
                <Text className="text-white font-bold text-xs">F</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => onRemovePlayer(playerIndex)}
              className="ml-1 bg-red-600/50 px-2 py-2 rounded-lg"
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          onPress={onAddPlayer}
          className="mt-2 rounded-lg py-2 flex-row items-center justify-center"
          style={{
            backgroundColor: `${team.color}20`,
            borderWidth: 1,
            borderColor: team.color,
            borderStyle: "dashed",
          }}
        >
          <Ionicons name="add-circle-outline" size={16} color={team.color} />
          <Text className="text-white/80 text-sm ml-2">Add Player</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main Setup Screen
const DeckSetUp = () => {
  const { categories, deck } = useLocalSearchParams();
  const router = useRouter();
  const { isPremium } = usePremium();

  const currentCategory = Decks.find((c) => c.slug === categories);
  const currentDeck = currentCategory?.decks.find((d) => d.slug === deck);

  const isTeamBased = currentDeck?.type === "team-based";
  const isMultiplayer =
    currentDeck?.type === "multi-player" ||
    currentDeck?.type === "multiplayer-player";

  // Regular players (for non-team games)
  const [players, setPlayers] = useState<Player[]>([]);

  // Teams (for team-based games)
  const [teams, setTeams] = useState<Team[]>([
    {
      name: "",
      players: [{ name: "", gender: undefined }],
      color: TEAM_COLORS[0],
    },
    {
      name: "",
      players: [{ name: "", gender: undefined }],
      color: TEAM_COLORS[1],
    },
  ]);

  const [filterByGender, setFilterByGender] = useState<boolean>(false);

  const maxTeams = isPremium ? 5 : 2;

  // Initialize players for multiplayer
  useEffect(() => {
    if (isMultiplayer && !isTeamBased && players.length === 0) {
      setPlayers([{ name: "", gender: undefined }]);
    }
  }, [currentDeck?.type]);

  if (!currentCategory || !currentDeck) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-xl">Deck Not Found</Text>
      </View>
    );
  }

  // Regular player functions
  const updatePlayers = (text: string, index: number) => {
    const updated = [...players];
    updated[index].name = text;
    setPlayers(updated);
  };

  const updatePlayerGender = (gender: "M" | "F", index: number) => {
    const updated = [...players];
    updated[index].gender = gender;
    setPlayers(updated);
  };

  const addPlayer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlayers([...players, { name: "", gender: undefined }]);
  };

  const removePlayer = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlayers(players.filter((_, i) => i !== index));
  };

  // Team functions
  const updateTeamName = (teamIndex: number, text: string) => {
    const updated = [...teams];
    updated[teamIndex].name = text;
    setTeams(updated);
  };

  const addPlayerToTeam = (teamIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = [...teams];
    updated[teamIndex].players.push({ name: "", gender: undefined });
    setTeams(updated);
  };

  const updateTeamPlayerName = (
    teamIndex: number,
    playerIndex: number,
    text: string
  ) => {
    const updated = [...teams];
    updated[teamIndex].players[playerIndex].name = text;
    setTeams(updated);
  };

  const updateTeamPlayerGender = (
    teamIndex: number,
    playerIndex: number,
    gender: "M" | "F"
  ) => {
    const updated = [...teams];
    updated[teamIndex].players[playerIndex].gender = gender;
    setTeams(updated);
  };

  const removePlayerFromTeam = (teamIndex: number, playerIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = [...teams];
    if (updated[teamIndex].players.length > 1) {
      updated[teamIndex].players = updated[teamIndex].players.filter(
        (_, i) => i !== playerIndex
      );
      setTeams(updated);
    } else {
      Alert.alert("Error", "Each team must have at least one player");
    }
  };

  const addTeam = () => {
    if (teams.length >= maxTeams) {
      if (!isPremium) {
        Alert.alert(
          "Premium Feature",
          "Upgrade to Premium to add up to 5 teams!",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Upgrade", onPress: () => router.push("/PaywallScreen") },
          ]
        );
      }
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTeams([
      ...teams,
      {
        name: "",
        players: [{ name: "", gender: undefined }],
        color: TEAM_COLORS[teams.length % TEAM_COLORS.length],
      },
    ]);
  };

  const removeTeam = (teamIndex: number) => {
    if (teams.length <= 2) {
      Alert.alert("Error", "You must have at least 2 teams");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTeams(teams.filter((_, i) => i !== teamIndex));
  };

  const startGame = () => {
    if (isTeamBased) {
      // Validate teams
      const teamsWithoutNames = teams.filter((t) => !t.name.trim());
      if (teamsWithoutNames.length > 0) {
        Alert.alert("Error", "Please enter names for all teams");
        return;
      }
      for (const team of teams) {
        const playersWithoutNames = team.players.filter((p) => !p.name.trim());
        if (playersWithoutNames.length > 0) {
          Alert.alert(
            "Error",
            `Please enter names for all players in ${team.name || "each team"}`
          );
          return;
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({
        pathname: "/game/team-game",
        params: {
          deck: currentDeck.slug,
          category: categories as string,
          teams: JSON.stringify(teams),
          filterByGender: filterByGender.toString(),
        },
      });
    } else {
      // Validate regular players
      if (isMultiplayer && players.length === 0) {
        Alert.alert("Error", "Please add at least one player");
        return;
      }
      const playersWithoutNames = players.filter((p) => !p.name.trim());
      if (playersWithoutNames.length > 0) {
        Alert.alert("Error", "Please enter names for all players");
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({
        pathname: "/game/[deck]",
        params: {
          deck: currentDeck.slug,
          players: JSON.stringify(players),
          filterByGender: filterByGender.toString(),
        },
      });
    }
  };

  const getCategoryColor = () => {
    if (currentCategory.slug === "mild-mischief")
      return { primary: "#667eea", secondary: "#764ba2" };
    if (currentCategory.slug === "risky-business")
      return { primary: "#f093fb", secondary: "#f5576c" };
    return { primary: "#4facfe", secondary: "#00f2fe" };
  };

  const colors = getCategoryColor();

  return (
    <ImageBackground
      source={require("@/assets/images/deckedBackground.jpg")}
      resizeMode="cover"
      className="h-full w-full"
    >
      <View className="absolute inset-0 bg-black/40" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 60,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-black/50 px-4 py-2 rounded-xl self-start mb-4"
            >
              <Text className="text-white text-lg">← Back</Text>
            </TouchableOpacity>

            <View
              className="rounded-3xl p-6 mb-6 mt-[30px]"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                borderWidth: 2,
                borderColor: colors.primary,
              }}
            >
              <View className="flex-row items-center mb-2">
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: colors.primary, opacity: 0.3 }}
                >
                  <Text className="text-2xl">{isTeamBased ? "🎭" : "🎮"}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-3xl font-bold">
                    {currentDeck.name}
                  </Text>
                  <Text className="text-white/70 text-sm mt-1">
                    {isTeamBased ? "Team-based game" : currentDeck.description}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Premium Banner for Teams */}
          {isTeamBased && !isPremium && (
            <TouchableOpacity
              onPress={() => router.push("/PaywallScreen")}
              className="mb-6 rounded-2xl p-4"
              style={{
                backgroundColor: "rgba(251, 191, 36, 0.15)",
                borderWidth: 2,
                borderColor: "#fbbf24",
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-yellow-400 text-base font-bold mb-1">
                    🔒 Limited to 2 Teams
                  </Text>
                  <Text className="text-yellow-100 text-sm">
                    Upgrade to Premium for up to 5 teams!
                  </Text>
                </View>
                <View className="bg-yellow-500 px-4 py-2 rounded-xl">
                  <Text className="text-black font-bold">Upgrade</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* TEAM-BASED UI */}
          {isTeamBased && (
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Text className="text-white text-2xl font-bold mr-2">
                  🏆 Teams ({teams.length}/{maxTeams})
                </Text>
                <View
                  className="h-1 flex-1 rounded-full"
                  style={{ backgroundColor: colors.primary, opacity: 0.5 }}
                />
              </View>

              {teams.map((team, teamIndex) => (
                <TeamCard
                  key={teamIndex}
                  team={team}
                  teamIndex={teamIndex}
                  onUpdateTeamName={(text) => updateTeamName(teamIndex, text)}
                  onAddPlayer={() => addPlayerToTeam(teamIndex)}
                  onUpdatePlayerName={(playerIndex, text) =>
                    updateTeamPlayerName(teamIndex, playerIndex, text)
                  }
                  onUpdatePlayerGender={(playerIndex, gender) =>
                    updateTeamPlayerGender(teamIndex, playerIndex, gender)
                  }
                  onRemovePlayer={(playerIndex) =>
                    removePlayerFromTeam(teamIndex, playerIndex)
                  }
                  onRemoveTeam={() => removeTeam(teamIndex)}
                  canRemove={teams.length > 2}
                />
              ))}

              {teams.length < maxTeams && (
                <TouchableOpacity
                  onPress={addTeam}
                  className="rounded-2xl py-4 mt-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white text-center font-bold text-lg">
                    + Add Team
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* REGULAR MULTIPLAYER UI */}
          {isMultiplayer && !isTeamBased && (
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Text className="text-white text-2xl font-bold mr-2">
                  👥 Players
                </Text>
                <View
                  className="h-1 flex-1 rounded-full"
                  style={{ backgroundColor: colors.primary, opacity: 0.5 }}
                />
              </View>

              {players.map((player, index) => (
                <PlayerCard
                  key={index}
                  player={player}
                  index={index}
                  colors={colors}
                  onUpdateName={(text) => updatePlayers(text, index)}
                  onUpdateGender={(gender) => updatePlayerGender(gender, index)}
                  onRemove={() => removePlayer(index)}
                  canRemove={players.length > 1}
                />
              ))}

              <TouchableOpacity
                onPress={addPlayer}
                className="rounded-2xl py-4 mt-2"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white text-center font-bold text-lg">
                  + Add Player
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Gender Filter */}
          <View
            className="rounded-2xl p-5 mb-6"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderWidth: 1,
              borderColor: colors.primary,
              opacity: 0.8,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Text className="text-2xl mr-3">🔀</Text>
                <View>
                  <Text className="text-white text-lg font-semibold">
                    Filter by Gender
                  </Text>
                  <Text className="text-white/60 text-sm mt-1">
                    Show gender-specific cards
                  </Text>
                </View>
              </View>
              <Switch
                value={filterByGender}
                onValueChange={setFilterByGender}
                trackColor={{ false: "#666", true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Start Button */}
          <TouchableOpacity
            onPress={startGame}
            className="rounded-2xl py-5 mt-4"
            style={{ backgroundColor: "#10b981" }}
          >
            <Text className="text-white text-center font-bold text-xl">
              🚀 Start {isTeamBased ? "Team " : ""}Game
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default DeckSetUp;
