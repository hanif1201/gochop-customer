import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Store data in AsyncStorage
 * @param {string} key Storage key
 * @param {any} value Value to store (will be JSON stringified)
 * @returns {Promise<void>}
 */
export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error("Error storing data:", error);
    return false;
  }
};

/**
 * Retrieve data from AsyncStorage
 * @param {string} key Storage key
 * @returns {Promise<any>} Retrieved value (JSON parsed)
 */
export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue !== null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Error retrieving data:", error);
    return null;
  }
};

/**
 * Remove data from AsyncStorage
 * @param {string} key Storage key
 * @returns {Promise<boolean>} Success status
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("Error removing data:", error);
    return false;
  }
};

/**
 * Clear all data from AsyncStorage
 * @returns {Promise<boolean>} Success status
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing all data:", error);
    return false;
  }
};

/**
 * Get all keys from AsyncStorage
 * @returns {Promise<string[]>} Array of keys
 */
export const getAllKeys = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error("Error getting all keys:", error);
    return [];
  }
};

/**
 * Store multiple items at once
 * @param {Array<Array<string, any>>} keyValuePairs Array of [key, value] pairs
 * @returns {Promise<boolean>} Success status
 */
export const multiSet = async (keyValuePairs) => {
  try {
    const pairs = keyValuePairs.map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]);
    await AsyncStorage.multiSet(pairs);
    return true;
  } catch (error) {
    console.error("Error storing multiple items:", error);
    return false;
  }
};

/**
 * Get multiple items at once
 * @param {string[]} keys Array of keys to retrieve
 * @returns {Promise<Object>} Object with key-value pairs
 */
export const multiGet = async (keys) => {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    return pairs.reduce((result, [key, value]) => {
      result[key] = value !== null ? JSON.parse(value) : null;
      return result;
    }, {});
  } catch (error) {
    console.error("Error retrieving multiple items:", error);
    return {};
  }
};

/**
 * Remove multiple items at once
 * @param {string[]} keys Array of keys to remove
 * @returns {Promise<boolean>} Success status
 */
export const multiRemove = async (keys) => {
  try {
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error("Error removing multiple items:", error);
    return false;
  }
};

/**
 * Get the size of storage used (approximate)
 * @returns {Promise<number>} Size in bytes
 */
export const getStorageSize = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const keyValuePairs = await AsyncStorage.multiGet(keys);

    let size = 0;
    keyValuePairs.forEach(([key, value]) => {
      size += key.length;
      size += value ? value.length : 0;
    });

    return size;
  } catch (error) {
    console.error("Error calculating storage size:", error);
    return 0;
  }
};

/**
 * Check if a key exists in storage
 * @param {string} key Key to check
 * @returns {Promise<boolean>} Whether the key exists
 */
export const hasKey = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error("Error checking key existence:", error);
    return false;
  }
};

/**
 * Merge an object with an existing object in storage
 * @param {string} key Storage key
 * @param {Object} value Object to merge
 * @returns {Promise<boolean>} Success status
 */
export const mergeData = async (key, value) => {
  try {
    const existing = (await getData(key)) || {};
    const merged = { ...existing, ...value };
    await storeData(key, merged);
    return true;
  } catch (error) {
    console.error("Error merging data:", error);
    return false;
  }
};
