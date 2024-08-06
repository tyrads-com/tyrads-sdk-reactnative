# Integrating Tyrads SDK with React Native

This guide explains how to integrate the Tyrads SDK into your React Native project, allowing you to show offers in your app.

## Prerequisites

- React Native project set up
- Android development environment configured

## Integration Steps

### 1. Add Tyrads SDK to your project
In the project's root `build.gradle` file, add the JitPack repository:

```
allprojects {
    repositories {
        // ... other repositories
        maven { url 'https://jitpack.io' }
    }
}

```

Add the Tyrads SDK to your `app/build.gradle` file:

```gradle
dependencies {
    implementation 'com.tyrads:tyrads-sdk:<VERSION>'
}
```

## 2. Create a Native Module
Create a new Java class in your Android project:

```
// TyradsModule.java
package com.your.package.name;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.tyrads.sdk.Tyrads;

public class TyradsModule extends ReactContextBaseJavaModule {
    public TyradsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "TyradsModule";
    }

    @ReactMethod
    public void init(String apiKey, String apiSecret) {
        Tyrads.init(getReactApplicationContext(), apiKey, apiSecret);
    }

    @ReactMethod
    public void loginUser(String userId) {
        Tyrads.loginUser(userId);
    }

    @ReactMethod
    public void showOffers() {
        Tyrads.showOffers(getCurrentActivity());
    }
}

```

## 3. Create a Package for the Native Module

```
// TyradsPackage.java
package com.your.package.name;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class TyradsPackage implements ReactPackage {
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new TyradsModule(reactContext));
        return modules;
    }
}

```

## 4. Register the Package
In your `MainApplication.java` file:
```
@Override
protected List<ReactPackage> getPackages() {
    List<ReactPackage> packages = new PackageList(this).getPackages();
    packages.add(new TyradsPackage()); // Add this line
    return packages;
}

```

## 5. Create a JavaScript wrapper
Create a file named Tyrads.js in your React Native project:

```
// Tyrads.js
import { NativeModules } from 'react-native';

const { TyradsModule } = NativeModules;

export default {
  init: (apiKey, apiSecret) => TyradsModule.init(apiKey, apiSecret),
  loginUser: (userId) => TyradsModule.loginUser(userId),
  showOffers: () => TyradsModule.showOffers(),
};

```

## 6. Use the Tyrads SDK in your app

```
import React from 'react';
import { Button, SafeAreaView, StatusBar, StyleSheet, Text, View, useColorScheme } from 'react-native';
import Tyrads from './Tyrads';
import { TYR_SDK_API_KEY, TYR_SDK_API_SECRET } from '@env';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const initializeAndShowOffers = () => {
    Tyrads.init(TYR_SDK_API_KEY, TYR_SDK_API_SECRET);
    Tyrads.loginUser('demo_user');
    Tyrads.showOffers();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.content}>
        <Text style={styles.title}>Tyrads SDK Demo</Text>
        <Button title="Show Offers" onPress={initializeAndShowOffers} />
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default App;

```

## 7. Set up environment variables (Optional):
- Install react-native-dotenv:
 `npm install react-native-dotenv`
- Create a .env file in your project root:
 ```
 TYR_SDK_API_KEY=your_api_key_here
 TYR_SDK_API_SECRET=your_api_secret_here
 ```
 - Update your `babel.config.js`:
 ```
 module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        envName: 'APP_ENV',
        moduleName: '@env',
        path: '.env',
        allowUndefined: true,
      },
    ],
  ],
};
 ```