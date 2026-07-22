import Geolocation from '@react-native-community/geolocation';
import BackgroundService from 'react-native-background-actions';
import { createMMKV } from 'react-native-mmkv';
import store from '../../components/redux/Store';

const LOCATION_INTERVAL_MS = 5 * 60 * 1000;
const LIVE_LOCATION_URL = 'https://elofic.fieldkonnect.io/api/updateLiveLocation';
const QUEUE_KEY = 'elofic_live_location_queue_v1';
const locationStorage = createMMKV({ id: 'elofic-live-location-storage' });

type QueuedLocation = {
  latitude: string;
  longitude: string;
  time: string;
};

const getQueue = (): QueuedLocation[] => {
  try {
    return JSON.parse(locationStorage.getString(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
};

const setQueue = (locations: QueuedLocation[]) => {
  if (locations.length === 0) locationStorage.remove(QUEUE_KEY);
  else locationStorage.set(QUEUE_KEY, JSON.stringify(locations));
};

const sleep = (time: number) => new Promise<void>(resolve => setTimeout(resolve, time));

const getCurrentPosition = () =>
  new Promise<{ coords: { latitude: number; longitude: number } }>((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 30000,
      maximumAge: 120000,
    });
  });

const formatApiDateTime = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value || '';
  return `${value('year')}-${value('month')}-${value('day')} ${value('hour')}:${value('minute')}:${value('second')}`;
};

class LocationService {
  private starting = false;

  private sendCurrentLocation = async () => {
    const token = store.getState()?.auth?.token;
    if (!token) return false;

    try {
      const position = await getCurrentPosition();
      const pendingLocations = [...getQueue(), {
        latitude: String(position.coords.latitude),
        longitude: String(position.coords.longitude),
        time: formatApiDateTime(new Date()),
      }];
      setQueue(pendingLocations);
      const response = await fetch(LIVE_LOCATION_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locations: pendingLocations }),
      });

      if (!response.ok) {
        console.log('[LiveLocation] API request failed:', response.status);
        return false;
      }
      setQueue([]);
      return true;
    } catch (error) {
      console.log('[LiveLocation] Capture failed:', error);
      return false;
    }
  };

  private trackingTask = async () => {
    while (BackgroundService.isRunning()) {
      await this.sendCurrentLocation();
      await sleep(LOCATION_INTERVAL_MS);
    }
  };

  startTracking = async () => {
    if (BackgroundService.isRunning() || this.starting) return true;
    if (!store.getState()?.auth?.token) return false;

    this.starting = true;
    try {
      await BackgroundService.start(this.trackingTask, {
        taskName: 'LiveLocationTracking',
        taskTitle: 'FieldKonnect location tracking',
        taskDesc: 'Location tracking is active while you are punched in.',
        taskIcon: { name: 'ic_launcher', type: 'mipmap' },
        color: '#395299',
        linkingURI: 'fieldconnect://attendance',
        foregroundServiceType: ['location', 'dataSync'],
        parameters: {},
      });
      return true;
    } catch (error) {
      console.log('[LiveLocation] Unable to start:', error);
      return false;
    } finally {
      this.starting = false;
    }
  };

  stopTracking = async () => {
    if (!BackgroundService.isRunning()) return true;
    try {
      await this.sendCurrentLocation();
      await BackgroundService.stop();
      return true;
    } catch (error) {
      console.log('[LiveLocation] Unable to stop:', error);
      return false;
    }
  };

  isTracking = () => BackgroundService.isRunning();
}

export default new LocationService();
