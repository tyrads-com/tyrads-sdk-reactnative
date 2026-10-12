#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  self.moduleName = @"TyradsSdkExample";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application
      didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
  return [self bundleURL];
}

- (NSURL *)bundleURL {
#if DEBUG
  return
      [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main"
                                 withExtension:@"jsbundle"];
#endif
}

@end


@interface SceneDelegate : UIResponder <UIWindowSceneDelegate>
@property (strong, nonatomic) UIWindow * window;
@end

@implementation SceneDelegate

- (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session options:(UISceneConnectionOptions *)connectionOptions {
  if (![scene isKindOfClass:[UIWindowScene class]]) {
    return;
  }
  
  UIWindowScene *windowScene = (UIWindowScene *)scene;
  UIWindow *newWindow = [[UIWindow alloc] initWithWindowScene:windowScene];
  
  id<UIApplicationDelegate> appDelegate = [UIApplication sharedApplication].delegate;
  if ([appDelegate respondsToSelector:@selector(window)]) {
    UIWindow *oldWindow = [appDelegate performSelector:@selector(window)];
    if (oldWindow && oldWindow.rootViewController) {
      newWindow.rootViewController = oldWindow.rootViewController;
    }
  }
  
  self.window = newWindow;
  [self.window makeKeyAndVisible];
}

@end
