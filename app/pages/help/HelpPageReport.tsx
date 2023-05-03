import React, { useState } from "react";
import { TextInput, Text, View, StyleSheet, StatusBar, ScrollView, Pressable } from "react-native";

const HelpPageReport = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");

  return (
    <View style={styles.container}>
      <ScrollView>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.titleText}>Tell us about the issue.</Text>
        <View style={styles.lineStyle} />
        <TextInput
          onChangeText={(text) => setUsername(text)}
          style={styles.input}
          placeholder="Name"
          value={username}
        />
        <TextInput
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
          placeholder="Email"
          value={email}
        />
        <TextInput
          onChangeText={(text) => setFeedback(text)}
          style={[styles.input, { height: 150, textAlignVertical: "top" }]}
          multiline
          placeholder="Feedback"
          value={feedback}
        />
        <Pressable onPress={() => alert("Your report is sent")} style={styles.submitButton}>
          <Text style={styles.submitText}>SUBMIT</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  titleText: {
    margin: 10,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 35,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 2,
    borderRadius: 10,
    fontSize: 20,
    paddingHorizontal: 10,
  },
  lineStyle: { flex: 1, height: 1, backgroundColor: "black" },
  submitButton: {
    width: "94%",
    height: 50,
    backgroundColor: "black",
    borderRadius: 10,
    alignSelf: "center",
    justifyContent: "center",
    margin: 10,
  },

  submitText: {
    color: "white",
    fontSize: 25,
    textAlign: "center",
  },
});

export default HelpPageReport;
