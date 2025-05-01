import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  FlatList,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from "react-native";
import { SearchBar, Card } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { OrderContext } from "../../context/OrderContext";
import restaurantAPI from "../../api/restaurants";
import menuAPI from "../../api/menu";

// Import components
import RestaurantCard from "../../components/restaurant/RestaurantCard";
import CategoryList from "../../components/home/CategoryList";
import FeaturedSection from "../../components/home/FeaturedSection";
import ActiveOrderCard from "../../components/order/ActiveOrderCard";

const HomeScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { user, isAuthenticated } = useContext(AuthContext);
  const { currentOrder, activeOrderId } = useContext(OrderContext);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [topRatedRestaurants, setTopRatedRestaurants] = useState([]);
  const [locationError, setLocationError] = useState(null);

  // Categories for food filters
  const categories = [
    { id: "all", name: "All", icon: "restaurant-outline" },
    { id: "burgers", name: "Burgers", icon: "fast-food-outline" },
    { id: "pizza", name: "Pizza", icon: "pizza-outline" },
    { id: "sushi", name: "Sushi", icon: "fish-outline" },
    { id: "chicken", name: "Chicken", icon: "nutrition-outline" },
    { id: "dessert", name: "Dessert", icon: "ice-cream-outline" },
    { id: "vegetarian", name: "Vegetarian", icon: "leaf-outline" },
    { id: "healthy", name: "Healthy", icon: "fitness-outline" },
  ];

  useEffect(() => {
    getLocationAndLoadData();
  }, []);

  const getLocationAndLoadData = async () => {
    setLoading(true);
    setLocationError(null);

    try {
      // Get location permission
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError("Location permission not granted");
        // Load data without location
        loadData();
        return;
      }

      // Get current location
      let locationResult = await Location.getCurrentPositionAsync({});
      setLocation(locationResult.coords);

      // Load data with location
      loadData(locationResult.coords);
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationError("Could not get your location");
      // Load data without location
      loadData();
    }
  };

  const loadData = async (coords = null) => {
    try {
      // Load nearby restaurants if location is available
      if (coords) {
        const nearbyResult = await restaurantAPI.getNearbyRestaurants(
          coords.latitude,
          coords.longitude,
          5 // 5km radius
        );

        if (nearbyResult.success) {
          setNearbyRestaurants(nearbyResult.data);
        }
      }

      // Load top rated restaurants
      const topRatedResult = await restaurantAPI.getRestaurants({
        sort: "-averageRating",
        limit: 10,
      });

      if (topRatedResult.success) {
        setTopRatedRestaurants(topRatedResult.data);
      }

      // Load featured menu items (from top restaurants)
      if (topRatedResult.success && topRatedResult.data.length > 0) {
        const featuredResult = await menuAPI.getFeaturedMenuItems(
          topRatedResult.data[0].id
        );

        if (featuredResult.success) {
          setFeaturedItems(featuredResult.data);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getLocationAndLoadData();
  };

  const handleSearch = () => {
    navigation.navigate("Search", { query: search });
    setSearch("");
  };

  const handleCategoryPress = (categoryId) => {
    if (categoryId === "all") {
      navigation.navigate("RestaurantsTab");
    } else {
      navigation.navigate("RestaurantsTab", { cuisine: categoryId });
    }
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
              {isAuthenticated && user
                ? `Hi, ${user.name.split(" ")[0]}!`
                : "Welcome!"}
            </Text>
            <View style={styles.locationContainer}>
              <Ionicons
                name='location-outline'
                size={16}
                color={theme.colors.primary}
              />
              <Text
                style={[
                  styles.locationText,
                  { color: theme.colors.placeholder },
                ]}
              >
                {locationError
                  ? "Location not available"
                  : location
                  ? "Delivering to your location"
                  : "Setting up your location..."}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.profileButton,
              { backgroundColor: theme.colors.card },
            ]}
            onPress={() => navigation.navigate("ProfileTab")}
          >
            <Ionicons
              name='person-outline'
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        <SearchBar
          placeholder='Search for restaurants, food...'
          onChangeText={setSearch}
          value={search}
          onSubmitEditing={handleSearch}
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
      </View>
    );
  };

  const renderActiveOrderCard = () => {
    if (!activeOrderId || !currentOrder) return null;

    return (
      <ActiveOrderCard
        order={currentOrder}
        onPress={() =>
          navigation.navigate("OrdersTab", { screen: "OrderTracking" })
        }
      />
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
          Finding great food near you...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderHeader()}
        {renderActiveOrderCard()}

        <CategoryList
          categories={categories}
          onCategoryPress={handleCategoryPress}
        />

        {nearbyRestaurants.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Nearby Restaurants
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("RestaurantsTab")}
              >
                <Text
                  style={[styles.seeAllText, { color: theme.colors.primary }]}
                >
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={nearbyRestaurants}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <RestaurantCard
                  restaurant={item}
                  onPress={() =>
                    navigation.navigate("RestaurantDetails", {
                      id: item._id,
                      name: item.name,
                    })
                  }
                  style={styles.restaurantCard}
                />
              )}
              contentContainerStyle={styles.restaurantList}
            />
          </View>
        )}

        {featuredItems.length > 0 && (
          <FeaturedSection
            title='Featured Items'
            items={featuredItems}
            onItemPress={(item) =>
              navigation.navigate("Menu", {
                restaurantId: item.restaurant,
                menuItemId: item._id,
                name: item.name,
              })
            }
          />
        )}

        {topRatedRestaurants.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Top Rated Restaurants
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("RestaurantsTab", {
                    sort: "-averageRating",
                  })
                }
              >
                <Text
                  style={[styles.seeAllText, { color: theme.colors.primary }]}
                >
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={topRatedRestaurants}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <RestaurantCard
                  restaurant={item}
                  onPress={() =>
                    navigation.navigate("RestaurantDetails", {
                      id: item._id,
                      name: item.name,
                    })
                  }
                  style={styles.restaurantCard}
                />
              )}
              contentContainerStyle={styles.restaurantList}
            />
          </View>
        )}

        {/* Add some bottom padding */}
        <View style={{ height: 20 }} />
      </ScrollView>
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
  header: {
    padding: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBarContainer: {
    borderRadius: 8,
    padding: 0,
    marginTop: 8,
  },
  searchBarInputContainer: {
    borderRadius: 8,
    height: 48,
  },
  section: {
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
  restaurantList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  restaurantCard: {
    marginRight: 8,
    width: 240,
  },
});

export default HomeScreen;
