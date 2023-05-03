import React, { useEffect, useState } from "react";
import styles from "./style";
import {
  Alert,
  KeyboardAvoidingView,
  Text,
  TextInput,
  View,
  ScrollView,
  Image,
  Platform,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Button } from "react-native-paper";
import { useFirebaseApp } from "@contexts/FiresbaseAppContext";
import { getStorage } from "firebase/storage";
import { getImageUrl } from "@utils/ImageUtils";
import { useMarkerInfo, useMarkerInfoDispatch } from "@contexts/MarkerContext";
import Carousel from "react-native-reanimated-carousel";
import { useUser, useUserDispatch } from "@contexts/UserContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { MarkerType } from "@utils/MarkerUtils";
import useFirestore from "@hooks/useFirestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome";
import { Timestamp } from "firebase/firestore";

const RentalDisplay = ({ route }: any) => {
  const { uid } = route.params;
  const markers = useMarkerInfo();
  const currMarker = markers[uid];
  const [displayCost, setDisplayCost] = useState(currMarker.cost);
  const userDispatch = useUserDispatch();
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [fromdate, setfromDate] = useState<Date | undefined>(
    currMarker.bookedBy !== "" ? currMarker.bookedFrom : currMarker.startDate
  );
  const [todate, settoDate] = useState<Date | undefined>(
    currMarker.bookedBy !== "" ? currMarker.bookedTo : currMarker.endDate
  );
  const [frommode, setfromMode] = useState<"date" | "time">("date");
  const [tomode, settoMode] = useState<"date" | "time">("date");
  const [fromshow, setfromShow] = useState(false);
  const [toshow, settoShow] = useState(false);

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

  const firebaseApp = useFirebaseApp();
  const storage = getStorage(firebaseApp);
  const userInfo = useUser();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const firestore = useFirestore(firebaseApp);
  const markerDispatch = useMarkerInfoDispatch();

  const updateHours = async () => {
    if (fromdate === undefined || todate === undefined) {
      return Alert.alert("Rental Status", "Please provide a start and end date", [
        {
          text: "OK",
        },
      ]);
    }

    let hoursBooked = Math.abs(todate.getTime() - fromdate.getTime()) / 36e5;
    // round to 2 decimal places
    hoursBooked = Math.round((hoursBooked + Number.EPSILON) * 100) / 100;
    let prevtotalHoursBooked = Math.round((userInfo.totalBookedHours + Number.EPSILON) * 100) / 100;
    let prevCurrentSession = userInfo.currentSession;
    try {
      await firestore.update(
        "users",
        {
          totalBookedHours: prevtotalHoursBooked + hoursBooked,
          currentSession: prevCurrentSession + hoursBooked,
        },
        userInfo.uid
      );

      userDispatch({
        type: "update",
        totalBookedHours: userInfo.totalBookedHours + hoursBooked,
        currentSession: userInfo.currentSession + hoursBooked,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const bookAndRedirect = async () => {
    if (fromdate === undefined || todate === undefined) {
      return Alert.alert("Rental Status", "Please provide a start and end date", [
        {
          text: "OK",
        },
      ]);
    }

    await firestore.update(
      `locations/${currMarker.city}/spots`,
      {
        bookedBy: userInfo.uid,
        bookedFrom: Timestamp.fromDate(fromdate),
        bookedTo: Timestamp.fromDate(todate),
      },
      uid
    );

    if (userInfo.currentSession >= 10) {
      const currentSessionTime = userInfo.currentSession;
      await firestore.update("users", { currentSession: currentSessionTime - 10 }, userInfo.uid);
      userDispatch({
        type: "update",
        currentSession: currentSessionTime - 10,
      });
    }

    markerDispatch({
      type: "update",
      data: {
        [uid]: {
          ...currMarker,
          bookedBy: userInfo.uid,
          bookedFrom: fromdate,
          bookedTo: todate,
        },
      },
    });

    navigation.navigate("BookedByMe", { uid: userInfo.uid });
  };

  useEffect(() => {
    (async () => {
      if (currMarker.type === MarkerType.commercial && currMarker.imageUrls) {
        setImages(currMarker.imageUrls.map((url) => ({ uri: url })));
      } else if (currMarker.imagePaths) {
        const imageUrls = await Promise.all(
          currMarker.imagePaths.map((path) => getImageUrl(storage, path))
        );

        setImages(imageUrls.map((url) => ({ uri: url })));
      }
    })();
  }, [uid]);

  //apply discount on load
  useEffect(() => {
    let discount = 0.9;
    if (userInfo.isPremium) {
      discount = 0.8;
    }

    if (userInfo.currentSession >= 10) {
      setDisplayCost(currMarker.cost * discount);
    }
  }, []);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <View style={{ flex: 1 }}>
        <ScrollView
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          contentContainerStyle={{ paddingHorizontal: 40 }}>
          <Text style={styles.headerText}>Parking Space Information</Text>
          <Button
            mode="contained"
            style={{
              marginTop: 10,
              marginBottom: 10,
              backgroundColor: "#FF5A5F",
            }}
            onPress={() => {
              navigation.navigate("ReportPage", { uid });
            }}>
            Report this parking space
          </Button>
          <Carousel
            loop={images.length > 1}
            width={320}
            height={230}
            data={images}
            mode="parallax"
            scrollAnimationDuration={1000}
            style={{
              marginBottom: 10,
            }}
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
          <Text style={styles.header2Text}>Parking Space Location</Text>
          <TextInput value={currMarker.address} editable={false} style={styles.formTextInput} />
          <TextInput value={currMarker.country} editable={false} style={styles.formTextInput} />
          <TextInput value={currMarker.city} editable={false} style={styles.formTextInput} />
          <Text>{"\n"}Parking Space Type</Text>
          <TextInput
            value={currMarker.parkingSpaceType}
            editable={false}
            style={styles.formTextInput}
          />
          <Text>{"\n"}Vehicle Size Type</Text>
          <TextInput
            value={currMarker.vehicleSizeType}
            editable={false}
            style={styles.formTextInput}
          />
          <Text>{"\n"}How many parking spaces are available</Text>
          <TextInput
            value={`${currMarker.numSpots}`}
            editable={false}
            style={styles.formTextInput}
          />
          <Text>{"\n"}Electric vehicle charger?</Text>
          <TextInput
            value={currMarker.electricCharger ? "Yes" : "No"}
            editable={false}
            style={styles.formTextInput}
          />
          <Text style={styles.header2Text}>{"\n"}Booking Information</Text>
          <Text>{"\n"}Desired Hourly Rate</Text>
          <TextInput value={`${displayCost}`} editable={false} style={styles.formTextInput} />
          <Text style={{ color: "red" }}>
            {userInfo.currentSession >= 10 ? "Congratulations, you have a discount applied!" : ""}
          </Text>
          <Text>{"\n"}Start Date(of parking availability)</Text>
          <TextInput
            value={currMarker.startDate?.toDateString()}
            editable={false}
            style={styles.formTextInput}
          />
          <Text>{"\n"}End Date(of parking availability)</Text>
          <TextInput
            value={currMarker.endDate?.toDateString()}
            editable={false}
            style={styles.formTextInput}
          />
          <Text>{"\n"}Additional Information for Client</Text>
          <TextInput
            value={currMarker.description}
            editable={false}
            numberOfLines={4}
            multiline
            style={[styles.formTextInput, { height: 75, paddingTop: 5, textAlignVertical: "top" }]}
          />
          {currMarker.url === undefined && (
            <>
              <Text>
                {"\n"}
                {currMarker.bookedBy !== ""
                  ? "Booked From"
                  : "Select your booking start date and start time:"}
              </Text>
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
            </>
          )}
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
          {currMarker.url === undefined && (
            <>
              <Text>
                {"\n"}
                {currMarker.bookedBy !== ""
                  ? "Booked To"
                  : "Select your booking end date and end time:"}
              </Text>
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
            </>
          )}
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

          <Text>{"\n"}</Text>
          <Button
            mode="contained"
            style={{
              marginBottom: 30,
            }}
            textColor="white"
            buttonColor="dodgerblue"
            disabled={currMarker.bookedBy !== "" && currMarker.bookedBy != null}
            // call 2 functions in one onPress, bookAndRedirect() and updateHours()
            onPress={async () => {
              if (currMarker.url) {
                await Linking.openURL(currMarker.url);
              } else {
                await updateHours();
                await bookAndRedirect();
              }
            }}>
            {currMarker.bookedBy !== "" ? "Spot is Booked" : "Book This Spot"}
          </Button>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RentalDisplay;
