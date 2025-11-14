import { auth } from "@/firebaseConfig";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type LoginFormData = {
  email: string;
  password: string;
};

const login = () => {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredentials.user;

      router.replace("/categories");
    } catch (error: any) {
      let message = "Login failed, try again";

      // Switch logic
      switch (error.code) {
        case "auth/user-not-found":
          message = "No account found with this email.";
          break;

        case "auth/wrong-password":
          message = "Incorrect password.";
          break;

        case "auth/invalid-email":
          message = "Invalid email address.";
          break;

        case "auth/network-request-failed":
          message = "Network error, check your internet connection.";
          break;
      }

      Alert.alert("Login Error", message);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/deckedBackground.jpg")}
      resizeMode="cover"
      className="h-[100vh]"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 justify-center items-center px-[40px] text-center">
              <Image
                source={require("../assets/images/logo.png")}
                resizeMode="cover"
                className="h-[180px] w-[180px] mt-[30px]"
              />
              <Text className="font-bold text-[#FFFFFF] mt-0 text-center text-1xl">
                Welcome to Decked Out! Please log in to continue.
              </Text>

              {/* Email */}
              <View className="w-[90%] my-[5px]">
                <Text className="InputLabel">Email Address</Text>
                <Controller
                  control={control}
                  name="email"
                  rules={{ required: "Email is required" }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="loginInput"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholder="Email"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.email && (
                  <Text className="text-red-400 text-sm">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              {/* Password */}
              <View className="w-[90%] my-[5px]">
                <Text className="InputLabel">Password</Text>
                <Controller
                  control={control}
                  name="password"
                  rules={{ required: "Password is required" }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="loginInput"
                      secureTextEntry
                      placeholder="Password"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.password && (
                  <Text className="text-red-400 text-sm">
                    {errors.password.message}
                  </Text>
                )}
              </View>

              {/* Submit Button */}
              <View className="w-[90%] my-[10px]">
                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  className="bg-[#2C003E] px-[40px] py-[10px] rounded-md"
                >
                  <Text className="text-white text-center">Log In</Text>
                </TouchableOpacity>
              </View>

              {/* Link to Sign Up */}
              <View>
                <Text className="text-white">
                  Don't have an account?{" "}
                  <TouchableOpacity onPress={() => router.push("/signUp")}>
                    <Text className="text-blue-400 underline">Sign Up</Text>
                  </TouchableOpacity>
                </Text>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default login;
