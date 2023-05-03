import React, { useEffect, useState } from "react";
import styles from "./style";
import { SelectList } from "react-native-dropdown-select-list";
import { Switch, Button } from "react-native-paper";
import {
  Text,
  TextInput,
  View,
  ScrollView,
  Alert,
  Image,
  Platform,
  TouchableOpacity,
} from "react-native";
import { GeoPoint, Timestamp } from "firebase/firestore";
import { useFirebaseApp } from "@contexts/FiresbaseAppContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import useFirestore from "@hooks/useFirestore";
import { useMarkerInfo, useMarkerInfoDispatch } from "@contexts/MarkerContext";
import { distance } from "@utils/MapUtils";
import { getStorage } from "firebase/storage";
import { uploadImageAsync, getImageUrl } from "@utils/ImageUtils";
import * as ImagePicker from "expo-image-picker";
import Carousel from "react-native-reanimated-carousel";
import { MarkerType } from "@utils/MarkerUtils";
import Spinner from "react-native-loading-spinner-overlay/lib";
import { v4 as uuid } from "uuid";
import GooglePlacesAutocomplete from "@components/GooglePlaceAutoComplete";
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/FontAwesome";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useUser } from "@contexts/UserContext";

import type { Dispatch } from "react";
import type { TRootRoutes } from "@customTypes/routes";
import type { ParamListBase } from "@react-navigation/native";
import type {
  NativeStackScreenProps,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import type { CustomFirestore } from "@hooks/useFirestore";
import type { IAction as IMarkerAction } from "@contexts/MarkerContext";
import type { FirebaseStorage } from "firebase/storage";
import { useUserLocation } from "@contexts/UserLocationContext";

type Props = NativeStackScreenProps<TRootRoutes, "RentalPage">;

const createRentalPage = async (
  firestore: CustomFirestore,
  storage: FirebaseStorage,
  geopoint: { latitude: number; longitude: number },
  startDate: Date | undefined,
  endDate: Date | undefined,
  address: string,
  country: string,
  city: string,
  cost: string,
  description: string,
  numSpots: string,
  parkingSpaceType: string,
  vehicleSizeType: string,
  electricCharger: boolean,
  images: { uri: string }[],
  navigation: NativeStackNavigationProp<ParamListBase>,
  markerDispatch: Dispatch<IMarkerAction>,
  userId: string,
  currentLocation: {
    latitude: number;
    longitude: number;
  },
  markerId?: string
) => {
  if (currentLocation.latitude === -1 && currentLocation.longitude === -1) {
    return Alert.alert("Rental Status", "Can't find current distance!", [
      {
        text: "OK",
      },
    ]);
  }

  if (geopoint.latitude === -1 && geopoint.longitude === -1) {
    return Alert.alert("Rental Status", "Please provide an address!", [
      {
        text: "OK",
      },
    ]);
  }

  if (startDate === undefined || endDate === undefined) {
    return Alert.alert("Rental Status", "Please provide a start and end date", [
      {
        text: "OK",
      },
    ]);
  }

  try {
    const imagePaths = (
      await Promise.all(images.map(({ uri }) => uploadImageAsync(storage, uri, "rental/")))
    ).map(([imagePath, _]) => imagePath);
    let doc;

    if (markerId) {
      await firestore.update(
        `locations/${city}/spots`,
        {
          geopoint: new GeoPoint(geopoint.latitude as number, geopoint.longitude as number),
          address,
          startDate: Timestamp.fromDate(startDate),
          endDate: Timestamp.fromDate(endDate),
          bookedBy: "",
          country,
          city,
          cost: parseInt(cost, 10),
          description,
          num_spots: parseInt(numSpots, 10),
          type: MarkerType.individual,
          parking_space_type: parkingSpaceType,
          vehicle_size_type: vehicleSizeType,
          electric_charger: electricCharger,
          image_paths: imagePaths.length > 1 ? imagePaths : ["rental/default-parking.jpg"],
        },
        markerId
      );
    } else {
      doc = await firestore.create(`locations/${city}/spots`, {
        geopoint: new GeoPoint(geopoint.latitude as number, geopoint.longitude as number),
        createdBy: userId,
        address,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        bookedBy: "",
        country,
        city,
        cost: parseInt(cost, 10),
        description,
        num_spots: parseInt(numSpots, 10),
        type: MarkerType.individual,
        parking_space_type: parkingSpaceType,
        vehicle_size_type: vehicleSizeType,
        electric_charger: electricCharger,
        image_paths: imagePaths.length > 1 ? imagePaths : ["rental/default-parking.jpg"],
      });
    }

    if (markerId) {
      markerDispatch({
        type: "update",
        data: {
          [markerId]: {
            address,
            createdBy: userId,
            bookedBy: "",
            startDate,
            endDate,
            country,
            city,
            parkingSpaceType,
            vehicleSizeType,
            electricCharger,
            type: MarkerType.individual,
            description,
            geopoint: geopoint as { latitude: number; longitude: number },
            cost: parseInt(cost, 10),
            numSpots: parseInt(numSpots, 10),
            distance: distance(
              currentLocation.latitude,
              currentLocation.longitude,
              geopoint.latitude as number,
              geopoint.longitude as number
            ),
            imagePaths,
          },
        },
      });
    } else if (doc) {
      markerDispatch({
        type: "add",
        data: {
          [doc.id]: {
            address,
            createdBy: userId,
            bookedBy: "",
            startDate,
            endDate,
            country,
            city,
            parkingSpaceType,
            vehicleSizeType,
            electricCharger,
            type: MarkerType.individual,
            description,
            geopoint: geopoint as { latitude: number; longitude: number },
            cost: parseInt(cost, 10),
            numSpots: parseInt(numSpots, 10),
            distance: distance(
              currentLocation.latitude,
              currentLocation.longitude,
              geopoint.latitude as number,
              geopoint.longitude as number
            ),
            imagePaths,
          },
        },
      });
    }

    Alert.alert("Rental Status", `Rental ${markerId ? "Updated" : "Created"} Successfully!`, [
      {
        text: "OK",
        onPress: () => navigation.navigate("Home"),
      },
    ]);
  } catch (error) {
    console.log(error);
    Alert.alert("Something went wrong!");
  }
};

const defaultParkingImage = require("@assets/default-parking.jpg");

const RentalPage = ({ route }: Props) => {
  const spaceTypeData = [
    { key: "1", value: "Driveway" },
    { key: "2", value: "On-street" },
    { key: "3", value: "Garage" },
    { key: "4", value: "Multilevel Parking Garage" },
  ];
  const vehicleTypeData = [
    { key: "1", value: "Small(eg. Ford Fiesta)" },
    { key: "2", value: "Medium(eg. Audi A3)" },
    { key: "3", value: "Large(eg. Volvo XC90)" },
    { key: "4", value: "Very Large(eg. Minibus)" },
  ];

  const sessiontoken = uuid();
  const { coord, uid } = route.params || {};
  const [geopoint, setGeopoint] = useState(coord ? coord : { longitude: -1, latitude: -1 });
  const userLocation = useUserLocation();
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [cost, setCost] = useState("0");
  const [description, setDescription] = useState("");
  const [numSpots, setNumSpots] = useState("0");
  const [parkingSpaceType, setParkingSpaceType] = useState("");
  const [vehicleSizeType, setVehicleSizeType] = useState("");
  const [electricCharger, setElectricCharger] = useState(false);
  const [averageCost, setAverageCost] = useState<string | null>(null);
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const markers = useMarkerInfo();

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const firebaseApp = useFirebaseApp();
  const firestore = useFirestore(firebaseApp);
  const markerDispatch = useMarkerInfoDispatch();
  const storage = getStorage(firebaseApp);
  const [fromdate, setfromDate] = useState<Date | undefined>(new Date());
  const [todate, settoDate] = useState<Date | undefined>(new Date());
  const [frommode, setfromMode] = useState<"date" | "time">("date");
  const [tomode, settoMode] = useState<"date" | "time">("date");
  const [fromshow, setfromShow] = useState(false);
  const [toshow, settoShow] = useState(false);
  const userInfo = useUser();

  const showfromMode = (currentMode: any) => {
    if (Platform.OS === "android") {
      setfromShow(true);
      // for iOS, add a button that closes the picker
    }
    setfromMode(currentMode);
  };

  const showtoMode = (currentMode: any) => {
    if (Platform.OS === "android") {
      settoShow(true);
      // for iOS, add a button that closes the picker
    }
    settoMode(currentMode);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setAddress("");
      setCountry("");
      setCity("");
      setCost("0");
      setDescription("");
      setNumSpots("0");
      setParkingSpaceType("");
      setVehicleSizeType("");
      setElectricCharger(false);
      setAverageCost(null);
      setImages([]);
      setGeopoint({ longitude: -1, latitude: -1 });
      navigation.setParams({ coord: undefined, uid: undefined, currLocation: undefined });
    });

    return unsubscribe;
  }, []);

  const pickImage = async () => {
    const result = await await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      setImages(result.assets.map((asset) => ({ uri: asset.uri, title: "hehe" })));
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      // get the address of the geo code
      if (coord) {
        setGeopoint(coord);
        const res = await Location.reverseGeocodeAsync(coord);

        if (res.length >= 1) {
          setAddress(`${res[0].streetNumber} ${res[0].street}`);
          setCity(res[0].city?.toLocaleLowerCase() || "");
          setCountry(res[0].country?.toLocaleLowerCase() || "");
        }
      }

      if (uid) {
        const currMarker = markers[uid];
        let images: { uri: string }[] = [];

        if (currMarker.imagePaths) {
          const res = await Promise.all(
            currMarker.imagePaths?.map((path) => getImageUrl(storage, path))
          );
          images = res.map((url) => ({ uri: url }));
        }

        setAddress(currMarker.address);
        setCity(currMarker.city);
        setCountry(currMarker.country);
        setCost(currMarker.cost.toString());
        setDescription(currMarker.description);
        setNumSpots(currMarker.numSpots.toString());
        setParkingSpaceType(currMarker.parkingSpaceType);
        setVehicleSizeType(currMarker.vehicleSizeType);
        setElectricCharger(currMarker.electricCharger);
        setImages(images);
        setfromDate(currMarker.startDate);
        settoDate(currMarker.endDate);
        setGeopoint(currMarker.geopoint);
      }

      const spotData = await firestore.read("locations", userLocation.city);

      if (spotData?.average_cost) {
        setAverageCost(`${spotData?.average_cost}`);
      }

      setLoading(false);
    })();
  }, [coord, uid]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          nestedScrollEnabled
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          contentContainerStyle={{ paddingHorizontal: 40 }}>
          <Spinner
            visible={loading}
            textContent="Loading..."
            animation="fade"
            textStyle={{ color: "white" }}
          />
          <Text style={styles.headerText}>Rent Out Your Parking Space</Text>
          {uid || images.length !== 0 ? (
            <Carousel
              loop={images.length > 1}
              width={320}
              height={230}
              data={images}
              mode="parallax"
              scrollAnimationDuration={1000}
              renderItem={({ item }) => (
                <Image
                  style={{
                    width: 320,
                    height: 230,
                    borderRadius: 5,
                  }}
                  source={{ uri: item.uri }}
                />
              )}
            />
          ) : (
            <Image
              style={{
                width: 320,
                height: 230,
                borderRadius: 5,
                alignSelf: "center",
                marginBottom: 10,
              }}
              source={defaultParkingImage}
            />
          )}
          <Button
            mode="outlined"
            textColor="dodgerblue"
            labelStyle={{ color: "dodgerblue" }}
            style={{
              marginBottom: 15,
              borderColor: "dodgerblue",
            }}
            onPress={pickImage}>
            Select Images
          </Button>
          <Text style={styles.header2Text}>Parking Space Location</Text>
          <GooglePlacesAutocomplete
            address={address}
            setAddress={setAddress}
            sessionToken={sessiontoken}
            onPredicationPress={async ({ display, value: { city, country } }) => {
              setCity(city);
              setCountry(country);
              setLoading(true);

              const res = await Location.geocodeAsync(display);

              if (res.length >= 1) {
                setGeopoint({
                  latitude: res[0].latitude,
                  longitude: res[0].longitude,
                });
              }

              setLoading(false);
            }}
          />
          <TextInput
            placeholder="City"
            style={styles.formTextInput}
            onChangeText={setCity}
            value={city}
          />
          <TextInput
            placeholder="Country"
            style={styles.formTextInput}
            onChangeText={setCountry}
            value={country}
          />
          <Text style={styles.header2Text}>{"\n"}Parking Space Information</Text>
          <Text>{"\n"}Parking Space Type</Text>
          <SelectList
            defaultOption={spaceTypeData[0]}
            setSelected={setParkingSpaceType}
            data={spaceTypeData}
            save="value"
          />
          <Text>{"\n"}Vehicle Size Type</Text>
          <SelectList
            defaultOption={vehicleTypeData[0]}
            setSelected={setVehicleSizeType}
            data={vehicleTypeData}
            save="value"
          />
          <Text>{"\n"}How many parking spaces do you want to rent out?</Text>
          <TextInput
            style={styles.numberTextInput}
            keyboardType="number-pad"
            onChangeText={setNumSpots}
            value={numSpots}
          />
          <Text>{"\n"}Electric vehicle charger?</Text>
          <Switch
            thumbColor={electricCharger ? "green" : "red"}
            trackColor={{ true: "#90EE90", false: "#FFCCCB" }}
            value={electricCharger}
            onValueChange={setElectricCharger}
            style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }], marginRight: "auto" }}
          />
          <Text style={styles.header2Text}>{"\n"}Booking Information</Text>
          <Text>
            {"\n"}Hourly Rate {averageCost && `(average cost in this area is $${averageCost})`}
          </Text>
          <TextInput
            placeholder="Enter hourly rate"
            style={styles.formTextInput}
            keyboardType="decimal-pad"
            value={cost}
            onChangeText={setCost}
          />
          <Text>{"\n"}Additional Information for Client</Text>
          <TextInput
            placeholder="Enter additional information"
            style={[styles.formTextInput, { height: 75, paddingTop: 5, textAlignVertical: "top" }]}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
          <Text>{"\n"}Select your booking start date and start time:</Text>
          <View style={{ position: "relative" }}>
            <TextInput
              style={{ borderWidth: 1, borderColor: "gray", padding: 10 }}
              value={fromdate?.toLocaleString()}
            />
            <TouchableOpacity
              onPress={() => showfromMode("date")}
              style={{ position: "absolute", top: 10, right: 40, paddingTop: 5 }}>
              <Icon name="calendar" size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => showfromMode("time")}
              style={{ position: "absolute", top: 10, right: 10, paddingTop: 5 }}>
              <Icon name="clock-o" size={20} color="#333" />
            </TouchableOpacity>
          </View>
          {fromshow && fromdate && (
            <DateTimePicker
              value={fromdate}
              mode={frommode}
              onChange={(_, selectedDate) => {
                const currentDate = selectedDate;
                setfromShow(false);
                setfromDate(currentDate);
              }}
            />
          )}
          <Text>{"\n"}Select your booking end date and end time:</Text>
          <View style={{ position: "relative" }}>
            <TextInput
              style={{ borderWidth: 1, borderColor: "gray", padding: 10 }}
              value={todate?.toLocaleString()}
            />
            <TouchableOpacity
              onPress={() => showtoMode("date")}
              style={{ position: "absolute", top: 10, right: 40, paddingTop: 5 }}>
              <Icon name="calendar" size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => showtoMode("time")}
              style={{ position: "absolute", top: 10, right: 10, paddingTop: 5 }}>
              <Icon name="clock-o" size={20} color="#333" />
            </TouchableOpacity>
          </View>
          {toshow && todate && (
            <DateTimePicker
              value={todate}
              mode={tomode}
              onChange={(_, selectedDate) => {
                const currentDate = selectedDate;
                settoShow(false);
                settoDate(currentDate);
              }}
            />
          )}

          <Button
            mode="contained"
            style={{
              marginTop: 30,
              marginBottom: 30,
            }}
            textColor="white"
            buttonColor="dodgerblue"
            onPress={async () => {
              setLoading(true);
              await createRentalPage(
                firestore,
                storage,
                geopoint,
                fromdate,
                todate,
                address,
                country,
                city,
                cost,
                description,
                numSpots,
                parkingSpaceType,
                vehicleSizeType,
                electricCharger,
                images,
                navigation,
                markerDispatch,
                userInfo.uid,
                userLocation,
                uid
              );
              setLoading(false);
            }}>
            {uid ? "Update Parking Details" : "Create Parking"}
          </Button>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default RentalPage;
