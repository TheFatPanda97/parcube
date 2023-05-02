// Navigation imports
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FirebaseAppProvider } from "@contexts/FiresbaseAppContext";
import { UserProvider } from "@contexts/UserContext";
import { SpotInfoProvider } from "@contexts/MarkerContext";
import { UserLocationProvider } from "@contexts/UserLocationContext";

// Home screen component
import ReportPage from "./pages/reportSys/ReportPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import RentalDisplay from "./pages/rental/RentalDisplayPage";
import TabNavigator from "./TabNavigator";
import AllRentalPage from "./pages/rental/AllRentalPage";

import type { TRootRoutes } from "./customTypes/routes";

import "react-native-get-random-values";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

// Linking import
import * as Linking from "expo-linking";

const Stack = createNativeStackNavigator<TRootRoutes>();

const config = {
  screens: {
    SignUpPage: "signup",
    RentalDisplay: "rent",
  },
};

const linking = {
  prefixes: ["expo://parcube/"],
  config,
};

const App = () => {
  return (
    <PaperProvider>
      <FirebaseAppProvider>
        <UserProvider>
          <SpotInfoProvider>
            <UserLocationProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <NavigationContainer
                  // @ts-ignore
                  theme={{ colors: { secondaryContainer: "transparent" } }}
                  linking={linking}>
                  <Stack.Navigator>
                    <Stack.Screen
                      name="LoginPage"
                      component={LoginPage}
                      options={{ title: "Login Page", headerShown: false }}
                    />
                    <Stack.Screen
                      name="SignUpPage"
                      component={SignUpPage}
                      options={{ title: "Signup Page", headerShown: false }}
                    />
                    <Stack.Screen
                      name="TabNavigator"
                      component={TabNavigator}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="ReportPage"
                      component={ReportPage}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="RentalDisplay"
                      component={RentalDisplay}
                      options={{
                        headerStyle: {
                          backgroundColor: "dodgerblue",
                        },
                        headerTintColor: "white",
                      }}
                    />
                    <Stack.Screen
                      name="AllRentalPage"
                      component={AllRentalPage}
                      options={{
                        headerStyle: {
                          backgroundColor: "dodgerblue",
                        },
                        headerTintColor: "white",
                      }}
                    />
                  </Stack.Navigator>
                </NavigationContainer>
              </GestureHandlerRootView>
            </UserLocationProvider>
          </SpotInfoProvider>
        </UserProvider>
      </FirebaseAppProvider>
    </PaperProvider>
  );
};

export default App;
