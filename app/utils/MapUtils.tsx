import Qs from "qs";
import * as Location from "expo-location";

const fetchCurrentLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.log("Permission to access location was denied");
    return;
  }

  const location = await Location.getCurrentPositionAsync({});
  const geopoint = { longitude: location.coords.longitude, latitude: location.coords.latitude };

  return geopoint;
};

const distance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const meridian = 20003;
  const equator = 40075;
  const deg_to_rad = 180 / Math.PI;
  const dx = ((equator * Math.abs(lng1 - lng2)) / 360) * Math.cos(((lat1 + lat2) * deg_to_rad) / 2);
  const dy = (meridian * Math.abs(lat1 - lat2)) / 180;
  return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
};

const getPlacePredication = (
  place: string,
  sessiontoken: string
): Promise<{
  data?: {
    predictions: {
      description: string;
      place_id: string;
      types: string[];
      terms: { offset: number; value: string }[];
      structured_formatting: {
        main_text: string;
        secondary_text: string;
      };
    }[];
  };
  error?: string;
}> =>
  new Promise((res) => {
    try {
      const request = new XMLHttpRequest();

      request.open(
        "GET",
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=` +
          encodeURIComponent(place) +
          "&" +
          Qs.stringify({
            key: "AIzaSyDJdG0aQilwponw25KEaCLJBdI67E2LwIY",
            language: "en",
            types: "geocode",
            sessiontoken,
            components: "country:ca",
          })
      );

      request.send();

      request.onreadystatechange = () => {
        if (request.readyState !== 4) return;

        if (request.status !== 200) res({ error: "status: " + request.status.toString() });

        const responseJSON = JSON.parse(request.responseText);

        if (responseJSON.status === "ZERO_RESULTS") res({ data: undefined });
        if (responseJSON.status === "OK") res({ data: responseJSON });

        res({ error: responseJSON.status });
      };
    } catch (e) {
      console.warn("google places autocomplete catch: " + e);
      res({ error: String(e) });
    }
  });

export { distance, getPlacePredication, fetchCurrentLocation };
