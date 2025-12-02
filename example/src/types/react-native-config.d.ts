declare module 'react-native-config' {
  export interface NativeConfig {
    TYRADS_SDK_KEY: string;
    TYRADS_SDK_SECRET: string;
  }
  const Config: NativeConfig;
  export default Config;
}
