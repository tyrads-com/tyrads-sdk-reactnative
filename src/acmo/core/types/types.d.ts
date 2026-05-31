
interface AcmoOffersResponseModel {
  code: number;
  data: Campaign[];
  message: string;
  timestamp: number;
  responseTime: number;
}

interface Campaign {
  campaignId: number;
  campaignName: string;
  campaignDescription: string;
  campaignType: string;
  campaignPremium: boolean;
  campaignStatus: string;
  validity: Validity;
  availableCurrencies: { [key: string]: AvailableCurrency };
  app: App;
  targeting: Targeting;
  payoutSummary: { [key: string]: PayoutSummary };
  tracking: Tracking;
  creative: Creative;
  hasPlaytimeEvents: boolean;
}

interface Validity {
  isRetryDownload: boolean;
  isActivated: boolean;
  isOldUser: boolean;
  expiredOn: string | null;
  expiredInSeconds: number | null;
  isInstalled: boolean;
}

interface AvailableCurrency {
  currencyId: number;
  currencyIcon: string;
  currencyName: string;
}

interface PayoutSummary {
  totalPayoutConverted: number;
  totalPlayablePayoutConverted: number;
  totalMicrochargePayoutConverted: number;
}

interface Creative {
  creativeUrl: string;
  creativePacks: CreativePack[];
}

interface CreativePack {
  creativePackId: number;
  creativePackName: string;
  languageName: string;
  languageCode: string;
  creatives: (CreativeElement | null)[];
}

interface CreativeElement {
  creativeId: number;
  creativeName: string;
  callToAction: string | null;
  text: string;
  byteSize: string;
  fileUrl: string;
  duration: string | null;
  creativeType: CreativeType;
}

interface CreativeType {
  name: string;
  type: string;
  width: string;
  height: string;
  creativeCategoryType: string;
}

interface Targeting {
  os: string | null;
  targetingType: string;
  reward: Reward | null;
}

interface Tracking {
  attributionTool: string | null;
  clickUrl: string | null;
  impressionUrl: string | null;
  s2sClickUrl: string | null;
}

interface App {
  id: number;
  title: string;
  packageName: string;
  rating: number;
  previewUrl: string;
  shortDescription: string;
  store: string;
  storeCategory: string;
  thumbnail: string;
}

interface Reward {
  rewardDifficulty: string;
  incentRewardDescription: string;
}

interface CurrencySales {
  name: null | string,
  multiplier: null | number,
  bannerUrl: null | string,
  dateStart: null | string,
  dateEnd: null | string,
  remainingTimeSeconds: null | number
}

interface ApiHeaders {
  languageCode: string;
  premiumColor: string;
  xUserId: string;
  xApiKey: string;
  xApiSecret: string;
  xSdkPlatform: string;
  xSdkVersion: string;
  userAgent: string;
}