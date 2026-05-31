import { View } from "react-native";
import { CurrencySalesNotif } from "./currency-sales/currency-sales-notif";
import { LimitedTimeEventsNotif } from "./limited-time-offer/limited-time-notif";
import { useEffect } from "react";
import InAppNotificationController from "./controller";

import TyradsSdkCoreMethods from "../../core/tyrads-sdk-core";

interface InAppNotificationHostProps {
  useModal?: boolean;
  style?: any;
}

const InAppNotificationHost: React.FC<InAppNotificationHostProps> = ({ useModal = true, style }) => {
  useEffect(() => {
    const initializeInAppNotifications = async () => {
      if (TyradsSdkCoreMethods.apiKey) {
        await InAppNotificationController.getInstance().init();
      }
    }
    initializeInAppNotifications();
  }, [])

  return (
    <View style={style}>
      <CurrencySalesNotif useModal={useModal} />
      <LimitedTimeEventsNotif useModal={useModal} />
    </View>
  );
}

export default InAppNotificationHost