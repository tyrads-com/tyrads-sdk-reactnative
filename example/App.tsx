import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Tyrads from 'tyrads-sdk-reactnative';
import { TYR_SDK_API_KEY, TYR_SDK_API_SECRET } from '@env';
import { Colors } from 'react-native/Libraries/NewAppScreen';


const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isInitialized, setIsInitialized] = useState(false);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const initializeTyrSDK = () => {
    Tyrads.init(TYR_SDK_API_KEY, TYR_SDK_API_SECRET);
    Tyrads.loginUser("66"); // user id
    setIsInitialized(true);
  };

  const showOffers = () => {
    if (!isInitialized) {
      initializeTyrSDK();
    }
    Tyrads.showOffers();
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.content}>
        <Text style={[styles.title, { color: isDarkMode ? Colors.white : Colors.black }]}>
          TyrAds SDK Demo
        </Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? Colors.light : Colors.dark }]}>
          React Native Implementation
        </Text>
        <TouchableOpacity
          style={[styles.button, isInitialized && styles.buttonInitialized]}
          onPress={showOffers}
        >
          <Text style={styles.buttonText}>
            {isInitialized ? 'Show Offers' : 'Initialize & Show Offers'}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.status, { color: isDarkMode ? Colors.light : Colors.dark }]}>
          SDK Status: {isInitialized ? 'Initialized' : 'Not Initialized'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 3,
  },
  buttonInitialized: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    marginTop: 20,
    fontSize: 16,
  },
});

export default App;
