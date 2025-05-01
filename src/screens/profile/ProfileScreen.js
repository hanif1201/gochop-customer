import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";

const MenuItem = ({ icon, title, onPress, showBadge, theme }) => (
  <TouchableOpacity
    style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
    onPress={onPress}
  >
    <View style={styles.menuItemLeft}>
      <View
        style={[
          styles.menuIcon,
          { backgroundColor: theme.colors.primary + "10" },
        ]}
      >
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
        {title}
      </Text>
    </View>

    <View style={styles.menuItemRight}>
      {showBadge && (
        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.badgeText}>New</Text>
        </View>
      )}
      <Ionicons
        name='chevron-forward'
        size={20}
        color={theme.colors.placeholder}
      />
    </View>
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { user, isAuthenticated, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View
                style={[
                  styles.defaultImage,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.defaultImageText,
                    { color: theme.colors.white },
                  ]}
                >
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : ""}
                </Text>
              </View>
            )}

            <View style={styles.nameContainer}>
              <Text style={[styles.userName, { color: theme.colors.text }]}>
                {user?.name || "Guest User"}
              </Text>
              <Text
                style={[styles.userEmail, { color: theme.colors.placeholder }]}
              >
                {user?.email || "Sign in to your account"}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.editButton, { borderColor: theme.colors.primary }]}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Text
                style={[styles.editButtonText, { color: theme.colors.primary }]}
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Account
          </Text>

          <MenuItem
            icon='person-outline'
            title='Personal Information'
            onPress={() => navigation.navigate("EditProfile")}
            theme={theme}
          />

          <MenuItem
            icon='location-outline'
            title='Saved Addresses'
            onPress={() => navigation.navigate("Addresses")}
            theme={theme}
          />

          <MenuItem
            icon='card-outline'
            title='Payment Methods'
            onPress={() => navigation.navigate("PaymentMethods")}
            theme={theme}
          />

          <MenuItem
            icon='receipt-outline'
            title='Order History'
            onPress={() => navigation.navigate("OrderHistory")}
            theme={theme}
          />
        </View>

        {/* Preferences Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Preferences
          </Text>

          <View
            style={[
              styles.menuItem,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: theme.colors.primary + "10" },
                ]}
              >
                <Ionicons
                  name={isDarkMode ? "moon-outline" : "sunny-outline"}
                  size={18}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                Dark Mode
              </Text>
            </View>

            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{
                false: "#767577",
                true: theme.colors.primary + "80",
              }}
              thumbColor={isDarkMode ? theme.colors.primary : "#f4f3f4"}
              ios_backgroundColor='#767577'
            />
          </View>

          <MenuItem
            icon='notifications-outline'
            title='Notification Settings'
            onPress={() => navigation.navigate("Settings")}
            theme={theme}
          />

          <MenuItem
            icon='language-outline'
            title='Language'
            onPress={() => navigation.navigate("Settings")}
            theme={theme}
          />
        </View>

        {/* Support Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Support
          </Text>

          <MenuItem
            icon='help-circle-outline'
            title='Help Center'
            onPress={() => {
              // In a real app, this might open a web view or navigate to a help screen
              Alert.alert(
                "Help Center",
                "This would navigate to the help center"
              );
            }}
            theme={theme}
          />

          <MenuItem
            icon='chatbubble-outline'
            title='Contact Us'
            onPress={() => {
              // In a real app, this might open a support chat or contact form
              Alert.alert("Contact Us", "This would open a contact form");
            }}
            theme={theme}
          />

          <MenuItem
            icon='information-circle-outline'
            title='About'
            onPress={() => navigation.navigate("Settings")}
            theme={theme}
            showBadge={true}
          />
        </View>

        {/* Logout Button */}
        {isAuthenticated && (
          <TouchableOpacity
            style={[
              styles.logoutButton,
              { backgroundColor: theme.colors.error + "10" },
            ]}
            onPress={handleLogout}
          >
            <Ionicons
              name='log-out-outline'
              size={20}
              color={theme.colors.error}
            />
            <Text style={[styles.logoutText, { color: theme.colors.error }]}>
              Logout
            </Text>
          </TouchableOpacity>
        )}

        {!isAuthenticated && (
          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => navigation.navigate("Auth")}
          >
            <Ionicons name='log-in-outline' size={20} color='white' />
            <Text style={styles.loginText}>Sign In</Text>
          </TouchableOpacity>
        )}

        {/* App Version */}
        <Text style={[styles.versionText, { color: theme.colors.placeholder }]}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  defaultImageText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  nameContainer: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    padding: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    color: "white",
    fontWeight: "bold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  loginText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
    color: "white",
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    paddingBottom: 24,
  },
});

export default ProfileScreen;
