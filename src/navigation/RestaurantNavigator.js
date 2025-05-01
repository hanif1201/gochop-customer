import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ThemeContext } from "../context/ThemeContext";

// Import screens
import RestaurantListScreen from "../screens/restaurant/RestaurantListScreen";
import RestaurantDetailsScreen from "../screens/restaurant/RestaurantDetailsScreen";
import MenuScreen from "../screens/restaurant/MenuScreen";
import CartScreen from "../screens/order/CartScreen";

const Stack = createStackNavigator();

const RestaurantNavigator = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <Stack.Navigator
      initialRouteName='RestaurantList'
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
        name='RestaurantList'
        component={RestaurantListScreen}
        options={{ title: "Restaurants" }}
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

export default RestaurantNavigator;
