import axios from "axios";
import NetworkCommon from "./network-common";

export type HttpError = {
  type: "network" | "server" | "timeout" | "unknown";
  status?: number;
  data?: any;
  message: string;
};

class HttpClient {
  private handleError(error: any): HttpError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (!error.response) {
        return {
          type: 'network',
          message: 'Network error or no response from server',
        };
      }

      if (error.code === 'ECONNABORTED') {
        return {
          type: 'timeout',
          message: 'Request timed out',
        };
      }

      return {
        type: 'server',
        status,
        data,
        message: error.message,
      };
    }

    return {
      type: 'unknown',
      message: String(error),
    };
  }

  async get(url: string, params?: any) {
    const api = NetworkCommon.getInstance().getAxios();
    try {
      const response = await api.get(url, {
        params: params ?? {},
      });
      return { status: response.status, data: response.data };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(url: string, data?: any, config?: any) {
    const api = NetworkCommon.getInstance().getAxios();
    try {
      const response = await api.post(url, data, config);
      return { status: response.status, data: response.data };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put(url: string, data?: any, config?: any) {
    const api = NetworkCommon.getInstance().getAxios();
    try {
      const response = await api.put(url, data, config);
      return { status: response.status, data: response.data };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(url: string, config?: any) {
    const api = NetworkCommon.getInstance().getAxios();
    try {
      const response = await api.delete(url, config);
      return { status: response.status, data: response.data };
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export const http = new HttpClient();

