import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ThemeContext } from "../context/ThemeContext";

// Import screens
import ProfileScreen from "../screens/profile/ProfileScreen";
import AddressScreen from "../screens/profile/AddressScreen";
import PaymentMethodsScreen from "../screens/profile/PaymentMethodsScreen";
import SettingsScreen from "../screens/profile/SettingsScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import OrderHistoryScreen from "../screens/order/OrderHistoryScreen";

const Stack = createStackNavigator();

const ProfileNavigator = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <Stack.Navigator
      initialRouteName='Profile'
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
        name='Profile'
        component={ProfileScreen}
        options={{ title: "My Profile" }}
      />
      <Stack.Screen
        name='EditProfile'
        component={EditProfileScreen}
        options={{ title: "Edit Profile" }}
      />
      <Stack.Screen
        name='Addresses'
        component={AddressScreen}
        options={{ title: "My Addresses" }}
      />
      <Stack.Screen
        name='PaymentMethods'
        component={PaymentMethodsScreen}
        options={{ title: "Payment Methods" }}
      />
      <Stack.Screen
        name='Settings'
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
      <Stack.Screen
        name='OrderHistory'
        component={OrderHistoryScreen}
        options={{ title: "Order History" }}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
