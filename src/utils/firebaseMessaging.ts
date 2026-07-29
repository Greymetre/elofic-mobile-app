import { PermissionsAndroid, Platform } from 'react-native';
import {
  AuthorizationStatus,
  getAPNSToken,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  registerDeviceForRemoteMessages,
  requestPermission,
  type FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidStyle,
  EventType,
} from '@notifee/react-native';

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
export const getFcmToken = async (): Promise<string | null> => {
  const messaging = getMessaging();

  try {
    await requestNotificationPermission();

    if (Platform.OS === 'ios') {
      await registerDeviceForRemoteMessages(messaging);

      const apnsToken = await getAPNSToken(messaging);
      if (!apnsToken) {
        console.warn('Unable to retrieve FCM token: APNs token is unavailable.');
        return null;
      }
    }

    const fcmToken = await getToken(messaging);
    return fcmToken || null;
  } catch (error) {
    console.warn('Unable to retrieve FCM token:', error);
    return null;
  }
};

const displayForegroundNotification = async (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) => {
  const dataTitle =
    typeof remoteMessage.data?.title === 'string'
      ? remoteMessage.data.title
      : undefined;
  const dataBody =
    typeof remoteMessage.data?.body === 'string'
      ? remoteMessage.data.body
      : undefined;
  const title =
    remoteMessage.notification?.title ||
    dataTitle ||
    'FieldConnect';
  const body =
    remoteMessage.notification?.body ||
    dataBody ||
    'You have a new notification.';

  const channelId = await notifee.createChannel({
    id: FOREGROUND_CHANNEL_ID,
    name: 'FieldConnect Notifications',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title,
    body,
    data: remoteMessage.data,
    android: {
      channelId,
      importance: AndroidImportance.HIGH,
      style: {
        type: AndroidStyle.BIGTEXT,
        text: body,
      },
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

/**
 * Opens the in-app notification list when a user taps either an FCM
 * notification or a foreground notification displayed through Notifee.
 * This covers background, foreground and terminated app states.
 */
export const subscribeToNotificationPresses = (
  onNotificationPress: () => void,
) => {
  const messaging = getMessaging();

  const unsubscribeFirebase = onNotificationOpenedApp(
    messaging,
    onNotificationPress,
  );

  const unsubscribeNotifee = notifee.onForegroundEvent(({type}) => {
    if (type === EventType.PRESS) {
      onNotificationPress();
    }
  });

  getInitialNotification(messaging)
    .then(remoteMessage => {
      if (remoteMessage) {
        onNotificationPress();
      }
    })
    .catch(error => {
      console.warn('Unable to read the initial FCM notification:', error);
    });

  notifee
    .getInitialNotification()
    .then(initialNotification => {
      if (initialNotification) {
        onNotificationPress();
      }
    })
    .catch(error => {
      console.warn('Unable to read the initial local notification:', error);
    });

  return () => {
    unsubscribeFirebase();
    unsubscribeNotifee();
  };
};
