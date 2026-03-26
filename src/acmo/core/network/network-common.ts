import axios, { type AxiosInstance, AxiosError } from 'axios';
import { AcmoConfig } from '../../../acmo_config';
import { Logger } from '../helpers/logger';
import TyradsSdkCore from '../tyrads-sdk-core';
import { getData } from '../storage/storage';

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

  public async init(): Promise<void> {
    const savedUserId = await getData<string>("xUserId");
    const userId = savedUserId;
    const apiKey = TyradsSdkCore.apiKey;
    const apiSecret = TyradsSdkCore.apiSecret;
    const sdkPlatform = AcmoConfig.SDK_PLATFORM;
    const sdkVersion = AcmoConfig.SDK_VERSION;

    if (this.axiosInstance) {
      const headers = this.axiosInstance.defaults.headers;
      headers.common['X-API-Key'] = apiKey;
      headers.common['X-API-Secret'] = apiSecret;
      headers.common['X-User-ID'] = userId;
      headers.common['X-SDK-Platform'] = sdkPlatform;
      headers.common['X-SDK-Version'] = sdkVersion;
      return;
    }

    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-Key': apiKey,
        'X-API-Secret': apiSecret,
        'X-User-ID': userId,
        'X-SDK-Platform': sdkPlatform,
        'X-SDK-Version': sdkVersion,
      },
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
