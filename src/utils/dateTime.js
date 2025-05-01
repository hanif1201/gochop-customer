/**
 * Format a date to a simple date string (MM/DD/YYYY)
 * @param {Date|string} date Date object or date string
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleDateString();
};

/**
 * Format a date to a time string (HH:MM AM/PM)
 * @param {Date|string} date Date object or date string
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/**
 * Format a date to a datetime string (MM/DD/YYYY, HH:MM AM/PM)
 * @param {Date|string} date Date object or date string
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date) => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  return `${formatDate(dateObj)}, ${formatTime(dateObj)}`;
};

/**
 * Get relative time string (e.g., "5 minutes ago", "2 hours ago")
 * @param {Date|string} date Date object or date string
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  const diffMs = now - dateObj;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "just now";
  } else if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? "minute" : "minutes"} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} ${diffHour === 1 ? "hour" : "hours"} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} ${diffDay === 1 ? "day" : "days"} ago`;
  } else {
    return formatDate(dateObj);
  }
};

/**
 * Calculate estimated delivery time from order placement
 * @param {Object} order Order object
 * @param {number} defaultTimeMinutes Default preparation time in minutes
 * @returns {Date} Estimated delivery time
 */
export const calculateEstimatedDeliveryTime = (
  order,
  defaultTimeMinutes = 45
) => {
  if (!order) return null;

  const orderTime = order.createdAt ? new Date(order.createdAt) : new Date();
  const preparationTime = order.restaurant?.preparationTime || 30;
  const deliveryTime = order.restaurant?.deliveryTime || 15;

  // Total time = preparation time + delivery time
  const totalTimeMinutes =
    order.status === "picked_up"
      ? deliveryTime
      : preparationTime + deliveryTime;

  const estimatedTime = new Date(
    orderTime.getTime() + totalTimeMinutes * 60000
  );

  return estimatedTime;
};

/**
 * Format a duration in minutes to a human-readable string
 * @param {number} minutes Duration in minutes
 * @returns {string} Formatted duration string
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return "";

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  return `${hours} ${hours === 1 ? "hour" : "hours"} ${remainingMinutes} min`;
};
