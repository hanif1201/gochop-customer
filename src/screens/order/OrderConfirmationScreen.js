import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { Button } from "react-native-elements";
import { ThemeContext } from "../../context/ThemeContext";
import { OrderContext } from "../../context/OrderContext";

const OrderConfirmationScreen = ({ route, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { fetchOrderDetails } = useContext(OrderContext);

  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const result = await fetchOrderDetails(orderId);

      if (result.success) {
        setOrder(result.order);
      } else {
        setError("Failed to load order details");
      }
    } catch (err) {
      console.error("Error loading order details:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderOrderInfo = () => {
    if (!order) return null;

    return (
      <View style={styles.orderInfoContainer}>
        <View style={styles.orderNumberContainer}>
          <Text style={[styles.orderNumberLabel, { color: theme.colors.text }]}>
            Order Number
          </Text>
          <Text style={[styles.orderNumber, { color: theme.colors.text }]}>
            #{order.orderNumber || order._id.slice(-6).toUpperCase()}
          </Text>
        </View>

        <View
          style={[
            styles.estimatedDeliveryContainer,
            { backgroundColor: theme.colors.primary + "20" },
          ]}
        >
          <Ionicons
            name='time-outline'
            size={24}
            color={theme.colors.primary}
          />
          <View style={styles.estimatedDeliveryTextContainer}>
            <Text
              style={[
                styles.estimatedDeliveryLabel,
                { color: theme.colors.text },
              ]}
            >
              Estimated Delivery
            </Text>
            <Text
              style={[
                styles.estimatedDeliveryTime,
                { color: theme.colors.primary },
              ]}
            >
              {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        <View style={styles.restaurantInfoContainer}>
          <Image
            source={{
              uri:
                order.restaurant.coverImage || "https://via.placeholder.com/80",
            }}
            style={styles.restaurantImage}
          />
          <View style={styles.restaurantTextContainer}>
            <Text style={[styles.restaurantName, { color: theme.colors.text }]}>
              {order.restaurant.name}
            </Text>
            <Text
              style={[
                styles.orderItemCount,
                { color: theme.colors.placeholder },
              ]}
            >
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        <View style={styles.deliveryAddressContainer}>
          <Text
            style={[styles.deliveryAddressLabel, { color: theme.colors.text }]}
          >
            Delivery Address
          </Text>
          <Text
            style={[
              styles.deliveryAddress,
              { color: theme.colors.placeholder },
            ]}
          >
            {order.deliveryAddress
              ? `${order.deliveryAddress.fullAddress || order.deliveryAddress}`
              : "Address not available"}
          </Text>
        </View>

        <View style={styles.paymentInfoContainer}>
          <Text style={[styles.paymentInfoLabel, { color: theme.colors.text }]}>
            Payment Method
          </Text>
          <Text
            style={[styles.paymentInfo, { color: theme.colors.placeholder }]}
          >
            {order.paymentMethod?.type === "cash"
              ? "Cash on Delivery"
              : `${order.paymentMethod?.brand || ""} **** ${
                  order.paymentMethod?.lastDigits || "****"
                }`}
          </Text>
        </View>

        <View style={styles.totalContainer}>
          <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
            Total
          </Text>
          <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>
            ${order.total.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.animationContainer}>
          {/* If you have a Lottie animation file, you can use it here */}
          {/* <LottieView
            source={require("../../../assets/animations/order-success.json")}
            autoPlay
            loop={false}
            style={styles.animation}
          /> */}

          {/* Fallback if no Lottie animation */}
          <View
            style={[
              styles.successIcon,
              { backgroundColor: theme.colors.success + "20" },
            ]}
          >
            <Ionicons
              name='checkmark-circle'
              size={80}
              color={theme.colors.success}
            />
          </View>
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>
          Order Confirmed!
        </Text>

        <Text style={[styles.subtitle, { color: theme.colors.placeholder }]}>
          Your order has been placed successfully. You can track the status of
          your order in the Orders section.
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={theme.colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[
                styles.retryButton,
                { borderColor: theme.colors.primary },
              ]}
              onPress={loadOrderDetails}
            >
              <Text
                style={[
                  styles.retryButtonText,
                  { color: theme.colors.primary },
                ]}
              >
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          renderOrderInfo()
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title='Track Order'
          onPress={() => navigation.navigate("OrderTracking")}
          buttonStyle={[
            styles.primaryButton,
            { backgroundColor: theme.colors.primary },
          ]}
          titleStyle={styles.buttonText}
          containerStyle={styles.buttonWrapper}
        />

        <Button
          title='Continue Shopping'
          onPress={() => navigation.popToTop()}
          buttonStyle={[
            styles.secondaryButton,
            {
              backgroundColor: "transparent",
              borderColor: theme.colors.primary,
            },
          ]}
          titleStyle={[
            styles.secondaryButtonText,
            { color: theme.colors.primary },
          ]}
          containerStyle={styles.buttonWrapper}
          type='outline'
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 120,
  },
  animationContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryButtonText: {
    fontWeight: "500",
  },
  orderInfoContainer: {
    marginTop: 16,
  },
  orderNumberContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  orderNumberLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  estimatedDeliveryContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  estimatedDeliveryTextContainer: {
    marginLeft: 16,
  },
  estimatedDeliveryLabel: {
    fontSize: 14,
  },
  estimatedDeliveryTime: {
    fontSize: 18,
    fontWeight: "bold",
  },
  restaurantInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  restaurantTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  orderItemCount: {
    fontSize: 14,
  },
  deliveryAddressContainer: {
    marginBottom: 16,
  },
  deliveryAddressLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 14,
    lineHeight: 20,
  },
  paymentInfoContainer: {
    marginBottom: 16,
  },
  paymentInfoLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  paymentInfo: {
    fontSize: 14,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  buttonWrapper: {
    marginVertical: 8,
  },
  primaryButton: {
    height: 48,
    borderRadius: 8,
  },
  secondaryButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OrderConfirmationScreen;
