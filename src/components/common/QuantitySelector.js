import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";

const QuantitySelector = ({
  value,
  onValueChange,
  min = 0,
  max = 10,
  size = "medium",
}) => {
  const { theme } = useContext(ThemeContext);

  const handleDecrement = () => {
    if (value > min) {
      onValueChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onValueChange(value + 1);
    }
  };

  // Determine styles based on size
  const containerStyle =
    size === "small" ? styles.smallContainer : styles.container;
  const buttonStyle = size === "small" ? styles.smallButton : styles.button;
  const textStyle = size === "small" ? styles.smallText : styles.text;
  const iconSize = size === "small" ? 16 : 20;

  return (
    <View
      style={[
        containerStyle,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <TouchableOpacity
        style={buttonStyle}
        onPress={handleDecrement}
        disabled={value <= min}
      >
        <Ionicons
          name='remove'
          size={iconSize}
          color={value <= min ? theme.colors.placeholder : theme.colors.primary}
        />
      </TouchableOpacity>

      <Text style={[textStyle, { color: theme.colors.text }]}>{value}</Text>

      <TouchableOpacity
        style={buttonStyle}
        onPress={handleIncrement}
        disabled={value >= max}
      >
        <Ionicons
          name='add'
          size={iconSize}
          color={value >= max ? theme.colors.placeholder : theme.colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    height: 36,
  },
  smallContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 6,
    overflow: "hidden",
    height: 28,
  },
  button: {
    height: "100%",
    width: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  smallButton: {
    height: "100%",
    width: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 30,
    textAlign: "center",
  },
  smallText: {
    fontSize: 14,
    fontWeight: "bold",
    minWidth: 24,
    textAlign: "center",
  },
});

export default QuantitySelector;
