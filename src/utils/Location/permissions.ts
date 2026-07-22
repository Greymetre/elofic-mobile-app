import { Alert, Linking, PermissionsAndroid, Platform } from "react-native";

const showBackgroundLocationDisclosure = () =>
  new Promise<boolean>(resolve => {
    Alert.alert(
      'Background Location Tracking',
      'FieldKonnect collects your location while you are punched in to support attendance and field activity tracking, including when the app is in the background. Tracking stops when you punch out.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Continue', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });

export const requestLocationPermission = async () => {
  if (Platform.OS === "android") {
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
        const accepted = await showBackgroundLocationDisclosure();
        if (!accepted) return false;
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
