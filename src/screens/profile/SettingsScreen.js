import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
  Modal,
  Picker,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Divider, Button } from "react-native-elements";

import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";

const SettingsScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme, syncWithDevice, toggleSync } =
    useContext(ThemeContext);
  const { isAuthenticated } = useContext(AuthContext);

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [promotionNotifications, setPromotionNotifications] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [language, setLanguage] = useState("english");

  const languages = [
    { code: "english", label: "English" },
    { code: "french", label: "Français" },
    { code: "spanish", label: "Español" },
    { code: "yoruba", label: "Yorùbá" },
    { code: "hausa", label: "Hausa" },
    { code: "igbo", label: "Igbo" },
  ];

  const handleSavePreferences = () => {
    Alert.alert("Success", "Your settings have been saved successfully");
  };

  const renderSwitchItem = (title, description, value, onValueChange) => (
    <View
      style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
    >
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        {description && (
          <Text
            style={[
              styles.settingDescription,
              { color: theme.colors.placeholder },
            ]}
          >
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: "#767577",
          true: theme.colors.primary + "80",
        }}
        thumbColor={value ? theme.colors.primary : "#f4f3f4"}
        ios_backgroundColor='#767577'
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Theme Settings */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Appearance
          </Text>

          {renderSwitchItem(
            "Dark Mode",
            "Toggle between light and dark theme",
            isDarkMode,
            toggleTheme
          )}

          {renderSwitchItem(
            "Use Device Settings",
            "Follow your device's theme settings",
            syncWithDevice,
            toggleSync
          )}

          <TouchableOpacity
            style={[
              styles.settingItem,
              { borderBottomColor: theme.colors.border },
            ]}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                Language
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: theme.colors.placeholder },
                ]}
              >
                Choose your preferred language
              </Text>
            </View>
            <View style={styles.valueContainer}>
              <Text
                style={[styles.valueText, { color: theme.colors.placeholder }]}
              >
                {languages.find((lang) => lang.code === language)?.label ||
                  "English"}
              </Text>
              <Ionicons
                name='chevron-forward'
                size={20}
                color={theme.colors.placeholder}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Notification Settings */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Notifications
          </Text>

          {renderSwitchItem(
            "Push Notifications",
            "Receive push notifications on your device",
            pushNotifications,
            setPushNotifications
          )}

          {renderSwitchItem(
            "Email Notifications",
            "Receive notifications via email",
            emailNotifications,
            setEmailNotifications
          )}

          {renderSwitchItem(
            "Order Updates",
            "Get notified about your order status",
            orderNotifications,
            setOrderNotifications
          )}

          {renderSwitchItem(
            "Promotions and Offers",
            "Receive notifications about special offers",
            promotionNotifications,
            setPromotionNotifications
          )}
        </View>

        {/* Privacy Settings */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Privacy
          </Text>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { borderBottomColor: theme.colors.border },
            ]}
            onPress={() => {
              // In a real app, this would navigate to privacy policy
              Alert.alert(
                "Privacy Policy",
                "This would show the privacy policy page"
              );
            }}
          >
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                Privacy Policy
              </Text>
            </View>
            <Ionicons
              name='chevron-forward'
              size={20}
              color={theme.colors.placeholder}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { borderBottomColor: theme.colors.border },
            ]}
            onPress={() => {
              // In a real app, this would navigate to terms and conditions
              Alert.alert(
                "Terms and Conditions",
                "This would show the terms and conditions page"
              );
            }}
          >
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                Terms and Conditions
              </Text>
            </View>
            <Ionicons
              name='chevron-forward'
              size={20}
              color={theme.colors.placeholder}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { borderBottomColor: theme.colors.border },
            ]}
            onPress={() => {
              // In a real app, this would navigate to data management page
              Alert.alert(
                "Data Management",
                "This would show the data management page"
              );
            }}
          >
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                Manage My Data
              </Text>
            </View>
            <Ionicons
              name='chevron-forward'
              size={20}
              color={theme.colors.placeholder}
            />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            About
          </Text>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { borderBottomColor: theme.colors.border },
            ]}
            onPress={() => {
              // In a real app, this would navigate to about page
              Alert.alert("About", "This would show the about page");
            }}
          >
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                About GoChop
              </Text>
            </View>
            <Ionicons
              name='chevron-forward'
              size={20}
              color={theme.colors.placeholder}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { borderBottomColor: theme.colors.border },
            ]}
            onPress={() => {
              // In a real app, this would show app version information
              Alert.alert(
                "App Version",
                "Version: 1.0.0\nBuild: 102\nReleased: May 1, 2025"
              );
            }}
          >
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                App Version
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: theme.colors.placeholder },
                ]}
              >
                1.0.0
              </Text>
            </View>
            <Ionicons
              name='chevron-forward'
              size={20}
              color={theme.colors.placeholder}
            />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <Button
          title='Save Preferences'
          onPress={handleSavePreferences}
          buttonStyle={[
            styles.saveButton,
            { backgroundColor: theme.colors.primary },
          ]}
          containerStyle={styles.saveButtonContainer}
          titleStyle={styles.saveButtonText}
        />
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType='slide'
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Select Language
              </Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name='close' size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    language === lang.code && {
                      backgroundColor: theme.colors.primary + "20",
                    },
                  ]}
                  onPress={() => {
                    setLanguage(lang.code);
                    setShowLanguageModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.languageText,
                      {
                        color:
                          language === lang.code
                            ? theme.colors.primary
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {lang.label}
                  </Text>
                  {language === lang.code && (
                    <Ionicons
                      name='checkmark'
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  valueText: {
    fontSize: 16,
    marginRight: 8,
  },
  saveButtonContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  saveButton: {
    height: 48,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
  },
  modalContent: {
    borderRadius: 12,
    padding: 16,
    maxHeight: "70%",
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
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  languageText: {
    fontSize: 16,
  },
});

export default SettingsScreen;
