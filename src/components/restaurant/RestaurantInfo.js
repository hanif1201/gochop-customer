import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Divider } from "react-native-elements";
import { ThemeContext } from "../../context/ThemeContext";

const RestaurantInfo = ({ restaurant }) => {
  const { theme } = useContext(ThemeContext);

  if (!restaurant) return null;

  // Format opening hours
  const formatHours = (openingHours) => {
    if (!openingHours || openingHours.length === 0) return "Not available";

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.

    const todayHours = openingHours.find((h) => h.day === today);

    if (!todayHours || todayHours.isClosed) return "Closed today";

    return `Today: ${todayHours.open} - ${todayHours.close}`;
  };

  // Format cuisines
  const formatCuisines = (cuisineType) => {
    if (!cuisineType || cuisineType.length === 0) return "Various";

    return cuisineType.join(", ");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons
            name='time-outline'
            size={20}
            color={theme.colors.primary}
          />
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>
              Hours
            </Text>
            <Text
              style={[styles.infoValue, { color: theme.colors.placeholder }]}
            >
              {formatHours(restaurant.openingHours)}
            </Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons
            name='bicycle-outline'
            size={20}
            color={theme.colors.primary}
          />
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>
              Delivery
            </Text>
            <Text
              style={[styles.infoValue, { color: theme.colors.placeholder }]}
            >
              {restaurant.deliveryTime} min • $
              {restaurant.deliveryFee.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <Divider
        style={[styles.divider, { backgroundColor: theme.colors.border }]}
      />

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons
            name='restaurant-outline'
            size={20}
            color={theme.colors.primary}
          />
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>
              Cuisine
            </Text>
            <Text
              style={[styles.infoValue, { color: theme.colors.placeholder }]}
            >
              {formatCuisines(restaurant.cuisineType)}
            </Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons
            name='card-outline'
            size={20}
            color={theme.colors.primary}
          />
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>
              Minimum Order
            </Text>
            <Text
              style={[styles.infoValue, { color: theme.colors.placeholder }]}
            >
              ${restaurant.minimumOrder.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <Divider
        style={[styles.divider, { backgroundColor: theme.colors.border }]}
      />

      <View style={styles.descriptionContainer}>
        <Text style={[styles.descriptionLabel, { color: theme.colors.text }]}>
          About
        </Text>
        <Text style={[styles.description, { color: theme.colors.text }]}>
          {restaurant.description}
        </Text>
      </View>

      <Divider
        style={[styles.divider, { backgroundColor: theme.colors.border }]}
      />

      <View style={styles.addressContainer}>
        <View style={styles.addressHeader}>
          <Ionicons
            name='location-outline'
            size={20}
            color={theme.colors.primary}
          />
          <Text style={[styles.addressLabel, { color: theme.colors.text }]}>
            Address
          </Text>
        </View>
        <Text style={[styles.address, { color: theme.colors.text }]}>
          {restaurant.address}
        </Text>
        <TouchableOpacity style={styles.directionsButton}>
          <Ionicons
            name='navigate-outline'
            size={16}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.directionsText, { color: theme.colors.primary }]}
          >
            Get Directions
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
  },
  divider: {
    marginVertical: 12,
  },
  descriptionContainer: {
    marginBottom: 4,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
  },
  addressContainer: {
    marginTop: 4,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  address: {
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 28,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginLeft: 28,
  },
  directionsText: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
});

export default RestaurantInfo;
