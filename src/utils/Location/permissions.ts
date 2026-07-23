import { Alert, Linking, PermissionsAndroid, Platform } from "react-native";

const showBackgroundLocationDisclosure = () =>
  new Promise<boolean>(resolve => {
    Alert.alert(
      'Precise Background Location',
      'FieldKonnect collects your precise location while you are punched in, including when the app is in the background, closed, or not in use. Greymetre uses this data to verify attendance, customer visits, assigned routes, and field activity. Your location is visible only to authorized Greymetre managers and is not sold. Tracking stops when you punch out.',
      [
        { text: 'Not Now', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Agree and Continue', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });

export const requestLocationPermission = async () => {
  if (Platform.OS === "android") {
    const hasForegroundBeforeRequest =
      await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) ||
      await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
    const hasBackgroundBeforeRequest =
      Number(Platform.Version) < 29 ||
      await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);

    // Google Play requires this in-app disclosure to appear before any Android
    // location permission dialog when background location is requested.
    if (!hasForegroundBeforeRequest || !hasBackgroundBeforeRequest) {
      const accepted = await showBackgroundLocationDisclosure();
      if (!accepted) return false;
    }

    const foreground = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);

    const hasForeground =
      foreground[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED ||
      foreground[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
    if (!hasForeground) return false;

    if (Number(Platform.Version) >= 29) {
      const hasBackground = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      );
      if (!hasBackground) {
        const backgroundResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        );
        if (backgroundResult !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Allow Background Location',
            'To capture live location after punch-in, open App Settings and set Location permission to “Allow all the time.”',
            [
              { text: 'Not Now', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ],
          );
          return false;
        }
      }
    }

    if (Number(Platform.Version) >= 33) {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }

    return true;
  }

  return true;
};
