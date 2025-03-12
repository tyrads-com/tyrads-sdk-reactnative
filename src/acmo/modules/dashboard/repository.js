import axios from 'axios';
import { getData } from '../../core/storage/storage';

const transformCampaigns = (campaigns) => {
  return campaigns.map((campaign) => ({
    campaignId: campaign.campaignId,
    appId: campaign.app?.id || '',
    title: campaign.app?.title || 'Unknown Title',
    creativePackName:
      campaign.creative?.creativePacks?.[0]?.creativePackName || '',
    fileUrl:
      campaign.creative?.creativePacks?.[0]?.creatives?.[0]?.fileUrl || '',
    points: campaign.campaignPayout?.totalPayoutConverted || 0,
    rewards: campaign.campaignPayout?.totalEvents || 0,
    currency: campaign.currency || {},
    thumbnail: campaign.app?.thumbnail || '',
    premium: campaign.premium || false,
    sortingScore: campaign.sortingScore || 0,
  }));
};

export const fetchCampaignsData = async (
  setLanguage,
  setPremiumColor,
  setCampaigns,
  setError,
  setIsLoading
) => {
  setIsLoading(true);

  try {
    const data = await getData('apiHeaders');
    const parsedHeaderData = JSON.parse(data);
    setLanguage(parsedHeaderData.languageCode);
    setPremiumColor(parsedHeaderData.premiumColor);

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-User-ID': parsedHeaderData.xUserId,
      'X-API-Key': parsedHeaderData.xApiKey,
      'X-API-Secret': parsedHeaderData.xApiSecret,
      'X-SDK-Platform': parsedHeaderData.xSdkPlatform,
      'X-SDK-Version': parsedHeaderData.xSdkVersion,
      'User-Agent': parsedHeaderData.userAgent,
    };

    const response = await axios.get(
      `https://api.tyrads.com/v2.0/campaigns?lang=${parsedHeaderData.languageCode}`,
      {
        headers: headers,
      }
    );

    const transformedCampaigns = transformCampaigns(response.data.data);

    const hotOffers = transformedCampaigns
      .sort((a, b) => b.premium - a.premium || b.sortingScore - a.sortingScore)
      .filter((item) => item.points > 0)
      .slice(0, 5);

    setCampaigns(hotOffers);
    
  } catch (error) {
    if (error.response) {
      console.log('Response Error:', error.response.data);
      console.log('Status Code:', error.response.status);
      console.log('Response Headers:', error.response.headers);
    } else if (error.request) {
      console.log('No Response from API:', error.request);
    } else {
      console.log('Error setting up request:', error.message);
    }
    setError('Something went wrong, please try again');
  } finally {
    setIsLoading(false);
  }
};
