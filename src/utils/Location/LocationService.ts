import Geolocation from "react-native-geolocation-service";
import BackgroundService from "react-native-background-actions";

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

class LocationService {
  watchId: number | null = null;

  startTracking = async () => {
    const veryIntensiveTask = async () => {
      while (BackgroundService.isRunning()) {
        Geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            console.log("LOCATION => ", latitude, longitude);

            // try {
            //   await fetch("https://your-api.com/location", {
            //     method: "POST",
            //     headers: {
            //       "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify({
            //       latitude,
            //       longitude,
            //       employeeId: 1,
            //     }),
            //   });
            // } catch (error) {
            //   console.log("API ERROR", error);
            // }
          },
          (error) => {
            console.log(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }
        );

        await sleep(10000); // every 10 sec
      }
    };

    const options = {
      taskName: "LocationTracking",
      taskTitle: "Employee Tracking Active",
      taskDesc: "Tracking employee live location",
      taskIcon: {
        name: "ic_launcher",
        type: "mipmap",
      },
      color: "#ff0000",
      parameters: {},
    };

    await BackgroundService.start(veryIntensiveTask, options);
  };

  stopTracking = async () => {
    await BackgroundService.stop();
  };
}

export default new LocationService();