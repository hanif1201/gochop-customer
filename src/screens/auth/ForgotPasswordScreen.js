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
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

const ForgotPasswordScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { forgotPassword, isLoading } = useContext(AuthContext);
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = async (values) => {
    Keyboard.dismiss();
    const result = await forgotPassword(values.email);
    if (result.success) {
      setResetSent(true);
    }
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
              Reset Password
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.placeholder }]}
            >
              {resetSent
                ? "Check your email for instructions to reset your password"
                : "Enter your email and we'll send you instructions to reset your password"}
            </Text>
          </View>

          {!resetSent ? (
            <Formik
              initialValues={{ email: "" }}
              validationSchema={ForgotPasswordSchema}
              onSubmit={handleResetPassword}
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

                  <Button
                    title='Send Reset Instructions'
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
          ) : (
            <Button
              title='Back to Login'
              onPress={() => navigation.navigate("Login")}
              buttonStyle={[
                styles.button,
                { backgroundColor: theme.colors.primary },
              ]}
              containerStyle={styles.buttonContainer}
              titleStyle={styles.buttonText}
            />
          )}

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.text }]}>
              Remember your password?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text
                style={[styles.signInText, { color: theme.colors.primary }]}
              >
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
    marginBottom: 24,
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
  signInText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default ForgotPasswordScreen;
