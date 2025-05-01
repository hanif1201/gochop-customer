import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ThemeContext } from "../context/ThemeContext";

// Import screens
import HomeScreen from "../screens/home/HomeScreen";
import SearchScreen from "../screens/home/SearchScreen";
import RestaurantDetailsScreen from "../screens/restaurant/RestaurantDetailsScreen";
import MenuScreen from "../screens/restaurant/MenuScreen";
import CartScreen from "../screens/order/CartScreen";

const Stack = createStackNavigator();

const HomeNavigator = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <Stack.Navigator
      initialRouteName='Home'
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
        name='Home'
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='Search'
        component={SearchScreen}
        options={{ title: "Search" }}
      />
      <Stack.Screen
        name='RestaurantDetails'
        component={RestaurantDetailsScreen}
        options={({ route }) => ({
          title: route.params?.name || "Restaurant",
          headerTransparent: true,
          headerTintColor: theme.colors.white,
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen
        name='Menu'
        component={MenuScreen}
        options={({ route }) => ({
          title: route.params?.name || "Menu",
        })}
      />
      <Stack.Screen
        name='Cart'
        component={CartScreen}
        options={{ title: "Your Cart" }}
      />
    </Stack.Navigator>
  );
};

export default HomeNavigator;
