import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Divider, Button } from "react-native-elements";

import { ThemeContext } from "../../context/ThemeContext";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";

// Import components
import QuantitySelector from "../../components/common/QuantitySelector";
import EmptyState from "../../components/common/EmptyState";

const CartScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const {
    cartItems,
    restaurant,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    getCartTotals,
    meetsMinimumOrder,
  } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);

  const { subtotal, deliveryFee, tax, total, itemCount } = getCartTotals();

  const handleQuantityChange = (index, quantity) => {
    updateItemQuantity(index, quantity);
  };

  const handleRemoveItem = (index) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => removeFromCart(index),
          style: "destructive",
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert("Clear Cart", "Are you sure you want to clear your cart?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Clear",
        onPress: () => clearCart(),
        style: "destructive",
      },
    ]);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to continue with your order.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Sign In",
            onPress: () => navigation.navigate("Auth", { screen: "Login" }),
          },
        ]
      );
      return;
    }

    if (!meetsMinimumOrder()) {
      Alert.alert(
        "Minimum Order",
        `The minimum order amount is $${restaurant.minimumOrder.toFixed(
          2
        )}. Please add more items to your cart.`,
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    navigation.navigate("Checkout");
  };

  const renderCartItem = ({ item, index }) => {
    return (
      <View style={[styles.cartItem, { backgroundColor: theme.colors.card }]}>
        <Image
          source={{ uri: item.image || "https://via.placeholder.com/60" }}
          style={styles.itemImage}
        />

        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <TouchableOpacity onPress={() => handleRemoveItem(index)}>
              <Ionicons
                name='close'
                size={20}
                color={theme.colors.placeholder}
              />
            </TouchableOpacity>
          </View>

          {item.customizations && item.customizations.length > 0 && (
            <View style={styles.customizations}>
              {item.customizations.map((customization, custIndex) => (
                <View key={`${index}-${custIndex}`}>
                  <Text
                    style={[
                      styles.customizationName,
                      { color: theme.colors.text },
                    ]}
                  >
                    {customization.name}:
                  </Text>
                  {customization.options.map((option, optIndex) => (
                    <Text
                      key={`${index}-${custIndex}-${optIndex}`}
                      style={[
                        styles.customizationOption,
                        { color: theme.colors.placeholder },
                      ]}
                    >
                      {option.name}{" "}
                      {option.price > 0 ? `(+$${option.price.toFixed(2)})` : ""}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          <View style={styles.itemFooter}>
            <Text style={[styles.itemPrice, { color: theme.colors.text }]}>
              ${item.subtotal.toFixed(2)}
            </Text>

            <QuantitySelector
              value={item.quantity}
              onValueChange={(value) => handleQuantityChange(index, value)}
              min={1}
              max={10}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyCart = () => {
    return (
      <EmptyState
        icon='cart-outline'
        title='Your cart is empty'
        description='Add items from a restaurant to get started with your order.'
        buttonTitle='Browse Restaurants'
        onButtonPress={() => navigation.navigate("RestaurantsTab")}
      />
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          <View style={styles.restaurantInfo}>
            <Text style={[styles.restaurantName, { color: theme.colors.text }]}>
              {restaurant?.name || "Your Cart"}
            </Text>

            <TouchableOpacity onPress={handleClearCart}>
              <Text style={[styles.clearCart, { color: theme.colors.error }]}>
                Clear Cart
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.cartList}
            ItemSeparatorComponent={() => (
              <Divider style={{ marginVertical: 8 }} />
            )}
          />

          <View
            style={[
              styles.orderSummary,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
              Order Summary
            </Text>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
                Subtotal
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                ${subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
                Delivery Fee
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                ${deliveryFee.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
                Tax
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                ${tax.toFixed(2)}
              </Text>
            </View>

            <Divider style={{ marginVertical: 8 }} />

            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
                Total
              </Text>
              <Text
                style={[styles.totalValue, { color: theme.colors.primary }]}
              >
                ${total.toFixed(2)}
              </Text>
            </View>

            {restaurant &&
              restaurant.minimumOrder > 0 &&
              !meetsMinimumOrder() && (
                <Text
                  style={[
                    styles.minimumOrderWarning,
                    { color: theme.colors.error },
                  ]}
                >
                  Minimum order amount is ${restaurant.minimumOrder.toFixed(2)}
                </Text>
              )}

            <Button
              title='Proceed to Checkout'
              onPress={handleCheckout}
              buttonStyle={[
                styles.checkoutButton,
                { backgroundColor: theme.colors.primary },
              ]}
              titleStyle={styles.checkoutButtonText}
              disabled={
                loading ||
                cartItems.length === 0 ||
                (restaurant &&
                  restaurant.minimumOrder > 0 &&
                  !meetsMinimumOrder())
              }
              loading={loading}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  restaurantInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  clearCart: {
    fontSize: 14,
  },
  cartList: {
    padding: 16,
    flexGrow: 1,
  },
  cartItem: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
    marginRight: 8,
  },
  customizations: {
    marginTop: 4,
  },
  customizationName: {
    fontSize: 14,
    fontWeight: "500",
  },
  customizationOption: {
    fontSize: 12,
    marginLeft: 8,
    marginBottom: 2,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  orderSummary: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  minimumOrderWarning: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 8,
    textAlign: "center",
  },
  checkoutButton: {
    height: 56,
    borderRadius: 8,
    marginTop: 16,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CartScreen;
