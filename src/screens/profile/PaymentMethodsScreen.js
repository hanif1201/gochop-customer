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
import { ThemeContext } from "../../context/ThemeContext";
import EmptyState from "../../components/common/EmptyState";

// Mock payment methods service (in a real app, this would be an API call)
const mockPaymentMethodsService = {
  getPaymentMethods: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            {
              _id: "1",
              type: "card",
              brand: "Visa",
              lastDigits: "4242",
              expiryMonth: 12,
              expiryYear: 25,
              isDefault: true,
              billingAddress: {
                name: "John Doe",
                line1: "123 Main St",
                city: "Ibadan",
                state: "Oyo",
                postalCode: "200001",
                country: "Nigeria",
              },
            },
            {
              _id: "2",
              type: "card",
              brand: "Mastercard",
              lastDigits: "8210",
              expiryMonth: 6,
              expiryYear: 26,
              isDefault: false,
              billingAddress: {
                name: "John Doe",
                line1: "456 Oak Ave",
                city: "Ibadan",
                state: "Oyo",
                postalCode: "200001",
                country: "Nigeria",
              },
            },
          ],
        });
      }, 1000);
    });
  },
  addPaymentMethod: (paymentData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            _id: "3",
            type: "card",
            brand: paymentData.cardType || "Visa",
            lastDigits: paymentData.cardNumber.slice(-4),
            expiryMonth: parseInt(paymentData.expiryMonth),
            expiryYear: parseInt(paymentData.expiryYear),
            isDefault: paymentData.isDefault,
            billingAddress: paymentData.billingAddress,
          },
        });
      }, 1000);
    });
  },
  removePaymentMethod: (paymentId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
        });
      }, 1000);
    });
  },
  setDefaultPaymentMethod: (paymentId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
        });
      }, 1000);
    });
  },
};

const PaymentMethodsScreen = ({ navigation, route }) => {
  const { theme } = useContext(ThemeContext);
  const returnToScreen = route.params?.returnTo;

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  const [paymentData, setPaymentData] = useState({
    cardHolderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    isDefault: false,
    billingAddress: {
      name: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Nigeria",
    },
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await mockPaymentMethodsService.getPaymentMethods();

      if (response.success) {
        setPaymentMethods(response.data);
      } else {
        setError("Failed to load payment methods");
      }
    } catch (err) {
      console.error("Error loading payment methods:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    resetPaymentForm();
    setShowAddModal(true);
  };

  const resetPaymentForm = () => {
    setPaymentData({
      cardHolderName: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      isDefault: false,
      billingAddress: {
        name: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Nigeria",
      },
    });
  };

  const handleDeletePaymentMethod = (paymentId) => {
    Alert.alert(
      "Delete Payment Method",
      "Are you sure you want to delete this payment method?",
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
              setDeletingPayment(true);
              setSelectedPaymentId(paymentId);

              const response =
                await mockPaymentMethodsService.removePaymentMethod(paymentId);

              if (response.success) {
                // Remove from state
                setPaymentMethods(
                  paymentMethods.filter((pm) => pm._id !== paymentId)
                );
                Alert.alert("Success", "Payment method deleted successfully");
              } else {
                Alert.alert("Error", "Failed to delete payment method");
              }
            } catch (err) {
              console.error("Error deleting payment method:", err);
              Alert.alert("Error", "Failed to delete payment method");
            } finally {
              setDeletingPayment(false);
              setSelectedPaymentId(null);
            }
          },
        },
      ]
    );
  };

  const handleSetDefaultPaymentMethod = async (paymentId) => {
    try {
      const response = await mockPaymentMethodsService.setDefaultPaymentMethod(
        paymentId
      );

      if (response.success) {
        // Update state
        const updatedPaymentMethods = paymentMethods.map((pm) => ({
          ...pm,
          isDefault: pm._id === paymentId,
        }));

        setPaymentMethods(updatedPaymentMethods);
        Alert.alert("Success", "Default payment method updated");
      } else {
        Alert.alert("Error", "Failed to update default payment method");
      }
    } catch (err) {
      console.error("Error setting default payment method:", err);
      Alert.alert("Error", "Failed to update default payment method");
    }
  };

  const validateCardNumber = (cardNumber) => {
    // Basic validation - remove spaces and ensure 16 digits
    const cleaned = cardNumber.replace(/\s+/g, "");
    return cleaned.length === 16 && /^\d+$/.test(cleaned);
  };

  const validateExpiryDate = (month, year) => {
    if (!month || !year) return false;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last two digits
    const currentMonth = currentDate.getMonth() + 1; // 1-12

    const expiryMonth = parseInt(month);
    const expiryYear = parseInt(year);

    // Check if month is valid
    if (expiryMonth < 1 || expiryMonth > 12) return false;

    // Check if expiry date is in the past
    if (
      expiryYear < currentYear ||
      (expiryYear === currentYear && expiryMonth < currentMonth)
    ) {
      return false;
    }

    return true;
  };

  const handleSavePaymentMethod = async () => {
    // Basic validation
    if (
      !paymentData.cardHolderName ||
      !paymentData.cardNumber ||
      !paymentData.expiryMonth ||
      !paymentData.expiryYear ||
      !paymentData.cvv
    ) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    if (!validateCardNumber(paymentData.cardNumber)) {
      Alert.alert(
        "Invalid Card Number",
        "Please enter a valid 16-digit card number"
      );
      return;
    }

    if (!validateExpiryDate(paymentData.expiryMonth, paymentData.expiryYear)) {
      Alert.alert("Invalid Expiry Date", "Please enter a valid expiry date");
      return;
    }

    try {
      setSavingPayment(true);

      // Format the data for API
      const cardType = getCardType(paymentData.cardNumber);

      const formattedData = {
        ...paymentData,
        cardType,
      };

      const response = await mockPaymentMethodsService.addPaymentMethod(
        formattedData
      );

      if (response.success) {
        // If this is the first payment method, set as default
        if (paymentMethods.length === 0) {
          response.data.isDefault = true;
        }

        // If set as default, update other payment methods
        if (formattedData.isDefault) {
          const updatedExisting = paymentMethods.map((pm) => ({
            ...pm,
            isDefault: false,
          }));

          setPaymentMethods([...updatedExisting, response.data]);
        } else {
          setPaymentMethods([...paymentMethods, response.data]);
        }

        setShowAddModal(false);

        Alert.alert("Success", "Payment method added successfully");

        // If returning to another screen, navigate back with selected payment method
        if (returnToScreen) {
          navigation.navigate(returnToScreen, {
            selectedPaymentMethod: response.data,
          });
        }
      } else {
        Alert.alert("Error", "Failed to add payment method");
      }
    } catch (err) {
      console.error("Error adding payment method:", err);
      Alert.alert("Error", "Failed to add payment method");
    } finally {
      setSavingPayment(false);
    }
  };

  const getCardType = (cardNumber) => {
    const firstDigit = cardNumber.charAt(0);
    const firstTwoDigits = parseInt(cardNumber.substring(0, 2));

    if (firstDigit === "4") return "Visa";
    if (firstTwoDigits >= 51 && firstTwoDigits <= 55) return "Mastercard";
    if (firstTwoDigits === 34 || firstTwoDigits === 37)
      return "American Express";
    if (firstTwoDigits === 62) return "UnionPay";

    return "Unknown";
  };

  const formatCardNumber = (number) => {
    // Format as 4 groups of 4 digits
    const cleaned = number.replace(/\s+/g, "");
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };

  const renderPaymentItem = ({ item }) => (
    <View style={[styles.paymentItem, { backgroundColor: theme.colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={styles.brandContainer}>
          <Ionicons
            name={getBrandIcon(item.brand)}
            size={24}
            color={theme.colors.primary}
          />
          <Text style={[styles.brandText, { color: theme.colors.text }]}>
            {item.brand}
          </Text>
        </View>

        {item.isDefault && (
          <View
            style={[
              styles.defaultBadge,
              { backgroundColor: theme.colors.primary + "20" },
            ]}
          >
            <Text style={[styles.defaultText, { color: theme.colors.primary }]}>
              Default
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.cardNumber, { color: theme.colors.text }]}>
        •••• •••• •••• {item.lastDigits}
      </Text>

      <Text style={[styles.expiryDate, { color: theme.colors.placeholder }]}>
        Expires {item.expiryMonth}/{item.expiryYear}
      </Text>

      <View style={styles.cardActions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={[
              styles.setDefaultButton,
              { backgroundColor: theme.colors.primary + "10" },
            ]}
            onPress={() => handleSetDefaultPaymentMethod(item._id)}
          >
            <Text
              style={[styles.setDefaultText, { color: theme.colors.primary }]}
            >
              Set as Default
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.deleteButton,
            { backgroundColor: theme.colors.error + "10" },
          ]}
          onPress={() => handleDeletePaymentMethod(item._id)}
          disabled={deletingPayment && selectedPaymentId === item._id}
        >
          {deletingPayment && selectedPaymentId === item._id ? (
            <ActivityIndicator size='small' color={theme.colors.error} />
          ) : (
            <Ionicons name='trash' size={18} color={theme.colors.error} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const getBrandIcon = (brand) => {
    switch (brand.toLowerCase()) {
      case "visa":
        return "card-outline";
      case "mastercard":
        return "card-outline";
      case "american express":
        return "card-outline";
      default:
        return "card-outline";
    }
  };

  const renderEmptyState = () => (
    <EmptyState
      icon='card-outline'
      title='No payment methods'
      description='Add a credit or debit card to speed up checkout'
      buttonTitle='Add Payment Method'
      onButtonPress={handleAddPaymentMethod}
    />
  );

  const renderAddPaymentModal = () => (
    <Modal
      visible={showAddModal}
      animationType='slide'
      transparent={true}
      onRequestClose={() => setShowAddModal(false)}
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
              Add Payment Method
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAddModal(false)}
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
                Cardholder Name*
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
                placeholder='Name on card'
                placeholderTextColor={theme.colors.placeholder}
                value={paymentData.cardHolderName}
                onChangeText={(text) =>
                  setPaymentData({ ...paymentData, cardHolderName: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Card Number*
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
                placeholder='1234 5678 9012 3456'
                placeholderTextColor={theme.colors.placeholder}
                value={paymentData.cardNumber}
                onChangeText={(text) => {
                  // Format the card number as user types
                  const formattedText = formatCardNumber(text);
                  setPaymentData({ ...paymentData, cardNumber: formattedText });
                }}
                keyboardType='numeric'
                maxLength={19} // 16 digits + 3 spaces
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 2, marginRight: 8 }]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Expiry Date*
                </Text>
                <View style={styles.expiryInputContainer}>
                  <TextInput
                    style={[
                      styles.expiryInput,
                      {
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    placeholder='MM'
                    placeholderTextColor={theme.colors.placeholder}
                    value={paymentData.expiryMonth}
                    onChangeText={(text) => {
                      // Allow only numbers and limit to 2 digits
                      const cleaned = text.replace(/\D/g, "").slice(0, 2);
                      setPaymentData({ ...paymentData, expiryMonth: cleaned });
                    }}
                    keyboardType='numeric'
                    maxLength={2}
                  />
                  <Text
                    style={[styles.expirySlash, { color: theme.colors.text }]}
                  >
                    /
                  </Text>
                  <TextInput
                    style={[
                      styles.expiryInput,
                      {
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    placeholder='YY'
                    placeholderTextColor={theme.colors.placeholder}
                    value={paymentData.expiryYear}
                    onChangeText={(text) => {
                      // Allow only numbers and limit to 2 digits
                      const cleaned = text.replace(/\D/g, "").slice(0, 2);
                      setPaymentData({ ...paymentData, expiryYear: cleaned });
                    }}
                    keyboardType='numeric'
                    maxLength={2}
                  />
                </View>
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  CVV*
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
                  placeholder='123'
                  placeholderTextColor={theme.colors.placeholder}
                  value={paymentData.cvv}
                  onChangeText={(text) => {
                    // Allow only numbers and limit to 4 digits (some cards have 4-digit CVV)
                    const cleaned = text.replace(/\D/g, "").slice(0, 4);
                    setPaymentData({ ...paymentData, cvv: cleaned });
                  }}
                  keyboardType='numeric'
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.sectionTitle}>
              <Text
                style={[styles.sectionTitleText, { color: theme.colors.text }]}
              >
                Billing Address
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Full Name*
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
                placeholder='Full name'
                placeholderTextColor={theme.colors.placeholder}
                value={paymentData.billingAddress.name}
                onChangeText={(text) =>
                  setPaymentData({
                    ...paymentData,
                    billingAddress: {
                      ...paymentData.billingAddress,
                      name: text,
                    },
                  })
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
                value={paymentData.billingAddress.line1}
                onChangeText={(text) =>
                  setPaymentData({
                    ...paymentData,
                    billingAddress: {
                      ...paymentData.billingAddress,
                      line1: text,
                    },
                  })
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
                value={paymentData.billingAddress.line2}
                onChangeText={(text) =>
                  setPaymentData({
                    ...paymentData,
                    billingAddress: {
                      ...paymentData.billingAddress,
                      line2: text,
                    },
                  })
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
                  value={paymentData.billingAddress.city}
                  onChangeText={(text) =>
                    setPaymentData({
                      ...paymentData,
                      billingAddress: {
                        ...paymentData.billingAddress,
                        city: text,
                      },
                    })
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
                  value={paymentData.billingAddress.state}
                  onChangeText={(text) =>
                    setPaymentData({
                      ...paymentData,
                      billingAddress: {
                        ...paymentData.billingAddress,
                        state: text,
                      },
                    })
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
                  value={paymentData.billingAddress.postalCode}
                  onChangeText={(text) =>
                    setPaymentData({
                      ...paymentData,
                      billingAddress: {
                        ...paymentData.billingAddress,
                        postalCode: text,
                      },
                    })
                  }
                  keyboardType='numeric'
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
                  value={paymentData.billingAddress.country}
                  onChangeText={(text) =>
                    setPaymentData({
                      ...paymentData,
                      billingAddress: {
                        ...paymentData.billingAddress,
                        country: text,
                      },
                    })
                  }
                />
              </View>
            </View>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() =>
                  setPaymentData({
                    ...paymentData,
                    isDefault: !paymentData.isDefault,
                  })
                }
              >
                <View
                  style={[
                    styles.checkboxInner,
                    {
                      borderColor: theme.colors.primary,
                      backgroundColor: paymentData.isDefault
                        ? theme.colors.primary
                        : "transparent",
                    },
                  ]}
                >
                  {paymentData.isDefault && (
                    <Ionicons name='checkmark' size={14} color='white' />
                  )}
                </View>
              </TouchableOpacity>
              <Text
                style={[styles.checkboxLabel, { color: theme.colors.text }]}
              >
                Set as default payment method
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            <Button
              title='Cancel'
              onPress={() => setShowAddModal(false)}
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
              title='Save'
              onPress={handleSavePaymentMethod}
              loading={savingPayment}
              buttonStyle={[
                styles.saveButton,
                { backgroundColor: theme.colors.primary },
              ]}
              titleStyle={styles.saveButtonText}
              containerStyle={styles.buttonContainer}
              disabled={savingPayment}
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
            Loading payment methods...
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
            onPress={loadPaymentMethods}
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
            data={paymentMethods}
            renderItem={renderPaymentItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyState()}
          />

          <TouchableOpacity
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            onPress={handleAddPaymentMethod}
          >
            <Ionicons name='add' size={24} color='white' />
          </TouchableOpacity>
        </>
      )}

      {renderAddPaymentModal()}
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
  paymentItem: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
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
  cardNumber: {
    fontSize: 16,
    marginBottom: 4,
  },
  expiryDate: {
    fontSize: 14,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  setDefaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  setDefaultText: {
    fontSize: 12,
    fontWeight: "500",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
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
  expiryInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
  },
  expiryInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: "center",
  },
  expirySlash: {
    fontSize: 18,
    marginHorizontal: 8,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: "bold",
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

export default PaymentMethodsScreen;
