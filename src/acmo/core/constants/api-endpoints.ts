class AcmoAPIEndpoints {
  public static readonly TARGETED_CAMPAIGNS = "campaigns";
  public static readonly ACTIVE_CAMPAIGNS = "campaigns/activated";
  public static readonly SUMMARY = "campaigns/activated/summary";
  public static readonly ENGAGEMENT = "account/engagement";
  public static readonly USER_ACTIVITIES = "account/activity";
  public static readonly ACTIVATE_CAMPAIGN = (id: number) => `campaigns/${id}/activate`;
  public static readonly TRANSLATIONS = (locale: string) => `translations/${locale}`;
  public static readonly TRANSLATIONS_VERSION = "translations/version";
}

export default AcmoAPIEndpoints;