import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Button } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import userAPI from "../../api/user";
import EmptyState from "../../components/common/EmptyState";

const AddressScreen = ({ navigation, route }) => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
    isDefault: false,
  });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const returnToScreen = route.params?.returnTo;

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getSavedAddresses();

      if (response.success) {
        setAddresses(response.data);
      } else {
        setError("Failed to load addresses");
      }
    } catch (err) {
      console.error("Error loading addresses:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    resetAddressForm();
    setEditMode(false);
    setShowAddressModal(true);
  };

  const handleEditAddress = (address) => {
    setNewAddress({
      name: address.name || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "Nigeria",
      isDefault: address.isDefault || false,
    });
    setSelectedAddressId(address._id);
    setEditMode(true);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = (addressId) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingAddress(true);
              setSelectedAddressId(addressId);

              const response = await userAPI.removeAddress(addressId);

              if (response.success) {
                // Remove from state
                setAddresses(
                  addresses.filter((addr) => addr._id !== addressId)
                );
                Alert.alert("Success", "Address deleted successfully");
              } else {
                Alert.alert("Error", "Failed to delete address");
              }
            } catch (err) {
              console.error("Error deleting address:", err);
              Alert.alert("Error", "Failed to delete address");
            } finally {
              setDeletingAddress(false);
              setSelectedAddressId(null);
            }
          },
        },
      ]
    );
  };

  const handleSaveAddress = async () => {
    // Basic validation
    if (!newAddress.name || !newAddress.line1 || !newAddress.city) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    try {
      setSavingAddress(true);

      // Format address into expected structure for API
      const addressData = {
        ...newAddress,
        fullAddress: `${newAddress.line1}, ${
          newAddress.line2 ? newAddress.line2 + ", " : ""
        }${newAddress.city}, ${newAddress.state}, ${newAddress.postalCode}, ${
          newAddress.country
        }`,
      };

      let response;

      if (editMode && selectedAddressId) {
        // Update existing address
        response = await userAPI.updateAddress(selectedAddressId, addressData);
      } else {
        // Add new address
        response = await userAPI.addAddress(addressData);
      }

      if (response.success) {
        await loadAddresses();
        setShowAddressModal(false);

        Alert.alert(
          "Success",
          editMode
            ? "Address updated successfully"
            : "Address added successfully"
        );

        // If returning to another screen, navigate back with selected address
        if (returnToScreen && !editMode) {
          navigation.navigate(returnToScreen, {
            selectedAddress: response.data,
          });
        }
      } else {
        Alert.alert(
          "Error",
          editMode ? "Failed to update address" : "Failed to add address"
        );
      }
    } catch (err) {
      console.error("Error saving address:", err);
      Alert.alert(
        "Error",
        editMode ? "Failed to update address" : "Failed to add address"
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      setLoadingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to get your current location"
        );
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      // Reverse geocode to get address details
      const result = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (result.length > 0) {
        const address = result[0];

        setNewAddress({
          ...newAddress,
          line1: address.street || "",
          line2: address.district || "",
          city: address.city || "",
          state: address.region || "",
          postalCode: address.postalCode || "",
          country: address.country || "Nigeria",
        });
      }
    } catch (err) {
      console.error("Error getting location:", err);
      Alert.alert("Error", "Failed to get your location");
    } finally {
      setLoadingLocation(false);
    }
  };

  const resetAddressForm = () => {
    setNewAddress({
      name: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Nigeria",
      isDefault: false,
    });
    setSelectedAddressId(null);
  };

  const renderAddressItem = ({ item }) => (
    <View style={[styles.addressItem, { backgroundColor: theme.colors.card }]}>
      <View style={styles.addressInfo}>
        <View style={styles.addressHeader}>
          <Text style={[styles.addressName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          {item.isDefault && (
            <View
              style={[
                styles.defaultBadge,
                { backgroundColor: theme.colors.primary + "20" },
              ]}
            >
              <Text
                style={[styles.defaultText, { color: theme.colors.primary }]}
              >
                Default
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.addressText, { color: theme.colors.text }]}>
          {item.fullAddress ||
            `${item.line1}, ${item.line2 ? item.line2 + ", " : ""}${
              item.city
            }, ${item.state}, ${item.postalCode}, ${item.country}`}
        </Text>
      </View>

      <View style={styles.addressActions}>
        <TouchableOpacity
          style={[
            styles.addressAction,
            { backgroundColor: theme.colors.primary + "10" },
          ]}
          onPress={() => handleEditAddress(item)}
        >
          <Ionicons name='pencil' size={18} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.addressAction,
            { backgroundColor: theme.colors.error + "10" },
          ]}
          onPress={() => handleDeleteAddress(item._id)}
          disabled={deletingAddress && selectedAddressId === item._id}
        >
          {deletingAddress && selectedAddressId === item._id ? (
            <ActivityIndicator size='small' color={theme.colors.error} />
          ) : (
            <Ionicons name='trash' size={18} color={theme.colors.error} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon='location-outline'
      title='No saved addresses'
      description='Add your delivery addresses to speed up checkout'
      buttonTitle='Add Address'
      onButtonPress={handleAddAddress}
    />
  );

  const renderAddressModal = () => (
    <Modal
      visible={showAddressModal}
      animationType='slide'
      transparent={true}
      onRequestClose={() => setShowAddressModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View
          style={[styles.modalContent, { backgroundColor: theme.colors.card }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editMode ? "Edit Address" : "Add New Address"}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAddressModal(false)}
            >
              <Ionicons
                name='close-outline'
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalForm}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Address Name*
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder='Home, Work, etc.'
                placeholderTextColor={theme.colors.placeholder}
                value={newAddress.name}
                onChangeText={(text) =>
                  setNewAddress({ ...newAddress, name: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Address Line 1*
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder='Street address'
                placeholderTextColor={theme.colors.placeholder}
                value={newAddress.line1}
                onChangeText={(text) =>
                  setNewAddress({ ...newAddress, line1: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Address Line 2
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder='Apartment, suite, etc.'
                placeholderTextColor={theme.colors.placeholder}
                value={newAddress.line2}
                onChangeText={(text) =>
                  setNewAddress({ ...newAddress, line2: text })
                }
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  City*
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  placeholder='City'
                  placeholderTextColor={theme.colors.placeholder}
                  value={newAddress.city}
                  onChangeText={(text) =>
                    setNewAddress({ ...newAddress, city: text })
                  }
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  State
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  placeholder='State'
                  placeholderTextColor={theme.colors.placeholder}
                  value={newAddress.state}
                  onChangeText={(text) =>
                    setNewAddress({ ...newAddress, state: text })
                  }
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Postal Code
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  placeholder='Postal code'
                  placeholderTextColor={theme.colors.placeholder}
                  value={newAddress.postalCode}
                  onChangeText={(text) =>
                    setNewAddress({ ...newAddress, postalCode: text })
                  }
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Country
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  placeholder='Country'
                  placeholderTextColor={theme.colors.placeholder}
                  value={newAddress.country}
                  onChangeText={(text) =>
                    setNewAddress({ ...newAddress, country: text })
                  }
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.locationButton,
                { borderColor: theme.colors.primary },
              ]}
              onPress={handleGetCurrentLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator size='small' color={theme.colors.primary} />
              ) : (
                <>
                  <Ionicons
                    name='location'
                    size={18}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.locationButtonText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Use Current Location
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() =>
                  setNewAddress({
                    ...newAddress,
                    isDefault: !newAddress.isDefault,
                  })
                }
              >
                <View
                  style={[
                    styles.checkboxInner,
                    {
                      borderColor: theme.colors.primary,
                      backgroundColor: newAddress.isDefault
                        ? theme.colors.primary
                        : "transparent",
                    },
                  ]}
                >
                  {newAddress.isDefault && (
                    <Ionicons name='checkmark' size={14} color='white' />
                  )}
                </View>
              </TouchableOpacity>
              <Text
                style={[styles.checkboxLabel, { color: theme.colors.text }]}
              >
                Set as default address
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            <Button
              title='Cancel'
              onPress={() => setShowAddressModal(false)}
              buttonStyle={[
                styles.cancelButton,
                {
                  backgroundColor: "transparent",
                  borderColor: theme.colors.border,
                },
              ]}
              titleStyle={[
                styles.cancelButtonText,
                { color: theme.colors.text },
              ]}
              containerStyle={styles.buttonContainer}
              type='outline'
            />

            <Button
              title={editMode ? "Update" : "Save"}
              onPress={handleSaveAddress}
              loading={savingAddress}
              buttonStyle={[
                styles.saveButton,
                { backgroundColor: theme.colors.primary },
              ]}
              titleStyle={styles.saveButtonText}
              containerStyle={styles.buttonContainer}
              disabled={savingAddress}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading addresses...
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
            onPress={loadAddresses}
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
          <FlatList
            data={addresses}
            renderItem={renderAddressItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyState()}
          />

          <TouchableOpacity
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            onPress={handleAddAddress}
          >
            <Ionicons name='add' size={24} color='white' />
          </TouchableOpacity>
        </>
      )}

      {renderAddressModal()}
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
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  addressItem: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addressInfo: {
    flex: 1,
    marginRight: 12,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  addressActions: {
    justifyContent: "center",
  },
  addressAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    right: 16,
    bottom: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  modalForm: {
    paddingBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxLabel: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  saveButton: {
    height: 48,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});

export default AddressScreen;
