import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Input, Button } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import userAPI from "../../api/user";

const EditProfileScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { user, updateProfile } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        profileImage: user.profileImage || null,
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      Keyboard.dismiss();

      // Validate form
      const newErrors = {};
      if (!formData.name) newErrors.name = "Name is required";
      if (!formData.email) newErrors.email = "Email is required";
      if (
        formData.email &&
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
      ) {
        newErrors.email = "Invalid email address";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      const result = await updateProfile(formData);

      if (result.success) {
        Alert.alert("Success", "Your profile has been updated successfully");
        navigation.goBack();
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Sorry, we need camera roll permissions to change your profile picture"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        // Upload image
        setImageLoading(true);

        // Create FormData for image upload
        const formData = new FormData();
        formData.append("profileImage", {
          uri: selectedImage.uri,
          type: "image/jpeg",
          name: "profile-image.jpg",
        });

        try {
          const response = await userAPI.uploadProfileImage(formData);

          if (response.success) {
            setFormData((prev) => ({
              ...prev,
              profileImage: response.data.profileImage,
            }));
            Alert.alert("Success", "Profile image updated successfully");
          } else {
            Alert.alert("Error", "Failed to upload image");
          }
        } catch (error) {
          Alert.alert("Error", "Failed to upload image");
          console.error("Image upload error:", error);
        } finally {
          setImageLoading(false);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong when selecting image");
      console.error("Image picker error:", error);
      setImageLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.imageContainer}>
            {imageLoading ? (
              <View
                style={[
                  styles.profileImagePlaceholder,
                  { backgroundColor: theme.colors.card },
                ]}
              >
                <ActivityIndicator size='large' color={theme.colors.primary} />
              </View>
            ) : formData.profileImage ? (
              <Image
                source={{ uri: formData.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View
                style={[
                  styles.profileImagePlaceholder,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.placeholderText,
                    { color: theme.colors.white },
                  ]}
                >
                  {formData.name
                    ? formData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : ""}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.changeImageButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleImagePicker}
              disabled={imageLoading}
            >
              <Ionicons name='camera' size={20} color='white' />
            </TouchableOpacity>
          </View>

          <Input
            placeholder='Full Name'
            leftIcon={
              <Ionicons
                name='person-outline'
                size={20}
                color={theme.colors.placeholder}
              />
            }
            value={formData.name}
            onChangeText={(text) => {
              setFormData({ ...formData, name: text });
              if (errors.name) {
                setErrors({ ...errors, name: null });
              }
            }}
            errorMessage={errors.name}
            inputStyle={{ color: theme.colors.text }}
            containerStyle={styles.inputContainer}
          />

          <Input
            placeholder='Email'
            leftIcon={
              <Ionicons
                name='mail-outline'
                size={20}
                color={theme.colors.placeholder}
              />
            }
            value={formData.email}
            onChangeText={(text) => {
              setFormData({ ...formData, email: text });
              if (errors.email) {
                setErrors({ ...errors, email: null });
              }
            }}
            keyboardType='email-address'
            autoCapitalize='none'
            errorMessage={errors.email}
            inputStyle={{ color: theme.colors.text }}
            containerStyle={styles.inputContainer}
          />

          <Input
            placeholder='Phone Number'
            leftIcon={
              <Ionicons
                name='call-outline'
                size={20}
                color={theme.colors.placeholder}
              />
            }
            value={formData.phone}
            onChangeText={(text) => {
              setFormData({ ...formData, phone: text });
              if (errors.phone) {
                setErrors({ ...errors, phone: null });
              }
            }}
            keyboardType='phone-pad'
            errorMessage={errors.phone}
            inputStyle={{ color: theme.colors.text }}
            containerStyle={styles.inputContainer}
          />

          <View style={styles.buttonContainer}>
            <Button
              title='Save Changes'
              onPress={handleSave}
              loading={loading}
              buttonStyle={[
                styles.saveButton,
                { backgroundColor: theme.colors.primary },
              ]}
              titleStyle={styles.buttonText}
              disabled={loading}
            />

            <Button
              title='Cancel'
              onPress={() => navigation.goBack()}
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
              type='outline'
              disabled={loading}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 32,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  changeImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  saveButton: {
    height: 56,
    borderRadius: 8,
    marginBottom: 16,
  },
  cancelButton: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButtonText: {
    fontSize: 16,
  },
});

export default EditProfileScreen;
