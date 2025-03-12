import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveData = async (key, object) => {
  try {
    const jsonValue = JSON.stringify(object);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    if (e instanceof Error) {
      console.error('Error saving object:', e.message);
    } else {
      console.error('An unknown error occurred while saving.');
    }
  }
};

export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    if (e instanceof Error) {
      console.error('Error getting object:', e.message);
    } else {
      console.error('An unknown error occurred while getting.');
    }
    return null;
  }
};