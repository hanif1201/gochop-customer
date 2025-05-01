import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from storage when app starts
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveCart();
    }
  }, [cartItems, restaurant, isLoading]);

  // Load cart from AsyncStorage
  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem("cart");
      const savedRestaurant = await AsyncStorage.getItem("cartRestaurant");

      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }

      if (savedRestaurant) {
        setRestaurant(JSON.parse(savedRestaurant));
      }
    } catch (error) {
      console.error("Error loading cart from storage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save cart to AsyncStorage
  const saveCart = async () => {
    try {
      await AsyncStorage.setItem("cart", JSON.stringify(cartItems));
      await AsyncStorage.setItem("cartRestaurant", JSON.stringify(restaurant));
    } catch (error) {
      console.error("Error saving cart to storage:", error);
    }
  };

  // Add item to cart
  const addToCart = (item, newRestaurant) => {
    // Check if adding from a different restaurant
    if (restaurant && newRestaurant && restaurant.id !== newRestaurant.id) {
      // Ask user if they want to clear the cart
      return {
        success: false,
        needsConfirmation: true,
        message:
          "You have items in your cart from another restaurant. Would you like to clear your cart and add this item?",
        restaurantName: restaurant.name,
        newRestaurantName: newRestaurant.name,
      };
    }

    // If cart is empty, set the restaurant
    if (!restaurant && newRestaurant) {
      setRestaurant(newRestaurant);
    }

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(
      (cartItem) =>
        cartItem.id === item.id &&
        JSON.stringify(cartItem.customizations) ===
          JSON.stringify(item.customizations)
    );

    let updatedCartItems;

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity += item.quantity;
      updatedCartItems[existingItemIndex].subtotal =
        updatedCartItems[existingItemIndex].price *
        updatedCartItems[existingItemIndex].quantity;

      // Add customization costs if any
      if (
        updatedCartItems[existingItemIndex].customizations &&
        updatedCartItems[existingItemIndex].customizations.length > 0
      ) {
        updatedCartItems[existingItemIndex].customizations.forEach(
          (customization) => {
            customization.options.forEach((option) => {
              updatedCartItems[existingItemIndex].subtotal +=
                option.price * updatedCartItems[existingItemIndex].quantity;
            });
          }
        );
      }
    } else {
      // Add new item
      updatedCartItems = [...cartItems, item];
    }

    setCartItems(updatedCartItems);

    Toast.show({
      type: "success",
      text1: "Added to Cart",
      text2: `${item.name} added to your cart`,
    });

    return { success: true };
  };

  // Handle confirmation to clear cart and add new item
  const confirmClearCartAndAdd = (item, newRestaurant) => {
    setCartItems([item]);
    setRestaurant(newRestaurant);

    Toast.show({
      type: "success",
      text1: "Cart Updated",
      text2: `Cart cleared and ${item.name} added`,
    });

    return { success: true };
  };

  // Remove item from cart
  const removeFromCart = (index) => {
    const updatedCartItems = [...cartItems];
    const removedItem = updatedCartItems[index];
    updatedCartItems.splice(index, 1);

    setCartItems(updatedCartItems);

    // If cart is empty, clear restaurant
    if (updatedCartItems.length === 0) {
      setRestaurant(null);
    }

    Toast.show({
      type: "info",
      text1: "Removed from Cart",
      text2: `${removedItem.name} removed from your cart`,
    });

    return { success: true };
  };

  // Update item quantity in cart
  const updateItemQuantity = (index, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(index);
    }

    const updatedCartItems = [...cartItems];
    updatedCartItems[index].quantity = quantity;

    // Recalculate subtotal
    updatedCartItems[index].subtotal = updatedCartItems[index].price * quantity;

    // Add customization costs if any
    if (
      updatedCartItems[index].customizations &&
      updatedCartItems[index].customizations.length > 0
    ) {
      updatedCartItems[index].customizations.forEach((customization) => {
        customization.options.forEach((option) => {
          updatedCartItems[index].subtotal += option.price * quantity;
        });
      });
    }

    setCartItems(updatedCartItems);
    return { success: true };
  };

  // Clear the entire cart
  const clearCart = () => {
    setCartItems([]);
    setRestaurant(null);

    Toast.show({
      type: "info",
      text1: "Cart Cleared",
      text2: "All items have been removed from your cart",
    });

    return { success: true };
  };

  // Calculate cart totals
  const getCartTotals = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + item.subtotal,
      0
    );

    // Calculate delivery fee if restaurant data is available
    let deliveryFee = 0;
    if (restaurant && restaurant.deliveryFee !== undefined) {
      deliveryFee = restaurant.deliveryFee;

      // Apply free delivery if order meets threshold
      if (
        restaurant.freeDeliveryThreshold &&
        subtotal >= restaurant.freeDeliveryThreshold
      ) {
        deliveryFee = 0;
      }
    }

    // Calculate tax if restaurant data is available
    let tax = 0;
    if (restaurant && restaurant.taxPercentage !== undefined) {
      tax = subtotal * (restaurant.taxPercentage / 100);
    }

    const total = subtotal + deliveryFee + tax;

    return {
      subtotal,
      deliveryFee,
      tax,
      total,
      itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
    };
  };

  // Check if cart meets minimum order amount
  const meetsMinimumOrder = () => {
    if (!restaurant || restaurant.minimumOrder === undefined) {
      return true;
    }

    const { subtotal } = getCartTotals();
    return subtotal >= restaurant.minimumOrder;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurant,
        isLoading,
        addToCart,
        confirmClearCartAndAdd,
        removeFromCart,
        updateItemQuantity,
        clearCart,
        getCartTotals,
        meetsMinimumOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
