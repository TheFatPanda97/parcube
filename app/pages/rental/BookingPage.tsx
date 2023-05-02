import { Text, View, Button, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { increment } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@contexts/UserContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { useFirebaseApp } from "@contexts/FiresbaseAppContext";
import useFirestore from "@hooks/useFirestore";
import { useMarkerInfo, useMarkerInfoDispatch } from "@contexts/MarkerContext";
import { Button as PaperButton } from "react-native-paper";
import { Overlay, Rating } from "react-native-elements";

import styles from "./style";

const BookingPage = () => {
  const userInfo = useUser();
  const firebaseApp = useFirebaseApp();
  const firestore = useFirestore(firebaseApp);
  const markers = useMarkerInfo();
  const markerDispatch = useMarkerInfoDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [visible, setVisible] = useState(true);
  const [lastRating, setlastRating] = useState(0);

  const onSubmit = async (address: string, bookingId: string, city: string, rating: number) => {
    let parking: any;

    cancelBooking(bookingId, city);

    try {
      parking = await firestore.read(`locations/${city}/spots`, bookingId);
    } catch (error) {
      console.log(error);
    }
    if (parking !== undefined) {
      try {
        await firestore.update(
          `locations/${city}/spots`,
          {
            rating:
              parking.rating != null
                ? (parking.rating * parking.ratingCount + rating) / (parking.ratingCount + 1)
                : rating,
            ratingCount: increment(1),
          },
          bookingId
        );

        Alert.alert(`Rating of ${rating} stars for ${address} added!`);
      } catch (error) {
        console.log(error);
        Alert.alert("Something went wrong, rating was not added.");
      }
      toggleOverlay();
    }
  };

  const toggleOverlay = () => {
    setVisible(!visible);
    setlastRating(lastRating);
    console.log(lastRating);
  };

  const cancelBooking = (id: string, city: string) => {
    firestore.update(
      `locations/${city}/spots`,
      {
        bookedBy: "",
      },
      id
    );

    markerDispatch({
      type: "update",
      data: {
        [id]: {
          ...markers[id],
          bookedBy: "",
        },
      },
    });
  };

  const today = new Date();

  return (
    <SafeAreaView>
      <ScrollView>
        <Text style={styles.headerText}>Booked By Me</Text>
        <View style={styles.formView}>
          {Object.entries(markers)
            .filter(([_, markerData]) => markerData.bookedBy === userInfo.uid)
            .map(([id, { address, city, bookedBy, bookedFrom, bookedTo, cost, numSpots }]) => (
              <View
                key={id}
                style={{
                  borderColor: "rgba(100,100,150,0.7)",
                  backgroundColor: "rgba(40,100,255,0.1)",
                  borderWidth: 1,
                  borderRadius: 5,
                  marginBottom: 10,
                  flex: 1,
                  alignSelf: "center",
                  paddingVertical: 10,
                }}>
                {bookedTo !== undefined && bookedTo.getTime() < today.getTime() && (
                  <Overlay
                    isVisible={visible}
                    onBackdropPress={toggleOverlay}
                    overlayStyle={{
                      borderWidth: 1,
                      borderColor: "rgba(40,186,255,0.8)",
                      borderRadius: 15,
                      width: "80%",
                      height: "25%",
                    }}>
                    <Text
                      style={{
                        fontSize: 15,
                        alignSelf: "center",
                      }}>
                      How was the <Text style={{ fontWeight: "bold" }}>{address}</Text> parking?
                    </Text>
                    <Rating
                      type="custom"
                      fractions={1}
                      startingValue={2.5}
                      ratingCount={5}
                      imageSize={48}
                      showRating
                      onFinishRating={setlastRating}
                      style={{
                        color: "rgba(40,186,255,0.8)",
                      }}
                    />
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "space-evenly",
                        flexDirection: "row",
                        maxHeight: 46,
                        marginTop: 10,
                      }}>
                      <PaperButton
                        mode="outlined"
                        textColor="dodgerblue"
                        labelStyle={{ color: "dodgerblue" }}
                        style={{
                          marginTop: 5,
                          marginRight: 5,
                          borderRadius: 5,
                          borderColor: "dodgerblue",
                          width: "50%",
                        }}
                        onPress={toggleOverlay}>
                        No, thanks
                      </PaperButton>
                      <PaperButton
                        mode="contained"
                        buttonColor="dodgerblue"
                        style={{
                          marginTop: 5,
                          marginLeft: 5,
                          borderRadius: 5,
                          width: "50%",
                        }}
                        onPress={() => onSubmit(address, id, city, lastRating)}>
                        Rate!
                      </PaperButton>
                    </View>
                  </Overlay>
                )}
                <View>
                  <Text
                    style={{
                      color: "black",
                      fontSize: 15,
                      alignSelf: "center",
                      paddingBottom: 10,
                      fontWeight: "bold",
                    }}>
                    {address}
                  </Text>
                  <Text
                    style={{
                      color: "black",
                      fontSize: 15,
                      alignSelf: "center",
                      paddingBottom: 10,
                    }}>
                    Booked from:{" "}
                    <Text style={{ fontWeight: "bold" }}>{bookedFrom?.toDateString()}</Text>
                  </Text>
                  <Text
                    style={{
                      color: "black",
                      fontSize: 15,
                      alignSelf: "center",
                      paddingBottom: 10,
                    }}>
                    Booked to:
                    <Text style={{ fontWeight: "bold" }}> {bookedTo?.toDateString()}</Text>
                  </Text>
                  <Text
                    style={{
                      color: "black",
                      fontSize: 15,
                      alignSelf: "center",
                      paddingBottom: 10,
                    }}>
                    Cost: <Text style={{ fontWeight: "bold" }}>{cost}</Text>
                  </Text>
                  <Text
                    style={{
                      color: "black",
                      fontSize: 15,
                      alignSelf: "center",
                      paddingBottom: 10,
                    }}>
                    Spots: <Text style={{ fontWeight: "bold" }}>{numSpots}</Text>
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}>
                    <View style={{ width: "45%", marginRight: 10 }}>
                      <Button
                        color="rgb(220,150,150)"
                        title="Cancel Booking"
                        disabled={bookedBy === "" && bookedBy == null}
                        onPress={() => cancelBooking(id, city)}
                      />
                    </View>
                    <View style={{ width: "45%" }}>
                      <Button
                        color="rgb(150,220,150)"
                        title="Details"
                        onPress={() => {
                          navigation.navigate("RentalDisplay", { uid: id });
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookingPage;
