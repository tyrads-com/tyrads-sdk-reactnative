import InAppNotificationRepo from "./repository";
import { getData, saveData } from "../../core/storage/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

class InAppNotificationController {
  private static instance: InAppNotificationController | null = null;
  private constructor() { }

  public static getInstance(): InAppNotificationController {
    if (!InAppNotificationController.instance) {
      InAppNotificationController.instance = new InAppNotificationController();
    }
    return InAppNotificationController.instance;
  }

  public currencySales: CurrencySales | null = null;
  public limitedTimeEvents: Array<ActivatedCampaign> | null = null;

  private async getUserId(): Promise<string> {
    try {
      const data = await AsyncStorage.getItem('apiHeaders');
      if (!data) return 'default';
      const parsed = JSON.parse(data);
      const headers = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
      return headers['xUserId'] || 'default';
    } catch {
      return 'default';
    }
  }

  private async getCurrencySalesKey(): Promise<string> {
    const userId = await this.getUserId();
    return `currency_sales_shown_${userId}`;
  }

  private async getLimitedTimeOffersKey(): Promise<string> {
    const userId = await this.getUserId();
    return `limited_time_offers_shown_${userId}`;
  }

  private getTodayDateString(): string {
    return new Date().toDateString();
  }

  public async markCurrencySalesAsShown() {
    if (!this.currencySales?.name) return;
    const key = await this.getCurrencySalesKey();
    const shownData = await getData<any>(key) || {};
    const safeShownData = (typeof shownData === 'object' && shownData !== null) ? shownData : {};
    safeShownData[this.currencySales.name] = this.getTodayDateString();
    await saveData(key, safeShownData);
  }

  public async markLimitedTimeOffersAsShown() {
    if (!this.limitedTimeEvents) return;
    const key = await this.getLimitedTimeOffersKey();
    const shownData = await getData<any>(key) || {};
    const safeShownData = (typeof shownData === 'object' && shownData !== null) ? shownData : {};
    const today = this.getTodayDateString();
    this.limitedTimeEvents.forEach(campaign => {
      campaign.limitedTimeEvents.forEach(event => {
        safeShownData[event.id.toString()] = today;
      });
    });
    await saveData(key, safeShownData);
  }

  public async init() {
    const [currencySalesKey, limitedTimeOffersKey] = await Promise.all([
      this.getCurrencySalesKey(),
      this.getLimitedTimeOffersKey(),
    ]);

    const [currencySalesShownData, limitedTimeOffersShownData] = await Promise.all([
      getData<Record<string, string>>(currencySalesKey),
      getData<Record<string, string>>(limitedTimeOffersKey),
    ]);

    const today = this.getTodayDateString();

    const isCurrencyShownToday = currencySalesShownData && Object.values(currencySalesShownData).includes(today);
    const isLimitedShownToday = limitedTimeOffersShownData && Object.values(limitedTimeOffersShownData).includes(today);

    const [currencySalesResult, limitedTimeOffersResult] = await Promise.all([
      !isCurrencyShownToday
        ? InAppNotificationRepo.getInstance().fetchCurrencySales()
        : Promise.resolve(null),
      !isLimitedShownToday
        ? InAppNotificationRepo.getInstance().fetchLimitedTimeOffers()
        : Promise.resolve(null),
    ]);

    if (currencySalesResult && currencySalesResult.name) {
      const hasBeenShownEver = currencySalesShownData && !!currencySalesShownData[currencySalesResult.name];
      this.currencySales = !hasBeenShownEver ? currencySalesResult : null;
    } else {
      this.currencySales = null;
    }

    const activeOffers = limitedTimeOffersResult?.data || [];
    const allFilteredOffers = this.filterLimitedOffersWithEvents(activeOffers);

    const hasNewEvent = allFilteredOffers.some(campaign =>
      campaign.limitedTimeEvents.some(event =>
        !limitedTimeOffersShownData || !limitedTimeOffersShownData[event.id.toString()]
      )
    );

    this.limitedTimeEvents = hasNewEvent ? allFilteredOffers : null;
  }
  private filterLimitedOffersWithEvents(
    activeOffers: ActivatedCampaignsData[]
  ): ActivatedCampaign[] {
    const allCampaigns = activeOffers
      .filter(group => group.groupName.toLocaleLowerCase() == "hotdeals")
      .flatMap(offer => offer.campaigns)
      .filter(campaign => campaign.limitedTimeEvents.length > 0)
      .filter(campaign =>
        campaign.status.toLowerCase() !== 'suspended' &&
        campaign.isInstalled
      )
      .filter(campaign =>
        campaign.limitedTimeEvents.some(event =>
          event.conversionStatus?.toLowerCase() !== "approved"
        )
      );
    const uniqueCampaigns = allCampaigns.filter((campaign, index, self) =>
      index === self.findIndex((c) => c.campaignId === campaign.campaignId)
    );
    return uniqueCampaigns;
  }

  public showCountdown(event: LimitedTimeEvent): boolean {
    const { allowDuplicateEvents, conversionStatus, dailyCount, dailyLimit } = event;
    const isDailyLimitIncomplete = dailyCount === null || dailyLimit === null || dailyCount < dailyLimit;

    if (!allowDuplicateEvents) {
      return conversionStatus === null;
    }
    if (isDailyLimitIncomplete) {
      return true;
    }
    return false;
  }

  public getFinalStatusString(event: LimitedTimeEvent): 'Completed' | 'Rejected' | '' {
    const { allowDuplicateEvents, conversionStatus, dailyCount, dailyLimit } = event;
    if (!allowDuplicateEvents) {
      if (conversionStatus === 'approved') return 'Completed';
      if (conversionStatus === 'rejected') return 'Rejected';
    }

    const isDailyLimitComplete = dailyCount !== null && dailyLimit !== null && dailyCount === dailyLimit;
    if (allowDuplicateEvents && isDailyLimitComplete) {
      return 'Completed';
    }
    return '';
  }

}

export default InAppNotificationController;