import InAppNotificationRepo from "./repository";

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

  public async init() {
    const result = await Promise.all([
      InAppNotificationRepo.getInstance().fetchCurrencySales(),
      InAppNotificationRepo.getInstance().fetchLimitedTimeOffers(),
    ]);

    this.currencySales = result[0];
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