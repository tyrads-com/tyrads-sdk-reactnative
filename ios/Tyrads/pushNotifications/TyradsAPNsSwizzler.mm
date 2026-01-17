//
//  TyradsAPNsSwizzler.mm
//  Pods
//
//  Created by Basharat Mehdi on 17/01/26.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h>
#import <objc/runtime.h>

@interface TyradsAPNsSwizzler : NSObject
@end

@implementation TyradsAPNsSwizzler

+ (void)load {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    [[NSNotificationCenter defaultCenter]
     addObserver:self
     selector:@selector(handleAppDidFinishLaunching:)
     name:UIApplicationDidFinishLaunchingNotification
     object:nil];
  });
}

+ (void)handleAppDidFinishLaunching:(NSNotification *)notification {
  [self swizzleAppDelegate];
  
  dispatch_async(dispatch_get_main_queue(), ^{
    UNUserNotificationCenter *center =
    [UNUserNotificationCenter currentNotificationCenter];
    if (center.delegate == nil) {
      Class receiverClass = NSClassFromString(@"APNsNotificationReceiver");
      if (receiverClass) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Warc-performSelector-leaks"
        id receiver =
        [receiverClass performSelector:NSSelectorFromString(@"shared")];
        if (receiver) {
          center.delegate = (id<UNUserNotificationCenterDelegate>)receiver;
          NSLog(@"TyradsSDK: [Swizzler] Automatically set "
                @"UNUserNotificationCenter delegate");
        }
#pragma clang diagnostic pop
      } else {
        NSLog(@"TyradsSDK: [Swizzler] Could not find APNsNotificationReceiver "
              @"class");
      }
    }
  });
}

+ (void)swizzleAppDelegate {
  id<UIApplicationDelegate> delegate =
  [UIApplication sharedApplication].delegate;
  if (!delegate) {
    NSLog(@"TyradsSDK: [Swizzler] No AppDelegate found to swizzle");
    return;
  }
  
  Class appDelegateClass = [delegate class];
  NSLog(@"TyradsSDK: [Swizzler] Swizzling AppDelegate class: %@",
        NSStringFromClass(appDelegateClass));
  
  [self swizzleInstanceMethod:appDelegateClass
                     original:@selector
   (application:
    didRegisterForRemoteNotificationsWithDeviceToken:)
                     swizzled:@selector
   (tyrads_application:
    didRegisterForRemoteNotificationsWithDeviceToken:)];
  
  [self swizzleInstanceMethod:appDelegateClass
                     original:@selector
   (application:
    didReceiveRemoteNotification:fetchCompletionHandler:)
                     swizzled:@selector
   (tyrads_application:
    didReceiveRemoteNotification:fetchCompletionHandler:)];
}

+ (void)swizzleInstanceMethod:(Class)cls
                     original:(SEL)originalSelector
                     swizzled:(SEL)swizzledSelector {
  Method originalMethod = class_getInstanceMethod(cls, originalSelector);
  Method swizzledMethod =
  class_getInstanceMethod([self class], swizzledSelector);
  
  if (!swizzledMethod) {
    return;
  }
  
  if (!originalMethod) {
    IMP stub;
    if (originalSelector == @selector
        (application:didReceiveRemoteNotification:fetchCompletionHandler:)) {
      stub = imp_implementationWithBlock(
                                         ^(id _self, UIApplication *app, NSDictionary *info,
                                           void (^completion)(UIBackgroundFetchResult)) {
                                             if (completion)
                                               completion(UIBackgroundFetchResultNewData);
                                           });
    } else {
      stub = imp_implementationWithBlock(^(id _self){
      });
    }
    
    class_addMethod(cls, originalSelector, stub,
                    method_getTypeEncoding(swizzledMethod));
    originalMethod = class_getInstanceMethod(cls, originalSelector);
  }
  
  method_exchangeImplementations(originalMethod, swizzledMethod);
}

- (void)tyrads_application:(UIApplication *)application
didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  NSLog(@"TyradsSDK: [Swizzler] "
        @"didRegisterForRemoteNotificationsWithDeviceToken");
  
  Class managerClass = NSClassFromString(@"APNsNotificationManager");
  if (managerClass) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Warc-performSelector-leaks"
    id manager = [managerClass performSelector:NSSelectorFromString(@"shared")];
    if (manager && [manager respondsToSelector:NSSelectorFromString(
                                                                    @"onTokenReceived:")]) {
                                                                      [manager performSelector:NSSelectorFromString(@"onTokenReceived:")
                                                                                    withObject:deviceToken];
                                                                    }
#pragma clang diagnostic pop
  }
  
  if ([self respondsToSelector:@selector
       (tyrads_application:
        didRegisterForRemoteNotificationsWithDeviceToken:)]) {
    [self tyrads_application:application
didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
  }
}

- (void)tyrads_application:(UIApplication *)application
didReceiveRemoteNotification:(NSDictionary *)userInfo
    fetchCompletionHandler:
(void (^)(UIBackgroundFetchResult))completionHandler {
  NSLog(@"TyradsSDK: [Swizzler] didReceiveRemoteNotification");
  
  Class receiverClass = NSClassFromString(@"APNsNotificationReceiver");
  if (receiverClass) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Warc-performSelector-leaks"
    id receiver =
    [receiverClass performSelector:NSSelectorFromString(@"shared")];
    if (receiver &&
        [receiver
         respondsToSelector:NSSelectorFromString(
                                                 @"handleSilentNotificationWithUserInfo:")]) {
                                                   [receiver performSelector:NSSelectorFromString(
                                                                                                  @"handleSilentNotificationWithUserInfo:")
                                                                  withObject:userInfo];
                                                 }
#pragma clang diagnostic pop
  }
  
  if ([self respondsToSelector:@selector
       (tyrads_application:
        didReceiveRemoteNotification:fetchCompletionHandler:)]) {
    [self tyrads_application:application
didReceiveRemoteNotification:userInfo
      fetchCompletionHandler:completionHandler];
  } else if (completionHandler) {
    completionHandler(UIBackgroundFetchResultNewData);
  }
}

@end
