import { http } from '../../core/network/http-client';
import { Logger } from '../../core/helpers/logger';
import AcmoAPIEndpoints from '../../core/constants/api-endpoints';

class InAppNotificationRepo {
  private static instance: InAppNotificationRepo;

  public static getInstance(): InAppNotificationRepo {
    if (!InAppNotificationRepo.instance) {
      InAppNotificationRepo.instance = new InAppNotificationRepo();
    }
    return InAppNotificationRepo.instance;
  }

  async fetchLimitedTimeOffers(): Promise<ActivatedCampaignsResponse | null> {

    try {
      const { status, data } = await http.get(
        AcmoAPIEndpoints.ACTIVE_CAMPAIGNS,
      );
      Logger.log(status, data)
      if (status === 200) {
        return data as ActivatedCampaignsResponse;
      }
      return null
    } catch (err) {
      Logger.error(err)
      return null
    }
  }
  async fetchCurrencySales(): Promise<CurrencySales | null> {

    const mockData: CurrencySales = {
      "name": "Ramadhan Karemm3",
      "multiplier": 1.97,
      "bannerUrl": "",
      "dateStart": "2025-11-01T00:00:00.000Z",
      "dateEnd": "2025-11-31T23:59:59.000Z",
      "remainingTimeSeconds": 86300
    };


    try {
      const { status, data } = await http.get(
        AcmoAPIEndpoints.ENGAGEMENT,
      );
      Logger.log(status, data)
      if (status === 200) {
        // return data.data.CurrencySales as CurrencySales;
        return mockData;
      }
      return null
    } catch (err) {
      Logger.error(err)
      return null
    }
  }

}

export default InAppNotificationRepo;