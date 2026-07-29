import Toast from 'react-native-toast-message';
import store from '../components/redux/Store';
import {logout} from '../components/redux/slice/AuthSlice';

let isHandlingUnauthorized = false;

export const handleUnauthorized = () => {
  if (!store.getState().auth?.token || isHandlingUnauthorized) {
    return;
  }

  isHandlingUnauthorized = true;
  store.dispatch(logout());
  Toast.show({
    type: 'error',
    text1: 'Session expired',
    text2: 'Please log in again.',
  });

  setTimeout(() => {
    isHandlingUnauthorized = false;
  }, 1500);
};
