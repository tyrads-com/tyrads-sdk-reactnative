interface ActivatedCampaignsResponse {
  data: ActivatedCampaignsData[];
  message: string;
}

interface ActivatedCampaignsData {
  groupName: string;
  campaigns: ActivatedCampaign[];
}

interface ActivatedCampaign {
  campaignId: number;
  campaignName: string;
  campaignDescription: null | string;
  createdOn: string;
  sortingScore: number;
  status: string;
  expiredOn: null | string;
  app: App;
  isRetryDownload: boolean;
  capReached: boolean;
  group: null | string;
  premium: boolean;
  isOldUser: boolean;
  isInstalled: boolean;
  campaignEventSummary: CampaignEventSummary;
  limitedTimeEvents: LimitedTimeEvent[];
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
  confidenceScore: number;
  securityLabel: string;
}

interface CampaignEventSummary {
  playableEventCountAvailable: number;
  playableEventCountCompleted: number;
  playableEventCountTotal: number;
}

interface LimitedTimeEvent {
  id: number;
  conversionStatus: null | string;
  identifier: string;
  eventName: string;
  eventDescription: null | string;
  eventCategory: string;
  payoutAmount: number;
  payoutAmountConverted: number;
  payoutTypeId: number;
  payoutType: string;
  allowDuplicateEvents: boolean;
  maxTime: number;
  maxTimeMetric: null | string;
  maxTimeRemainSeconds: null | number;
  enforceMaxTimeCompletion: boolean;
  isLimitedTimeEvent: boolean;
  limitedTimeEventRemainingSeconds: number;
  isTicketSubmitted: boolean;
}
