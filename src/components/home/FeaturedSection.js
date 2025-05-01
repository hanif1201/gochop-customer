import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";

const FeaturedSection = ({ title, items, onItemPress }) => {
  const { theme } = useContext(ThemeContext);

  if (!items || items.length === 0) return null;

  const renderFeaturedItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.featuredItem, { backgroundColor: theme.colors.card }]}
        onPress={() => onItemPress(item)}
      >
        <Image
          source={{ uri: item.image || "https://via.placeholder.com/150" }}
          style={styles.itemImage}
          resizeMode='cover'
        />

        <View style={styles.itemInfo}>
          <Text
            style={[styles.itemName, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text
            style={[
              styles.itemDescription,
              { color: theme.colors.placeholder },
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>

          <View style={styles.itemFooter}>
            <View style={styles.priceContainer}>
              {item.discountedPrice ? (
                <>
                  <Text
                    style={[
                      styles.discountedPrice,
                      { color: theme.colors.primary },
                    ]}
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
                <Text style={[styles.price, { color: theme.colors.primary }]}>
                  ${item.price.toFixed(2)}
                </Text>
              )}
            </View>

            <View style={styles.ratingContainer}>
              <Ionicons name='star' size={14} color='#FFD700' />
              <Text style={[styles.rating, { color: theme.colors.text }]}>
                {item.rating || "New"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <TouchableOpacity>
          <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
            See All
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderFeaturedItem}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAllText: {
    fontSize: 14,
  },
  listContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  featuredItem: {
    width: 250,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: "100%",
    height: 150,
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    marginBottom: 8,
    minHeight: 32,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
  },
  discountedPrice: {
    fontSize: 14,
    fontWeight: "bold",
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 12,
    marginLeft: 2,
  },
});

export default FeaturedSection;
