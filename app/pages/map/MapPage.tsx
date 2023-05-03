import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaView, View, Text, ActivityIndicator, Alert } from "react-native";
import MapView, { Marker, Circle, Callout } from "react-native-maps";
import { distance, fetchCurrentLocation } from "@utils/MapUtils";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import DropDownPicker from "react-native-dropdown-picker";
import { useFirebaseApp } from "@contexts/FiresbaseAppContext";
import useFirestore from "@hooks/useFirestore";
import { useMarkerInfo, useMarkerInfoDispatch } from "@contexts/MarkerContext";
import { Button, FAB } from "react-native-paper";
import { v4 as uuid } from "uuid";
import GooglePlacesAutocomplete from "@components/GooglePlaceAutoComplete";
import * as Location from "expo-location";
import { useUserLocation, useUserLocationDispatch } from "@contexts/UserLocationContext";
import styles from "./style";

import type { IUserLocationState } from "@contexts/UserLocationContext";
import type { CustomFirestore } from "@hooks/useFirestore";
import type { IMarkerState, TMarkerData } from "@contexts/MarkerContext";

const currentLocationImg = require("@assets/current-location.png");

let filterRadius: number = 5000; // 50 km
let filterParkingSize: number = 0; // display all markers if no filter yet
let filterPrice: number = 5000; // $50
let filterParkingType: string = "all"; // display all markers if no filter yet
const nearMeCorrection = 1.25; // Earth is a sphere (correction variable)

const findSearchLocation = async (
  address: string,
  city: string,
  firestore: CustomFirestore,
  navigation: NativeStackNavigationProp<ParamListBase>
) => {
  const markers = await firestore.read("locations/" + city.toLowerCase() + "/spots");
  let uid = null;

  if (markers) {
    uid = markers.find((marker) => marker.address.toLowerCase() === address.toLowerCase())?.id;
  }

  if (uid) {
    navigation.navigate("RentalDisplay", { uid });
  } else {
    Alert.alert("Search Status", "No parking spots at the address specified", [
      {
        text: "OK",
      },
    ]);
  }
};

const checkFilters = (
  filtered: boolean,
  marker: TMarkerData,
  currentLocation: { latitude: number; longitude: number },
  valueDistance: number | null,
  valueSize: number | null,
  valuePrice: number | null,
  parkingType: string | null
) => {
  if (!filtered) {
    return true;
  }

  if (valueDistance != null) {
    filterRadius = valueDistance;
  }
  if (valueSize != null) {
    filterParkingSize = valueSize;
  }
  if (valuePrice != null) {
    filterPrice = valuePrice;
  }
  if (parkingType != null) {
    filterParkingType = parkingType;
  }

  // apply filters
  return (
    distance(
      marker.geopoint.latitude,
      marker.geopoint.longitude,
      currentLocation.latitude,
      currentLocation.longitude
    ) < filterRadius &&
    (marker.numSpots === filterParkingSize || filterParkingSize === 0) &&
    marker.cost <= filterPrice &&
    (marker.parkingSpaceType === filterParkingType || filterParkingType === "all")
  );
};

const MapPage = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [loading, setLoading] = useState(false);
  const firebaseApp = useFirebaseApp();
  const firestore = useFirestore(firebaseApp);
  const markers = useMarkerInfo();
  const markerDispatch = useMarkerInfoDispatch();
  const userLocation = useUserLocation();
  const userLocationDispatch = useUserLocationDispatch();

  const [openPrice, setOpenPrice] = useState(false);
  const [valuePrice, setValuePrice] = useState(null);
  const [itemsPrice, setItemsPrice] = useState([
    { label: "< 5$", value: 5 },
    { label: "< 10$", value: 10 },
    { label: "< 15$", value: 15 },
    { label: "< 20$", value: 20 },
  ]);
  const [openTime, setOpenTime] = useState(false);
  const [valueTime, setValueTime] = useState(null);
  const [itemsTime, setItemsTime] = useState([
    { label: "< 1hr", value: 5, disabled: true },
    { label: "< 6hrs", value: 6, disabled: true },
    { label: "< 12hrs", value: 12, disabled: true },
    { label: "< 24hrs", value: 24, disabled: true },
  ]);
  const [openSize, setOpenSize] = useState(false);
  const [valueSize, setValueSize] = useState(null);
  const [itemsSize, setItemsSize] = useState([
    { label: "1 car", value: 1 },
    { label: "2 cars", value: 2 },
    { label: "3 cars", value: 3 },
    { label: "4 cars", value: 4 },
  ]);
  const [openDistance, setOpenDistance] = useState(false);
  const [valueDistance, setValueDistance] = useState(null);
  const [itemsDistance, setItemsDistance] = useState([
    { label: "< 1km", value: 1 },
    { label: "< 5km", value: 5 },
    { label: "< 15km", value: 15 },
    { label: "< 20km", value: 20 },
  ]);
  const [openType, setOpenType] = useState(false);
  const [valueType, setValueType] = useState(null);
  const [itemsType, setItemsType] = useState([
    { label: "Driveway", value: "Driveway" },
    { label: "On-street", value: "On-street" },
    { label: "Garage", value: "Garage" },
    { label: "Multilevel Parking Garage", value: "Multilevel Parking Garage" },
  ]);
  const [filtered, setFiltered] = useState(false);
  const [address, setAddress] = useState("");
  const sessiontoken = uuid();
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchParkingLocations = async (userLocation: IUserLocationState) => {
    if (
      userLocation.city === "" ||
      (userLocation.latitude === -1 && userLocation.longitude === -1)
    ) {
      return;
    }

    const markers = await firestore.read(`locations/${userLocation.city}/spots`);

    if (markers) {
      markerDispatch({
        type: "clearAndAdd",
        data: markers.reduce(
          (accumulator: IMarkerState, currVal) => ({
            ...accumulator,
            [currVal.id]: {
              address: currVal.address,
              createdBy: currVal.createdBy,
              bookedBy: currVal.bookedBy,
              startDate: new Date(currVal.startDate.seconds * 1000),
              endDate: new Date(currVal.endDate.seconds * 1000),
              bookedFrom: currVal.bookedFrom
                ? new Date(currVal.bookedFrom.seconds * 1000)
                : undefined,
              bookedTo: currVal.bookedTo ? new Date(currVal.bookedTo.seconds * 1000) : undefined,
              city: currVal.city,
              country: currVal.country,
              description: currVal.description,
              type: currVal.type,
              parkingSpaceType: currVal.parking_space_type,
              vehicleSizeType: currVal.vehicle_size_type,
              electricCharger: currVal.electric_charger,
              geopoint: {
                latitude: currVal.geopoint.latitude,
                longitude: currVal.geopoint.longitude,
              },
              cost: currVal.cost,
              numSpots: currVal.num_spots,
              distance: distance(
                userLocation.latitude,
                userLocation.longitude,
                currVal.geopoint.latitude,
                currVal.geopoint.longitude
              ),
              imagePaths: currVal.image_paths,
              imageUrls: currVal.image_urls,
              url: currVal.url,
            },
          }),
          {}
        ),
      });
    }
  };

  const fetchCurrentLocationData = async () => {
    const currLocationGeopoint = await fetchCurrentLocation();

    if (currLocationGeopoint) {
      const res = await Location.reverseGeocodeAsync(currLocationGeopoint);

      if (res.length >= 1) {
        const city = res[0].city?.toLocaleLowerCase() || "";

        const newUserLocation = {
          ...currLocationGeopoint,
          city,
        };

        userLocationDispatch({
          type: "setUserLocation",
          data: newUserLocation,
        });

        await fetchParkingLocations(newUserLocation);
      }
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchCurrentLocationData();
      setLoading(false);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <FAB
        style={{
          position: "absolute",
          left: 20,
          bottom: 70,
          borderRadius: 100,
          backgroundColor: "dodgerblue",
          zIndex: 9999,
        }}
        icon="crosshairs"
        size="small"
        color="white"
        onPress={async () => {
          setLoading(true);
          await fetchCurrentLocationData();
          setLoading(false);
        }}
      />
      <FAB
        style={{
          position: "absolute",
          left: 20,
          bottom: 20,
          borderRadius: 100,
          backgroundColor: "dodgerblue",
          zIndex: 9999,
        }}
        icon="filter"
        size="small"
        color="white"
        onPress={() => setShowFilters(!showFilters)}
      />
      {loading ? (
        <View
          style={{
            position: "absolute",
            top: "50%",
            left: "45%",
          }}>
          <ActivityIndicator size="large" color="dodgerblue" />
          <Text>Loading</Text>
        </View>
      ) : (
        <MapView
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onPress={(e) => {
            navigation.navigate("RentalPage", {
              coord: e.nativeEvent.coordinate,
              currLocation: userLocation,
            });
          }}>
          {userLocation.latitude !== -1 &&
            userLocation.longitude !== -1 &&
            Object.entries(markers)
              .filter(([_, markerData]) =>
                checkFilters(
                  filtered,
                  markerData,
                  userLocation,
                  valueDistance,
                  valueSize,
                  valuePrice,
                  valueType
                )
              )
              .map(([id, { address, bookedBy, geopoint, cost, numSpots, distance }]) => (
                <Marker key={id} coordinate={geopoint}>
                  <Callout
                    tooltip
                    style={{ height: 170, width: 200, paddingHorizontal: 10 }}
                    onPress={() => {
                      navigation.navigate("RentalDisplay", { uid: id });
                    }}>
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        flex: 1,
                        borderWidth: 1,
                        borderColor: "white",
                        borderRadius: 20,
                        backgroundColor: "rgba(150,150,150,0.7)",
                      }}>
                      <Text style={{ fontWeight: "bold", textAlign: "left", color: "white" }}>
                        {address}
                      </Text>
                      <Text style={{ color: "white" }}>Price: ${cost}/hr</Text>
                      <Text style={{ color: "white" }}>
                        {distance != null ? distance.toFixed(1) : "Many"} km away
                      </Text>
                      <Text style={{ color: "white" }}>Parking spots: {numSpots}</Text>
                      <Text
                        style={{
                          fontWeight: "bold",
                          color:
                            bookedBy === "" || bookedBy == null
                              ? "rgb(150,220,150)"
                              : "rgb(250,170,170)",
                        }}>
                        Is booked: {bookedBy === "" || bookedBy == null ? "No" : "Yes"}
                      </Text>
                      <Text style={{ color: "white" }}>
                        Click here to{" "}
                        {bookedBy === "" || bookedBy == null ? "book." : "see details."}
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              ))}
          {userLocation.latitude !== -1 && userLocation.longitude !== -1 && filtered && (
            <Circle
              key={(userLocation.longitude + userLocation.latitude).toString()}
              center={userLocation}
              radius={filterRadius * 1000 * nearMeCorrection}
              strokeWidth={2}
              strokeColor="rgb(130,170,230)"
              fillColor="rgba(173,216,230,0.5)"
            />
          )}
          {userLocation.latitude !== -1 && userLocation.longitude !== -1 && (
            <Marker
              key="currentLocation"
              coordinate={userLocation}
              title="You Are Here"
              image={currentLocationImg}
            />
          )}
        </MapView>
      )}
      <GooglePlacesAutocomplete
        style={{
          marginTop: 40,
          maxHeight: 50,
          width: "98%",
          marginLeft: 5,
        }}
        predicationContainerStyle={{
          width: "98%",
          marginLeft: 5,
        }}
        address={address}
        setAddress={setAddress}
        sessionToken={sessiontoken}
        onPredicationPress={async ({
          display,
          value: { city, country, address: localAddress },
        }) => {
          setLoading(true);

          setAddress(localAddress);
          setCity(city);
          setCountry(country);

          await findSearchLocation(localAddress, city, firestore, navigation);

          setLoading(false);
        }}
      />
      {showFilters && (
        <>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
            }}>
            <View style={{ flex: 1 }}>
              <DropDownPicker
                style={styles.filter}
                dropDownContainerStyle={{
                  zIndex: 1000000,
                  width: "94%",
                  marginLeft: 4,
                }}
                open={openPrice}
                value={valuePrice}
                items={itemsPrice}
                setOpen={setOpenPrice}
                setValue={setValuePrice}
                setItems={setItemsPrice}
                placeholder="Price"
                textStyle={{
                  fontSize: 10,
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <DropDownPicker
                style={styles.filter}
                dropDownContainerStyle={{
                  zIndex: 1000000,
                  width: "94%",
                  marginLeft: 4,
                }}
                open={openTime}
                value={valueTime}
                items={itemsTime}
                setOpen={setOpenTime}
                setValue={setValueTime}
                setItems={setItemsTime}
                placeholder="Time"
                textStyle={{
                  fontSize: 10,
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <DropDownPicker
                style={styles.filter}
                dropDownContainerStyle={{
                  zIndex: 1000000,
                  width: "94%",
                  marginLeft: 4,
                }}
                open={openSize}
                value={valueSize}
                items={itemsSize}
                setOpen={setOpenSize}
                setValue={setValueSize}
                setItems={setItemsSize}
                placeholder="Size"
                textStyle={{
                  fontSize: 10,
                }}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
            }}>
            <View style={{ flex: 1 }}>
              <DropDownPicker
                style={styles.filter2}
                open={openDistance}
                value={valueDistance}
                items={itemsDistance}
                setOpen={setOpenDistance}
                setValue={setValueDistance}
                setItems={setItemsDistance}
                placeholder="Distance"
                textStyle={{
                  fontSize: 10,
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <DropDownPicker
                style={styles.filter2}
                open={openType}
                value={valueType}
                items={itemsType}
                setOpen={setOpenType}
                setValue={setValueType}
                setItems={setItemsType}
                placeholder="Type"
                textStyle={{
                  fontSize: 10,
                }}
              />
            </View>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              flexDirection: "row",
              maxHeight: 46,
            }}>
            <Button
              mode="contained"
              buttonColor="dodgerblue"
              style={{
                marginTop: 5,
                borderRadius: 5,
                width: 200,
              }}
              onPress={() => setFiltered(!filtered)}
              disabled={loading}>
              {filtered ? "Remove Filters" : "Apply Filters"}
            </Button>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default MapPage;
