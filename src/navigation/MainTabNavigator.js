import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "react-native-elements";
import { View } from "react-native";

// Import navigators and screens
import HomeNavigator from "./HomeNavigator";
import RestaurantNavigator from "./RestaurantNavigator";
import OrderNavigator from "./OrderNavigator";
import ProfileNavigator from "./ProfileNavigator";

// Import contexts
import { ThemeContext } from "../context/ThemeContext";
import { CartContext } from "../context/CartContext";
import { OrderContext } from "../context/OrderContext";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { theme } = useContext(ThemeContext);
  const { cartItems, getCartTotals } = useContext(CartContext);
  const { activeOrderId } = useContext(OrderContext);

  const { itemCount } = getCartTotals();

  return (
    <Tab.Navigator
      initialRouteName='HomeTab'
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "RestaurantsTab") {
            iconName = focused ? "restaurant" : "restaurant-outline";
          } else if (route.name === "OrdersTab") {
            iconName = focused ? "receipt" : "receipt-outline";
          } else if (route.name === "ProfileTab") {
            iconName = focused ? "person" : "person-outline";
          }

          // Show badge on cart icon if there are items
          if (route.name === "OrdersTab" && (itemCount > 0 || activeOrderId)) {
            return (
              <View>
                <Ionicons name={iconName} size={size} color={color} />
                {itemCount > 0 && (
                  <Badge
                    value={itemCount}
                    status='error'
                    containerStyle={{
                      position: "absolute",
                      top: -5,
                      right: -10,
                    }}
                  />
                )}
                {activeOrderId && !itemCount && (
                  <Badge
                    status='success'
                    containerStyle={{
                      position: "absolute",
                      top: -5,
                      right: -10,
                    }}
                  />
                )}
              </View>
            );
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.placeholder,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          height: theme.metrics.tabBarHeight + theme.metrics.bottomInset,
          paddingBottom: theme.metrics.bottomInset,
        },
        headerShown: false,
        tabBarLabelStyle: theme.fonts.style.small,
      })}
    >
      <Tab.Screen
        name='HomeTab'
        component={HomeNavigator}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name='RestaurantsTab'
        component={RestaurantNavigator}
        options={{ title: "Restaurants" }}
      />
      <Tab.Screen
        name='OrdersTab'
        component={OrderNavigator}
        options={{ title: "Orders" }}
      />
      <Tab.Screen
        name='ProfileTab'
        component={ProfileNavigator}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
