import { useEffect } from "react"
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Logger } from "../../../../core/helpers/logger"
import { numeral } from "../../../../core/helpers/numeral"
import { CountdownTimer } from "../../../../core/components/countdown-timer"
import InAppNotificationController from "../../controller"
import { acmoLaunchURL } from "../../../../core/helpers/launcher"

export const LimitedTimeOfferCard: React.FC<{ activatedCampaign: ActivatedCampaign | null }> = ({ activatedCampaign }) => {

  const controller = InAppNotificationController.getInstance();

  useEffect(() => {
    Logger.log('activatedCampaign in offer card', activatedCampaign)
  })

  const handleButtonPress = (link: string) => {
    acmoLaunchURL(link);
  }

  return <View style={styles.container}>
    <Image
      source={require('../../../../../assets/images/alarm-clock.png')}
      style={styles.bgImage}
    />
    <View style={styles.appHeader}>
      <Image
        source={{ uri: activatedCampaign?.app.thumbnail }}
        style={styles.thumbnail}
      />
      <Text style={styles.appName}>
        {activatedCampaign?.app.title}
      </Text>
    </View>
    <FlatList
      data={activatedCampaign?.limitedTimeEvents || []}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item: event, index }) => (
        <View key={index}
          style={styles.eventContainer}>
          <View style={styles.eventNameContainer}>
            <Text style={styles.eventName}>
              {event.eventName}
            </Text>
            <View style={styles.eventPayoutRow}>
              <Image style={styles.eventCurrencyIcon}
                source={{ uri: activatedCampaign?.currency.adUnitCurrencyIcon }}
              />
              <Text style={[styles.eventPayout, { color: '#02B5BE' }]}>
                {numeral(event.limitedTimeEventRemainingSeconds)}
              </Text>
            </View>
          </View>
          {
            !controller.showCountdown(event)
              ?
              <Text
                style={[
                  styles.eventStatus,
                  { color: event.conversionStatus == 'approved' ? '#A3A9B6' : '#FF554A' }
                ]}>
                {controller.getFinalStatusString(event)}
              </Text>
              :
              <View style={styles.timerContainer}>
                <CountdownTimer
                  style={styles.timer}
                  duration={event.limitedTimeEventRemainingSeconds}
                />
              </View>
          }
        </View>
      )}
      style={styles.eventsContainer}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
    />
    <TouchableOpacity style={[styles.filledButton, { backgroundColor: "#02B5BE", }]}
      onPress={() => handleButtonPress(activatedCampaign?.app.previewUrl || '')}
      activeOpacity={0.8}
    >
      <Text style={styles.btnText}>Play Now</Text>
    </TouchableOpacity>
  </View>
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 16,
    width: '100%',
    maxWidth: '100%',
    padding: 16,
    backgroundColor: '#FFF9ED',
    overflow: 'hidden',
  },
  bgImage: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  thumbnail: {
    width: 43,
    height: 43,
    borderRadius: 7,
    marginRight: 13
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    width: '75%',
    fontSize: 12,
    fontWeight: '600',
    color: '#1E2020',
    marginRight: 16,
  },
  eventsContainer: {
    maxHeight: 350
  },
  eventContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  eventNameContainer: {
    width: '58%',
    marginRight: 8,
  },
  eventName: {
    fontSize: 12,
    color: '#1E2020',
  },
  eventPayoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  eventCurrencyIcon: {
    width: 12,
    height: 12,
    marginRight: 4,
    objectFit: 'contain',
  },
  eventPayout: {
    fontSize: 12,
    fontWeight: '700',
  },
  eventStatus: {
    fontSize: 10,
    fontWeight: '600',
  },
  timerContainer: {
    backgroundColor: '#FF554A',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  timer: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white'
  },
  filledButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white'
  }
})