import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";

const CategoryItem = ({ category, onPress }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      style={[styles.categoryItem, { backgroundColor: theme.colors.card }]}
      onPress={() => onPress(category.id)}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.primary + "20" },
        ]}
      >
        <Ionicons name={category.icon} size={24} color={theme.colors.primary} />
      </View>
      <Text style={[styles.categoryName, { color: theme.colors.text }]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const CategoryList = ({ categories, onCategoryPress }) => {
  const { theme } = useContext(ThemeContext);

  if (!categories || categories.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Categories
      </Text>

      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <CategoryItem category={item} onPress={onCategoryPress} />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoriesList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  categoryItem: {
    marginRight: 8,
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    width: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    textAlign: "center",
  },
});

export default CategoryList;
