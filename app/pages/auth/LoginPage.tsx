import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Text, TextInput, View, Image } from "react-native";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Spinner from "react-native-loading-spinner-overlay";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "react-native-paper";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import { useUserDispatch } from "@contexts/UserContext";
import { useFirebaseApp } from "@contexts/FiresbaseAppContext";
import { getStorage } from "firebase/storage";
import useFirestore from "@hooks/useFirestore";
import { DEFAULT_PROFILE_IMAGE_PATH, getImageUrl } from "@utils/ImageUtils";
import Constants from "expo-constants";

import styles from "./style";

import type { Dispatch } from "react";
import type { Auth } from "firebase/auth";
import type { IAction as IUserContextAction } from "@contexts/UserContext";
import type { CustomFirestore } from "hooks/useFirestore";
import type { FirebaseStorage } from "firebase/storage";

WebBrowser.maybeCompleteAuthSession();

const onLogin = async (
  setLoading: (state: boolean) => void,
  auth: Auth,
  firestore: CustomFirestore,
  storage: FirebaseStorage,
  email: string,
  password: string,
  setIncorrectLogin: (val: boolean) => void,
  userDispatch: Dispatch<IUserContextAction>,
  navigation: NativeStackNavigationProp<ParamListBase>
) => {
  setLoading(true);
  setIncorrectLogin(false);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;
    const userData = await firestore.read("users", uid);
    const imageUrl = await getImageUrl(storage, userData?.image_path);

    userDispatch({
      type: "login",
      uid,
      email,
      firstname: userData?.first_name,
      lastname: userData?.last_name,
      username: userData?.username,
      isPremium: userData?.isPremium,
      totalBookedHours: userData?.totalBookedHours,
      currentSession: userData?.currentSession,
      imageUrl,
    });

    setLoading(false);
    navigation.navigate("TabNavigator");
  } catch (error) {
    // user login failed
    setLoading(false);
    setIncorrectLogin(true);
    console.log(error);
  }
};

const setGoogleUserInfo = async (
  token: string,
  firestore: CustomFirestore,
  storage: FirebaseStorage,
  userDispatch: Dispatch<IUserContextAction>
) => {
  try {
    const response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const apiData = await response.json();

    let { id: uid, email, given_name: firstname, family_name: lastname, name: username } = apiData;
    let imagePath = DEFAULT_PROFILE_IMAGE_PATH;
    let isPremium = false;
    let totalBookedHours = 0;
    let currentSession = 0;

    const userData = await firestore.read("users", uid);

    // google login
    if (userData) {
      firstname = userData?.first_name;
      lastname = userData?.last_name;
      username = userData?.username;
      imagePath = userData?.image_path;
      isPremium = userData?.isPremium;
      totalBookedHours = userData?.totalBookedHours;
      currentSession = userData?.currentSession;
    } else {
      // google sign up, record data in database
      await firestore.create(
        "users",
        {
          email,
          first_name: firstname,
          last_name: lastname,
          username,
          image_path: imagePath,
        },
        uid
      );
    }

    const imageUrl = await getImageUrl(storage, imagePath);

    userDispatch({
      type: "login",
      uid,
      email,
      firstname,
      lastname,
      username,
      imageUrl,
      isPremium,
      totalBookedHours,
      currentSession,
    });
  } catch (error) {
    console.log(error);
  }
};

const LoginScreen = () => {
  const [request, response, promptGoogleLogin] = Google.useAuthRequest({
    androidClientId: Constants.expoConfig?.extra?.androidClientId,
    redirectUri: AuthSession.makeRedirectUri({
      scheme: "parcube",
      useProxy: true,
    }),
    expoClientId: Constants.expoConfig?.extra?.expoClientId,
  });

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const firebaseApp = useFirebaseApp();
  const firestore = useFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  const userDispatch = useUserDispatch();
  const storage = getStorage(firebaseApp);

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null); // google login token
  const [incorrectLogin, setIncorrectLogin] = useState(false);

  useEffect(() => {
    (async () => {
      if (response?.type === "success" && response.authentication?.accessToken) {
        setToken(response.authentication?.accessToken);
        await setGoogleUserInfo(
          response.authentication?.accessToken,
          firestore,
          storage,
          userDispatch
        );
        navigation.navigate("TabNavigator");
      }
    })();
  }, [response, token, firestore]);

  return (
    <KeyboardAvoidingView style={styles.containerView} behavior="padding">
      <View style={styles.screenContainer}>
        <Spinner
          visible={loading}
          textContent="logging in ..."
          animation="fade"
          textStyle={{ color: "white" }}
        />
        <View style={styles.formView}>
          <Text style={styles.logoText}>Parcube</Text>
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
          {incorrectLogin && <Text style={{ color: "red" }}>Incorrect email/password</Text>}
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
                onLogin(
                  setLoading,
                  auth,
                  firestore,
                  storage,
                  email,
                  password,
                  setIncorrectLogin,
                  userDispatch,
                  navigation
                )
              }>
              Login
            </Button>
            <Button
              mode="outlined"
              textColor="dodgerblue"
              labelStyle={{ color: "dodgerblue" }}
              style={{
                marginTop: 5,
                borderRadius: 5,
                borderColor: "dodgerblue",
              }}
              onPress={() => navigation.navigate("SignUpPage")}>
              Sign Up
            </Button>
            <View
              style={{
                marginTop: 20,
                marginBottom: 20,
                borderBottomColor: "grey",
                borderWidth: 1,
                borderRadius: 5,
              }}
            />
            <Button
              icon={({ size }) => (
                <Image
                  source={require("@assets/google-logo.png")}
                  style={{ width: size, height: size }}
                />
              )}
              mode="outlined"
              textColor="dodgerblue"
              labelStyle={{ color: "black" }}
              style={{
                borderRadius: 5,
              }}
              disabled={!request}
              onPress={() => promptGoogleLogin()}>
              Continue with Google
            </Button>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
