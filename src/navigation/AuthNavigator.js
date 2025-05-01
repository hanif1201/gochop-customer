import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ThemeContext } from "../context/ThemeContext";

// Import authentication screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import WelcomeScreen from "../screens/auth/WelcomeScreen";

const Stack = createStackNavigator();

const AuthNavigator = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <Stack.Navigator
      initialRouteName='Welcome'
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          shadowColor: "transparent", // iOS
          elevation: 0, // Android
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: theme.fonts.style.heading,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name='Welcome'
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='Login'
        component={LoginScreen}
        options={{ title: "Sign In" }}
      />
      <Stack.Screen
        name='Register'
        component={RegisterScreen}
        options={{ title: "Create Account" }}
      />
      <Stack.Screen
        name='ForgotPassword'
        component={ForgotPasswordScreen}
        options={{ title: "Reset Password" }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
