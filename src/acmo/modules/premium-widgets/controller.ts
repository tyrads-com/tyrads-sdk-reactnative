
import repository from './repository';

class PremiumWidgetsController {
  private static instance: PremiumWidgetsController;

  private constructor() { }

  public static getInstance(): PremiumWidgetsController {
    if (!PremiumWidgetsController.instance) {
      PremiumWidgetsController.instance = new PremiumWidgetsController();
    }
    return PremiumWidgetsController.instance;
  }

  public async getPremiums(): Promise<{
    campaigns: Campaign[];
    currencySales: CurrencySales;
    summary: number;
  }> {
    const [campaigns, currencySales, summary] = await Promise.all([
      repository.fetchTargetedCampaigns(),
      repository.fetchCurrencySales(),
      repository.fetchSummary(),
    ]);

    return {
      campaigns,
      currencySales,
      summary,
    };
  }

  public async openOffer(campaign: Campaign) {
    await repository.openOffer(campaign);
  }
}

export default PremiumWidgetsController.getInstance();