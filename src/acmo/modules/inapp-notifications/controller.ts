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

  public async markCurrencySalesAsShown() {
    const key = await this.getCurrencySalesKey();
    await saveData(key, true);
  }

  public async markLimitedTimeOffersAsShown() {
    const key = await this.getLimitedTimeOffersKey();
    await saveData(key, true);
  }

  public async init() {
    const [currencySalesShown, limitedTimeOffersShown] = await Promise.all([
      getData<boolean>(await this.getCurrencySalesKey()),
      getData<boolean>(await this.getLimitedTimeOffersKey()),
    ]);

    const tasks: [Promise<CurrencySales | null>, Promise<ActivatedCampaignsResponse | null>] = [
      !currencySalesShown
        ? InAppNotificationRepo.getInstance().fetchCurrencySales()
        : Promise.resolve(null),
      !limitedTimeOffersShown
        ? InAppNotificationRepo.getInstance().fetchLimitedTimeOffers()
        : Promise.resolve(null),
    ];

    const result = await Promise.all(tasks);

    this.currencySales = result[0] || null;
    const activeOffers = result[1]?.data || [];
    const limitedTimeEvents = this.filterLimitedOffersWithEvents(activeOffers);
    this.limitedTimeEvents = limitedTimeEvents;
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