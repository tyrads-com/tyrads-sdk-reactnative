import { http } from '../../core/network/http-client';
import { acmoLaunchURLForce } from '../../core/helpers/launcher';
import AcmoAPIEndpoints from '../../core/constants/api-endpoints';
import TyradsSdkCore from '../../core/tyrads-sdk-core';
import { Logger } from '../../core/helpers/logger';

class PremiumWidgetsRepository {
  private static instance: PremiumWidgetsRepository;
  private constructor() { }
  static getInstance() {
    if (!PremiumWidgetsRepository.instance) {
      PremiumWidgetsRepository.instance = new PremiumWidgetsRepository();
    }
    return PremiumWidgetsRepository.instance;
  }

  public async fetchTargetedCampaigns(): Promise<Campaign[]> {
    const language = TyradsSdkCore.currentLanguage

    const { status, data } = await http.get(`${AcmoAPIEndpoints.TARGETED_CAMPAIGNS}?lang=${language}`);

    if (status !== 200) {
      throw new Error('Failed to fetch targeted campaigns');
    }

    const campaigns = data.data as Campaign[];

    const hotOffers = campaigns
      .sort((a, b) => {
        if (a.campaignPremium && !b.campaignPremium) return -1;
        if (!a.campaignPremium && b.campaignPremium) return 1;
        return 0;
      })
      .slice(0, 5);

    return hotOffers as Campaign[];
  }

  public async fetchCurrencySales(): Promise<CurrencySales> {
    const language = TyradsSdkCore.currentLanguage

    const { status, data } = await http.get(`${AcmoAPIEndpoints.ENGAGEMENT}?lang=${language}`);

    if (status !== 200) {
      throw new Error('Failed to fetch currency sales');
    }

    return data.data.CurrencySales as CurrencySales;
  }

  public async fetchSummary(): Promise<number> {
    const language = TyradsSdkCore.currentLanguage

    const { status, data } = await http.get(`${AcmoAPIEndpoints.SUMMARY}?lang=${language}`);

    if (status !== 200) {
      throw new Error('Failed to fetch summary');
    }

    return data.data.activeCampaignCount as number;
  }

  public async track(activity: string): Promise<void> {

    const { status } = await http.post(AcmoAPIEndpoints.USER_ACTIVITIES, { activity });

    if (status !== 200) {
      throw new Error('Failed to track activity');
    }
  }

  public async openOffer(campaign: Campaign): Promise<void> {
    const campaignId = campaign.campaignId;
    const clickUrl = campaign.tracking.clickUrl;
    const isRetryDownload = campaign.validity.isRetryDownload;
    const isInstalled = campaign.validity.isInstalled;
    const previewUrl = campaign.app.previewUrl;
    const s2sClickUrl = campaign.tracking.s2sClickUrl;

    try {
      let url: string = clickUrl || "";
      if (isInstalled) {
        url = previewUrl;
      } else {
        if (isRetryDownload) {
          await this.track("CampaignActivatedRetry");
        } else {
          await this.track("CampaignActivated");
        }
        await http.post(AcmoAPIEndpoints.ACTIVATE_CAMPAIGN(campaignId), {}, {});
      }
      if (s2sClickUrl != null) {
        const res = await http.get(s2sClickUrl);
        if (res.status == 200) {
          // url = res.data.url;
          return;
        }
      }
      await acmoLaunchURLForce(url);
    } catch (error) {
      Logger.error(error)
    }
  }
}

export default PremiumWidgetsRepository.getInstance();

