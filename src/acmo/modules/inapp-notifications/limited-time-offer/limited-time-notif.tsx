import type React from "react";
import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import InAppNotificationController from "../controller";
import { CardAlert } from "../components/modal-wrapper";
import { CardGradient } from "../components/gradient_card";
import { Logger } from "../../../core/helpers/logger";
import { LimitedTimeOfferCard } from "./components/limited-time-offer-card";
import SnapCarousel from "../../../core/components/snap-carousel";
import NotificationManager from "../inapp-notification-manager";


const SCREEN_WIDTH = Dimensions.get('window').width
export const LimitedTimeEventsNotif: React.FC = () => {

  const [visible, setVisible] = useState(false);
  const [limitedTimeEvents, setLimitedTimeEvents] = useState<ActivatedCampaign[] | null>([]);
  const controller = InAppNotificationController.getInstance();
  const notificationManager = NotificationManager.getInstance();

  useEffect(() => {
    if (controller.limitedTimeEvents) {
      const limitedTimeEventsArray = controller.limitedTimeEvents;
      Logger.log('limitedTimeEvents', limitedTimeEventsArray)
      setLimitedTimeEvents(limitedTimeEventsArray);
    }
  }, []);

  useEffect(() => {
    const hasEvents = limitedTimeEvents?.length !== undefined && limitedTimeEvents?.length > 0;

    if (hasEvents) {
      notificationManager.setLimitedTimeVisible(true);
      setVisible(true);
    } else {
      notificationManager.setLimitedTimeVisible(false);
    }
  }, [limitedTimeEvents]);

  const handleClose = () => {
    setVisible(false);
    notificationManager.setLimitedTimeVisible(false);
  };

  return <CardAlert visible={visible} onClose={handleClose}>
    <CardGradient onClose={handleClose}>
      <Text style={styles.title}>{"Limited Time Offer"}</Text>
      <View style={styles.horizontalLine} />
      <Text style={styles.text}>Limited time offer unlocked! Play now and claim extra rewards!</Text>
      <SnapCarousel
        data={limitedTimeEvents!}
        renderItem={({ item, index }: { item: ActivatedCampaign; index: number }) => (
          <View key={index} style={{ paddingHorizontal: 6 }}>

            <LimitedTimeOfferCard
              activatedCampaign={item}
            />
          </View>
        )}
        sliderWidth={(SCREEN_WIDTH * 0.9) - 32}
        itemWidth={limitedTimeEvents?.length == 1 ? (SCREEN_WIDTH * 0.82) : (SCREEN_WIDTH * 0.65)}
        loop={false}
        paginationContainerStyle={{
          marginTop: 16,
          paddingVertical: 0,
        }}
        autoplay
      />
    </CardGradient>
  </CardAlert>
}


const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E2020',
    textAlign: 'center',
    marginTop: 20,
  },
  horizontalLine: {
    width: '100%',
    borderBottomColor: '#E0E2E7',
    borderBottomWidth: 1,
    marginVertical: 16,
  },
  text: {
    fontSize: 12,
    fontWeight: '400',
    color: '#1E2020',
    textAlign: 'center',
    marginBottom: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: "#FF554A",
    paddingVertical: 4,
    borderRadius: 20,
  },
  timer: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timerMessage: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  outlinedButton: {
    borderWidth: 2,
    borderRadius: 30,
    justifyContent: 'center',
    height: 42,
  },
  outlinedButtonTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlinedButtonText: {
    color: '#02B5BE',
    fontSize: 14,
    fontWeight: '600',
  },
});