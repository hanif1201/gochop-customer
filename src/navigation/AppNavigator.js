import React, { useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";

import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

// Import navigators
import AuthNavigator from "./AuthNavigator";
import MainTabNavigator from "./MainTabNavigator";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading: authLoading } = useContext(AuthContext);
  const { theme, isLoading: themeLoading } = useContext(ThemeContext);

  // Show loading indicator while checking auth state and loading theme
  if (authLoading || themeLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size='large' color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name='Auth' component={AuthNavigator} />
      ) : (
        <Stack.Screen name='Main' component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
