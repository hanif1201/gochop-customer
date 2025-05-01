import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "react-native-elements";

import { ThemeContext } from "../../context/ThemeContext";
import { CartContext } from "../../context/CartContext";
import menuAPI from "../../api/menu";
import restaurantAPI from "../../api/restaurants";

// Import components
import MenuItemCard from "../../components/menu/MenuItemCard";
import MenuCategoryList from "../../components/menu/MenuCategoryList";
import QuantitySelector from "../../components/common/QuantitySelector";

const { width } = Dimensions.get("window");

const MenuScreen = ({ route, navigation }) => {
  const { restaurantId, menuItemId, name } = route.params;
  const { theme } = useContext(ThemeContext);
  const { addToCart, confirmClearCartAndAdd } = useContext(CartContext);

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadMenuData();
    loadRestaurantData();
  }, [restaurantId]);

  useEffect(() => {
    // If a specific menu item ID is provided, show its details
    if (menuItemId && menuItems.length > 0) {
      const item = menuItems.find((item) => item._id === menuItemId);
      if (item) {
        handleMenuItemPress(item);
      }
    }
  }, [menuItemId, menuItems]);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      const response = await menuAPI.getRestaurantMenuItems(restaurantId);

      if (response.success) {
        setMenuItems(response.data);
        organizeCategories(response.data);
      } else {
        setError("Failed to load menu items");
      }
    } catch (error) {
      console.error("Error loading menu items:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadRestaurantData = async () => {
    try {
      const response = await restaurantAPI.getRestaurant(restaurantId);

      if (response.success) {
        setRestaurant(response.data);
      } else {
        setError("Failed to load restaurant details");
      }
    } catch (error) {
      console.error("Error loading restaurant details:", error);
      setError("Could not load restaurant information");
    }
  };

  const organizeCategories = (items) => {
    if (!items || items.length === 0) return;

    // Extract unique categories
    const uniqueCategories = [...new Set(items.map((item) => item.category))];
    setCategories(uniqueCategories);

    // Set first category as selected by default
    if (uniqueCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(uniqueCategories[0]);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleMenuItemPress = (item) => {
    setSelectedItem(item);
    setQuantity(1);

    // Initialize customizations if any
    if (item.customizations && item.customizations.length > 0) {
      const initialCustomizations = item.customizations.map((customization) => {
        const { name, required, options, multiSelect } = customization;

        // If required and not multi-select, pre-select the first option
        let selectedOptions = [];
        if (required && !multiSelect && options.length > 0) {
          selectedOptions = [options[0]];
        }

        return {
          name,
          required,
          multiSelect,
          options: options,
          selectedOptions,
        };
      });

      setSelectedCustomizations(initialCustomizations);
    } else {
      setSelectedCustomizations([]);
    }

    setShowItemModal(true);
  };

  const toggleCustomizationOption = (customizationIndex, option) => {
    const updatedCustomizations = [...selectedCustomizations];
    const customization = updatedCustomizations[customizationIndex];

    if (customization.multiSelect) {
      // For multi-select, toggle the option
      const optionIndex = customization.selectedOptions.findIndex(
        (selected) => selected.id === option.id
      );

      if (optionIndex >= 0) {
        // Remove option if already selected
        customization.selectedOptions.splice(optionIndex, 1);
      } else {
        // Add option if not selected
        customization.selectedOptions.push(option);
      }
    } else {
      // For single-select, replace the selection
      customization.selectedOptions = [option];
    }

    updatedCustomizations[customizationIndex] = customization;
    setSelectedCustomizations(updatedCustomizations);
  };

  const isOptionSelected = (customizationIndex, option) => {
    if (!selectedCustomizations[customizationIndex]) return false;

    return selectedCustomizations[customizationIndex].selectedOptions.some(
      (selected) => selected.id === option.id
    );
  };

  const validateCustomizations = () => {
    for (let i = 0; i < selectedCustomizations.length; i++) {
      const customization = selectedCustomizations[i];
      if (
        customization.required &&
        customization.selectedOptions.length === 0
      ) {
        return `Please select an option for ${customization.name}`;
      }
    }
    return null;
  };

  const handleAddToCart = async () => {
    // Validate customizations
    const validationError = validateCustomizations();
    if (validationError) {
      Alert.alert("Missing Selection", validationError);
      return;
    }

    setAddingToCart(true);

    try {
      // Format the selected item and customizations for the cart
      const cartItem = {
        id: selectedItem._id,
        name: selectedItem.name,
        price: selectedItem.price,
        discountedPrice: selectedItem.discountedPrice,
        image: selectedItem.image,
        quantity: quantity,
        restaurant: selectedItem.restaurant,
        customizations: selectedCustomizations.map((customization) => ({
          name: customization.name,
          options: customization.selectedOptions,
        })),
        subtotal: calculateSubtotal(),
      };

      // Add the restaurant info for cart context
      const restaurantInfo = {
        id: restaurant._id,
        name: restaurant.name,
        minimumOrder: restaurant.minimumOrder,
        deliveryFee: restaurant.deliveryFee,
        freeDeliveryThreshold: restaurant.freeDeliveryThreshold,
        taxPercentage: restaurant.taxPercentage || 5,
      };

      // Add to cart
      const result = await addToCart(cartItem, restaurantInfo);

      if (result.success) {
        setShowItemModal(false);
        Alert.alert(
          "Added to Cart",
          `${selectedItem.name} has been added to your cart`,
          [
            {
              text: "Continue Shopping",
              style: "cancel",
            },
            {
              text: "View Cart",
              onPress: () => navigation.navigate("Cart"),
            },
          ]
        );
      } else if (result.needsConfirmation) {
        // Handle case where items from another restaurant are in the cart
        Alert.alert(
          "Replace Cart Items?",
          `Your cart contains items from ${result.restaurantName}. Adding this item will clear your current cart.`,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Replace",
              onPress: () => {
                confirmClearCartAndAdd(cartItem, restaurantInfo);
                setShowItemModal(false);
                Alert.alert("Cart Updated", "Item added to cart");
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Could not add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const calculateSubtotal = () => {
    if (!selectedItem) return 0;

    // Get base price (accounting for discounts)
    let subtotal = selectedItem.discountedPrice || selectedItem.price;

    // Add customization costs
    selectedCustomizations.forEach((customization) => {
      customization.selectedOptions.forEach((option) => {
        if (option.price) {
          subtotal += option.price;
        }
      });
    });

    // Multiply by quantity
    return subtotal * quantity;
  };

  const renderMenuItem = ({ item }) => (
    <MenuItemCard item={item} onPress={() => handleMenuItemPress(item)} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name='restaurant-outline'
        size={64}
        color={theme.colors.placeholder}
      />
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        No menu items found in this category
      </Text>
    </View>
  );

  const renderItemModal = () => {
    if (!selectedItem) return null;

    return (
      <Modal
        visible={showItemModal}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setShowItemModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowItemModal(false)}
              >
                <Ionicons name='close' size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Item Image */}
              <Image
                source={{
                  uri: selectedItem.image || "https://via.placeholder.com/400",
                }}
                style={styles.itemImage}
                resizeMode='cover'
              />

              {/* Item Details */}
              <View style={styles.itemDetails}>
                <Text style={[styles.itemName, { color: theme.colors.text }]}>
                  {selectedItem.name}
                </Text>

                <Text
                  style={[
                    styles.itemDescription,
                    { color: theme.colors.placeholder },
                  ]}
                >
                  {selectedItem.description}
                </Text>

                {/* Item Tags */}
                <View style={styles.tagsContainer}>
                  {selectedItem.isVeg && (
                    <View style={[styles.tag, { backgroundColor: "#4CAF50" }]}>
                      <Text style={styles.tagText}>Veg</Text>
                    </View>
                  )}

                  {selectedItem.isVegan && (
                    <View style={[styles.tag, { backgroundColor: "#8BC34A" }]}>
                      <Text style={styles.tagText}>Vegan</Text>
                    </View>
                  )}

                  {selectedItem.isGlutenFree && (
                    <View style={[styles.tag, { backgroundColor: "#FF9800" }]}>
                      <Text style={styles.tagText}>Gluten Free</Text>
                    </View>
                  )}

                  {selectedItem.spicyLevel > 0 && (
                    <View style={[styles.tag, { backgroundColor: "#F44336" }]}>
                      <Text style={styles.tagText}>
                        {selectedItem.spicyLevel === 1 && "Mild"}
                        {selectedItem.spicyLevel === 2 && "Spicy"}
                        {selectedItem.spicyLevel === 3 && "Very Spicy"}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Item Price */}
                <View style={styles.priceContainer}>
                  {selectedItem.discountedPrice ? (
                    <>
                      <Text
                        style={[
                          styles.discountedPrice,
                          { color: theme.colors.primary },
                        ]}
                      >
                        ${selectedItem.discountedPrice.toFixed(2)}
                      </Text>
                      <Text
                        style={[
                          styles.originalPrice,
                          { color: theme.colors.placeholder },
                        ]}
                      >
                        ${selectedItem.price.toFixed(2)}
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.price, { color: theme.colors.text }]}>
                      ${selectedItem.price.toFixed(2)}
                    </Text>
                  )}
                </View>

                {/* Customizations */}
                {selectedItem.customizations &&
                  selectedItem.customizations.length > 0 && (
                    <View style={styles.customizationsContainer}>
                      <Text
                        style={[
                          styles.customizationsTitle,
                          { color: theme.colors.text },
                        ]}
                      >
                        Customizations
                      </Text>

                      {selectedCustomizations.map((customization, index) => (
                        <View key={index} style={styles.customizationSection}>
                          <Text
                            style={[
                              styles.customizationName,
                              { color: theme.colors.text },
                            ]}
                          >
                            {customization.name}
                            {customization.required ? " *" : ""}
                          </Text>
                          <Text
                            style={[
                              styles.customizationDescription,
                              { color: theme.colors.placeholder },
                            ]}
                          >
                            {customization.multiSelect
                              ? "Select one or more"
                              : "Select one"}
                          </Text>

                          {customization.options.map((option) => (
                            <TouchableOpacity
                              key={option.id}
                              style={[
                                styles.optionItem,
                                isOptionSelected(index, option) && {
                                  backgroundColor: theme.colors.primary + "20",
                                  borderColor: theme.colors.primary,
                                },
                                { borderColor: theme.colors.border },
                              ]}
                              onPress={() =>
                                toggleCustomizationOption(index, option)
                              }
                            >
                              <View style={styles.optionContent}>
                                <Text
                                  style={[
                                    styles.optionName,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {option.name}
                                </Text>
                                {option.price > 0 && (
                                  <Text
                                    style={[
                                      styles.optionPrice,
                                      { color: theme.colors.placeholder },
                                    ]}
                                  >
                                    +${option.price.toFixed(2)}
                                  </Text>
                                )}
                              </View>
                              {isOptionSelected(index, option) && (
                                <Ionicons
                                  name='checkmark-circle'
                                  size={20}
                                  color={theme.colors.primary}
                                />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      ))}
                    </View>
                  )}

                {/* Quantity Selector */}
                <View style={styles.quantityContainer}>
                  <Text
                    style={[styles.quantityLabel, { color: theme.colors.text }]}
                  >
                    Quantity
                  </Text>
                  <QuantitySelector
                    value={quantity}
                    onValueChange={setQuantity}
                    min={1}
                    max={10}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Add to Cart Button */}
            <View
              style={[
                styles.actionContainer,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <View style={styles.totalContainer}>
                <Text style={[styles.totalText, { color: theme.colors.text }]}>
                  Total:
                </Text>
                <Text
                  style={[styles.totalAmount, { color: theme.colors.primary }]}
                >
                  ${calculateSubtotal().toFixed(2)}
                </Text>
              </View>

              <Button
                title={addingToCart ? "Adding..." : "Add to Cart"}
                onPress={handleAddToCart}
                loading={addingToCart}
                buttonStyle={[
                  styles.addToCartButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                titleStyle={styles.addToCartButtonText}
                disabled={addingToCart || !selectedItem.isAvailable}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
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
          Loading menu items...
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
          onPress={loadMenuData}
        >
          <Text style={[styles.retryButtonText, { color: theme.colors.white }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Restaurant Header */}
      {restaurant && (
        <View
          style={[
            styles.restaurantHeader,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <Image
            source={{
              uri:
                restaurant.logoImage ||
                restaurant.coverImage ||
                "https://via.placeholder.com/60",
            }}
            style={styles.restaurantLogo}
          />
          <View style={styles.restaurantInfo}>
            <Text style={[styles.restaurantName, { color: theme.colors.text }]}>
              {restaurant.name}
            </Text>
            <View style={styles.restaurantMeta}>
              <View style={styles.metaItem}>
                <Ionicons name='star' size={14} color='#FFD700' />
                <Text
                  style={[styles.metaText, { color: theme.colors.placeholder }]}
                >
                  {restaurant.averageRating.toFixed(1)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons
                  name='time-outline'
                  size={14}
                  color={theme.colors.placeholder}
                />
                <Text
                  style={[styles.metaText, { color: theme.colors.placeholder }]}
                >
                  {restaurant.deliveryTime} min
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons
                  name='bicycle-outline'
                  size={14}
                  color={theme.colors.placeholder}
                />
                <Text
                  style={[styles.metaText, { color: theme.colors.placeholder }]}
                >
                  ${restaurant.deliveryFee.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Menu Categories */}
      <MenuCategoryList
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      {/* Menu Items */}
      <FlatList
        data={getFilteredMenuItems()}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.menuList}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Floating Cart Button */}
      <TouchableOpacity
        style={[styles.cartButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("Cart")}
      >
        <Ionicons name='cart-outline' size={24} color={theme.colors.white} />
        <Text style={styles.cartButtonText}>View Cart</Text>
      </TouchableOpacity>

      {/* Item Details Modal */}
      {renderItemModal()}
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
  restaurantHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restaurantLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  restaurantInfo: {
    marginLeft: 12,
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  restaurantMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  menuList: {
    padding: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "90%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20, // For bottom area (notch) on newer iPhones
  },
  modalHeader: {
    padding: 16,
    alignItems: "flex-end",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  modalContent: {
    flex: 1,
  },
  itemImage: {
    width: "100%",
    height: 250,
  },
  itemDetails: {
    padding: 16,
  },
  itemName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
  },
  discountedPrice: {
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: "line-through",
  },
  customizationsContainer: {
    marginBottom: 24,
  },
  customizationsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  customizationSection: {
    marginBottom: 16,
  },
  customizationName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  customizationDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 14,
    fontWeight: "500",
  },
  optionPrice: {
    fontSize: 12,
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  actionContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addToCartButton: {
    height: 56,
    borderRadius: 28,
  },
  addToCartButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MenuScreen;
