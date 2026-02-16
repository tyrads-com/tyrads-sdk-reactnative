class AcmoAPIEndpoints {
  public static readonly TARGETED_CAMPAIGNS = "campaigns";
  public static readonly ACTIVE_CAMPAIGNS = "activated-campaigns";
  public static readonly ENGAGEMENT = "engagement";
  public static readonly USER_ACTIVITIES = "user-activities";
  public static readonly ACTIVATE_CAMPAIGN = (id: number) => `campaigns/active/${id}`;
  public static readonly TRANSLATIONS = (locale: string) => `translations/${locale}`;
  public static readonly TRANSLATIONS_VERSION = "translations/version";
}

export default AcmoAPIEndpoints;