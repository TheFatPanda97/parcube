import { useEffect, useState } from "react";
import { View, Text, ScrollView, ViewStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMarkerInfo, useMarkerInfoDispatch } from "@contexts/MarkerContext";
import { useUser } from "@contexts/UserContext";
import { Surface, Button } from "react-native-paper";
import { useFirebaseApp } from "@contexts/FiresbaseAppContext";
import useFirestore from "@hooks/useFirestore";
import Spinner from "react-native-loading-spinner-overlay/lib";

import type { ParamListBase } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface IActionButton {
  disabled: boolean;
  children: React.ReactNode;
  style: ViewStyle;
  color: string;
  [key: string]: any;
}

const ActionButton = ({ children, color, disabled, style, ...props }: IActionButton) => (
  <Button
    mode="outlined"
    textColor={disabled ? "grey" : color}
    labelStyle={{ color: disabled ? "grey" : color }}
    style={{
      borderColor: disabled ? "grey" : color,
      ...style,
    }}
    disabled={disabled}
    {...props}>
    {children}
  </Button>
);

const AllRentalPage = () => {
  const markers = useMarkerInfo();
  const userInfo = useUser();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const firebaseApp = useFirebaseApp();
  const firestore = useFirestore(firebaseApp);
  const [userIdToUserName, setUserIdToUserName] = useState<{ [id: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const markerDispatch = useMarkerInfoDispatch();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const userInfos = await firestore.read("users");
      setUserIdToUserName(
        userInfos.reduce((acc, { id, username }) => ({ ...acc, [id]: username }), {})
      );
      setLoading(false);
    })();
  }, []);

  return (
    <ScrollView>
      <Spinner
        visible={loading}
        textContent="Loading..."
        animation="fade"
        textStyle={{ color: "white" }}
      />
      {Object.entries(markers)
        .filter(([_, { createdBy }]) => createdBy === userInfo.uid)
        .map(
          ([
            markerId,
            { address, city, country, bookedBy, bookedFrom, bookedTo, startDate, endDate },
          ]) => {
            return (
              <Surface
                elevation={4}
                key={markerId}
                style={{
                  marginHorizontal: 20,
                  marginVertical: 10,
                  padding: 10,
                  backgroundColor: "white",
                  borderRadius: 5,
                }}>
                <Text>Address: {address}</Text>
                <Text>City: {city}</Text>
                <Text>Country: {country}</Text>
                <Text>Available From: {startDate?.toLocaleString()}</Text>
                <Text>Available To: {endDate?.toLocaleString()}</Text>
                {bookedBy && (
                  <>
                    <View
                      style={{
                        marginVertical: 5,
                        borderBottomColor: "grey",
                        borderWidth: 1,
                        borderRadius: 5,
                      }}
                    />
                    <Text>Booked By: {userIdToUserName[bookedBy]}</Text>
                    <Text>Booked From: {bookedFrom?.toLocaleString()}</Text>
                    <Text>Booked To: {bookedTo?.toLocaleString()}</Text>
                  </>
                )}
                <View
                  style={{
                    marginVertical: 5,
                    borderBottomColor: "grey",
                    borderWidth: 1,
                    borderRadius: 5,
                  }}
                />
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <ActionButton
                    color="dodgerblue"
                    disabled={!!bookedBy}
                    style={{
                      marginVertical: 5,
                      borderRadius: 5,
                      flexGrow: 1,
                      marginRight: 5,
                    }}
                    onPress={() =>
                      navigation.navigate("TabNavigator", {
                        screen: "RentalPage",
                        params: { uid: markerId },
                      })
                    }>
                    Edit Rental
                  </ActionButton>
                  <ActionButton
                    color="red"
                    disabled={!!bookedBy}
                    style={{
                      marginVertical: 5,
                      borderRadius: 5,
                      flexGrow: 1,
                      marginLeft: 5,
                    }}
                    onPress={async () => {
                      await firestore.delete(`locations/${city.toLowerCase()}/spots`, markerId);
                      markerDispatch({ type: "delete", deletionIds: [markerId] });
                    }}>
                    Delete Rental
                  </ActionButton>
                </View>
              </Surface>
            );
          }
        )}
    </ScrollView>
  );
};

export default AllRentalPage;
