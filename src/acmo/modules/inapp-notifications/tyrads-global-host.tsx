import React from "react";
import { View, StyleSheet } from "react-native";
import { LocalizationProvider } from "../localization/localization_context";
import InAppNotificationHost from "./inapp-notification-host";

const TyradsGlobalHost: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <View style={{ flex: 1 }}>
      {children}
      <View style={styles.overlay} pointerEvents="box-none">
        <LocalizationProvider>
          <InAppNotificationHost useModal={true} />
        </LocalizationProvider>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default TyradsGlobalHost;
