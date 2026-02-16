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
      const {status, data} = await http.get(
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

    try {
      const {status, data} = await http.get(
        AcmoAPIEndpoints.ENGAGEMENT,
      );
      Logger.log(status, data)
      if (status === 200) {
        return data.data.CurrencySales as CurrencySales;
      }
      return null
    } catch (err) {
      Logger.error(err)
      return null
    }
  }

}

export default InAppNotificationRepo;