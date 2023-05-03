import type { THelpRoutes } from "@customTypes/routes";
import HelpPageClient from "@pages/help/HelpPageClient";
import HelpPageHost from "@pages/help/HelpPageHost";
import HelpPageMenu from "@pages/help/HelpPageMenu";
import HelpPageReport from "@pages/help/HelpPageReport";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator<THelpRoutes>();

const HelpPageNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HelpPageMenu"
        component={HelpPageMenu}
        options={{
          title: "Help!",
          headerStyle: {
            backgroundColor: "#458ff7",
          },
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HelpPageClient"
        component={HelpPageClient}
        options={{
          title: "Help Client",
          headerStyle: {
            backgroundColor: "#458ff7",
          },
        }}
      />
      <Stack.Screen
        name="HelpPageHost"
        component={HelpPageHost}
        options={{
          title: "Help Host",
          headerStyle: {
            backgroundColor: "#458ff7",
          },
        }}
      />
      <Stack.Screen
        name="HelpPageReport"
        component={HelpPageReport}
        options={{
          title: "Report Issue",
          headerStyle: {
            backgroundColor: "#458ff7",
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default HelpPageNavigator;
