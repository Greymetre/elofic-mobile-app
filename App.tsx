/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  DefaultTheme,
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { KeyboardProvider } from "react-native-keyboard-controller";

import Toast, {
  BaseToast,
  BaseToastProps,
  ErrorToast,
} from 'react-native-toast-message';
import { colors } from './src/utils/Colors';
import store, { persistor } from './src/components/redux/Store';
import SplashScreen from './src/screens/Splash';
import Routes from './src/navigations/Routes';
import {handleUnauthorized} from './src/api/handleUnauthorized';
import {
  subscribeToForegroundNotifications,
  subscribeToNotificationPresses,
} from './src/utils/firebaseMessaging';
;


const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);
  const loadingRef = React.useRef(true);
  const navigationRef = React.useRef<NavigationContainerRef<any>>(null);
  const navigationReadyRef = React.useRef(false);
  const pendingNotificationNavigationRef = React.useRef(false);
  //  const navigationRef = createNavigationContainerRef();

  useEffect(() => {
    const openNotificationList = () => {
      if (
        !loadingRef.current &&
        navigationReadyRef.current &&
        navigationRef.current?.isReady()
      ) {
        navigationRef.current.navigate('Notifications');
        pendingNotificationNavigationRef.current = false;
      } else {
        pendingNotificationNavigationRef.current = true;
      }
    };

    const unsubscribeForegroundNotifications =
      subscribeToForegroundNotifications();
    const unsubscribeNotificationPresses =
      subscribeToNotificationPresses(openNotificationList);

    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error?.response?.status === 401) {
          handleUnauthorized();
        }
        return Promise.reject(error);
      },
    );

    setTimeout(() => {
      loadingRef.current = false;
      setLoading(false);
    }, 2000);

    return () => {
      unsubscribeForegroundNotifications();
      unsubscribeNotificationPresses();
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    if (
      !loading &&
      navigationReadyRef.current &&
      pendingNotificationNavigationRef.current
    ) {
      // Allow the authenticated navigator to replace the splash screen first.
      const timer = setTimeout(() => {
        navigationRef.current?.navigate('Notifications');
        pendingNotificationNavigationRef.current = false;
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'transparent',
    },
  };

  const toastConfig = {
    success: (props: BaseToastProps) => (
      <BaseToast
        {...props}

        text2NumberOfLines={0}
        style={{
          borderLeftColor: colors.blue,
        }}
      />
    ),
    error: (props: BaseToastProps) => <ErrorToast {...props} text1NumberOfLines={0}
      text2NumberOfLines={0} />,
  };


  return (
    <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <QueryClientProvider client={queryClient}>
              <View style={{ flex: 1, backgroundColor: colors.bgColor }}>
                <StatusBar
                  translucent
                  backgroundColor="transparent"
                  barStyle={'light-content'}
                />

                <NavigationContainer
                  ref={navigationRef}
                  theme={MyTheme}
                  onReady={() => {
                    navigationReadyRef.current = true;
                    if (
                      !loadingRef.current &&
                      pendingNotificationNavigationRef.current
                    ) {
                      navigationRef.current?.navigate('Notifications');
                      pendingNotificationNavigationRef.current = false;
                    }
                    console.log('Navigation is ready');
                  }}
                >

                  {loading ? <SplashScreen /> : <Routes />}
                </NavigationContainer>

                <Toast config={toastConfig} visibilityTime={1500} />
                {Platform.OS == 'android' && (
                  <SafeAreaView style={{ backgroundColor: colors.white }} />
                )}
              </View>
            </QueryClientProvider>
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
};

export default App
