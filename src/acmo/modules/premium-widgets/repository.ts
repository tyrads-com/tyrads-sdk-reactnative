import axios from 'axios';
import { getData } from '../../core/storage/storage';
import { acmoLaunchURLForce } from '../../core/helpers/launcher';

export const fetchPremiumOfferDetails = async (
  setPremiumColor: (color: string) => void,
  setCampaigns: (campaigns: Campaign[]) => void,
  setCurrencySale: (currencySale: CurrencySales) => void,
  setActiveCount: (activeCount: number) => void,
  setError: (error: string) => void,
  setIsLoading: (loading: boolean) => void
): Promise<void> => {
  setIsLoading(true);

  try {
    const data: any = await getData('apiHeaders');
    if (!data) throw new Error('apiHeaders data not found.');

    const parsedHeaderData: ApiHeaders = JSON.parse(data);
    setPremiumColor(parsedHeaderData.premiumColor);

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-User-ID': parsedHeaderData.xUserId,
      'X-API-Key': parsedHeaderData.xApiKey,
      'X-API-Secret': parsedHeaderData.xApiSecret,
      'X-SDK-Platform': parsedHeaderData.xSdkPlatform,
      'X-SDK-Version': parsedHeaderData.xSdkVersion,
      'User-Agent': parsedHeaderData.userAgent,
    };

    const langParam = `?lang=${parsedHeaderData.languageCode}`;

    const [campaignsRes, currencyRes, summaryRes] = await Promise.all([
      axios.get<{ data: Campaign[] }>(`https://api.tyrads.com/v3.0/campaigns${langParam}`, { headers }),
      axios.get<{ data: { CurrencySales: CurrencySales } }>(`https://api.tyrads.com/v3.0/engagement${langParam}`, { headers }),
      axios.get<{ data: { activeCampaignCount: number } }>(`https://api.tyrads.com/v3.0/activated-campaigns/summary${langParam}`, { headers })
    ]);

    const hotOffers = campaignsRes.data.data
      .sort((a, b) => {
        if (a.campaignPremium && !b.campaignPremium) return -1;
        if (!a.campaignPremium && b.campaignPremium) return 1;
        return 0;
      })
      .filter(item => {
        const payouts = Object.values(item.payoutSummary);
        return payouts.some(p => p.totalPlayablePayoutConverted > 0);
      })
      .slice(0, 5);
    // const currency: CurrencySales = {
    //   "name": "Ramadhan Karem",
    //   "multiplier": 1.5,
    //   "bannerUrl": "",
    //   "dateStart": "2025-03-10T00:00:00.000Z",
    //   "dateEnd": "2025-03-10T23:59:59.000Z",
    //   remainingTimeSeconds: 3090
    // };

    setCampaigns(hotOffers);

    setCurrencySale(currencyRes.data.data.CurrencySales);

    setActiveCount(summaryRes.data.data.activeCampaignCount);
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      console.log('Response Error:', error.response.data);
    } else if (axios.isAxiosError(error) && error.request) {
      console.log('No Response from API:', error.request);
    } else {
      console.log('Request Setup Error:', error.message);
    }
    setError('Something went wrong, please try again.');
  } finally {
    setIsLoading(false);
  }
};

const track = async (activity: string) => {
  const data: any = await getData('apiHeaders');
  if (!data) throw new Error('apiHeaders data not found.');

  const parsedHeaderData: ApiHeaders = JSON.parse(data);

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-User-ID': parsedHeaderData.xUserId,
    'X-API-Key': parsedHeaderData.xApiKey,
    'X-API-Secret': parsedHeaderData.xApiSecret,
    'X-SDK-Platform': parsedHeaderData.xSdkPlatform,
    'X-SDK-Version': parsedHeaderData.xSdkVersion,
    'User-Agent': parsedHeaderData.userAgent,
  };
  try {
    const fd = {
      "activity": activity
    };
    await axios.post('https://api.tyrads.com/v3.0/user-activities', fd, { headers });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.log('Response Error:', error.response.data);
    } else if (axios.isAxiosError(error) && error.request) {
      console.log('No Response from API:', error.request);
    } else {
      console.log('Request Setup Error:', error);
    }
  }
}

export const openOffer = async (campaign: Campaign) => {
  const campaignId = campaign.campaignId;
  const clickUrl = campaign.tracking.clickUrl;
  const isRetryDownload = campaign.validity.isRetryDownload;
  const isInstalled = campaign.validity.isInstalled;
  const previewUrl = campaign.app.previewUrl;
  const s2sClickUrl = campaign.tracking.s2sClickUrl;

  const data: any = await getData('apiHeaders');
  if (!data) throw new Error('apiHeaders data not found.');

  const parsedHeaderData: ApiHeaders = JSON.parse(data);

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-User-ID': parsedHeaderData.xUserId,
    'X-API-Key': parsedHeaderData.xApiKey,
    'X-API-Secret': parsedHeaderData.xApiSecret,
    'X-SDK-Platform': parsedHeaderData.xSdkPlatform,
    'X-SDK-Version': parsedHeaderData.xSdkVersion,
    'User-Agent': parsedHeaderData.userAgent,
  };

  try {
    let url: string = clickUrl || "";
    if (isInstalled) {
      url = previewUrl;
    } else {
      if (isRetryDownload) {
        await track("CampaignActivatedRetry");
      } else {
        await track("CampaignActivated");
      }
      await axios.post(`https://api.tyrads.com/v3.0/campaigns/active/${campaignId}`, {}, { headers });
    }
    if (s2sClickUrl != null) {
      const res = await axios.get(s2sClickUrl);
      if (res.status == 200) {
        // url = res.data.url;
        return;
      }
    }
    await acmoLaunchURLForce(url);
  } catch (error) {
    console.log('=============Error=============');
    console.log(error);
    console.log('====================================');
  }
}

