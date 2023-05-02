import { useState, useEffect } from "react";
import { Text, View, TextInput, Alert, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, FAB } from "react-native-paper";
import Spinner from "react-native-loading-spinner-overlay/lib";
import { useUser, useUserDispatch } from "@contexts/UserContext";
import { useNavigation } from "@react-navigation/native";
import { useFirebaseApp } from "@contexts/FiresbaseAppContext";
import useFirestore from "@hooks/useFirestore";
import * as Linking from "expo-linking";
import { getStorage } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { uploadImageAsync } from "@utils/ImageUtils";

import styles from "./style";

import type { Dispatch } from "react";
import type { IAction as IUserContextAction } from "@contexts/UserContext";
import type { CustomFirestore } from "@hooks/useFirestore";
import type { ParamListBase } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const onSubmit = async (
  setLoading: (state: boolean) => void,
  firestore: CustomFirestore,
  uid: string,
  firstname: string,
  lastname: string,
  username: string,
  userDispatch: Dispatch<IUserContextAction>
) => {
  try {
    await firestore.update(
      "users",
      {
        first_name: firstname,
        last_name: lastname,
        username,
      },
      uid
    );

    userDispatch({
      type: "update",
      firstname,
      lastname,
      username,
    });

    Alert.alert("Update Status", "Successfully updated your profile!");
  } catch (error) {
    setLoading(false);
    console.log(error);
  }
};

const togglePremium = async (
  setLoading: (state: boolean) => void,
  firestore: CustomFirestore,
  uid: string,
  userDispatch: Dispatch<IUserContextAction>
) => {
  const user = await firestore.read("users", uid);
  let premiumStatus = user.isPremium;

  try {
    premiumStatus = !premiumStatus;

    await firestore.update(
      "users",
      {
        isPremium: premiumStatus,
      },
      uid
    );

    userDispatch({
      type: "update",
      isPremium: premiumStatus,
    });

    if (premiumStatus) {
      Alert.alert("Update Status", "You have successfully become a premium user!");
    } else {
      Alert.alert("Update Status", "You have successfully cancelled your premium status!");
    }
  } catch (error) {
    setLoading(false);
    console.log(error);
  }
};

const ProfilePage = () => {
  const userInfo = useUser();

  const [firstname, setFirstname] = useState(userInfo.firstname);
  const [lastname, setLastname] = useState(userInfo.lastname);
  const [username, setUsername] = useState(userInfo.username);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const firebaseApp = useFirebaseApp();
  const userDispatch = useUserDispatch();
  const firestore = useFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);

  const prefix = Linking.createURL("expo://parcube/signup/");

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setFirstname(userInfo.firstname);
      setLastname(userInfo.lastname);
      setUsername(userInfo.username);
    });

    return unsubscribe;
  }, []);

  const pickImage = async () => {
    const status = await ImagePicker.getCameraPermissionsAsync();

    console.log(status);

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const [imagePath, imageUrl] = await uploadImageAsync(
        storage,
        result.assets[0].uri,
        "profile-images/"
      );

      await firestore.update(
        "users",
        {
          image_path: imagePath,
        },
        userInfo.uid
      );

      userDispatch({
        type: "update",
        imageUrl,
      });
    }
  };

  return (
    <SafeAreaView style={styles.containerView}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formView}>
          <Spinner
            visible={loading}
            textContent="Updating"
            animation="fade"
            textStyle={{ color: "white" }}
          />
          <Text style={styles.logoText}>Profile Page</Text>
          <View>
            <Image
              source={{ uri: userInfo.imageUrl }}
              style={{
                width: 130,
                height: 130,
                borderRadius: 100,
                alignSelf: "center",
                marginBottom: 20,
              }}
            />
            <FAB
              style={{
                position: "absolute",
                left: 175,
                top: 85,
                borderRadius: 100,
                backgroundColor: "dodgerblue",
              }}
              icon="pen"
              size="small"
              color="white"
              onPress={pickImage}
            />
          </View>
          <Text>Username</Text>
          <TextInput
            placeholder="Username"
            style={styles.formTextInput}
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
          <Text>First Name</Text>
          <TextInput
            placeholder="Fist Name"
            style={styles.formTextInput}
            value={firstname}
            onChangeText={(text) => setFirstname(text)}
          />
          <Text>Last Name</Text>
          <TextInput
            placeholder="Last Name"
            style={styles.formTextInput}
            value={lastname}
            onChangeText={(text) => setLastname(text)}
          />
          <Text>Email</Text>
          <TextInput style={styles.formTextInput} value={userInfo.email} editable={false} />
          <View>
            <Button
              mode="contained"
              buttonColor="dodgerblue"
              textColor="white"
              style={{
                marginVertical: 5,
                borderRadius: 5,
              }}
              onPress={() =>
                onSubmit(
                  setLoading,
                  firestore,
                  userInfo.uid,
                  firstname,
                  lastname,
                  username,
                  userDispatch
                )
              }>
              Confirm Profile Changes
            </Button>
          </View>
          {/* <QRCode value={prefix} /> */}
          <View
            style={{
              marginVertical: 5,
              borderBottomColor: "grey",
              borderWidth: 1,
              borderRadius: 5,
            }}
          />
          <Button
            mode="outlined"
            textColor="dodgerblue"
            labelStyle={{ color: "dodgerblue" }}
            style={{
              marginVertical: 5,
              borderRadius: 5,
              borderColor: "dodgerblue",
            }}
            onPress={() => {
              navigation.navigate("AllRentalPage");
            }}>
            Edit Rentals
          </Button>
          <Button
            mode="contained"
            buttonColor={userInfo.isPremium ? "red" : "gold"}
            textColor="white"
            style={{
              marginTop: 5,
              marginBottom: 20,
              borderRadius: 5,
            }}
            onPress={() => togglePremium(setLoading, firestore, userInfo.uid, userDispatch)}>
            {userInfo.isPremium ? "Cancel Premium Account" : "Become Premium User"}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfilePage;
