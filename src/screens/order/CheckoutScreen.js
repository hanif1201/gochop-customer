import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Button, Divider } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";

import { ThemeContext } from "../../context/ThemeContext";
import { CartContext } from "../../context/CartContext";
import { OrderContext } from "../../context/OrderContext";
import { AuthContext } from "../../context/AuthContext";

const CheckoutScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { cartItems, restaurant, getCartTotals, clearCart } =
    useContext(CartContext);
  const { createOrder } = useContext(OrderContext);
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  // Dummy payment methods - in a real app these would come from an API
  const [paymentMethods, setPaymentMethods] = useState([
    {
      _id: "1",
      type: "card",
      brand: "Visa",
      lastDigits: "4242",
      isDefault: true,
    },
    {
      _id: "2",
      type: "card",
      brand: "Mastercard",
      lastDigits: "8210",
      isDefault: false,
    },
    {
      _id: "3",
      type: "cash",
      isDefault: false,
    },
  ]);

  // Dummy addresses - in a real app these would come from user profile
  const [addresses, setAddresses] = useState([
    {
      _id: "1",
      name: "Home",
      fullAddress: "123 Main St, Apartment 4B, Ibadan, Oyo, 200001, Nigeria",
      isDefault: true,
    },
    {
      _id: "2",
      name: "Work",
      fullAddress: "456 Business Ave, Suite 200, Ibadan, Oyo, 200002, Nigeria",
      isDefault: false,
    },
  ]);

  const { subtotal, deliveryFee, tax, total } = getCartTotals();

  useEffect(() => {
    // Set default values
    const defaultPayment =
      paymentMethods.find((pm) => pm.isDefault) || paymentMethods[0];
    const defaultAddress =
      addresses.find((addr) => addr.isDefault) || addresses[0];

    setSelectedPaymentMethod(defaultPayment);
    setSelectedAddress(defaultAddress);

    // Check for navigation params (from address/payment selection screens)
    if (navigation.getParam) {
      const paymentParam = navigation.getParam("selectedPaymentMethod");
      const addressParam = navigation.getParam("selectedAddress");

      if (paymentParam) {
        setSelectedPaymentMethod(paymentParam);
      }

      if (addressParam) {
        setSelectedAddress(addressParam);
      }
    }
  }, []);

  const handlePlaceOrder = async () => {
    // Validate required fields
    if (!selectedPaymentMethod) {
      Alert.alert("Missing Information", "Please select a payment method");
      return;
    }

    if (!selectedAddress) {
      Alert.alert("Missing Information", "Please select a delivery address");
      return;
    }

    try {
      setLoading(true);

      // Prepare order data
      const orderData = {
        restaurant: restaurant._id,
        items: cartItems.map((item) => ({
          menuItem: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          subtotal: item.subtotal,
          customizations: item.customizations || [],
        })),
        subtotal,
        deliveryFee,
        tax,
        total,
        paymentMethod: {
          type: selectedPaymentMethod.type,
          ...selectedPaymentMethod,
        },
        deliveryAddress: selectedAddress,
        deliveryInstructions: deliveryInstructions,
        status: "pending",
      };

      // Create order
      const result = await createOrder(orderData);

      if (result.success) {
        // Navigate to confirmation screen
        navigation.navigate("OrderConfirmation", { orderId: result.orderId });
      } else {
        Alert.alert("Error", "Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethodItem = (method) => {
    const isSelected =
      selectedPaymentMethod && selectedPaymentMethod._id === method._id;

    return (
      <TouchableOpacity
        key={method._id}
        style={[
          styles.optionItem,
          isSelected && { borderColor: theme.colors.primary },
          { backgroundColor: theme.colors.card },
        ]}
        onPress={() => setSelectedPaymentMethod(method)}
      >
        <View style={styles.optionContent}>
          {method.type === "cash" ? (
            <Ionicons
              name='cash-outline'
              size={24}
              color={theme.colors.primary}
            />
          ) : (
            <Ionicons
              name='card-outline'
              size={24}
              color={theme.colors.primary}
            />
          )}

          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
              {method.type === "cash"
                ? "Cash on Delivery"
                : `${method.brand} ****${method.lastDigits}`}
            </Text>
            {method.isDefault && (
              <Text
                style={[styles.defaultLabel, { color: theme.colors.primary }]}
              >
                Default
              </Text>
            )}
          </View>
        </View>

        {isSelected && (
          <Ionicons
            name='checkmark-circle'
            size={24}
            color={theme.colors.primary}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderAddressItem = (address) => {
    const isSelected = selectedAddress && selectedAddress._id === address._id;

    return (
      <TouchableOpacity
        key={address._id}
        style={[
          styles.optionItem,
          isSelected && { borderColor: theme.colors.primary },
          { backgroundColor: theme.colors.card },
        ]}
        onPress={() => setSelectedAddress(address)}
      >
        <View style={styles.optionContent}>
          <Ionicons
            name='location-outline'
            size={24}
            color={theme.colors.primary}
          />

          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
              {address.name}
            </Text>
            <Text
              style={[
                styles.optionDescription,
                { color: theme.colors.placeholder },
              ]}
              numberOfLines={2}
            >
              {address.fullAddress}
            </Text>
            {address.isDefault && (
              <Text
                style={[styles.defaultLabel, { color: theme.colors.primary }]}
              >
                Default
              </Text>
            )}
          </View>
        </View>

        {isSelected && (
          <Ionicons
            name='checkmark-circle'
            size={24}
            color={theme.colors.primary}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Delivery Address Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Delivery Address
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() =>
                  navigation.navigate("Addresses", { returnTo: "Checkout" })
                }
              >
                <Text
                  style={[
                    styles.addButtonText,
                    { color: theme.colors.primary },
                  ]}
                >
                  Add New
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.optionsContainer}>
              {addresses.map(renderAddressItem)}
            </View>
          </View>

          {/* Delivery Instructions */}
          <View
            style={[
              styles.instructionsContainer,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text
              style={[styles.instructionsLabel, { color: theme.colors.text }]}
            >
              Delivery Instructions (Optional)
            </Text>
            <TextInput
              style={[
                styles.instructionsInput,
                {
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                },
              ]}
              placeholder='Add instructions for the rider...'
              placeholderTextColor={theme.colors.placeholder}
              multiline
              numberOfLines={3}
              value={deliveryInstructions}
              onChangeText={setDeliveryInstructions}
            />
          </View>

          {/* Payment Method Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Payment Method
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() =>
                  navigation.navigate("PaymentMethods", {
                    returnTo: "Checkout",
                  })
                }
              >
                <Text
                  style={[
                    styles.addButtonText,
                    { color: theme.colors.primary },
                  ]}
                >
                  Add New
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.optionsContainer}>
              {paymentMethods.map(renderPaymentMethodItem)}
            </View>
          </View>

          {/* Order Summary */}
          <View
            style={[
              styles.summaryContainer,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
              Order Summary
            </Text>

            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
                Subtotal
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                ${subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
                Delivery Fee
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                ${deliveryFee.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
                Tax
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                ${tax.toFixed(2)}
              </Text>
            </View>

            <Divider
              style={[styles.divider, { backgroundColor: theme.colors.border }]}
            />

            <View style={styles.totalItem}>
              <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
                Total
              </Text>
              <Text
                style={[styles.totalValue, { color: theme.colors.primary }]}
              >
                ${total.toFixed(2)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Place Order Button */}
        <View
          style={[
            styles.buttonContainer,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <Button
            title={`Place Order • ${total.toFixed(2)}`}
            onPress={handlePlaceOrder}
            loading={loading}
            buttonStyle={[
              styles.placeOrderButton,
              { backgroundColor: theme.colors.primary },
            ]}
            titleStyle={styles.placeOrderButtonText}
            disabled={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addButton: {
    paddingVertical: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  optionsContainer: {
    marginBottom: 8,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  optionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  defaultLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  instructionsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  instructionsLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  instructionsInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  summaryContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    marginVertical: 8,
  },
  totalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  placeOrderButton: {
    height: 56,
    borderRadius: 8,
  },
  placeOrderButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CheckoutScreen;
