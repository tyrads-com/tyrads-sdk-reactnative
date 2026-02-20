import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useLocalization } from '../../localization/localization_context';

const PremiumEmptyView: React.FC<{ onContinue?: () => void, colorPremium?: string}> = ({ onContinue, colorPremium}) => {

  const { t } = useLocalization();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../../assets/images/premium-emptybg.jpeg')}
        style={styles.backgroundImage}
        imageStyle={styles.imageBorderRadius}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: 'white', fontFamily: 'Poppins_600SemiBold' }]}>
            {t('data.widget.empty.noOffers')}
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: 'white' }]}
            onPress={onContinue}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: colorPremium ?? '#1C90DF',
                  fontWeight: 'bold',
                  fontSize: 12,
                },
              ]}
            >
              {t('data.widget.button.continuePlaying')}
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  backgroundImage: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageBorderRadius: {
    borderRadius: 16,
  },
  content: {
    paddingVertical: 22,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 16,
  },
  button: {
    minWidth: '100%',
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
});

export default PremiumEmptyView;
