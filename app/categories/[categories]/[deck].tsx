import { Decks } from "@/assets/games/Decks";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  ImageBackground,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Separate component for player card to properly use hooks
const PlayerCard = ({
  player,
  index,
  colors,
  onUpdateName,
  onUpdateGender,
  onRemove,
  canRemove,
}: {
  player: { name: string; gender?: "M" | "F" };
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
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        marginBottom: 12,
      }}
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
            style={{
              backgroundColor: colors.primary,
              opacity: 0.2,
            }}
          >
            <Text className="text-white font-bold">{index + 1}</Text>
          </View>

          <TextInput
            value={player.name}
            onChangeText={onUpdateName}
            placeholder={`Player ${index + 1} name`}
            placeholderTextColor="#999"
            className="flex-1 text-white text-base font-semibold px-4 py-3 rounded-xl"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
          />

          {/* Gender buttons */}
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

          {/* Remove button */}
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

const DeckSetUp = () => {
  const { categories, deck } = useLocalSearchParams();
  const router = useRouter();

  const currentCategory = Decks.find((c) => c.slug === categories);
  const currentDeck = currentCategory?.decks.find((d) => d.slug === deck);

  const [players, setPlayers] = useState<
    { name: string; gender?: "M" | "F" }[]
  >([]);
  const [filterByGender, setFilterByGender] = useState<boolean>(false);

  // Initialize with one player for multiplayer games
  useEffect(() => {
    if (
      (currentDeck?.type === "multi-player" ||
        currentDeck?.type === "multiplayer-player") &&
      players.length === 0
    ) {
      setPlayers([{ name: "", gender: undefined }]);
    }
  }, [currentDeck?.type]);

  if (!currentCategory) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-xl">Deck Not Found</Text>
      </View>
    );
  }

  const updatePlayers = (text: string, index: number) => {
    const inputedPlayers = [...players];
    inputedPlayers[index].name = text;
    setPlayers(inputedPlayers);
  };

  const updatePlayerGender = (gender: "M" | "F", index: number) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].gender = gender;
    setPlayers(updatedPlayers);
  };

  const addPlayer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlayers([...players, { name: "", gender: undefined }]);
  };

  const removePlayer = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlayers(players.filter((_, i) => i !== index));
  };

  const startGame = () => {
    // Validate multiplayer games have at least one player
    if (
      (currentDeck?.type === "multi-player" ||
        currentDeck?.type === "multiplayer-player") &&
      players.length === 0
    ) {
      Alert.alert("Error", "Please add at least one player to start the game");
      return;
    }

    // Validate all players have names
    const playersWithoutNames = players.filter((p) => !p.name.trim());
    if (playersWithoutNames.length > 0) {
      Alert.alert(
        "Error",
        "Please enter names for all players before starting"
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push({
      pathname: "/game/[deck]",
      params: {
        deck: currentDeck?.slug ?? "",
        players: JSON.stringify(players),
        filterByGender: filterByGender.toString(),
      },
    });
  };

  // Get category color scheme
  const getCategoryColor = () => {
    if (currentCategory.slug === "mild-mischief") {
      return { primary: "#667eea", secondary: "#764ba2" };
    } else if (currentCategory.slug === "risky-business") {
      return { primary: "#f093fb", secondary: "#f5576c" };
    } else {
      return { primary: "#4facfe", secondary: "#00f2fe" };
    }
  };

  const colors = getCategoryColor();
  const isMultiplayer =
    currentDeck?.type === "multi-player" ||
    currentDeck?.type === "multiplayer-player";

  return (
    <ImageBackground
      source={require("@/assets/images/deckedBackground.jpg")}
      resizeMode="cover"
      className="h-full w-full"
    >
      {/* Dark overlay */}
      <View className="absolute inset-0 bg-black/40" />

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
            className="rounded-3xl p-6 mb-6"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              borderWidth: 2,
              borderColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center mb-2">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                style={{
                  backgroundColor: colors.primary,
                  opacity: 0.3,
                }}
              >
                <Text className="text-2xl">🎮</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-3xl font-bold">
                  {currentDeck?.name}
                </Text>
                <Text className="text-white/70 text-sm mt-1">
                  {currentDeck?.description}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Player inputs (if multiplayer) */}
        {isMultiplayer && (
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
              style={{
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text className="text-white text-center font-bold text-lg">
                + Add Player
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Gender filter */}
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
              onValueChange={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilterByGender(value);
              }}
              trackColor={{ false: "#666", true: colors.primary }}
              thumbColor={filterByGender ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Start Game Button */}
        <TouchableOpacity
          onPress={startGame}
          className="rounded-2xl py-5 mt-4"
          style={{
            backgroundColor: "#10b981",
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <Text className="text-white text-center font-bold text-xl">
            🚀 Start Game
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

export default DeckSetUp;
