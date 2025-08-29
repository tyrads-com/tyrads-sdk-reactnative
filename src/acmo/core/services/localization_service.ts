import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { type AxiosInstance } from 'axios';

const BASE_URL = 'https://api.tyrads.com/v3.0/';

interface TranslationResponse {
  data: Array<{
    code: string;
    sha256: string;
  }>;
}

type Translations = {
  [key: string]: string | Translations;
};

class LocalizationService {
  private static instance: LocalizationService;
  private axios: AxiosInstance | null = null;
  private translations: Translations = {};
  private supportedLocales: string[] = [];
  private readonly fallbackLocale: string = 'en';

  private constructor() {
  }

  public static getInstance(): LocalizationService {
    if (!LocalizationService.instance) {
      LocalizationService.instance = new LocalizationService();
    }
    return LocalizationService.instance;
  }

  private static async getHeadersFromStorage(): Promise<Record<string, string>> {
    try {
      const data = await AsyncStorage.getItem('credentials');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to retrieve headers from AsyncStorage', error);
      return {};
    }
  }


  public async init(locale: string): Promise<void> {
    if (this.axios) {
      return;
    }

    const headers = await LocalizationService.getHeadersFromStorage();

    this.axios = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        "X-API-Key": headers["X-API-Key"],
        "X-API-Secret": headers["X-API-Secret"],
      }
    });

    this.axios.interceptors.request.use(
      (config) => {
        console.log('====================================');
        console.log(`Request: ${config.method} ${config.baseURL}${config.url}`);
        console.log('Headers:', config.headers);
        console.log('====================================');
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    this.axios.interceptors.response.use(
      (res) => {
        console.log('====================================');
        console.log('Response Data:', res.data);
        console.log('====================================');
        return res;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    await this.loadTranslations(locale);
  }

  private async loadTranslations(locale: string, force = false): Promise<void> {
    const hasUpdate = await this.checkForUpdate(locale, force);

    if (!hasUpdate) {
      const cachedData = await AsyncStorage.getItem(`translations_${locale}`);
      if (cachedData) {
        try {
          this.translations = JSON.parse(cachedData);
          return;
        } catch (e) {
          console.error('Failed to parse cached translations', e);
        }
      }
    }

    await this.fetchTranslations(locale, force);
  }

  private async fetchTranslations(locale: string, force = false): Promise<void> {
    if (!this.axios) return;
    try {
      let effectiveLocale = locale;
      if (!this.supportedLocales.includes(locale)) {
        effectiveLocale = this.fallbackLocale;
      }

      const response = await this.axios.get(
        `translations/${effectiveLocale}`,
        {
          params: {
            force,
            format: 'nested',
          },
        }
      );

      if (response.status === 200) {
        this.translations = response.data as Translations;
        await AsyncStorage.setItem(`translations_${effectiveLocale}`, JSON.stringify(response.data));
      } else {
        console.warn(`Failed to load translations: ${response.status}`);
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.error('Network error fetching translations:', e.message);
      } else {
        console.error('An unexpected error occurred:', e);
      }
    }
  }

  private async checkForUpdate(locale: string, force = false): Promise<boolean> {
    if (!this.axios) return false;
    try {
      const response = await this.axios.get<TranslationResponse>('translations/version', { params: { force } });
      if (response.status === 200) {
        const data = response.data.data;
        this.supportedLocales = data.map(item => item.code);

        const currentLocaleData = data.find(item => item.code === locale);
        if (!currentLocaleData) {
          return false;
        }

        const currentLocaleSha256 = currentLocaleData.sha256;
        const cachedVersion = await AsyncStorage.getItem(`cached_version_${locale}`);

        if (currentLocaleSha256 !== cachedVersion) {
          await AsyncStorage.setItem(`cached_version_${locale}`, currentLocaleSha256);
          return true;
        }
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.error('Error checking for update:', e.message);
      } else {
        console.error('An unexpected error occurred:', e);
      }
    }
    return false;
  }

  public translate(key: string, args: Record<string, string | number> = {}): string {
    const keys = key.split('.');
    let currentMap: any = this.translations;

    for (const k of keys) {
      if (typeof currentMap === 'object' && currentMap !== null && currentMap.hasOwnProperty(k)) {
        currentMap = currentMap[k];
      } else {
        return key;
      }
    }

    if (typeof currentMap === 'string') {
      let result = currentMap;
      for (const [argKey, argValue] of Object.entries(args)) {
        const regex = new RegExp(`{${argKey}}`, 'gi');
        result = result.replace(regex, String(argValue));
      }
      return result;
    }

    return key;
  }

  public async changeLanguage(locale: string, force = false): Promise<void> {
    await this.loadTranslations(locale, force);
  }
}

export default LocalizationService;