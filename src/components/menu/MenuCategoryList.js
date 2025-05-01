import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { ThemeContext } from "../../context/ThemeContext";

const MenuCategoryList = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { theme } = useContext(ThemeContext);

  if (!categories || categories.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                { color: theme.colors.text },
                selectedCategory === category && { color: "white" },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: "transparent",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default MenuCategoryList;
