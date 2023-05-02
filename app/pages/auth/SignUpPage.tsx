import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "react-native-paper";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useFirebaseApp } from "@contexts/FiresbaseAppContext";
import { useUserDispatch } from "@contexts/UserContext";
import Spinner from "react-native-loading-spinner-overlay/lib";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import useFirestore from "@hooks/useFirestore";
import { getStorage } from "firebase/storage";
import { DEFAULT_PROFILE_IMAGE_PATH, getImageUrl } from "@utils/ImageUtils";

import styles from "./style";

import type { Auth } from "firebase/auth";
import type { IAction as IUserContextAction } from "@contexts/UserContext";
import type { Dispatch } from "react";
import type { CustomFirestore } from "@hooks/useFirestore";
import type { FirebaseStorage } from "firebase/storage";

const onSignUp = async (
  setLoading: (state: boolean) => void,
  auth: Auth,
  firestore: CustomFirestore,
  storage: FirebaseStorage,
  email: string,
  password: string,
  firstname: string,
  lastname: string,
  username: string,
  userDispatch: Dispatch<IUserContextAction>,
  navigation: NativeStackNavigationProp<ParamListBase>
) => {
  setLoading(true);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;
    const imageUrl = await getImageUrl(storage, DEFAULT_PROFILE_IMAGE_PATH);

    // email sign up, record data in database
    await firestore.create(
      "users",
      {
        email,
        first_name: firstname,
        last_name: lastname,
        username,
        image_path: DEFAULT_PROFILE_IMAGE_PATH,
      },
      uid
    );

    userDispatch({
      type: "login",
      uid,
      email,
      firstname,
      lastname,
      username,
      imageUrl,
    });

    setLoading(false);
    navigation.navigate("TabNavigator");
  } catch (error) {
    setLoading(false);
    console.log(error);
  }
};

const SignUpPage = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const firebaseApp = useFirebaseApp();
  const auth = getAuth(firebaseApp);
  const userDispatch = useUserDispatch();
  const firestore = useFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  return (
    <SafeAreaView style={styles.containerView}>
      <View style={styles.formView}>
        <Spinner
          visible={loading}
          textContent="Signing up ..."
          animation="fade"
          textStyle={{ color: "white" }}
        />
        <Text style={styles.logoText}>Parcube Sign Up</Text>
        <TextInput
          placeholder="Fist Name"
          style={styles.formTextInput}
          onChangeText={(text) => setFirstname(text)}
        />
        <TextInput
          placeholder="Last Name"
          style={styles.formTextInput}
          onChangeText={(text) => setLastname(text)}
        />
        <TextInput
          placeholder="Username"
          style={styles.formTextInput}
          onChangeText={(text) => setUsername(text)}
        />
        <TextInput
          placeholder="Email"
          style={styles.formTextInput}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          placeholder="Password"
          style={styles.formTextInput}
          secureTextEntry
          onChangeText={(text) => setPassword(text)}
        />
        <View>
          <Button
            mode="contained"
            buttonColor="dodgerblue"
            textColor="white"
            style={{
              marginTop: 5,
              borderRadius: 5,
            }}
            onPress={() =>
              onSignUp(
                setLoading,
                auth,
                firestore,
                storage,
                email,
                password,
                firstname,
                lastname,
                username,
                userDispatch,
                navigation
              )
            }>
            Sign Up
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignUpPage;
