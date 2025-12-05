import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
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

const Login = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      if (authData.user) {
        console.log("User logged in:", authData.user.email);
        router.replace("/categories");
      }
    } catch (error: any) {
      let message = "Login failed, try again";

      // Supabase error handling
      if (error.message?.includes("Invalid login credentials")) {
        message = "Invalid email or password.";
      } else if (error.message?.includes("Email not confirmed")) {
        message = "Please verify your email address.";
      } else if (error.message?.includes("network")) {
        message = "Network error, check your internet connection.";
      }

      Alert.alert("Login Error", message);
    } finally {
      setLoading(false);
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
                      editable={!loading}
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
                      editable={!loading}
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
                  disabled={loading}
                  style={{ opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center">Log In</Text>
                  )}
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

export default Login;
