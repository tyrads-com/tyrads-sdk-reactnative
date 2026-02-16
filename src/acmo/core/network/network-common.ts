import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { type AxiosInstance, AxiosError } from 'axios';
import { AcmoConfig } from '../../../acmo_config';
import { Logger } from '../helpers/logger';

const BASE_URL = AcmoConfig.BASE_URL;

class NetworkCommon {
  private static instance: NetworkCommon;
  private axiosInstance: AxiosInstance | null = null;

  private constructor() { }


  public static getInstance(): NetworkCommon {
    if (!NetworkCommon.instance) {
      NetworkCommon.instance = new NetworkCommon();
    }
    return NetworkCommon.instance;
  }

  private async getStoredHeaders(): Promise<Record<string, string>> {
    try {
      const data = await AsyncStorage.getItem('apiHeaders');
      if (!data) throw new Error('apiHeaders data not found.');
      let parsed = JSON.parse(data);

      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }

      return parsed;
    } catch (e) {
      Logger.error('[NetworkCommon] Failed to read stored headers', e);
      return {};
    }
  }

  public async init(): Promise<void> {
    if (this.axiosInstance) return;

    const savedHeaders = await this.getStoredHeaders();
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        "X-API-Key": savedHeaders['xApiKey'],
        'X-API-Secret': savedHeaders['xApiSecret'],
        'X-User-ID': savedHeaders['xUserId'],
        'X-SDK-Platform': savedHeaders['xSdkPlatform'],
        'X-SDK-Version': savedHeaders['xSdkVersion'],
      }
    });

    this.addInterceptors();
  }

  private logSafe(title: string, data: any) {
    if (!__DEV__) return;

    try {
      console.group(title);
      console.log(JSON.stringify(data, null, 2));
      console.groupEnd();
    } catch {
      console.log(title, data);
    }
  }

  private addInterceptors() {
    if (!this.axiosInstance) return;

    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (__DEV__) {
          this.logSafe('HTTP REQUEST', {
            timestamp: new Date().toISOString(),
            method: config.method?.toUpperCase(),
            url: `${config.baseURL}${config.url}`,
            headers: {
              ...config.headers,
              'X-API-Key': '***',
              'X-API-Secret': '***',
            },
            body: config.data,
          });
        }
        return config;
      },
      (error) => {
        Logger.error('Request Interceptor Error:', error);
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          this.logSafe('HTTP RESPONSE', {
            timestamp: new Date().toISOString(),
            status: response.status,
            url: response.config.url,
            data: response.data,
          });
        }
        return response;
      },
      (error: AxiosError) => {
        if (__DEV__) {
          this.logSafe('HTTP ERROR', {
            timestamp: new Date().toISOString(),
            isAxiosError: axios.isAxiosError(error),
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
            responseData: error.response?.data,
          });
        }
        return Promise.reject(error);
      }
    );
  }

  public getAxios(): AxiosInstance {
    if (!this.axiosInstance) {
      throw new Error('NetworkCommon not initialized. Call init() first.');
    }
    return this.axiosInstance;
  }
}

export default NetworkCommon;
