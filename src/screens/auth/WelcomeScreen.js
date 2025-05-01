import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemeContext } from "../../context/ThemeContext";

const WelcomeScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <ImageBackground
      source={require("../../../assets/images/welcome-bg.jpg")} // Make sure to create this asset
      style={styles.background}
    >
      <StatusBar
        barStyle='light-content'
        translucent={true}
        backgroundColor='transparent'
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.7)"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.logoContainer}>
            <Text style={[styles.logoText, { color: theme.colors.white }]}>
              GoChop
            </Text>
            <Text style={[styles.tagline, { color: theme.colors.white }]}>
              Delicious food delivered fast
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={[styles.buttonText, { color: theme.colors.white }]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: "transparent",
                  borderColor: theme.colors.white,
                  borderWidth: 1,
                },
              ]}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={[styles.buttonText, { color: theme.colors.white }]}>
                Create Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => navigation.navigate("Main")}
            >
              <Text
                style={[styles.skipButtonText, { color: theme.colors.white }]}
              >
                Continue as Guest
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradient: {
    flex: 1,
    justifyContent: "space-between",
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 120,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
  },
  logoText: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 16,
  },
  tagline: {
    fontSize: 18,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "100%",
    height: 56,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  skipButton: {
    marginTop: 8,
    padding: 8,
  },
  skipButtonText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default WelcomeScreen;
