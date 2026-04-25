#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE (TyradsSdk, NSObject)

RCT_EXTERN_METHOD(startObserving)
RCT_EXTERN_METHOD(stopObserving)
RCT_EXTERN_METHOD(init:(NSString *)apiKey
                  secretKey:(NSString *)secretKey
                  encKey:(NSString * _Nullable)encKey
                  engagementId:(NSString * _Nullable)engagementId
                  placementId:(NSString * _Nullable)placementId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
// RCT_EXTERN_METHOD(loginUser:(NSString *)userId)
RCT_EXTERN_METHOD(loginUser:(NSString *)userId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(showOffers:(NSInteger)launchMode
                  route:(NSString)route
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(showOfferDetails:(NSInteger)launchMode
                  route:(NSString)route
                  campaignID:(NSInteger)campaignID
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(changeLanguage:(NSString *)lang
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setSDKVersion: (NSString *) version)
RCT_EXTERN_METHOD(setMediaSourceInfo:(NSDictionary *)mediaSourceInfo)
RCT_EXTERN_METHOD(setUserInfo:(NSDictionary *)userInfo)
RCT_EXTERN_METHOD(isPrivacyAccepted:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(checkOnboardingProcess:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(preloadOffers : (NSString *_Nullable)route
                  resolver : (RCTPromiseResolveBlock)resolve
                  rejecter : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(pushRequestPermission:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(pushGetApnsToken:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(showInAppNotification)
RCT_EXTERN_METHOD(dismissInAppNotification)

@end
