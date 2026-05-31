import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CardAlert } from "../components/modal-wrapper";
import { useEffect, useState } from "react";
import { CardGradient } from "../components/gradient_card";
import { CountdownTimer } from "../../../core/components/countdown-timer";
import TyradsSdkCoreMethods, { TyradsSdkCore } from "../../../core/tyrads-sdk-core";
import InAppNotificationController from "../controller";
import NotificationManager from "../inapp-notification-manager";

interface InAppNotifProps {
  useModal?: boolean;
}

export const CurrencySalesNotif: React.FC<InAppNotifProps> = ({ useModal = true }) => {

  const [visible, setVisible] = useState(false);
  const [currencySales, setCurrencySales] = useState<CurrencySales | null>(null);
  const controller = InAppNotificationController.getInstance();
  const notificationManager = NotificationManager.getInstance();

  useEffect(() => {
    const updateFromController = () => {
      if (controller.currencySales) {
        setCurrencySales(controller.currencySales);
      } else {
        setCurrencySales(null);
      }
    };

    updateFromController();
    const unsubscribe = controller.addListener(updateFromController);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = notificationManager.addListener(() => {
      updateVisibility();
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (currencySales) {
      notificationManager.setCurrencySalesVisible(true);
      updateVisibility();
    } else {
      notificationManager.setCurrencySalesVisible(false);
    }
  }, [currencySales]);

  const updateVisibility = () => {
    const shouldShow = notificationManager.shouldShowCurrencySales();
    setVisible(shouldShow);
    if (shouldShow) {
      controller.markCurrencySalesAsShown();
    }
  };

  const handleClose = () => {
    setVisible(false);
    notificationManager.setCurrencySalesVisible(false);
    if (!useModal) {
      TyradsSdkCoreMethods.dismissInAppNotification();
    }
  };

  const handleButtonPress = () => {
    handleClose();
    setTimeout(() => {
      TyradsSdkCoreMethods.showOffers({ launchMode: 2 });
    }, 400)
  };

  return (
    <CardAlert visible={visible} onClose={handleClose} useModal={useModal}>
      <CardGradient onClose={handleClose}>
        <Text style={styles.title}>{"Bonus Rewards \nUnlocked!"}</Text>
        <View style={styles.horizontalLine} />
        <Text style={styles.subtitle}>{`You get ${currencySales?.multiplier}X bonus rewards!`}</Text>
        <Text style={styles.text}>Go to offerwall and activate new offer!</Text>
        {
          <View style={styles.timerContainer}>
            <Text style={styles.timerMessage}>Bonus Expires in </Text>
            <CountdownTimer style={styles.timer} duration={currencySales?.remainingTimeSeconds ?? 0}></CountdownTimer>
          </View>
        }
        <TouchableOpacity
          style={[styles.outlinedButton, { borderColor: TyradsSdkCore.getInstance().mainColor || "#02B5BE", backgroundColor: "white" }]}
          onPress={handleButtonPress}
          activeOpacity={0.8}
        >
          <View style={styles.outlinedButtonTextContainer}>
            <Text style={[styles.outlinedButtonText, { color: TyradsSdkCore.getInstance().mainColor || "#02B5BE" }]}>Go to Offerwall</Text>
          </View>
        </TouchableOpacity>
      </CardGradient>
    </CardAlert>
  )
};

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
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E2020',
    textAlign: 'center',
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