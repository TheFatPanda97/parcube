import { Text, TouchableHighlight, ScrollView, View, ViewStyle } from "react-native";
import { getPlacePredication } from "@utils/MapUtils";
import { useState } from "react";
import { TextInput } from "react-native-paper";

interface IProps {
  address: string;
  setAddress: (text: string) => void;
  sessionToken: string;
  showFullAddressOnPredicationPress?: boolean;
  onPredicationPress: (predication: {
    display: string;
    value: {
      address: string;
      city: string;
      country: string;
    };
  }) => void;
  style?: ViewStyle;
  predicationContainerStyle?: ViewStyle;
}

const GooglePlacesAutocomplete = ({
  address,
  setAddress,
  sessionToken,
  onPredicationPress,
  showFullAddressOnPredicationPress,
  style,
  predicationContainerStyle,
}: IProps) => {
  const [addressPredication, setAddressPredication] = useState<
    {
      display: string;
      value: {
        address: string;
        city: string;
        country: string;
      };
    }[]
  >([]);

  return (
    <>
      <View style={{ flex: 1, ...style }}>
        <TextInput
          placeholder="Type in an address"
          style={{
            height: 43,
            fontSize: 14,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: "#eaeaea",
            backgroundColor: "#fafafa",
          }}
          underlineColor="transparent"
          activeUnderlineColor="dodgerblue"
          onChangeText={async (text) => {
            setAddress(text);
            if (text === "") {
              setAddressPredication([]);
            } else {
              const predictions = await getPlacePredication(text, sessionToken);
              if (predictions.data) {
                setAddressPredication(
                  predictions.data.predictions
                    .filter(({ terms }) => terms.length >= 5)
                    .map((predication) => {
                      return {
                        display: predication.description,
                        value: {
                          address: predication["structured_formatting"]["main_text"],
                          city: predication.terms[2].value,
                          country: "Canada",
                        },
                      };
                    })
                );
              }
            }
          }}
          value={address}
          right={
            <TextInput.Icon
              onPress={() => {
                setAddress("");
                setAddressPredication([]);
              }}
              icon="window-close"
            />
          }
        />
      </View>
      {addressPredication.length >= 1 && (
        <View
          style={{
            flex: 1,
            maxHeight: 150,
            borderColor: "lightgrey",
            borderWidth: 1,
            borderRadius: 5,
            backgroundColor: "#fafafa",
            ...predicationContainerStyle,
          }}>
          <ScrollView nestedScrollEnabled>
            {addressPredication.map(({ display, value }) => (
              <TouchableHighlight
                style={{
                  paddingVertical: 7,
                  paddingHorizontal: 3,
                  borderRadius: 5,
                }}
                underlayColor="lightgrey"
                key={display}
                onPress={() => {
                  if (showFullAddressOnPredicationPress) {
                    setAddress(display);
                  } else {
                    setAddress(value.address);
                  }
                  setAddressPredication([]);
                  onPredicationPress({ display, value });
                }}>
                <Text>{display}</Text>
              </TouchableHighlight>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );
};

export default GooglePlacesAutocomplete;
