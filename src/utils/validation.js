/**
 * Validate email format
 * @param {string} email Email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password Password to validate
 * @returns {Object} Validation result with status and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      message: "Password is required",
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters",
    };
  }

  return {
    isValid: true,
    message: "Password is valid",
  };
};

/**
 * Validate phone number format
 * @param {string} phoneNumber Phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
export const isValidPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return false;

  // Basic phone number validation (allows various formats)
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phoneNumber);
};

/**
 * Validate credit card number using Luhn algorithm
 * @param {string} cardNumber Credit card number to validate
 * @returns {boolean} Whether the card number is valid
 */
export const isValidCreditCard = (cardNumber) => {
  if (!cardNumber) return false;

  // Remove all non-digit characters
  const digits = cardNumber.replace(/\D/g, "");

  // Check if the card number is of valid length
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  // Implement Luhn algorithm for validation
  let sum = 0;
  let shouldDouble = false;

  // Loop from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

/**
 * Identify credit card type based on number
 * @param {string} cardNumber Credit card number
 * @returns {string} Card type (Visa, MasterCard, etc.) or "Unknown"
 */
export const getCreditCardType = (cardNumber) => {
  if (!cardNumber) return "Unknown";

  // Remove all non-digit characters
  const digits = cardNumber.replace(/\D/g, "");

  // Visa: Starts with 4
  if (/^4/.test(digits)) {
    return "Visa";
  }

  // Mastercard: Starts with 51-55 or 2221-2720
  if (/^5[1-5]/.test(digits) || /^2[2-7][2-7][0-9]/.test(digits)) {
    return "MasterCard";
  }

  // American Express: Starts with 34 or 37
  if (/^3[47]/.test(digits)) {
    return "American Express";
  }

  // Discover: Starts with 6011, 622126-622925, 644-649, or 65
  if (
    /^6011/.test(digits) ||
    /^622[1-9][2-9][0-9]/.test(digits) ||
    /^64[4-9]/.test(digits) ||
    /^65/.test(digits)
  ) {
    return "Discover";
  }

  // JCB: Starts with 35
  if (/^35/.test(digits)) {
    return "JCB";
  }

  // Diners Club: Starts with 300-305, 36, or 38-39
  if (/^3(?:0[0-5]|[68])/.test(digits)) {
    return "Diners Club";
  }

  return "Unknown";
};

/**
 * Validate zip/postal code
 * @param {string} postalCode Postal code to validate
 * @param {string} country Country code (default: 'US')
 * @returns {boolean} Whether the postal code is valid
 */
export const isValidPostalCode = (postalCode, country = "US") => {
  if (!postalCode) return false;

  // Different regex for different countries
  const postalRegexes = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/i,
    UK: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i,
    NG: /^\d{6}$/, // Nigeria postal code format
  };

  const regex = postalRegexes[country] || postalRegexes["US"];
  return regex.test(postalCode);
};

/**
 * Check if a text field is empty or contains only whitespace
 * @param {string} value Text to validate
 * @returns {boolean} Whether the text is empty
 */
export const isEmpty = (value) => {
  return value === undefined || value === null || value.trim() === "";
};

/**
 * Validate a form object against schema
 * @param {Object} form Form data object
 * @param {Object} schema Validation schema with field rules
 * @returns {Object} Validation errors by field name
 */
export const validateForm = (form, schema) => {
  const errors = {};

  Object.keys(schema).forEach((field) => {
    const rules = schema[field];
    const value = form[field];

    if (rules.required && isEmpty(value)) {
      errors[field] = `${field} is required`;
    } else if (value && rules.minLength && value.length < rules.minLength) {
      errors[field] = `${field} must be at least ${rules.minLength} characters`;
    } else if (value && rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `${field} must be at most ${rules.maxLength} characters`;
    } else if (value && rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.message || `${field} is invalid`;
    } else if (value && rules.validator && !rules.validator(value)) {
      errors[field] = rules.message || `${field} is invalid`;
    }
  });

  return errors;
};
