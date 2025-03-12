import { Button, StyleSheet, View, TextInput, SafeAreaView, ScrollView } from 'react-native';
import Tyrads from '@tyrads.com/tyrads-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';


export default function App() {
  const [apiKey, setApiKey] = useState('4f0eaa99e38e49b8b52804116e638a41');
  const [apiSecret, setApiSecret] = useState('cd3c34a52a3b75a3fdd928774615d4e142dd2e6a8ce9da14df4205c7cc812ce81d3656e3dc2c0c58ed05c75c57f87a3431fed62725bb0286f9461521b6c9997a');
  const [userId, setUserId] = useState('6');

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredCredentials();
    initialization()
  }, []);

  const initialization = async () => {
    Tyrads.init(apiKey, apiSecret);
    try{
      await Tyrads.loginUser(userId);
    }catch (err){
      console.log(err);
    }finally{
      setLoading(false);
    }

    console.log('initialized');
  }

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
    <SafeAreaView style = {{flex : 1}}>
      <ScrollView style = {{marginTop : 40}}>
          <View style={styles.container}>
          {!isLoading && <Tyrads.topPremiumOffers
          viewStyle = {1}
          />}
          <View style = {{height : 20}}></View>
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
