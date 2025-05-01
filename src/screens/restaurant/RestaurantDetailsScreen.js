import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  ActivityIndicator,
  StatusBar,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SharedElement } from "react-navigation-shared-element";

import { ThemeContext } from "../../context/ThemeContext";
import restaurantAPI from "../../api/restaurants";

// Import components
import MenuItemCard from "../../components/menu/MenuItemCard";
import RestaurantInfo from "../../components/restaurant/RestaurantInfo";
import MenuCategoryList from "../../components/menu/MenuCategoryList";

const HEADER_HEIGHT = 250;
const HEADER_MIN_HEIGHT = 70;

const RestaurantDetailsScreen = ({ route, navigation }) => {
  const { id, name } = route.params;
  const { theme } = useContext(ThemeContext);

  const [restaurant, setRestaurant] = useState(null);
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Calculate header height for animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [HEADER_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  // Calculate header opacity for animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Calculate title opacity for animation
  const titleOpacity = scrollY.interpolate({
    inputRange: [
      0,
      HEADER_HEIGHT - HEADER_MIN_HEIGHT - 40,
      HEADER_HEIGHT - HEADER_MIN_HEIGHT,
    ],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  useEffect(() => {
    if (restaurant && restaurant.menuItems) {
      organizeMenuByCategory();
    }
  }, [restaurant]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const response = await restaurantAPI.getRestaurant(id);

      if (response.success) {
        setRestaurant(response.data);
      } else {
        setError("Failed to load restaurant details");
      }
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const organizeMenuByCategory = () => {
    // Extract unique categories
    const categories = [
      ...new Set(restaurant.menuItems.map((item) => item.category)),
    ];
    setMenuCategories(categories);

    // Set first category as selected by default
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }

    // Organize menu items by category
    setMenuItems(restaurant.menuItems);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);

    // Scroll to category section
    // This would require additional refs and measurements in a real implementation
  };

  const handleMenuItemPress = (item) => {
    navigation.navigate("Menu", {
      restaurantId: restaurant._id,
      menuItemId: item._id,
      name: item.name,
    });
  };

  const getStatusStyle = () => {
    if (!restaurant) return {};

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
    if (!restaurant) return "";

    switch (restaurant.status) {
      case "open":
        return "Open Now";
      case "closed":
        return "Closed";
      case "busy":
        return "Busy";
      default:
        return "";
    }
  };

  const getFilteredMenuItems = () => {
    if (!selectedCategory) return [];
    return menuItems.filter((item) => item.category === selectedCategory);
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
          Loading restaurant details...
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
          onPress={fetchRestaurantDetails}
        >
          <Text style={[styles.retryButtonText, { color: theme.colors.white }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        translucent
        backgroundColor='transparent'
        barStyle='light-content'
      />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            height: headerHeight,
            opacity: headerOpacity,
          },
        ]}
      >
        <SharedElement id={`restaurant.${restaurant._id}.image`}>
          <Image
            source={{
              uri: restaurant.coverImage || "https://via.placeholder.com/400",
            }}
            style={styles.headerImage}
          />
        </SharedElement>

        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
          style={styles.headerGradient}
        />

        <View style={styles.headerContent}>
          <View style={styles.statusBadge}>
            <View style={[styles.statusIndicator, getStatusStyle()]} />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>

          <Text style={styles.restaurantName}>{restaurant.name}</Text>

          <View style={styles.headerInfo}>
            <View style={styles.headerInfoItem}>
              <Ionicons name='location-outline' size={16} color='#fff' />
              <Text style={styles.headerInfoText}>
                {restaurant.location?.city || restaurant.address}
              </Text>
            </View>

            <View style={styles.headerInfoItem}>
              <Ionicons name='star' size={16} color='#FFD700' />
              <Text style={styles.headerInfoText}>
                {restaurant.averageRating.toFixed(1)} ({restaurant.ratingCount})
              </Text>
            </View>

            <View style={styles.headerInfoItem}>
              <Ionicons name='time-outline' size={16} color='#fff' />
              <Text style={styles.headerInfoText}>
                {restaurant.deliveryTime} min
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Navigation Bar with Animated Title */}
      <View
        style={[
          styles.navbar,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name='arrow-back' size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <Animated.Text
          style={[
            styles.navbarTitle,
            {
              opacity: titleOpacity,
              color: theme.colors.text,
            },
          ]}
        >
          {restaurant.name}
        </Animated.Text>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => {
            /* Handle favorite */
          }}
        >
          <Ionicons name='heart-outline' size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Restaurant Info Section */}
        <RestaurantInfo restaurant={restaurant} />

        {/* Menu Categories */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Menu
          </Text>

          <MenuCategoryList
            categories={menuCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />

          {/* Menu Items for Selected Category */}
          <FlatList
            data={getFilteredMenuItems()}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <MenuItemCard
                item={item}
                onPress={() => handleMenuItemPress(item)}
              />
            )}
            scrollEnabled={false}
            contentContainerStyle={styles.menuItemList}
          />
        </View>
      </Animated.ScrollView>

      {/* Floating Action Button for Cart */}
      <TouchableOpacity
        style={[styles.cartButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("Cart")}
      >
        <Ionicons name='cart-outline' size={24} color={theme.colors.white} />
        <Text style={styles.cartButtonText}>View Cart</Text>
      </TouchableOpacity>
    </View>
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
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    zIndex: 1,
  },
  headerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  headerContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  restaurantName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  headerInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  headerInfoText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 4,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    zIndex: 2,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  navbarTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingTop: HEADER_HEIGHT,
    paddingBottom: 80,
  },
  menuSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  menuItemList: {
    paddingTop: 8,
  },
  cartButton: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cartButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default RestaurantDetailsScreen;
