import { Image, ImageBackground, Text } from "react-native";

export default function CustomSplash() {
  return (
    <ImageBackground
      source={require("../assets/images/deckedBackground.jpg")}
      resizeMode="cover"
      className="flex-1 justify-center items-center"
    >
      <Image
        source={require("../assets/images/logo.png")}
        className="h-[200px] w-[200px]"
        resizeMode="cover"
      />
      <Text className="font-bold text-white text-2xl mt-2 text-center">
        Your Digital home for Spicy Games
      </Text>
    </ImageBackground>
  );
}
