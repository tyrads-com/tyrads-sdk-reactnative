import { View } from 'react-native';
import { LocalizationProvider } from '../localization/localization_context';
import TyradsSdkCore from '../../core/tyrads-sdk-core';
import BasePremiumOffersWidget, { PremiumWidgetStyles } from './premium_offers_widget';
import PremiumWidgetsLoading from './components/premium_loading';

export const PremiumOffersWidget = ({
  widgetStyle = PremiumWidgetStyles.list,
  launchMode = 2,
}: {
  widgetStyle?: PremiumWidgetStyles;
  launchMode?: number;
}) => {
  const handleNavigation = (route?: string, campaignID?: number | null) => {
    TyradsSdkCore.showOffers({ route: route, campaignID: campaignID, launchMode: launchMode });
  };
  return (
    <LocalizationProvider>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <BasePremiumOffersWidget
          widgetStyle={widgetStyle}
          onNavigate={handleNavigation}
        />
      </View>
    </LocalizationProvider>
  );
};

export const PremiumOffersWidgetLoading = (
  { widgetStyle = PremiumWidgetStyles.list }: {
    widgetStyle?: PremiumWidgetStyles;
  }
) => {
  return (
    <PremiumWidgetsLoading
      widgetStyle={widgetStyle}
    />
  );
};
