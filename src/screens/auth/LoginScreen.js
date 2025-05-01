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
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Input, Button } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import * as Yup from "yup";

import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const LoginScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { login, isLoading } = useContext(AuthContext);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = async (values) => {
    Keyboard.dismiss();
    const result = await login(values);
    if (!result.success) {
      // Error handling is done in the AuthContext
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
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
              Welcome Back!
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.placeholder }]}
            >
              Sign in to your account to continue
            </Text>
          </View>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
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

                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword")}
                  style={styles.forgotPassword}
                >
                  <Text
                    style={[
                      styles.forgotPasswordText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <Button
                  title='Sign In'
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
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text
                style={[styles.signupText, { color: theme.colors.primary }]}
              >
                Sign Up
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
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
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
    marginBottom: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  buttonContainer: {
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
  },
  footerText: {
    marginRight: 4,
    fontSize: 14,
  },
  signupText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default LoginScreen;
