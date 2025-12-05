import { supabase } from "@/lib/supabase";
import clsx from "clsx";
import { useRouter } from "expo-router";
import * as React from "react";
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

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  subscribeToNews: boolean;
};

const SignUp = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Sign up with Supabase
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      if (authData.user) {
        // Update profile with newsletter preference
        await supabase
          .from("profiles")
          .update({ subscribe_to_news: data.subscribeToNews })
          .eq("id", authData.user.id);

        console.log("User registered:", authData.user.email);

        // Check if email confirmation is required
        if (authData.session) {
          // Email confirmation not required, go to categories
          router.replace("/categories");
        } else {
          // Email confirmation required
          Alert.alert(
            "Check Your Email",
            "We've sent you a confirmation email. Please verify your email to continue.",
            [{ text: "OK", onPress: () => router.replace("/login") }]
          );
        }
      }
    } catch (error: any) {
      let message = "Something went wrong, try again";

      if (error.message?.includes("already registered")) {
        message = "This email is already in use.";
      } else if (error.message?.includes("invalid email")) {
        message = "The email address is invalid.";
      } else if (error.message?.includes("Password")) {
        message = "Password should be at least 6 characters.";
      } else if (error.message?.includes("network")) {
        message = "Network error. Please check your internet connection.";
      }

      Alert.alert("Sign Up Error", message);
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
                Welcome to Decked Out! Please Sign up to continue.
              </Text>

              {/* Email */}
              <View className="flex flex-col justify-start w-[90%] my-[5px]">
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
              <View className="flex flex-col justify-start w-[90%] my-[5px]">
                <Text className="InputLabel">Password</Text>
                <Controller
                  control={control}
                  name="password"
                  rules={{ required: "Password is required", minLength: 6 }}
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
                    {errors.password.message || "Minimum 6 characters"}
                  </Text>
                )}
              </View>

              {/* Confirm Password */}
              <View className="flex flex-col justify-start w-[90%] my-[5px]">
                <Text className="InputLabel">Confirm Password</Text>
                <Controller
                  control={control}
                  name="confirmPassword"
                  rules={{
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match",
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="loginInput"
                      secureTextEntry
                      placeholder="Confirm Password"
                      value={value}
                      onChangeText={onChange}
                      editable={!loading}
                    />
                  )}
                />
                {errors.confirmPassword && (
                  <Text className="text-red-400 text-sm">
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </View>

              {/* Stay Updated Checkbox */}
              <Controller
                control={control}
                name="subscribeToNews"
                defaultValue={false}
                render={({ field: { value, onChange } }) => (
                  <View className="flex flex-row justify-center items-center w-[80%] gap-[10px]">
                    <TouchableOpacity
                      onPress={() => onChange(!value)}
                      disabled={loading}
                      className="flex justify-center items-center my-2 border border-[#2c003e] rounded-sm w-[24px] h-[24px]"
                    >
                      <Text
                        className={clsx(
                          "text-white text-base",
                          value ? "text-green" : "bg-transparent"
                        )}
                      >
                        {value ? "✔" : " "}
                      </Text>
                    </TouchableOpacity>

                    <Text className="text-sm text-white flex-1">
                      Stay updated with the latest Decked Out News and Updates
                    </Text>
                  </View>
                )}
              />

              {/* Submit Button */}
              <View className="flex justify-center items-center w-[90%] my-[5px]">
                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  className="bg-[#2C003E] px-[40px] py-[10px] rounded-md"
                  disabled={loading}
                  style={{ opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white">Sign Up</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View>
                <Text className="flex justify-center items-center text-white">
                  already have an account?{" "}
                  <TouchableOpacity onPress={() => router.push("/login")}>
                    <Text className="text-blue-400 underline">Log in</Text>
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

export default SignUp;
