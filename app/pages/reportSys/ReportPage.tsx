import React, { useState } from "react";
import styles from "./style";
import { Text, TextInput, View, ScrollView, Alert } from "react-native";
import { Button } from "react-native-paper";
import { useFirebaseApp } from "@contexts/FiresbaseAppContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import useFirestore from "@hooks/useFirestore";

import type { TRootRoutes } from "@customTypes/routes";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<TRootRoutes, "ReportPage">;

const ReportPage = ({ route }: Props) => {
  const { uid } = route.params;
  const firebaseApp = useFirebaseApp();
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const firestore = useFirestore(firebaseApp);

  const onReport = async () => {
    await firestore.create(
      "reports/",
      {
        reason,
        comments,
      },
      uid
    );
    return Alert.alert("Report Status", "You have successfully reported this parking space", [
      {
        text: "OK",
        onPress: () => navigation.navigate("RentalDisplay", { uid }),
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        contentContainerStyle={{ paddingHorizontal: 40 }}>
        <Text style={styles.headerText}>Report This Parking Space</Text>
        <Text style={styles.header2Text}>Reason for Reporting</Text>
        <TextInput
          style={styles.formTextInput}
          placeholder="Please enter the reason for reporting"
          placeholderTextColor="grey"
          multiline
          numberOfLines={4}
          onChangeText={setReason}
          value={reason}
        />
        <Text style={styles.header2Text}>Additional Comments</Text>
        <TextInput
          style={styles.formTextInput}
          placeholder="Please enter any additional comments"
          placeholderTextColor="grey"
          multiline
          numberOfLines={4}
          onChangeText={setComments}
          value={comments}
        />

        <Button
          mode="contained"
          style={{
            marginBottom: 30,
          }}
          textColor="white"
          buttonColor="dodgerblue"
          onPress={onReport}>
          Send Report
        </Button>
      </ScrollView>
    </View>
  );
};

export default ReportPage;
