import { View } from "react-native";
import { CurrencySalesNotif } from "./currency-sales/currency-sales-notif";
import { LimitedTimeEventsNotif } from "./limited-time-offer/limited-time-notif";
import { useEffect } from "react";
import InAppNotificationController from "./controller";

const InAppNotificationHost: React.FC = () => {
  useEffect(() => {
    const initializeInAppNotifications =  async () => {
      await InAppNotificationController.getInstance().init();
    }
    initializeInAppNotifications();
  }, [])
  
  return (
    <View>
      <CurrencySalesNotif />
      <LimitedTimeEventsNotif />
    </View>
  );
}

export default InAppNotificationHost