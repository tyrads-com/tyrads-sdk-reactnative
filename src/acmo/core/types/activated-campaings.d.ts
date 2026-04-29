interface ActivatedCampaignsResponse {
  data: ActivatedCampaignsData[];
  message: string;
}

interface ActivatedCampaignsData {
  groupName: string;
  availableCurrencies: { [key: string]: AvailableCurrency };
  campaigns: ActivatedCampaign[];
}

interface AvailableCurrency {
  currencyId: number;
  currencyIcon: string;
  currencyName: string;
}

interface ActivatedCampaign {
  campaignId: number;
  campaignName: string;
  campaignDescription: null | string;
  campaignType: string;
  campaignPremium: boolean;
  validity: {
    isRetryDownload: boolean;
    isActivated: boolean;
    isOldUser: boolean;
    activeCurrencyId: number;
    expiredOn: string | null;
    expiredInSeconds: number | null;
    isInstalled: boolean;
    capReached: boolean;
  };
  availableCurrencies: { [key: string]: AvailableCurrency };
  app: App;
  campaignStatus: string;
  group: null | string;
  stage: null | string;
  eventSummary: CampaignEventSummary;
  limitedTimeEvents: LimitedTimeEvent[];
  shorterMaxTimeEvents: any[];
}

interface App {
  id: number;
  title: string;
  packageName: string;
  rating: number;
  shortDescription: string;
  store: string;
  storeCategory: string;
  previewUrl: string;
  thumbnail: string;
}

interface CampaignEventSummary {
  playableEventCountAvailable: number;
  playableEventCountCompleted: number;
  playableEventCountTotal: number;
  microchargeEventCountAvailable: number;
  microchargeEventCountCompleted: number;
  microchargeEventCountTotal: number;
}

interface LimitedTimeEvent {
  appEventId: number;
  conversionStatus: null | string;
  identifier: string;
  eventName: string;
  eventDescription: null | string;
  eventCategory: string;
  payoutInfo: { [key: string]: PayoutInfo };
  allowDuplicateEvents: boolean;
  maxTime: number;
  maxTimeMetric: null | string;
  maxTimeRemainSeconds: null | number;
  enforceMaxTimeCompletion: boolean;
  isLimitedTimeEvent: boolean;
  limitedTimeEventRemainingSeconds: number;
  isTicketSubmitted: boolean;
  ticketStatus: null | string;
  lockEventRule: null | string;
  hideEventRule: null | string;
  shorterMaxTimeRule: null | string;
  specialCompletionReason: null | string;
  dailyCount: number;
  dailyLimit: null | number;
  count: number;
  limit: null | number;
  totalDailyUniqueCount: number;
  totalDailyUniqueLimit: null | number;
  dailyUniqueTodayExist: boolean;
}

interface PayoutInfo {
  currencyId: number;
  currencyName: string;
  currencyIcon: string;
  currencyConversionRate: number;
  payoutAmountConverted: number;
}
