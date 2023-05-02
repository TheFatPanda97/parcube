import { createContext, useContext } from "react";
import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import Constants from "expo-constants";

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.apiKey,
  authDomain: Constants.expoConfig?.extra?.authDomain,
  projectId: Constants.expoConfig?.extra?.projectId,
  storageBucket: Constants.expoConfig?.extra?.storageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.messagingSenderId,
  appId: Constants.expoConfig?.extra?.appId,
};

// Initialize Firebase
const initialFirebaseAppState = initializeApp(firebaseConfig);

const FirebaseAppContext = createContext<FirebaseApp>(initialFirebaseAppState);

interface IProps {
  children: JSX.Element;
}

const FirebaseAppProvider = ({ children }: IProps) => (
  <FirebaseAppContext.Provider value={initialFirebaseAppState}>
    {children}
  </FirebaseAppContext.Provider>
);

const useFirebaseApp = () => {
  return useContext(FirebaseAppContext);
};

export { FirebaseAppProvider, useFirebaseApp };
