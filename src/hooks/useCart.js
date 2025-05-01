import { useContext } from "react";
import { CartContext } from "../context/CartContext";

/**
 * Custom hook to access the cart context
 * @returns {Object} Cart context values and methods
 */
const useCart = () => {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};

export default useCart;
