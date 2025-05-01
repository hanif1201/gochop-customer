/**
 * Format currency value to price string with 2 decimal places
 * @param {number} value Number to format
 * @param {string} currencySymbol Currency symbol to use (default: $)
 * @returns {string} Formatted price string
 */
export const formatCurrency = (value, currencySymbol = "$") => {
  if (value === undefined || value === null) return `${currencySymbol}0.00`;

  return `${currencySymbol}${parseFloat(value).toFixed(2)}`;
};

/**
 * Convert snake_case to Title Case
 * @param {string} text Snake case text to convert
 * @returns {string} Title case string
 */
export const snakeCaseToTitleCase = (text) => {
  if (!text) return "";

  return text
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Truncate text with ellipsis after specified length
 * @param {string} text Text to truncate
 * @param {number} maxLength Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;

  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format phone number to standard format (XXX) XXX-XXXX
 * @param {string} phoneNumber Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return "";

  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Check if the input is a valid phone number
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  return phoneNumber;
};

/**
 * Format a list of items into a string with commas and "and"
 * @param {Array} items Array of items to format
 * @returns {string} Formatted string
 */
export const formatList = (items) => {
  if (!items || items.length === 0) return "";

  if (items.length === 1) return items[0];

  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1).join(", ");

  return `${otherItems}, and ${lastItem}`;
};

/**
 * Convert number to ordinal string (1st, 2nd, 3rd, etc.)
 * @param {number} number Number to convert
 * @returns {string} Ordinal string
 */
export const getOrdinal = (number) => {
  const j = number % 10;
  const k = number % 100;

  if (j === 1 && k !== 11) {
    return `${number}st`;
  }
  if (j === 2 && k !== 12) {
    return `${number}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${number}rd`;
  }

  return `${number}th`;
};
