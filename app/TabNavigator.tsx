// Navigation imports
import { MaterialCommunityIcons } from "@expo/vector-icons";
import HelpPageNavigator from "@pages/help/HelpPageNavigator";
import RentalPage from "@pages/rental/RentalMutatePage";
import BookingPage from "@pages/rental/BookingPage";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";

// Home screen component
import type { TRootRoutes } from "./customTypes/routes";
import Home from "@pages/map/MapPage";
import ProfilePage from "@pages/profile/ProfilePage";

const Tab = createMaterialBottomTabNavigator<TRootRoutes>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      activeColor="#f0edf6"
      inactiveColor="#C1C1C1"
      barStyle={{ backgroundColor: "#458ff7" }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" color={color} size={26} />,
        }}
      />
      <Tab.Screen
        name="RentalPage"
        component={RentalPage}
        options={{
          tabBarLabel: "Rental Page",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-cash" color={color} size={26} />
          ),
          tabBarColor: "red",
        }}
      />
      <Tab.Screen
        name="BookedByMe"
        component={BookingPage}
        options={{
          tabBarLabel: "My Bookings",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="car-brake-parking" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="HelpPageNavigator"
        component={HelpPageNavigator}
        options={{
          tabBarLabel: "Help",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="help" color={color} size={26} />,
        }}
      />
      <Tab.Screen
        name="ProfilePage"
        component={ProfilePage}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
