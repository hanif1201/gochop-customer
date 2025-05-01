import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ThemeContext } from "../context/ThemeContext";
import { OrderContext } from "../context/OrderContext";

// Import screens
import CartScreen from "../screens/order/CartScreen";
import CheckoutScreen from "../screens/order/CheckoutScreen";
import OrderConfirmationScreen from "../screens/order/OrderConfirmationScreen";
import OrderDetailsScreen from "../screens/order/OrderDetailsScreen";
import OrderHistoryScreen from "../screens/order/OrderHistoryScreen";
import OrderTrackingScreen from "../screens/order/OrderTrackingScreen";

const Stack = createStackNavigator();

const OrderNavigator = () => {
  const { theme } = useContext(ThemeContext);
  const { activeOrderId } = useContext(OrderContext);

  return (
    <Stack.Navigator
      initialRouteName={activeOrderId ? "OrderTracking" : "Cart"}
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
        name='Cart'
        component={CartScreen}
        options={{ title: "Your Cart" }}
      />
      <Stack.Screen
        name='Checkout'
        component={CheckoutScreen}
        options={{ title: "Checkout" }}
      />
      <Stack.Screen
        name='OrderConfirmation'
        component={OrderConfirmationScreen}
        options={{
          title: "Order Confirmed",
          headerLeft: () => null, // Disable back button
        }}
      />
      <Stack.Screen
        name='OrderDetails'
        component={OrderDetailsScreen}
        options={({ route }) => ({
          title: `Order #${route.params?.orderNumber || ""}`,
        })}
      />
      <Stack.Screen
        name='OrderHistory'
        component={OrderHistoryScreen}
        options={{ title: "Your Orders" }}
      />
      <Stack.Screen
        name='OrderTracking'
        component={OrderTrackingScreen}
        options={{
          title: "Track Your Order",
          headerLeft: null, // Disable back button while order is active
        }}
      />
    </Stack.Navigator>
  );
};

export default OrderNavigator;
