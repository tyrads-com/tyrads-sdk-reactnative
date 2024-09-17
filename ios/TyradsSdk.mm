#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TyradsSdk, NSObject)

RCT_EXTERN_METHOD(init:(NSString *)apiKey secretKey:(NSString *)secretKey)
RCT_EXTERN_METHOD(loginUser:(NSString *)userId)
RCT_EXTERN_METHOD(showOffers:(NSInteger)launchMode)

@end
