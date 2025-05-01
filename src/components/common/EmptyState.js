import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "react-native-elements";
import { ThemeContext } from "../../context/ThemeContext";

const EmptyState = ({
  icon,
  title,
  description,
  buttonTitle,
  onButtonPress,
  iconSize = 80,
  showButton = true,
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Ionicons
        name={icon || "alert-circle-outline"}
        size={iconSize}
        color={theme.colors.placeholder}
      />

      <Text style={[styles.title, { color: theme.colors.text }]}>
        {title || "Nothing to see here"}
      </Text>

      {description && (
        <Text style={[styles.description, { color: theme.colors.placeholder }]}>
          {description}
        </Text>
      )}

      {showButton && buttonTitle && (
        <Button
          title={buttonTitle}
          onPress={onButtonPress}
          buttonStyle={[
            styles.button,
            { backgroundColor: theme.colors.primary },
          ]}
          titleStyle={styles.buttonText}
          containerStyle={styles.buttonContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  buttonContainer: {
    width: "80%",
    maxWidth: 280,
  },
  button: {
    height: 48,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EmptyState;
