import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemeContext } from "../../context/ThemeContext";
import { OrderContext } from "../../context/OrderContext";
import EmptyState from "../../components/common/EmptyState";

const OrderHistoryItem = ({ order, onPress, theme }) => {
  const getStatusStyle = () => {
    switch (order.status) {
      case "delivered":
        return { color: theme.colors.success };
      case "cancelled":
        return { color: theme.colors.error };
      case "on_the_way":
      case "picked_up":
        return { color: theme.colors.primary };
      default:
        return { color: theme.colors.info };
    }
  };

  const getStatusText = () => {
    switch (order.status) {
      case "pending":
        return "Pending";
      case "accepted":
        return "Confirmed";
      case "preparing":
        return "Preparing";
      case "ready_for_pickup":
        return "Ready for pickup";
      case "assigned_to_rider":
        return "Rider assigned";
      case "picked_up":
        return "Picked up";
      case "on_the_way":
        return "On the way";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return order.status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    // Format: May 1, 2025 at 2:30 PM
    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TouchableOpacity
      style={[styles.orderItem, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={[styles.orderNumber, { color: theme.colors.text }]}>
            #{order.orderNumber || order._id.slice(-6).toUpperCase()}
          </Text>
          <Text style={[styles.orderDate, { color: theme.colors.placeholder }]}>
            {formatDate(order.createdAt)}
          </Text>
        </View>
        <Text style={[styles.orderStatus, getStatusStyle()]}>
          {getStatusText()}
        </Text>
      </View>

      <View style={styles.restaurantInfo}>
        <Text style={[styles.restaurantName, { color: theme.colors.text }]}>
          {order.restaurant?.name || "Restaurant"}
        </Text>
        <Text style={[styles.itemCount, { color: theme.colors.placeholder }]}>
          {order.items?.length || 0}{" "}
          {order.items?.length === 1 ? "item" : "items"}
        </Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={[styles.totalLabel, { color: theme.colors.placeholder }]}>
          Total:
        </Text>
        <Text style={[styles.totalAmount, { color: theme.colors.text }]}>
          ${order.total.toFixed(2)}
        </Text>
        <View style={styles.spacer} />
        <Ionicons
          name='chevron-forward'
          size={20}
          color={theme.colors.placeholder}
        />
      </View>
    </TouchableOpacity>
  );
};

const OrderHistoryScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { fetchAllOrders, isLoading } = useContext(OrderContext);

  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // all, active, completed

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const result = await fetchAllOrders();

      if (result.success) {
        setOrders(result.orders);
      } else {
        setError("Failed to load orders");
      }
    } catch (err) {
      console.error("Error loading orders:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleOrderPress = (order) => {
    navigation.navigate("OrderDetails", {
      orderId: order._id,
      orderNumber: order.orderNumber || order._id.slice(-6).toUpperCase(),
    });
  };

  const getFilteredOrders = () => {
    switch (activeTab) {
      case "active":
        return orders.filter(
          (order) => !["delivered", "cancelled"].includes(order.status)
        );
      case "completed":
        return orders.filter((order) =>
          ["delivered", "cancelled"].includes(order.status)
        );
      default:
        return orders;
    }
  };

  const renderEmptyState = () => (
    <EmptyState
      icon='receipt-outline'
      title='No orders found'
      description={
        activeTab === "all"
          ? "You haven't placed any orders yet."
          : activeTab === "active"
          ? "You don't have any active orders."
          : "You don't have any completed orders."
      }
      buttonTitle='Browse Restaurants'
      onButtonPress={() => navigation.navigate("HomeTab")}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "all" && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("all")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "all"
                    ? theme.colors.primary
                    : theme.colors.text,
                fontWeight: activeTab === "all" ? "bold" : "normal",
              },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "active" && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "active"
                    ? theme.colors.primary
                    : theme.colors.text,
                fontWeight: activeTab === "active" ? "bold" : "normal",
              },
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "completed" && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("completed")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "completed"
                    ? theme.colors.primary
                    : theme.colors.text,
                fontWeight: activeTab === "completed" ? "bold" : "normal",
              },
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading orders...
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
            onPress={loadOrders}
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
          data={getFilteredOrders()}
          renderItem={({ item }) => (
            <OrderHistoryItem
              order={item}
              onPress={() => handleOrderPress(item)}
              theme={theme}
            />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  orderItem: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  orderDate: {
    fontSize: 12,
    marginTop: 2,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  restaurantInfo: {
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 14,
    marginBottom: 2,
  },
  itemCount: {
    fontSize: 12,
  },
  orderFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  totalLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  spacer: {
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
});

export default OrderHistoryScreen;
