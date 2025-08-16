import { StyleSheet, View, TextInput, SafeAreaView, ScrollView, ActivityIndicator, InteractionManager, Alert, TouchableOpacity, Text } from 'react-native';
// import Tyrads from '@tyrads.com/tyrads-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { PremiumWidgetStyles } from '../../src/acmo/modules/dashboard/top_offers';
import Tyrads from '../../src/index';


export default function App() {
  const [apiKey, setApiKey] = useState('YOUR_API_KEY');
  const [apiSecret, setApiSecret] = useState('YOUR_API_SECRET');
  const [encKey, setEncKey] = useState('YOUR_ENC_KEY');
  const [userId, setUserId] = useState('YOUR_USER_ID');

  const [isPremiumLoading, setPremiumLoading] = useState(true);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(async () => {
      const creds = await loadStoredCredentials()
      await initialization(creds);
    });

    return () => {
      task.cancel();
    };
  }, []);


  const initialization = async ({
    storedApiKey,
    storedApiSecret,
    storedEncKey,
    storedUserId,
  }: {
    storedApiKey: string,
    storedApiSecret: string,
    storedEncKey: string,
    storedUserId: string
  }) => {
    if (!storedApiKey || !storedApiSecret || !storedUserId) {
      Alert.alert(
        'Missing Fields',
        'These fields (API Key, Secret, User ID) are required.'
      );
      setPremiumLoading(false);
      return;
    }
    try {
      await Tyrads.init(storedApiKey, storedApiSecret, storedEncKey);
      await Tyrads.loginUser(storedUserId);
      console.log('Initialized successfully');
    } catch (err) {
      console.log('Initialization error:', err);
    } finally {
      setPremiumLoading(false);
    }
  };

  const loadStoredCredentials = async () => {
    const storedApiKey = await AsyncStorage.getItem('apiKey') || '';
    const storedApiSecret = await AsyncStorage.getItem('apiSecret') || '';
    const storedEncKey = await AsyncStorage.getItem('encKey') || '';
    const storedUserId = await AsyncStorage.getItem('userId') || '';

    setApiKey(storedApiKey);
    setApiSecret(storedApiSecret);
    setEncKey(storedEncKey);
    setUserId(storedUserId);

    return { storedApiKey, storedApiSecret, storedEncKey, storedUserId };
  };


  const saveCredentials = async () => {
    await AsyncStorage.setItem('apiKey', apiKey);
    await AsyncStorage.setItem('apiSecret', apiSecret);
    await AsyncStorage.setItem('encKey', encKey);
    await AsyncStorage.setItem('userId', userId);
  };

  const handleButtonClick = async () => {
    console.log('Button Clicked');
    const task = InteractionManager.runAfterInteractions(async () => {
      setLoading(true);
      await saveCredentials();
      await Tyrads.init(apiKey, apiSecret, encKey);
      await Tyrads.loginUser(userId);
      await Tyrads.showOffers({ launchMode: 2 });
      setLoading(false);
    });
    return () => {
      task.cancel();
    };
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ marginTop: 40 }}>
        <View style={styles.container}>
          {<Tyrads.topPremiumOffers widgetStyle={PremiumWidgetStyles.sliderCards} />}
          <View style={{ height: 20 }}></View>
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
            placeholder="Encryption Key (optional)"
            value={encKey}
            onChangeText={setEncKey}
          />
          <TextInput
            style={styles.input}
            placeholder="User ID"
            value={userId}
            onChangeText={setUserId}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#00a5ceff', justifyContent: 'center', borderRadius: 12,}}>
            <TouchableOpacity
              style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}
              onPress={handleButtonClick}
              disabled={isLoading}
            >
              {isLoading ?
                <ActivityIndicator size={28} style={{ marginRight: 10 }} color={'#fff'}/> :
                null}
              <Text style={{ fontSize: 16, color: '#fff', fontWeight: '700' }}>
                Show Offers
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
