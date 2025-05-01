import { useContext } from "react";
import { OrderContext } from "../context/OrderContext";

/**
 * Custom hook to access the order context
 * @returns {Object} Order context values and methods
 */
const useOrders = () => {
  const context = useContext(OrderContext);

  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }

  return context;
};

export default useOrders;
