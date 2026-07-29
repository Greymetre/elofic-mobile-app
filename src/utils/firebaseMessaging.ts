import { PermissionsAndroid, Platform } from 'react-native';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  registerDeviceForRemoteMessages,
  requestPermission,
  type FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

const FOREGROUND_CHANNEL_ID = 'field-connect-notifications';

const requestNotificationPermission = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version < 33) return true;

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  const status = await requestPermission(getMessaging());
  return (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  );
};

/**
 * Returns this Firebase app installation's FCM token.
 *
 * Notification permission controls whether notifications can be displayed,
 * but token retrieval is still attempted when permission is declined so the
 * login request always carries the best available device token.
 */
export const getFcmToken = async (): Promise<string> => {
  const messaging = getMessaging();

  try {
    await requestNotificationPermission();

    if (Platform.OS === 'ios') {
      await registerDeviceForRemoteMessages(messaging);
    }

    return await getToken(messaging);
  } catch (error) {
    console.warn('Unable to retrieve FCM token:', error);
    return '';
  }
};

const displayForegroundNotification = async (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) => {
  const channelId = await notifee.createChannel({
    id: FOREGROUND_CHANNEL_ID,
    name: 'FieldConnect Notifications',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title:
      remoteMessage.notification?.title ||
      remoteMessage.data?.title ||
      'FieldConnect',
    body:
      remoteMessage.notification?.body ||
      remoteMessage.data?.body ||
      'You have a new notification.',
    data: remoteMessage.data,
    android: {
      channelId,
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: 'default',
      },
    },
  });
};

/**
 * Displays FCM messages as local notifications while the app is foregrounded.
 * Returns the Firebase unsubscribe callback.
 */
export const subscribeToForegroundNotifications = () =>
  onMessage(getMessaging(), async remoteMessage => {
    try {
      await displayForegroundNotification(remoteMessage);
    } catch (error) {
      console.warn('Unable to display foreground notification:', error);
    }
  });
