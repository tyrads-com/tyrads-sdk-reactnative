import { Linking } from "react-native";

export async function acmoLaunchURLForce(url: string) {
    await Linking.openURL(url);
}

export async function acmoLaunchURL(url: string) {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    console.warn("Don't know how to open URI: " + url);
  }
}
