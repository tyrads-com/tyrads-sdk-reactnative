import { Button, StyleSheet, View, TextInput } from 'react-native';
import Tyrads from '@tyrads.com/tyrads-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    loadStoredCredentials();
  }, []);

  const loadStoredCredentials = async () => {
    const storedApiKey = await AsyncStorage.getItem('apiKey');
    const storedApiSecret = await AsyncStorage.getItem('apiSecret');
    const storedUserId = await AsyncStorage.getItem('userId');

    if (storedApiKey) setApiKey(storedApiKey);
    if (storedApiSecret) setApiSecret(storedApiSecret);
    if (storedUserId) setUserId(storedUserId);
  };

  const saveCredentials = async () => {
    await AsyncStorage.setItem('apiKey', apiKey);
    await AsyncStorage.setItem('apiSecret', apiSecret);
    await AsyncStorage.setItem('userId', userId);
  };

  const handleButtonClick = async () => {
    console.log('Button Clicked');
    await saveCredentials();
    Tyrads.init(apiKey, apiSecret);
    Tyrads.loginUser(userId);
    Tyrads.showOffers({ launchMode: 3 });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="API Key"
        value={apiKey}
        onChangeText={setApiKey}
      />
      <TextInput
        style={styles.input}
        placeholder="API Secret"
        value={apiSecret}
        onChangeText={setApiSecret}
      />
      <TextInput
        style={styles.input}
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
      />
      <Button title="Show Offers" onPress={handleButtonClick} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
