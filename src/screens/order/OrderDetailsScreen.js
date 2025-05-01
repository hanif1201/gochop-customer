import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { Divider, Button } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";

import { ThemeContext } from "../../context/ThemeContext";
import { OrderContext } from "../../context/OrderContext";

const OrderStatusStep = ({ status, currentStatus, icon, label, theme }) => {
  const isCompleted = getStatusValue(currentStatus) >= getStatusValue(status);
  const isActive = currentStatus === status;

  return (
    <View style={styles.statusStep}>
      <View
        style={[
          styles.statusIcon,
          {
            backgroundColor: isCompleted
              ? theme.colors.primary
              : theme.colors.card,
            borderColor: isActive
              ? theme.colors.primary
              : isCompleted
              ? "transparent"
              : theme.colors.border,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={isCompleted ? "white" : theme.colors.placeholder}
        />
      </View>
      <Text
        style={[
          styles.statusLabel,
          {
            color:
              isActive || isCompleted
                ? theme.colors.primary
                : theme.colors.text,
            fontWeight: isActive ? "bold" : "normal",
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

// Helper to get numerical value for status comparison
const getStatusValue = (status) => {
  const statusMap = {
    pending: 0,
    accepted: 1,
    preparing: 2,
    ready_for_pickup: 3,
    assigned_to_rider: 4,
    picked_up: 5,
    on_the_way: 6,
    delivered: 7,
    cancelled: -1,
  };
  return statusMap[status] || 0;
};

const OrderDetailsScreen = ({ route, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const {
    fetchOrderDetails,
    rateOrder,
    cancelOrder,
    setupOrderStatusListener,
  } = useContext(OrderContext);

  const { orderId, orderNumber } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    loadOrderDetails();

    // Set up order status listener
    const cleanupListener = setupOrderStatusListener(orderId);

    return () => {
      if (cleanupListener) cleanupListener();
    };
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

  const handleCancelOrder = async () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            setCancelling(true);

            // Ask for cancellation reason
            Alert.prompt(
              "Cancellation Reason",
              "Please provide a reason for cancellation",
              [
                {
                  text: "Cancel",
                  onPress: () => setCancelling(false),
                  style: "cancel",
                },
                {
                  text: "Submit",
                  onPress: async (reason) => {
                    const result = await cancelOrder(
                      orderId,
                      reason || "Customer requested cancellation"
                    );

                    if (result.success) {
                      loadOrderDetails();
                    } else {
                      Alert.alert(
                        "Error",
                        "Failed to cancel order. Please try again."
                      );
                    }
                    setCancelling(false);
                  },
                },
              ],
              "plain-text",
              ""
            );
          } catch (err) {
            console.error("Error cancelling order:", err);
            Alert.alert("Error", "Failed to cancel order. Please try again.");
            setCancelling(false);
          }
        },
      },
    ]);
  };

  const handleRateOrder = async () => {
    // Show rating dialog
    Alert.alert("Rate Your Order", "How would you rate your experience?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "1 Star",
        onPress: () => showRatingCommentDialog(1),
      },
      {
        text: "2 Stars",
        onPress: () => showRatingCommentDialog(2),
      },
      {
        text: "3 Stars",
        onPress: () => showRatingCommentDialog(3),
      },
      {
        text: "4 Stars",
        onPress: () => showRatingCommentDialog(4),
      },
      {
        text: "5 Stars",
        onPress: () => showRatingCommentDialog(5),
      },
    ]);
  };

  const showRatingCommentDialog = (selectedRating) => {
    setRating(selectedRating);

    // Show comment dialog
    Alert.prompt(
      "Additional Comments",
      "Any additional feedback about your experience?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Submit Rating",
          onPress: async (comment) => {
            setRatingComment(comment || "");
            await submitRating(selectedRating, comment || "");
          },
        },
      ],
      "plain-text",
      ""
    );
  };

  const submitRating = async (ratingValue, comment) => {
    try {
      setRatingLoading(true);

      const ratingData = {
        orderRating: ratingValue,
        comment: comment,
        rateRestaurant: true,
        restaurantRating: ratingValue,
        rateDelivery: order.status === "delivered",
        deliveryRating: ratingValue,
      };

      const result = await rateOrder(orderId, ratingData);

      if (result.success) {
        Alert.alert(
          "Thank You",
          "Your rating has been submitted successfully!"
        );
        loadOrderDetails();
      } else {
        Alert.alert("Error", "Failed to submit rating. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
      Alert.alert("Error", "Failed to submit rating. Please try again.");
    } finally {
      setRatingLoading(false);
    }
  };

  const getStatusTime = (status) => {
    if (!order || !order.statusTimestamps) return null;
    return order.statusTimestamps[status];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderStatusBar = () => {
    if (!order) return null;

    const getStatusLabel = (status) => {
      switch (status) {
        case "pending":
          return "Placed";
        case "accepted":
          return "Confirmed";
        case "preparing":
          return "Preparing";
        case "ready_for_pickup":
          return "Ready";
        case "assigned_to_rider":
          return "Assigned";
        case "picked_up":
          return "Picked Up";
        case "on_the_way":
          return "On the Way";
        case "delivered":
          return "Delivered";
        case "cancelled":
          return "Cancelled";
        default:
          return status;
      }
    };

    if (order.status === "cancelled") {
      return (
        <View style={styles.cancelledContainer}>
          <View
            style={[
              styles.cancelledIconContainer,
              { backgroundColor: theme.colors.error + "20" },
            ]}
          >
            <Ionicons
              name='close-circle'
              size={32}
              color={theme.colors.error}
            />
          </View>
          <Text style={[styles.cancelledText, { color: theme.colors.error }]}>
            Order Cancelled
          </Text>
          <Text
            style={[styles.cancelledTime, { color: theme.colors.placeholder }]}
          >
            {formatDate(getStatusTime("cancelled"))}
          </Text>
          <Text style={[styles.cancelledReason, { color: theme.colors.text }]}>
            Reason: {order.cancellationReason || "Not specified"}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.statusContainer}>
        <OrderStatusStep
          status='pending'
          currentStatus={order.status}
          icon='receipt-outline'
          label='Placed'
          theme={theme}
        />
        <View
          style={[styles.statusLine, { backgroundColor: theme.colors.border }]}
        />

        <OrderStatusStep
          status='accepted'
          currentStatus={order.status}
          icon='checkmark-outline'
          label='Confirmed'
          theme={theme}
        />
        <View
          style={[styles.statusLine, { backgroundColor: theme.colors.border }]}
        />

        <OrderStatusStep
          status='preparing'
          currentStatus={order.status}
          icon='restaurant-outline'
          label='Preparing'
          theme={theme}
        />
        <View
          style={[styles.statusLine, { backgroundColor: theme.colors.border }]}
        />

        <OrderStatusStep
          status='on_the_way'
          currentStatus={order.status}
          icon='bicycle-outline'
          label='On the Way'
          theme={theme}
        />
        <View
          style={[styles.statusLine, { backgroundColor: theme.colors.border }]}
        />

        <OrderStatusStep
          status='delivered'
          currentStatus={order.status}
          icon='home-outline'
          label='Delivered'
          theme={theme}
        />
      </View>
    );
  };

  const renderOrderItems = () => {
    if (!order || !order.items) return null;

    return (
      <View style={styles.orderItemsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Order Items
        </Text>

        {order.items.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <View style={styles.orderItemDetails}>
              <Text
                style={[styles.orderItemQuantity, { color: theme.colors.text }]}
              >
                {item.quantity}x
              </Text>
              <View style={styles.orderItemNameContainer}>
                <Text
                  style={[styles.orderItemName, { color: theme.colors.text }]}
                  numberOfLines={1}
                >
                  {item.menuItem?.name || item.name || "Item"}
                </Text>
                {item.customizations?.length > 0 && (
                  <Text
                    style={[
                      styles.orderItemCustomizations,
                      { color: theme.colors.placeholder },
                    ]}
                    numberOfLines={1}
                  >
                    {item.customizations
                      .map((cust) =>
                        cust.options.map((opt) => opt.name).join(", ")
                      )
                      .join(", ")}
                  </Text>
                )}
              </View>
            </View>
            <Text style={[styles.orderItemPrice, { color: theme.colors.text }]}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size='large' color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading order details...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Ionicons
          name='alert-circle-outline'
          size={48}
          color={theme.colors.error}
        />
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={loadOrderDetails}
        >
          <Text style={[styles.retryButtonText, { color: theme.colors.white }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!order) {
    return null;
  }

  const isOrderCompletable = ["delivered", "cancelled"].includes(order.status);
  const isOrderRatable = order.status === "delivered" && !order.isRated;
  const isOrderCancellable = ["pending", "accepted"].includes(order.status);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView>
        <View style={styles.headerContainer}>
          <View style={styles.orderNumberContainer}>
            <Text
              style={[
                styles.orderNumberLabel,
                { color: theme.colors.placeholder },
              ]}
            >
              Order Number
            </Text>
            <Text style={[styles.orderNumber, { color: theme.colors.text }]}>
              #{order.orderNumber || order._id.slice(-6).toUpperCase()}
            </Text>
          </View>

          <View style={styles.orderTimeContainer}>
            <Text
              style={[
                styles.orderTimeLabel,
                { color: theme.colors.placeholder },
              ]}
            >
              Order Time
            </Text>
            <Text style={[styles.orderTime, { color: theme.colors.text }]}>
              {formatDate(order.createdAt)}
            </Text>
          </View>
        </View>

        {renderStatusBar()}

        <View
          style={[
            styles.restaurantContainer,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <Image
            source={{
              uri:
                order.restaurant?.coverImage ||
                "https://via.placeholder.com/100",
            }}
            style={styles.restaurantImage}
          />

          <View style={styles.restaurantInfo}>
            <Text style={[styles.restaurantName, { color: theme.colors.text }]}>
              {order.restaurant?.name || "Restaurant"}
            </Text>

            <TouchableOpacity
              style={styles.viewRestaurantButton}
              onPress={() => {
                if (order.restaurant?._id) {
                  navigation.navigate("RestaurantsTab", {
                    screen: "RestaurantDetails",
                    params: {
                      id: order.restaurant._id,
                      name: order.restaurant.name,
                    },
                  });
                }
              }}
            >
              <Text
                style={[
                  styles.viewRestaurantText,
                  { color: theme.colors.primary },
                ]}
              >
                View Restaurant
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.contentContainer,
            { backgroundColor: theme.colors.card },
          ]}
        >
          {renderOrderItems()}

          <Divider style={{ marginVertical: 16 }} />

          <View style={styles.costSummary}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Order Summary
            </Text>

            <View style={styles.costItem}>
              <Text style={[styles.costLabel, { color: theme.colors.text }]}>
                Subtotal
              </Text>
              <Text style={[styles.costValue, { color: theme.colors.text }]}>
                ${order.subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.costItem}>
              <Text style={[styles.costLabel, { color: theme.colors.text }]}>
                Delivery Fee
              </Text>
              <Text style={[styles.costValue, { color: theme.colors.text }]}>
                ${order.deliveryFee.toFixed(2)}
              </Text>
            </View>

            <View style={styles.costItem}>
              <Text style={[styles.costLabel, { color: theme.colors.text }]}>
                Tax
              </Text>
              <Text style={[styles.costValue, { color: theme.colors.text }]}>
                ${order.tax.toFixed(2)}
              </Text>
            </View>

            <View style={[styles.costItem, styles.totalItem]}>
              <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
                Total
              </Text>
              <Text
                style={[styles.totalValue, { color: theme.colors.primary }]}
              >
                ${order.total.toFixed(2)}
              </Text>
            </View>
          </View>

          <Divider style={{ marginVertical: 16 }} />

          <View style={styles.deliverySection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Delivery Information
            </Text>

            <View style={styles.deliveryInfo}>
              <Text
                style={[
                  styles.deliveryLabel,
                  { color: theme.colors.placeholder },
                ]}
              >
                Address
              </Text>
              <Text
                style={[styles.deliveryValue, { color: theme.colors.text }]}
              >
                {order.deliveryAddress?.fullAddress || "Address not available"}
              </Text>
            </View>

            {order.deliveryInstructions && (
              <View style={styles.deliveryInfo}>
                <Text
                  style={[
                    styles.deliveryLabel,
                    { color: theme.colors.placeholder },
                  ]}
                >
                  Instructions
                </Text>
                <Text
                  style={[styles.deliveryValue, { color: theme.colors.text }]}
                >
                  {order.deliveryInstructions}
                </Text>
              </View>
            )}

            <View style={styles.deliveryInfo}>
              <Text
                style={[
                  styles.deliveryLabel,
                  { color: theme.colors.placeholder },
                ]}
              >
                Estimated Delivery
              </Text>
              <Text
                style={[styles.deliveryValue, { color: theme.colors.text }]}
              >
                {order.estimatedDeliveryTime
                  ? formatDate(order.estimatedDeliveryTime)
                  : "Not available"}
              </Text>
            </View>
          </View>

          <Divider style={{ marginVertical: 16 }} />

          <View style={styles.paymentSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Payment Information
            </Text>

            <View style={styles.paymentInfo}>
              <Text
                style={[
                  styles.paymentLabel,
                  { color: theme.colors.placeholder },
                ]}
              >
                Method
              </Text>
              <Text style={[styles.paymentValue, { color: theme.colors.text }]}>
                {order.paymentMethod?.type === "cash"
                  ? "Cash on Delivery"
                  : `${order.paymentMethod?.brand || ""} **** ${
                      order.paymentMethod?.lastDigits || "****"
                    }`}
              </Text>
            </View>

            <View style={styles.paymentInfo}>
              <Text
                style={[
                  styles.paymentLabel,
                  { color: theme.colors.placeholder },
                ]}
              >
                Status
              </Text>
              <Text style={[styles.paymentValue, { color: theme.colors.text }]}>
                {order.paymentStatus || "Pending"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {isOrderCancellable && (
        <View
          style={[
            styles.buttonContainer,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <Button
            title='Cancel Order'
            onPress={handleCancelOrder}
            loading={cancelling}
            buttonStyle={[
              styles.cancelButton,
              { backgroundColor: theme.colors.error },
            ]}
            titleStyle={styles.buttonText}
          />
        </View>
      )}

      {isOrderRatable && (
        <View
          style={[
            styles.buttonContainer,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <Button
            title='Rate Order'
            onPress={handleRateOrder}
            loading={ratingLoading}
            buttonStyle={[
              styles.rateButton,
              { backgroundColor: theme.colors.primary },
            ]}
            titleStyle={styles.buttonText}
          />
        </View>
      )}

      {!isOrderCompletable && (
        <View
          style={[
            styles.buttonContainer,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <Button
            title='Track Order'
            onPress={() => navigation.navigate("OrderTracking")}
            buttonStyle={[
              styles.trackButton,
              { backgroundColor: theme.colors.primary },
            ]}
            titleStyle={styles.buttonText}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  orderNumberContainer: {
    flex: 1,
  },
  orderNumberLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  orderTimeContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  orderTimeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  statusStep: {
    alignItems: "center",
    width: 60,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  statusLine: {
    flex: 1,
    height: 2,
  },
  cancelledContainer: {
    alignItems: "center",
    paddingVertical: 24,
    marginHorizontal: 16,
  },
  cancelledIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cancelledText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cancelledTime: {
    fontSize: 14,
    marginBottom: 8,
  },
  cancelledReason: {
    fontSize: 14,
    textAlign: "center",
  },
  restaurantContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  restaurantInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: "center",
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  viewRestaurantButton: {
    alignSelf: "flex-start",
  },
  viewRestaurantText: {
    fontSize: 14,
  },
  contentContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderItemsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderItemDetails: {
    flexDirection: "row",
    flex: 1,
  },
  orderItemQuantity: {
    fontSize: 14,
    marginRight: 8,
    minWidth: 28,
  },
  orderItemNameContainer: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: "500",
  },
  orderItemCustomizations: {
    fontSize: 12,
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "500",
  },
  costSummary: {
    marginBottom: 16,
  },
  costItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
  },
  costValue: {
    fontSize: 14,
  },
  totalItem: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 16,
  },
  totalValue: {
    fontWeight: "bold",
    fontSize: 16,
  },
  deliverySection: {
    marginBottom: 16,
  },
  deliveryInfo: {
    marginBottom: 12,
  },
  deliveryLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  deliveryValue: {
    fontSize: 14,
  },
  paymentSection: {
    marginBottom: 16,
  },
  paymentInfo: {
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  paymentValue: {
    fontSize: 14,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  cancelButton: {
    height: 48,
    borderRadius: 8,
  },
  trackButton: {
    height: 48,
    borderRadius: 8,
  },
  rateButton: {
    height: 48,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OrderDetailsScreen;
