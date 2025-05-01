import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { SearchBar } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";

import { ThemeContext } from "../../context/ThemeContext";
import restaurantAPI from "../../api/restaurants";
import menuAPI from "../../api/menu";

// Import components
import RestaurantCard from "../../components/restaurant/RestaurantCard";
import MenuItemCard from "../../components/menu/MenuItemCard";
import EmptyState from "../../components/common/EmptyState";

const SearchScreen = ({ route, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const initialQuery = route.params?.query || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("restaurants"); // restaurants or menuItems
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, []);

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Search restaurants
      const restaurantsResponse = await restaurantAPI.searchRestaurants(query);

      if (restaurantsResponse.success) {
        setRestaurants(restaurantsResponse.data);
      }

      // For menu items, we would need a separate endpoint
      // This is a simplified approach - in a real app, you might have a dedicated endpoint
      // Here we're just using the first few restaurants to fetch their menu items
      let allMenuItems = [];

      if (restaurantsResponse.success && restaurantsResponse.data.length > 0) {
        // Only search menus from the top 3 restaurants to avoid too many requests
        const topRestaurants = restaurantsResponse.data.slice(0, 3);

        for (const restaurant of topRestaurants) {
          const menuResponse = await menuAPI.getRestaurantMenuItems(
            restaurant._id
          );

          if (menuResponse.success) {
            // Filter menu items by the search query
            const filteredItems = menuResponse.data.filter(
              (item) =>
                item.name.toLowerCase().includes(query.toLowerCase()) ||
                (item.description &&
                  item.description.toLowerCase().includes(query.toLowerCase()))
            );

            // Add restaurant info to each menu item
            const itemsWithRestaurant = filteredItems.map((item) => ({
              ...item,
              restaurantName: restaurant.name,
              restaurantId: restaurant._id,
            }));

            allMenuItems = [...allMenuItems, ...itemsWithRestaurant];
          }
        }
      }

      setMenuItems(allMenuItems);

      // Set active tab based on results
      if (restaurantsResponse.data.length === 0 && allMenuItems.length > 0) {
        setActiveTab("menuItems");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to perform search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantPress = (restaurant) => {
    navigation.navigate("RestaurantDetails", {
      id: restaurant._id,
      name: restaurant.name,
    });
  };

  const handleMenuItemPress = (item) => {
    navigation.navigate("Menu", {
      restaurantId: item.restaurantId,
      menuItemId: item._id,
      name: item.name,
    });
  };

  const renderRestaurantItem = ({ item }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => handleRestaurantPress(item)}
      style={styles.restaurantItem}
      compact
    />
  );

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuItemContainer}>
      <Text
        style={[styles.restaurantLabel, { color: theme.colors.placeholder }]}
      >
        From {item.restaurantName}
      </Text>
      <MenuItemCard item={item} onPress={() => handleMenuItemPress(item)} />
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon='search-outline'
      title={
        searchQuery ? "No results found" : "Search for restaurants and dishes"
      }
      description={
        searchQuery
          ? "Try a different search term or browse categories"
          : "Find your favorite restaurants and dishes"
      }
      buttonTitle='Browse Categories'
      onButtonPress={() => navigation.navigate("HomeTab")}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <SearchBar
        placeholder='Search for restaurants, dishes...'
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={() => handleSearch()}
        containerStyle={[
          styles.searchBarContainer,
          {
            backgroundColor: "transparent",
            borderBottomColor: "transparent",
            borderTopColor: "transparent",
          },
        ]}
        inputContainerStyle={[
          styles.searchBarInputContainer,
          { backgroundColor: theme.colors.card },
        ]}
        inputStyle={{ color: theme.colors.text }}
        placeholderTextColor={theme.colors.placeholder}
        searchIcon={{ color: theme.colors.placeholder }}
        clearIcon={{ color: theme.colors.placeholder }}
      />

      {searchQuery.trim() && !loading && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "restaurants" && {
                backgroundColor: theme.colors.primary + "20",
              },
            ]}
            onPress={() => setActiveTab("restaurants")}
          >
            <Text
              style={[
                styles.tabButtonText,
                {
                  color:
                    activeTab === "restaurants"
                      ? theme.colors.primary
                      : theme.colors.text,
                },
              ]}
            >
              Restaurants ({restaurants.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "menuItems" && {
                backgroundColor: theme.colors.primary + "20",
              },
            ]}
            onPress={() => setActiveTab("menuItems")}
          >
            <Text
              style={[
                styles.tabButtonText,
                {
                  color:
                    activeTab === "menuItems"
                      ? theme.colors.primary
                      : theme.colors.text,
                },
              ]}
            >
              Menu Items ({menuItems.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Searching...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
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
            onPress={() => handleSearch()}
          >
            <Text
              style={[styles.retryButtonText, { color: theme.colors.white }]}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {activeTab === "restaurants" ? (
            <FlatList
              data={restaurants}
              renderItem={renderRestaurantItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={renderEmptyState}
            />
          ) : (
            <FlatList
              data={menuItems}
              renderItem={renderMenuItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={renderEmptyState}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    borderRadius: 8,
    padding: 0,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  searchBarInputContainer: {
    borderRadius: 8,
    height: 48,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  restaurantItem: {
    marginBottom: 16,
    width: "100%",
  },
  menuItemContainer: {
    marginBottom: 16,
  },
  restaurantLabel: {
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 4,
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
});

export default SearchScreen;
