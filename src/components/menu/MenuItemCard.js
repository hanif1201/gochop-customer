import React, { useContext } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";

const MenuItemCard = ({ item, onPress }) => {
  const { theme } = useContext(ThemeContext);

  if (!item) return null;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.name, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          {item.featured && (
            <View
              style={[
                styles.featuredBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>

        <Text
          style={[styles.description, { color: theme.colors.placeholder }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>

        <View style={styles.tagsContainer}>
          {item.isVeg && (
            <View style={[styles.tag, { backgroundColor: "#4CAF50" }]}>
              <Text style={styles.tagText}>Veg</Text>
            </View>
          )}

          {item.isVegan && (
            <View style={[styles.tag, { backgroundColor: "#8BC34A" }]}>
              <Text style={styles.tagText}>Vegan</Text>
            </View>
          )}

          {item.isGlutenFree && (
            <View style={[styles.tag, { backgroundColor: "#FF9800" }]}>
              <Text style={styles.tagText}>Gluten Free</Text>
            </View>
          )}

          {item.spicyLevel > 0 && (
            <View style={[styles.tag, { backgroundColor: "#F44336" }]}>
              <Text style={styles.tagText}>
                {item.spicyLevel === 1 && "Mild"}
                {item.spicyLevel === 2 && "Spicy"}
                {item.spicyLevel === 3 && "Very Spicy"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            {item.discountedPrice ? (
              <>
                <Text
                  style={[styles.discountedPrice, { color: theme.colors.text }]}
                >
                  ${item.discountedPrice.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.originalPrice,
                    { color: theme.colors.placeholder },
                  ]}
                >
                  ${item.price.toFixed(2)}
                </Text>
              </>
            ) : (
              <Text style={[styles.price, { color: theme.colors.text }]}>
                ${item.price.toFixed(2)}
              </Text>
            )}
          </View>

          <View style={styles.timeContainer}>
            <Ionicons
              name='time-outline'
              size={14}
              color={theme.colors.placeholder}
            />
            <Text style={[styles.time, { color: theme.colors.placeholder }]}>
              {item.preparationTime} min
            </Text>
          </View>
        </View>
      </View>

      <Image
        source={{ uri: item.image || "https://via.placeholder.com/100" }}
        style={styles.image}
        resizeMode='cover'
      />

      {!item.isAvailable && (
        <View style={styles.unavailableOverlay}>
          <Text style={styles.unavailableText}>Unavailable</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={onPress}
        disabled={!item.isAvailable}
      >
        <Ionicons name='add' size={24} color='white' />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  infoContainer: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  featuredBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  featuredText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  description: {
    fontSize: 12,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    fontSize: 12,
    marginLeft: 2,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  unavailableOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  unavailableText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
});

export default MenuItemCard;
