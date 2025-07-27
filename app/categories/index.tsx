import * as React from "react";
import { ImageBackground, ScrollView, Text, View } from "react-native";

const index = () => {
  return (
    <ImageBackground
      source={require("@/assets/images/deckedBackground.jpg")}
      resizeMode="cover"
      className="h-full"
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        className="h-full"
      >
        {/* Overlay */}
        {/* <View className="fixed h-[100%] top-0 left-0 w-full z-[-2] bg-[#0000001e] backdrop-blur-[90%]"></View> */}

        <View>
          <Text className="text-white">Hello Categories</Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default index;
