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
  public limitedTimeEvents: Set<ActivatedCampaign> | null = null;

  public async init() {
    const result = await Promise.all([
      InAppNotificationRepo.getInstance().fetchCurrencySales(),
      InAppNotificationRepo.getInstance().fetchLimitedTimeOffers(),
    ]);

    this.currencySales = result[0];
    const activeOffers = result[1]?.data || [];
    const limitedTimeEvents = this.filterLimitedOffersWithEvents(activeOffers);
    this.limitedTimeEvents = new Set(limitedTimeEvents);
  }
  private filterLimitedOffersWithEvents(
    activeOffers: ActivatedCampaignsData[]
  ): ActivatedCampaign[] {
    const allCampaigns = activeOffers
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
    return allCampaigns;
  }
}

export default InAppNotificationController;