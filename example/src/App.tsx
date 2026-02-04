import { StyleSheet, View, TextInput, SafeAreaView, ScrollView, ActivityIndicator, InteractionManager, Alert, TouchableOpacity, Text, KeyboardAvoidingView, Platform } from 'react-native';
// import Tyrads from '@tyrads.com/tyrads-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { PremiumWidgetStyles } from '../../src/acmo/modules/dashboard/top_offers';
import Tyrads, { type TyradsMediaSourceInfo } from '../../src/index';
// import { TYRADS_SDK_KEY, TYRADS_SDK_SECRET, TYRADS_SDK_ENC_KEY } from '@env';


export default function App() {
  const [mediaSource, setMediaSource] = useState('');
  const [apiKey, setApiKey] = useState('e82465b5ddd847b2bfd164b958bf8e7b');
  const [apiSecret, setApiSecret] = useState('aeec6e8d886eb5d32eb4bd99dc4e5acfc46789f0309a99364e8cda7da9d3bc05fd42f4c4780415855fa68e11a28f15c83fa8c27aea18053ea67395409925c162');
  const [encKey, setEncKey] = useState('');
  const [engagementId, setEngagementId] = useState('');
  const [userId, setUserId] = useState('user5346');

  const [isReady, setReady] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [widgetKey, setWidgetKey] = useState(0);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(async () => {
      const creds = await loadStoredCredentials()
      await initialization(creds);
      setReady(true);
    });

    return () => {
      task.cancel();
    };
  }, []);


  const initialization = async ({
    storedApiKey,
    storedApiSecret,
    storedUserId,
  }: {
    storedApiKey: string,
    storedApiSecret: string,
    storedUserId: string
  }) => {
    if (!storedApiKey || !storedApiSecret || !storedUserId) {
      Alert.alert(
        'Missing Fields',
        'These fields (API Key, Secret, User ID) are required.'
      );
      return;
    }
    try {
      await Tyrads.init(storedApiKey, storedApiSecret, encKey, engagementId);
      await Tyrads.loginUser(storedUserId);
      setWidgetKey(prevKey => prevKey + 1);
      console.log('Initialized successfully');
    } catch (err) {
      console.log('Initialization error:', err);
    }
  };

  const loadStoredCredentials = async () => {
    const storedApiKey = await AsyncStorage.getItem('apiKey') || apiKey;
    const storedApiSecret = await AsyncStorage.getItem('apiSecret') || apiSecret;
    const storedUserId = await AsyncStorage.getItem('userId') || userId;

    setApiKey(storedApiKey);
    setApiSecret(storedApiSecret);
    setUserId(storedUserId);

    return { storedApiKey, storedApiSecret, storedUserId };
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
      const prevUserId = await AsyncStorage.getItem('userId');

      if (prevUserId !== userId || mediaSource !== '') {
        console.log('Different userId detected, re-initializing.');
        await saveCredentials();
        await Tyrads.init(apiKey, apiSecret, encKey, engagementId,
          (mediaSource != null && mediaSource !== '') ? JSON.parse(mediaSource) as TyradsMediaSourceInfo : undefined,
        );
        await Tyrads.loginUser(userId);
        setWidgetKey(prevKey => prevKey + 1);
      } else {
        console.log('Same userId detected, skipping re-initialization.');
      }

      await Tyrads.showOffers({ launchMode: 2 });
      setLoading(false);
    });
    return () => {
      task.cancel();
    };
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ marginTop: 40 }}
          // contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {isReady ? (
              <Tyrads.topPremiumOffers key={widgetKey} widgetStyle={PremiumWidgetStyles.list} />
            ) : (
              <Tyrads.topPremiumOffersLoading widgetStyle={PremiumWidgetStyles.list} />
            )}
            <View style={{ height: 20 }}></View>
            <TextInput
              style={styles.input}
              placeholder="Media Source in JSON (optional)"
              value={mediaSource}
              onChangeText={setMediaSource}
            />
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
              placeholder="Engagement ID (optional)"
              value={engagementId}
              onChangeText={setEngagementId}
            />
            <TextInput
              style={styles.input}
              placeholder="User ID"
              value={userId}
              onChangeText={setUserId}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#00a5ceff', justifyContent: 'center', borderRadius: 12, }}>
              <TouchableOpacity
                style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}
                onPress={handleButtonClick}
                disabled={isLoading}
              >
                {isLoading ?
                  <ActivityIndicator size={28} style={{ marginRight: 10 }} color={'#fff'} /> :
                  null}
                <Text style={{ fontSize: 16, color: '#fff', fontWeight: '700' }}>
                  Show Offers
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
