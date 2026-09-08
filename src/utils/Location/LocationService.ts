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

type LocationPosition = {
  coords: {
    latitude: number;
    longitude: number;
  };
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
  new Promise<LocationPosition>((resolve, reject) => {
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
  private watchId: number | null = null;
  private latestPosition: LocationPosition | null = null;
  private lastSentAt = 0;
  private sending = false;

  private sendPosition = async (position: LocationPosition) => {
    if (this.sending) return false;
    const token = store.getState()?.auth?.token;
    if (!token) return false;

    this.sending = true;
    try {
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
      this.lastSentAt = Date.now();
      return true;
    } catch (error) {
      console.log('[LiveLocation] Capture failed:', error);
      return false;
    } finally {
      this.sending = false;
    }
  };

  private sendCurrentLocation = async () => {
    try {
      const position = this.latestPosition || await getCurrentPosition();
      return await this.sendPosition(position);
    } catch (error) {
      console.log('[LiveLocation] Capture failed:', error);
      return false;
    }
  };

  private stopLocationWatch = () => {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.latestPosition = null;
  };

  private startLocationWatch = () => {
    if (this.watchId !== null) return;

    Geolocation.setRNConfiguration({
      skipPermissionRequests: true,
      authorizationLevel: 'always',
      enableBackgroundLocationUpdates: true,
    });

    this.watchId = Geolocation.watchPosition(
      position => {
        this.latestPosition = position;
        if (Date.now() - this.lastSentAt >= LOCATION_INTERVAL_MS) {
          this.sendPosition(position).catch(error => {
            console.log('[LiveLocation] Upload failed:', error);
          });
        }
      },
      error => {
        console.log('[LiveLocation] Watch error:', error.code, error.message);
        if (error.code === 1) {
          this.stopLocationWatch();
          BackgroundService.stop().catch(stopError => {
            console.log('[LiveLocation] Unable to stop after permission change:', stopError);
          });
        }
      },
      {
        enableHighAccuracy: false,
        distanceFilter: 25,
        interval: 60000,
        fastestInterval: 30000,
        maximumAge: 120000,
      },
    );
  };

  private trackingTask = async () => {
    this.startLocationWatch();
    await this.sendCurrentLocation();
    while (BackgroundService.isRunning()) {
      await sleep(LOCATION_INTERVAL_MS);
      if (BackgroundService.isRunning()) await this.sendCurrentLocation();
    }
    this.stopLocationWatch();
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
    if (!BackgroundService.isRunning()) {
      this.stopLocationWatch();
      return true;
    }
    try {
      await this.sendCurrentLocation();
      this.stopLocationWatch();
      await BackgroundService.stop();
      return true;
    } catch (error) {
      console.log('[LiveLocation] Unable to stop:', error);
      this.stopLocationWatch();
      await BackgroundService.stop();
      return false;
    }
  };

  isTracking = () => BackgroundService.isRunning();
}

export default new LocationService();
