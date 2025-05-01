import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

import { ThemeContext } from "../../context/ThemeContext";
import restaurantAPI from "../../api/restaurants";

import RestaurantCard from "../../components/restaurant/RestaurantCard";
import EmptyState from "../../components/common/EmptyState";

const RestaurantListScreen = ({ navigation, route }) => {
  const { theme } = useContext(ThemeContext);
  const initialFilters = route.params || {};

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    cuisine: initialFilters.cuisine || null,
    sort: initialFilters.sort || "-averageRating",
    priceRange: initialFilters.priceRange || null,
    deliveryTime: initialFilters.deliveryTime || null,
  });
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Cuisine types
  const cuisineTypes = [
    { id: null, name: "All" },
    { id: "Nigerian", name: "Nigerian" },
    { id: "Chinese", name: "Chinese" },
    { id: "Italian", name: "Italian" },
    { id: "American", name: "American" },
    { id: "Indian", name: "Indian" },
    { id: "Japanese", name: "Japanese" },
    { id: "Fast Food", name: "Fast Food" },
    { id: "Desserts", name: "Desserts" },
  ];

  // Sort options
  const sortOptions = [
    { id: "-averageRating", name: "Rating (High to Low)" },
    { id: "deliveryTime", name: "Delivery Time (Fast to Slow)" },
    { id: "deliveryFee", name: "Delivery Fee (Low to High)" },
    { id: "-createdAt", name: "Newest" },
  ];

  // Price range options
  const priceRangeOptions = [
    { id: null, name: "All" },
    { id: "1", name: "$" },
    { id: "2", name: "$$" },
    { id: "3", name: "$$$" },
    { id: "4", name: "$$$$" },
  ];

  // Delivery time options
  const deliveryTimeOptions = [
    { id: null, name: "All" },
    { id: "30", name: "Under 30 mins" },
    { id: "45", name: "Under 45 mins" },
    { id: "60", name: "Under 60 mins" },
  ];

  useEffect(() => {
    getLocationPermission();
  }, []);

  useEffect(() => {
    loadRestaurants();
  }, [location, activeFilters]);

  const getLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const locationResult = await Location.getCurrentPositionAsync({});
        setLocation(locationResult.coords);
      } else {
        // Load restaurants without location filter
        loadRestaurants();
      }
    } catch (error) {
      console.error("Error getting location permission:", error);
      // Load restaurants without location filter
      loadRestaurants();
    }
  };

  const loadRestaurants = async () => {
    try {
      setLoading(true);

      const params = {
        sort: activeFilters.sort,
      };

      // Add cuisine filter if selected
      if (activeFilters.cuisine) {
        params.cuisine = activeFilters.cuisine;
      }

      // Add price range filter if selected
      if (activeFilters.priceRange) {
        params.priceRange = activeFilters.priceRange;
      }

      // Add delivery time filter if selected
      if (activeFilters.deliveryTime) {
        params.maxDeliveryTime = activeFilters.deliveryTime;
      }

      let response;

      // Use location if available
      if (location) {
        response = await restaurantAPI.getNearbyRestaurants(
          location.latitude,
          location.longitude,
          10 // 10km radius
        );
      } else {
        response = await restaurantAPI.getRestaurants(params);
      }

      if (response.success) {
        // Apply any additional filtering that couldn't be done via API
        let filteredRestaurants = response.data;

        // Filter by search text if provided
        if (search) {
          const searchLower = search.toLowerCase();
          filteredRestaurants = filteredRestaurants.filter(
            (restaurant) =>
              restaurant.name.toLowerCase().includes(searchLower) ||
              (restaurant.cuisineType &&
                restaurant.cuisineType.some((cuisine) =>
                  cuisine.toLowerCase().includes(searchLower)
                ))
          );
        }

        setRestaurants(filteredRestaurants);
      } else {
        setError("Failed to load restaurants");
      }
    } catch (error) {
      console.error("Error loading restaurants:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    loadRestaurants();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRestaurants();
  };

  const handleRestaurantPress = (restaurant) => {
    navigation.navigate("RestaurantDetails", {
      id: restaurant._id,
      name: restaurant.name,
    });
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    setActiveFilters({
      cuisine: null,
      sort: "-averageRating",
      priceRange: null,
      deliveryTime: null,
    });
    setShowFilterModal(false);
  };

  const FilterButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        isActive && { backgroundColor: theme.colors.primary },
        { borderColor: theme.colors.border },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterButtonText,
          { color: isActive ? theme.colors.white : theme.colors.text },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterButtons = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {cuisineTypes.map((cuisine) => (
          <FilterButton
            key={`cuisine-${cuisine.id || "all"}`}
            title={cuisine.name}
            isActive={activeFilters.cuisine === cuisine.id}
            onPress={() =>
              applyFilters({ ...activeFilters, cuisine: cuisine.id })
            }
          />
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.filterIconButton, { borderColor: theme.colors.border }]}
        onPress={handleFilterPress}
      >
        <Ionicons name='options-outline' size={20} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderRestaurantItem = ({ item }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => handleRestaurantPress(item)}
      style={styles.restaurantCard}
      compact
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      icon='restaurant-outline'
      title='No restaurants found'
      description='Try different filters or check back later'
      buttonTitle='Reset Filters'
      onButtonPress={resetFilters}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[styles.searchBar, { backgroundColor: theme.colors.card }]}
        >
          <Ionicons name='search' size={20} color={theme.colors.placeholder} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder='Search restaurants or cuisines...'
            placeholderTextColor={theme.colors.placeholder}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType='search'
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name='close-circle'
                size={20}
                color={theme.colors.placeholder}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Buttons */}
      {renderFilterButtons()}

      {/* Restaurant List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading restaurants...
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
            onPress={loadRestaurants}
          >
            <Text
              style={[styles.retryButtonText, { color: theme.colors.white }]}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderRestaurantItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Filter Restaurants
              </Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name='close' size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Sort By */}
              <Text
                style={[
                  styles.filterSectionTitle,
                  { color: theme.colors.text },
                ]}
              >
                Sort By
              </Text>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    activeFilters.sort === option.id && {
                      backgroundColor: theme.colors.primary + "20",
                    },
                  ]}
                  onPress={() =>
                    setActiveFilters({ ...activeFilters, sort: option.id })
                  }
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      { color: theme.colors.text },
                      activeFilters.sort === option.id && {
                        color: theme.colors.primary,
                      },
                    ]}
                  >
                    {option.name}
                  </Text>
                  {activeFilters.sort === option.id && (
                    <Ionicons
                      name='checkmark'
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}

              {/* Cuisines */}
              <Text
                style={[
                  styles.filterSectionTitle,
                  { color: theme.colors.text },
                ]}
              >
                Cuisine
              </Text>
              <View style={styles.filterOptionsGrid}>
                {cuisineTypes.map((cuisine) => (
                  <TouchableOpacity
                    key={`modal-cuisine-${cuisine.id || "all"}`}
                    style={[
                      styles.filterOptionChip,
                      activeFilters.cuisine === cuisine.id && {
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary,
                      },
                      { borderColor: theme.colors.border },
                    ]}
                    onPress={() =>
                      setActiveFilters({
                        ...activeFilters,
                        cuisine: cuisine.id,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.filterOptionChipText,
                        {
                          color:
                            activeFilters.cuisine === cuisine.id
                              ? theme.colors.white
                              : theme.colors.text,
                        },
                      ]}
                    >
                      {cuisine.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Price Range */}
              <Text
                style={[
                  styles.filterSectionTitle,
                  { color: theme.colors.text },
                ]}
              >
                Price Range
              </Text>
              <View style={styles.filterOptionsRow}>
                {priceRangeOptions.map((option) => (
                  <TouchableOpacity
                    key={`price-${option.id || "all"}`}
                    style={[
                      styles.filterOptionChip,
                      activeFilters.priceRange === option.id && {
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary,
                      },
                      { borderColor: theme.colors.border },
                    ]}
                    onPress={() =>
                      setActiveFilters({
                        ...activeFilters,
                        priceRange: option.id,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.filterOptionChipText,
                        {
                          color:
                            activeFilters.priceRange === option.id
                              ? theme.colors.white
                              : theme.colors.text,
                        },
                      ]}
                    >
                      {option.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Delivery Time */}
              <Text
                style={[
                  styles.filterSectionTitle,
                  { color: theme.colors.text },
                ]}
              >
                Delivery Time
              </Text>
              <View style={styles.filterOptionsGrid}>
                {deliveryTimeOptions.map((option) => (
                  <TouchableOpacity
                    key={`time-${option.id || "all"}`}
                    style={[
                      styles.filterOptionChip,
                      activeFilters.deliveryTime === option.id && {
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary,
                      },
                      { borderColor: theme.colors.border },
                    ]}
                    onPress={() =>
                      setActiveFilters({
                        ...activeFilters,
                        deliveryTime: option.id,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.filterOptionChipText,
                        {
                          color:
                            activeFilters.deliveryTime === option.id
                              ? theme.colors.white
                              : theme.colors.text,
                        },
                      ]}
                    >
                      {option.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.resetButton,
                  { borderColor: theme.colors.border },
                ]}
                onPress={resetFilters}
              >
                <Text
                  style={[styles.resetButtonText, { color: theme.colors.text }]}
                >
                  Reset All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.applyButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => applyFilters(activeFilters)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  filterIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  restaurantCard: {
    marginBottom: 16,
    width: "100%",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: "50%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContent: {
    padding: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  filterOptionText: {
    fontSize: 14,
  },
  filterOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  filterOptionsRow: {
    flexDirection: "row",
    marginHorizontal: -4,
  },
  filterOptionChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
  },
  filterOptionChipText: {
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  resetButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    marginRight: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  applyButton: {
    marginLeft: 8,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
});

export default RestaurantListScreen;
