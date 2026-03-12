import { StyleSheet, View, TextInput, SafeAreaView, ScrollView, ActivityIndicator, InteractionManager, Alert, TouchableOpacity, Text, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
// import Tyrads from '@tyrads.com/tyrads-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import Tyrads, { PremiumWidgetStyles, type TyradsMediaSourceInfo, type TyradsConfig } from '../../src/index';
import Config from 'react-native-config';

export default function App() {
  const [mediaSource, setMediaSource] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [encKey, setEncKey] = useState('');
  const [engagementId, setEngagementId] = useState('');
  const [userId, setUserId] = useState('');

  const [isReady, setReady] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [widgetKey, setWidgetKey] = useState(0);
  const [showInitialPages, setShowInitialPages] = useState(false);
  const [lastShowInitialPages, setLastShowInitialPages] = useState(showInitialPages);


  const [selectedConfig, setSelectedConfig] = useState('belanda1');
  const isAndroid = Platform.OS === 'android';

  const configOptions = [
    { label: 'Tyrreward', value: 'tyrreward' },
    { label: 'Belanda 1', value: 'belanda1' },
    { label: 'Belanda 2', value: 'belanda2' },
    { label: 'Belanda 3', value: 'belanda3' },
  ];

  const getConfigKeys = async (): Promise<{ apiKey: string; apiSecret: string; encKey: string; }> => {
    const storedConfig = await AsyncStorage.getItem('selectedConfig');
    if (storedConfig) {
      setSelectedConfig(storedConfig);
    }
    const platformPrefix = isAndroid ? 'ANDROID_' : 'IOS_';
    const configPrefix = selectedConfig === 'tyrreward' ? 'TYRREWARD' : `BELANDA${selectedConfig === 'belanda1' ? '1' : selectedConfig === 'belanda2' ? '2' : '3'}_TYRADS`;

    const keyName = `${platformPrefix}${configPrefix}_SDK_KEY`;
    const secretName = `${platformPrefix}${configPrefix}_SDK_SECRET`;
    const encName = `${platformPrefix}${configPrefix}_SDK_ENC_KEY`;
    console.log("Key Name", keyName);


    return {
      apiKey: (Config as any)[keyName] || '',
      apiSecret: (Config as any)[secretName] || '',
      encKey: (Config as any)[encName] || ''
    };
  };

  useEffect(() => {
    const syncAndInit = async () => {
      try {
        setReady(false);

        const keys = await getConfigKeys();
        const storedUserId = await AsyncStorage.getItem('userId') || 'user123';
        setUserId(storedUserId);

        setApiKey(keys.apiKey);
        setApiSecret(keys.apiSecret);
        setEncKey(keys.encKey);

        if (keys.apiKey && keys.apiSecret) {
          await Tyrads.init(keys.apiKey, keys.apiSecret, keys.encKey, engagementId);
          await Tyrads.loginUser(storedUserId);

          setWidgetKey(prev => prev + 1);
          setReady(true);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    const task = InteractionManager.runAfterInteractions(syncAndInit);
    return () => task.cancel();
  }, [selectedConfig, isAndroid, showInitialPages]);

  const handleButtonClick = async () => {
    setLoading(true);
    try {
      const lastUserId = await AsyncStorage.getItem('userId');

      if (lastUserId !== userId || mediaSource !== '' || lastShowInitialPages !== showInitialPages) {
        console.log('Credentials or User changed. Re-initializing...');

        await Tyrads.init(apiKey, apiSecret, encKey, engagementId,
          mediaSource ? JSON.parse(mediaSource) as TyradsMediaSourceInfo : undefined,
          undefined,
          {
            skipInitialPages: !showInitialPages
          } as TyradsConfig,
        );
        await Tyrads.loginUser(userId);
        await AsyncStorage.setItem('userId', userId);
        setWidgetKey(prev => prev + 1);
        setLastShowInitialPages(showInitialPages);
      }

      await Tyrads.showOffers({ launchMode: 2 });
    } catch (err) {
      Alert.alert("Error", "Failed to show offers");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onConfigChange = async (value: string) => {
    setSelectedConfig(value)
    await AsyncStorage.setItem('selectedConfig', value);
  }

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
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Select Config:</Text>
              <Dropdown options={configOptions} selectedValue={selectedConfig} onValueChange={onConfigChange} />
              <Text style={styles.platformInfo}>
                Platform: {isAndroid ? 'Android' : 'iOS'} | Config: {selectedConfig.toUpperCase()}
              </Text>
            </View>
            {Platform.OS === 'android' && <Dropdown
              options={[
                { value: true, label: 'Show Initial Pages' },
                { value: false, label: 'Hide Initial Pages' },
              ]}
              selectedValue={showInitialPages}
              onValueChange={setShowInitialPages}
            />}
            <View style={{ height: 8 }}></View>
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
  inputContainer: { width: '100%', marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#333' },
  dropdownButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 20
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: 300,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  platformInfo: { fontSize: 12, color: '#666', fontStyle: 'italic' },
});


const Dropdown = ({ options, selectedValue, onValueChange }: { options: { value: any, label: string }[], selectedValue: any, onValueChange: (value: any) => void }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ marginBottom: 4, width: '100%' }}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setVisible(true)}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: 'black' }}>{options.filter((option) => option.value === selectedValue)[0]?.label || "Select an option..."}</Text>
          <Text>{!visible ? '\u25bc' : '\u25b2'}</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.dropdownList}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    onValueChange(item.value);
                    setVisible(false);
                  }}
                >
                  <Text style={{ color: 'black' }}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
