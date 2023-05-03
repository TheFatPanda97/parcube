import type { THelpRoutes } from "@customTypes/routes";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Text, SafeAreaView, StyleSheet, Pressable, StatusBar, Image } from "react-native";

// Navigation imports
type Props = NativeStackScreenProps<THelpRoutes>;

const HelpPageMenu = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.titleText}>How can we help?</Text>
      <Pressable
        onPress={() => navigation.navigate("HelpPageClient")}
        style={styles.buttonContainer}>
        <Image source={require("@assets/car.png")} style={styles.buttonIcon} />
        <Text style={styles.buttonText} numberOfLines={1}>
          Parkers
        </Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate("HelpPageHost")} style={styles.buttonContainer}>
        <Image source={require("@assets/park.png")} style={styles.houseIcon} />
        <Text style={styles.buttonText} numberOfLines={1}>
          Hosting
        </Text>
      </Pressable>
      <Pressable
        onPress={() => navigation.navigate("HelpPageReport")}
        style={styles.buttonContainer}>
        <Image source={require("@assets/warning.png")} style={styles.reportIcon} />
        <Text style={styles.reportText} numberOfLines={1}>
          Report
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },

  statusBar: {
    backgroundColor: "cornflowerblue",
  },

  buttonContainer: {
    width: "70%",
    flex: 0.15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderWidth: 3,
    borderRadius: 10,
    margin: 5,
  },

  buttonIcon: {
    width: 100,
    height: 60,
    resizeMode: "contain",
    //center the image
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  reportText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginRight: 15,
  },

  buttonText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },

  titleText: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "bold",
    margin: 10,
    marginTop: 0,
    paddingTop: 0,
  },

  houseIcon: {
    width: 100,
    height: 90,
    resizeMode: "contain",
    //center the image
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  reportIcon: {
    width: 100,
    height: 100,
    resizeMode: "stretch",
    //center the image
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },
});

export default HelpPageMenu;
