import clsx from "clsx";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Login = () => {
  const [checked, setChecked] = useState<boolean>(false);

  return (
    <ImageBackground
      source={require("../assets/images/deckedBackground.jpg")}
      resizeMode="cover"
      className="flex-1 justify-center items-center px-[40px]
      text-center"
    >
      <Image
        source={require("../assets/images/logo.png")}
        resizeMode="cover"
        className="h-[180px] w-[180px]"
      />
      <Text className="font-bold text-[#FFFFFF] mt-0 text-center text-1xl">
        Welcome to Decked Out! Please log in to continue.
      </Text>

      <View className="flex flex-col justify-start w-[90%] my-[5px]">
        <Text className="InputLabel">Name</Text>
        <TextInput className="loginInput" />
      </View>

      <View className="flex flex-col justify-start w-[90%] my-[5px]">
        <Text className="InputLabel">Email</Text>
        <TextInput className="loginInput" />
      </View>

      <View className="flex flex-row justify-center items-center w-[80%] gap-[10px]">
        <TouchableOpacity
          onPress={() => setChecked((prev) => !prev)}
          className=" items-center my-2 p-[4] border border-[#2c003e] rounded-sm"
        >
          <Text
            className={clsx(
              " text-white",
              checked ? "text-green-600" : "bg-transparent"
            )}
          >
            {checked ? "✔" : "   "}
          </Text>
        </TouchableOpacity>

        <Text className="text-sm text-white">
          Stay updated with the latest Decked Out News and Updates
        </Text>
      </View>

      <View className="flex justify-center items-center w-[90%] my-[5px]">
        <TouchableOpacity className="bg-[#2C003E] px-[40px] py-[10px] rounded-md">
          <Text className="text-white">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default Login;
