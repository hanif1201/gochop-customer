import React, { useState, useContext } from "react";
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
} from "react-native";
import { Input, Button } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import * as Yup from "yup";

import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";

// Validation schema
const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name is too short")
    .max(50, "Name is too long")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9+\s()-]{8,15}$/, "Please enter a valid phone number")
    .required("Phone number is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
  address: Yup.string().required("Address is required"),
});

const RegisterScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { register, isLoading } = useContext(AuthContext);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleRegister = async (values) => {
    Keyboard.dismiss();

    // Remove confirmPassword as it's not needed in the API request
    const { confirmPassword, ...userData } = values;

    const result = await register(userData);
    if (!result.success) {
      // Error handling is done in the AuthContext
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps='handled'
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Create Account
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.placeholder }]}
            >
              Sign up to start ordering delicious food
            </Text>
          </View>

          <Formik
            initialValues={{
              name: "",
              email: "",
              phone: "",
              password: "",
              confirmPassword: "",
              address: "",
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleRegister}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.form}>
                <Input
                  placeholder='Full Name'
                  leftIcon={
                    <Ionicons
                      name='person-outline'
                      size={20}
                      color={theme.colors.placeholder}
                    />
                  }
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  value={values.name}
                  inputStyle={{ color: theme.colors.text }}
                  errorMessage={touched.name && errors.name ? errors.name : ""}
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
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  inputStyle={{ color: theme.colors.text }}
                  errorMessage={
                    touched.email && errors.email ? errors.email : ""
                  }
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
                  onChangeText={handleChange("phone")}
                  onBlur={handleBlur("phone")}
                  value={values.phone}
                  keyboardType='phone-pad'
                  inputStyle={{ color: theme.colors.text }}
                  errorMessage={
                    touched.phone && errors.phone ? errors.phone : ""
                  }
                  containerStyle={styles.inputContainer}
                />

                <Input
                  placeholder='Address'
                  leftIcon={
                    <Ionicons
                      name='location-outline'
                      size={20}
                      color={theme.colors.placeholder}
                    />
                  }
                  onChangeText={handleChange("address")}
                  onBlur={handleBlur("address")}
                  value={values.address}
                  inputStyle={{ color: theme.colors.text }}
                  errorMessage={
                    touched.address && errors.address ? errors.address : ""
                  }
                  containerStyle={styles.inputContainer}
                />

                <Input
                  placeholder='Password'
                  leftIcon={
                    <Ionicons
                      name='lock-closed-outline'
                      size={20}
                      color={theme.colors.placeholder}
                    />
                  }
                  rightIcon={
                    <TouchableOpacity onPress={togglePasswordVisibility}>
                      <Ionicons
                        name={
                          passwordVisible ? "eye-off-outline" : "eye-outline"
                        }
                        size={20}
                        color={theme.colors.placeholder}
                      />
                    </TouchableOpacity>
                  }
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                  secureTextEntry={!passwordVisible}
                  inputStyle={{ color: theme.colors.text }}
                  errorMessage={
                    touched.password && errors.password ? errors.password : ""
                  }
                  containerStyle={styles.inputContainer}
                />

                <Input
                  placeholder='Confirm Password'
                  leftIcon={
                    <Ionicons
                      name='lock-closed-outline'
                      size={20}
                      color={theme.colors.placeholder}
                    />
                  }
                  rightIcon={
                    <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
                      <Ionicons
                        name={
                          confirmPasswordVisible
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={20}
                        color={theme.colors.placeholder}
                      />
                    </TouchableOpacity>
                  }
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  value={values.confirmPassword}
                  secureTextEntry={!confirmPasswordVisible}
                  inputStyle={{ color: theme.colors.text }}
                  errorMessage={
                    touched.confirmPassword && errors.confirmPassword
                      ? errors.confirmPassword
                      : ""
                  }
                  containerStyle={styles.inputContainer}
                />

                <Button
                  title='Create Account'
                  onPress={handleSubmit}
                  loading={isLoading}
                  buttonStyle={[
                    styles.button,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  containerStyle={styles.buttonContainer}
                  titleStyle={styles.buttonText}
                  disabled={isLoading}
                />
              </View>
            )}
          </Formik>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.text }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={[styles.loginText, { color: theme.colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
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
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 12,
  },
  buttonContainer: {
    marginTop: 12,
    marginBottom: 24,
  },
  button: {
    height: 56,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  footerText: {
    marginRight: 4,
    fontSize: 14,
  },
  loginText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
