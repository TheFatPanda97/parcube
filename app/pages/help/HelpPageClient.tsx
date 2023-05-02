import React from "react";
import { Text, View, SafeAreaView, StyleSheet, StatusBar, Image, ScrollView } from "react-native";

const HelpPageClient = () => {
  const example_img = require("@assets/ui_example.png");

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.innerContainer}>
        <ScrollView>
          <StatusBar barStyle="dark-content" />
          <Text style={[styles.allText, styles.titleText]}>How to Rent Parking</Text>
          <Text style={[styles.allText, styles.stepText]}>Step 1</Text>
          <Text style={styles.descriptionText}>
            Go to the rent tab and click on the button that says "Rent Parking"
          </Text>
          <Image source={example_img} style={styles.imgStyle} />
          <Text style={[styles.allText, styles.stepText]}>Step 2</Text>
          <Text style={styles.descriptionText}>Click the parking spot you want to rent</Text>
          <Image source={example_img} style={styles.imgStyle} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: "lightgrey",
  },

  innerContainer: {
    backgroundColor: "white",
  },

  allText: {
    fontSize: 20,
    marginHorizontal: 30,
  },

  stepText: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: "bold",
    backgroundColor: "lightgrey",
    borderRadius: 10,
    overflow: "hidden",
  },

  imgStyle: {
    width: 200,
    height: 400,
    alignContent: "center",
    justifyContent: "center",
    marginLeft: "24%",
    marginVertical: 10,
    borderWidth: 3,
    borderRadius: 20,
    overflow: "hidden",
  },

  titleText: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: "bold",
    marginVertical: 10,
  },

  stepCard: {
    backgroundColor: "#89cff0",
    borderRadius: 30,
    borderTopEndRadius: 30,
    margin: 10,
  },

  descriptionText: {
    fontSize: 20,
    marginHorizontal: 30,
    textAlign: "center",
  },

  stepTextContainer: {
    borderRadius: 30,
  },
});

export default HelpPageClient;
