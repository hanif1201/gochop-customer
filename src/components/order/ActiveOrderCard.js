import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ThemeContext } from "../../context/ThemeContext";

const ActiveOrderCard = ({ order, onPress }) => {
  const { theme } = useContext(ThemeContext);

  if (!order) return null;

  // Helper to get status info
  const getStatusInfo = () => {
    switch (order.status) {
      case "pending":
        return {
          icon: "time-outline",
          color: theme.colors.warning,
          label: "Waiting for confirmation",
        };
      case "accepted":
        return {
          icon: "checkmark-done-outline",
          color: theme.colors.success,
          label: "Order accepted",
        };
      case "preparing":
        return {
          icon: "restaurant-outline",
          color: theme.colors.info,
          label: "Preparing your food",
        };
      case "ready_for_pickup":
        return {
          icon: "checkmark-circle-outline",
          color: theme.colors.info,
          label: "Ready for pickup",
        };
      case "assigned_to_rider":
        return {
          icon: "bicycle-outline",
          color: theme.colors.info,
          label: "Rider assigned",
        };
      case "picked_up":
        return {
          icon: "bicycle-outline",
          color: theme.colors.primary,
          label: "Order picked up",
        };
      case "on_the_way":
        return {
          icon: "bicycle-outline",
          color: theme.colors.primary,
          label: "On the way to you",
        };
      default:
        return {
          icon: "information-circle-outline",
          color: theme.colors.placeholder,
          label: "Processing order",
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Determine estimated delivery or ready time
  const getDeliveryTime = () => {
    if (order.estimatedDeliveryTime) {
      const deliveryTime = new Date(order.estimatedDeliveryTime);
      const now = new Date();

      // If delivery time is in the past, show "Soon"
      if (deliveryTime < now) return "Soon";

      // Format the time
      return deliveryTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return "Calculating...";
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={[
          theme.colors.primary,
          theme.colors.primaryVariant || theme.colors.primary + "CC",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name={statusInfo.icon} size={28} color='white' />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.status}>{statusInfo.label}</Text>
            <Text style={styles.restaurantName}>
              {order.restaurant?.name || "Restaurant"}
            </Text>
            <Text style={styles.itemCount}>
              {order.items?.length || 0} item
              {order.items?.length !== 1 ? "s" : ""}
            </Text>
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.estimatedTime}>{getDeliveryTime()}</Text>
            <Text style={styles.trackText}>Track</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    marginBottom: 2,
  },
  restaurantName: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 2,
  },
  itemCount: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  timeContainer: {
    alignItems: "flex-end",
  },
  estimatedTime: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  trackText: {
    fontSize: 12,
    color: "white",
    textDecorationLine: "underline",
  },
});

export default ActiveOrderCard;
