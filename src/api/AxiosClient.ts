import axios from 'axios';
import Toast from 'react-native-toast-message';
import store from '../components/redux/Store';
import {handleUnauthorized} from './handleUnauthorized';
export const BASE_URL = 'https://elofic.fieldkonnect.io/';
// export const BASE_URL = 'http://192.168.1.4:8000/';
const axiosClient = axios.create({ baseURL: BASE_URL });

axiosClient.interceptors.request.use(async config => {
  const token = store.getState()?.auth?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

axiosClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error?.response?.status === 401) {
      handleUnauthorized();
      return Promise.reject(error);
    }

    if (error?.response?.status === 400) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || error?.response?.data?.reminders[0]?.message || error?.response?.data ||
          error?.response?.data?.errorMessage ||
          error?.response?.data?.message ||
          error?.response?.data?.errors[0]?.error || 'Something went wrong',
        visibilityTime: 5000
      });

      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
