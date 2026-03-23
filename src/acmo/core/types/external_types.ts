export interface TyradsMediaSourceInfo {
  mediaSourceName?: string,
  mediaCampaignName?: string,
  mediaSourceId?: string,
  mediaSubSourceId?: string,
  incentivized?: boolean,
  mediaAdsetName?: string,
  mediaAdsetId?: string,
  mediaCreativeName?: string,
  mediaCreativeId?: string,
  sub1?: string,
  sub2?: string,
  sub3?: string,
  sub4?: string,
  sub5?: string,
}

export interface TyradsUserInfo {
  email?: string,
  phoneNumber?: string,
  userGroup?: string,
  age?: number,
  gender?: number,
}

export interface TyradsConfig {
  skipInitialPages: boolean | false,
}