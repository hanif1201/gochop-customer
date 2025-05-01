import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SharedElement } from "react-navigation-shared-element";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.65;

const RestaurantCard = ({ restaurant, onPress, style, compact = false }) => {
  const { theme } = useContext(ThemeContext);

  if (!restaurant) return null;

  const getStatusStyle = () => {
    switch (restaurant.status) {
      case "open":
        return { backgroundColor: theme.colors.success };
      case "closed":
        return { backgroundColor: theme.colors.error };
      case "busy":
        return { backgroundColor: theme.colors.warning };
      default:
        return { backgroundColor: theme.colors.gray[500] };
    }
  };

  const getStatusText = () => {
    switch (restaurant.status) {
      case "open":
        return "Open";
      case "closed":
        return "Closed";
      case "busy":
        return "Busy";
      default:
        return "";
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: theme.colors.card },
        compact ? styles.compactContainer : {},
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Restaurant Image */}
      <SharedElement id={`restaurant.${restaurant._id}.image`}>
        <Image
          source={{
            uri: restaurant.coverImage || "https://via.placeholder.com/400",
          }}
          style={compact ? styles.compactImage : styles.image}
          resizeMode='cover'
        />
      </SharedElement>

      {/* Status Badge */}
      <View style={[styles.statusBadge, getStatusStyle()]}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {/* Restaurant Info */}
      <View style={styles.infoContainer}>
        <Text
          numberOfLines={1}
          style={[styles.name, { color: theme.colors.text }]}
        >
          {restaurant.name}
        </Text>

        <View style={styles.ratingContainer}>
          <Ionicons name='star' size={16} color='#FFD700' />
          <Text style={[styles.rating, { color: theme.colors.text }]}>
            {restaurant.averageRating.toFixed(1)} ({restaurant.ratingCount})
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons
              name='time-outline'
              size={14}
              color={theme.colors.placeholder}
            />
            <Text
              style={[styles.detailText, { color: theme.colors.placeholder }]}
            >
              {restaurant.deliveryTime} min
            </Text>
          </View>

          {!compact && (
            <>
              <View style={styles.detailDivider} />

              <View style={styles.detailItem}>
                <Ionicons
                  name='bicycle-outline'
                  size={14}
                  color={theme.colors.placeholder}
                />
                <Text
                  style={[
                    styles.detailText,
                    { color: theme.colors.placeholder },
                  ]}
                >
                  ${restaurant.deliveryFee.toFixed(2)}
                </Text>
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.detailItem}>
                <Ionicons
                  name='restaurant-outline'
                  size={14}
                  color={theme.colors.placeholder}
                />
                <Text
                  style={[
                    styles.detailText,
                    { color: theme.colors.placeholder },
                  ]}
                >
                  {restaurant.cuisineType && restaurant.cuisineType.length > 0
                    ? restaurant.cuisineType[0]
                    : "Various"}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: CARD_WIDTH,
    height: 220,
  },
  compactContainer: {
    width: "100%",
    height: 180,
  },
  image: {
    width: "100%",
    height: 140,
  },
  compactImage: {
    width: "100%",
    height: 100,
  },
  statusBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    marginLeft: 4,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  detailDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D3D3D3",
    marginHorizontal: 8,
  },
});

export default RestaurantCard;
