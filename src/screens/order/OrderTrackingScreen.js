import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import { Button } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

import { ThemeContext } from "../../context/ThemeContext";
import { OrderContext } from "../../context/OrderContext";

const { width } = Dimensions.get("window");
const CARD_HEIGHT = 170;
const CARD_WIDTH = width * 0.8;

const OrderTrackingScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { activeOrderId, currentOrder, trackOrder, cancelOrder } =
    useContext(OrderContext);

  const [trackingInfo, setTrackingInfo] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const mapRef = useRef(null);
  const _scrollView = useRef(null);
  let mapIndex = 0;
  let mapAnimation = new Animated.Value(0);

  useEffect(() => {
    if (!activeOrderId) {
      navigation.replace("OrdersTab", { screen: "Cart" });
      return;
    }

    getLocationPermission();
    loadTrackingInfo();

    // Set up periodic tracking updates
    const trackingInterval = setInterval(() => {
      if (!refreshing) {
        loadTrackingInfo(false);
      }
    }, 30000); // Update every 30 seconds

    return () => {
      clearInterval(trackingInterval);
    };
  }, [activeOrderId]);

  // Map animation setup
  useEffect(() => {
    mapAnimation.addListener(({ value }) => {
      let index = Math.floor(value / CARD_WIDTH + 0.3);
      if (index >= trackingInfo?.order?.items?.length) {
        index = trackingInfo?.order?.items?.length - 1;
      }
      if (index <= 0) {
        index = 0;
      }

      clearTimeout(regionTimeout);

      const regionTimeout = setTimeout(() => {
        if (mapIndex !== index) {
          mapIndex = index;
          // If we had multiple markers, we could animate to them here
        }
      }, 10);
    });
  }, [trackingInfo]);

  const getLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (err) {
      console.error("Error getting location permission:", err);
    }
  };

  const loadTrackingInfo = async (showLoader = true) => {
    if (!activeOrderId) return;

    try {
      if (showLoader) setLoading(true);

      const result = await trackOrder(activeOrderId);

      if (result?.success) {
        setTrackingInfo(result.tracking);
      } else {
        setError("Failed to load tracking information");
      }
    } catch (err) {
      console.error("Error loading tracking info:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTrackingInfo(false);
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
                      activeOrderId,
                      reason || "Customer requested cancellation"
                    );

                    if (result?.success) {
                      navigation.replace("OrderDetails", {
                        orderId: activeOrderId,
                        orderNumber:
                          trackingInfo?.order?.orderNumber ||
                          activeOrderId.slice(-6).toUpperCase(),
                      });
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

  const handleSupportContact = () => {
    // In a real app, this would open chat support or make a call
    Alert.alert(
      "Contact Support",
      "For any issues with your order, please contact our support team.",
      [
        {
          text: "Call Support",
          onPress: () => {
            // In a real app, this would make a phone call
            console.log("Calling support...");
          },
        },
        {
          text: "Chat Support",
          onPress: () => {
            // In a real app, this would open a chat window
            console.log("Opening chat support...");
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  // Format the estimated delivery time
  const getEstimatedDeliveryTime = () => {
    if (
      !trackingInfo ||
      !trackingInfo.order ||
      !trackingInfo.order.estimatedDeliveryTime
    ) {
      return "Calculating...";
    }

    const deliveryTime = new Date(trackingInfo.order.estimatedDeliveryTime);
    const now = new Date();

    if (deliveryTime < now) {
      return "Arriving soon";
    }

    // Format as "2:30 PM" or similar
    return deliveryTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format the order status
  const getStatusInfo = () => {
    if (!trackingInfo || !trackingInfo.order) {
      return {
        text: "Processing order",
        description: "We're preparing your order",
        icon: "time-outline",
        color: theme.colors.info,
      };
    }

    const status = trackingInfo.order.status;

    switch (status) {
      case "pending":
        return {
          text: "Order placed",
          description: "Waiting for restaurant confirmation",
          icon: "receipt-outline",
          color: theme.colors.info,
        };
      case "accepted":
        return {
          text: "Order confirmed",
          description: "The restaurant is preparing your order",
          icon: "checkmark-outline",
          color: theme.colors.success,
        };
      case "preparing":
        return {
          text: "Preparing",
          description: "The restaurant is cooking your food",
          icon: "restaurant-outline",
          color: theme.colors.info,
        };
      case "ready_for_pickup":
        return {
          text: "Ready for pickup",
          description: "Your order is ready and waiting for a rider",
          icon: "checkmark-done-outline",
          color: theme.colors.info,
        };
      case "assigned_to_rider":
        return {
          text: "Rider assigned",
          description: "A rider is heading to pick up your order",
          icon: "bicycle-outline",
          color: theme.colors.info,
        };
      case "picked_up":
        return {
          text: "Order picked up",
          description: "Your rider has picked up your order",
          icon: "bicycle-outline",
          color: theme.colors.primary,
        };
      case "on_the_way":
        return {
          text: "On the way",
          description: "Your rider is on the way to you",
          icon: "bicycle-outline",
          color: theme.colors.primary,
        };
      case "delivered":
        return {
          text: "Delivered",
          description: "Your order has been delivered",
          icon: "checkmark-circle-outline",
          color: theme.colors.success,
        };
      case "cancelled":
        return {
          text: "Cancelled",
          description:
            trackingInfo.order.cancellationReason ||
            "Your order has been cancelled",
          icon: "close-circle-outline",
          color: theme.colors.error,
        };
      default:
        return {
          text: "Processing",
          description: "We're preparing your order",
          icon: "time-outline",
          color: theme.colors.info,
        };
    }
  };

  // Get the appropriate map region
  const getMapRegion = () => {
    if (!trackingInfo || !trackingInfo.order) {
      return (
        userLocation || {
          latitude: 6.5244, // Default to Ibadan, Nigeria
          longitude: 3.3792,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }
      );
    }

    let coordinates = [];

    // Add restaurant location if available
    if (
      trackingInfo.order.restaurant &&
      trackingInfo.order.restaurant.location &&
      trackingInfo.order.restaurant.location.coordinates
    ) {
      coordinates.push({
        latitude: trackingInfo.order.restaurant.location.coordinates[1],
        longitude: trackingInfo.order.restaurant.location.coordinates[0],
      });
    }

    // Add delivery location if available
    if (
      trackingInfo.order.deliveryLocation &&
      trackingInfo.order.deliveryLocation.coordinates
    ) {
      coordinates.push({
        latitude: trackingInfo.order.deliveryLocation.coordinates[1],
        longitude: trackingInfo.order.deliveryLocation.coordinates[0],
      });
    }

    // Add rider location if available
    if (
      trackingInfo.rider &&
      trackingInfo.rider.currentLocation &&
      trackingInfo.rider.currentLocation.coordinates
    ) {
      coordinates.push({
        latitude: trackingInfo.rider.currentLocation.coordinates[1],
        longitude: trackingInfo.rider.currentLocation.coordinates[0],
      });
    }

    // If we have coordinates, find the bounding region
    if (coordinates.length > 0) {
      let minLat = Math.min(...coordinates.map((c) => c.latitude));
      let maxLat = Math.max(...coordinates.map((c) => c.latitude));
      let minLng = Math.min(...coordinates.map((c) => c.longitude));
      let maxLng = Math.max(...coordinates.map((c) => c.longitude));

      // Add some padding
      const padding = 0.01;
      minLat -= padding;
      maxLat += padding;
      minLng -= padding;
      maxLng += padding;

      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(maxLat - minLat, 0.02),
        longitudeDelta: Math.max(maxLng - minLng, 0.02),
      };
    }

    // Fallback to user location
    return (
      userLocation || {
        latitude: 6.5244, // Default to Ibadan, Nigeria
        longitude: 3.3792,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }
    );
  };

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size='large' color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading tracking information...
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
          onPress={() => loadTrackingInfo()}
        >
          <Text style={[styles.retryButtonText, { color: theme.colors.white }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!trackingInfo || !trackingInfo.order) {
    return null;
  }

  const statusInfo = getStatusInfo();
  const order = trackingInfo.order;
  const rider = trackingInfo.rider;

  const isOrderCancellable = ["pending", "accepted"].includes(order.status);
  const isOrderCompleted = ["delivered", "cancelled"].includes(order.status);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={getMapRegion()}
          region={getMapRegion()}
        >
          {/* Restaurant Marker */}
          {order.restaurant &&
            order.restaurant.location &&
            order.restaurant.location.coordinates && (
              <Marker
                coordinate={{
                  latitude: order.restaurant.location.coordinates[1],
                  longitude: order.restaurant.location.coordinates[0],
                }}
                title={order.restaurant.name}
                description='Restaurant location'
              >
                <View
                  style={[
                    styles.markerContainer,
                    { backgroundColor: theme.colors.card },
                  ]}
                >
                  <Ionicons
                    name='restaurant'
                    size={18}
                    color={theme.colors.primary}
                  />
                </View>
              </Marker>
            )}

          {/* Delivery Location Marker */}
          {order.deliveryLocation && order.deliveryLocation.coordinates && (
            <Marker
              coordinate={{
                latitude: order.deliveryLocation.coordinates[1],
                longitude: order.deliveryLocation.coordinates[0],
              }}
              title='Delivery Location'
              description='Your location'
            >
              <View
                style={[
                  styles.markerContainer,
                  { backgroundColor: theme.colors.card },
                ]}
              >
                <Ionicons name='home' size={18} color={theme.colors.info} />
              </View>
            </Marker>
          )}

          {/* Rider Marker */}
          {rider &&
            rider.currentLocation &&
            rider.currentLocation.coordinates && (
              <Marker
                coordinate={{
                  latitude: rider.currentLocation.coordinates[1],
                  longitude: rider.currentLocation.coordinates[0],
                }}
                title={rider.name || "Delivery Rider"}
                description='Your delivery rider'
              >
                <View
                  style={[
                    styles.markerContainer,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Ionicons name='bicycle' size={18} color='white' />
                </View>
              </Marker>
            )}
        </MapView>

        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: theme.colors.card }]}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size='small' color={theme.colors.primary} />
          ) : (
            <Ionicons name='refresh' size={24} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Order Info Card */}
      <View
        style={[styles.orderInfoCard, { backgroundColor: theme.colors.card }]}
      >
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIconContainer,
              { backgroundColor: statusInfo.color + "20" },
            ]}
          >
            <Ionicons
              name={statusInfo.icon}
              size={28}
              color={statusInfo.color}
            />
          </View>

          <View style={styles.statusTextContainer}>
            <Text style={[styles.statusText, { color: theme.colors.text }]}>
              {statusInfo.text}
            </Text>
            <Text
              style={[
                styles.statusDescription,
                { color: theme.colors.placeholder },
              ]}
            >
              {statusInfo.description}
            </Text>
          </View>
        </View>

        <View style={styles.deliveryInfoContainer}>
          <View style={styles.deliveryTimeContainer}>
            <Text
              style={[
                styles.deliveryTimeLabel,
                { color: theme.colors.placeholder },
              ]}
            >
              Estimated Delivery
            </Text>
            <Text style={[styles.deliveryTime, { color: theme.colors.text }]}>
              {getEstimatedDeliveryTime()}
            </Text>
          </View>

          <View
            style={[
              styles.orderNumberContainer,
              { borderLeftColor: theme.colors.border },
            ]}
          >
            <Text
              style={[
                styles.orderNumberLabel,
                { color: theme.colors.placeholder },
              ]}
            >
              Order #
            </Text>
            <Text style={[styles.orderNumber, { color: theme.colors.text }]}>
              {order.orderNumber || order._id.slice(-6).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.restaurantInfoContainer}>
          <Image
            source={{
              uri:
                order.restaurant?.coverImage ||
                "https://via.placeholder.com/60",
            }}
            style={styles.restaurantImage}
          />

          <View style={styles.restaurantTextContainer}>
            <Text style={[styles.restaurantName, { color: theme.colors.text }]}>
              {order.restaurant?.name || "Restaurant"}
            </Text>
            <Text
              style={[styles.itemCount, { color: theme.colors.placeholder }]}
            >
              {order.items?.length || 0}{" "}
              {order.items?.length === 1 ? "item" : "items"}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.viewDetailsButton,
              { borderColor: theme.colors.primary },
            ]}
            onPress={() =>
              navigation.navigate("OrderDetails", {
                orderId: order._id,
                orderNumber:
                  order.orderNumber || order._id.slice(-6).toUpperCase(),
              })
            }
          >
            <Text
              style={[styles.viewDetailsText, { color: theme.colors.primary }]}
            >
              View Details
            </Text>
          </TouchableOpacity>
        </View>

        {rider && (
          <View
            style={[
              styles.riderInfoContainer,
              { borderTopColor: theme.colors.border },
            ]}
          >
            <View style={styles.riderInfo}>
              <Image
                source={{
                  uri: rider.profileImage || "https://via.placeholder.com/40",
                }}
                style={styles.riderImage}
              />

              <View style={styles.riderTextContainer}>
                <Text style={[styles.riderName, { color: theme.colors.text }]}>
                  {rider.name || "Your Rider"}
                </Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name='star' size={14} color='#FFD700' />
                  <Text
                    style={[styles.riderRating, { color: theme.colors.text }]}
                  >
                    {rider.rating?.toFixed(1) || "New"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.riderContactButtons}>
              <TouchableOpacity
                style={[
                  styles.riderContactButton,
                  { backgroundColor: theme.colors.success + "20" },
                ]}
                onPress={() => {
                  // In a real app, this would make a phone call
                  Alert.alert(
                    "Call Rider",
                    `Call ${rider.name || "your rider"}?`,
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Call",
                        onPress: () => console.log("Calling rider..."),
                      },
                    ]
                  );
                }}
              >
                <Ionicons name='call' size={20} color={theme.colors.success} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.riderContactButton,
                  { backgroundColor: theme.colors.info + "20" },
                ]}
                onPress={() => {
                  // In a real app, this would send a message
                  Alert.alert(
                    "Message Rider",
                    `Message ${rider.name || "your rider"}?`,
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Message",
                        onPress: () => console.log("Messaging rider..."),
                      },
                    ]
                  );
                }}
              >
                <Ionicons
                  name='chatbubble'
                  size={20}
                  color={theme.colors.info}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          {isOrderCancellable && (
            <Button
              title='Cancel Order'
              onPress={handleCancelOrder}
              loading={cancelling}
              buttonStyle={[
                styles.cancelButton,
                { backgroundColor: theme.colors.error },
              ]}
              containerStyle={styles.buttonContainer}
              titleStyle={styles.buttonText}
            />
          )}

          {!isOrderCompleted && (
            <Button
              title='Contact Support'
              onPress={handleSupportContact}
              buttonStyle={[
                styles.supportButton,
                {
                  backgroundColor: isOrderCancellable
                    ? "transparent"
                    : theme.colors.primary,
                  borderColor: theme.colors.primary,
                  borderWidth: isOrderCancellable ? 1 : 0,
                },
              ]}
              containerStyle={styles.buttonContainer}
              titleStyle={[
                styles.buttonText,
                {
                  color: isOrderCancellable
                    ? theme.colors.primary
                    : theme.colors.white,
                },
              ]}
              type={isOrderCancellable ? "outline" : "solid"}
            />
          )}

          {isOrderCompleted && (
            <Button
              title='Back to Home'
              onPress={() => navigation.navigate("HomeTab")}
              buttonStyle={[
                styles.homeButton,
                { backgroundColor: theme.colors.primary },
              ]}
              containerStyle={styles.buttonContainer}
              titleStyle={styles.buttonText}
            />
          )}
        </View>
      </View>
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
  mapContainer: {
    height: "40%",
    width: "100%",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  refreshButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  orderInfoCard: {
    height: "60%",
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
  },
  deliveryInfoContainer: {
    flexDirection: "row",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  deliveryTimeContainer: {
    flex: 1,
  },
  deliveryTimeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  deliveryTime: {
    fontSize: 16,
    fontWeight: "bold",
  },
  orderNumberContainer: {
    flex: 1,
    paddingLeft: 16,
    marginLeft: 16,
    borderLeftWidth: 1,
  },
  orderNumberLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 16,
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
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 14,
  },
  viewDetailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: "500",
  },
  riderInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  riderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  riderImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  riderTextContainer: {
    marginLeft: 12,
  },
  riderName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  riderRating: {
    fontSize: 12,
    marginLeft: 4,
  },
  riderContactButtons: {
    flexDirection: "row",
  },
  riderContactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    height: 48,
    borderRadius: 8,
  },
  supportButton: {
    height: 48,
    borderRadius: 8,
  },
  homeButton: {
    height: 48,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default OrderTrackingScreen;
