import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  containerView: {
    flex: 1,
    alignItems: "center",
  },
  screenContainer: {
    flex: 1,
  },
  logoText: {
    fontSize: 40,
    fontWeight: "800",
    marginTop: 150,
    marginBottom: 30,
    textAlign: "center",
  },
  headerText: {
    fontSize: 30,
    fontWeight: "800",
    marginTop: 40,
    marginBottom: 10,
    textAlign: "center",
  },
  header2Text: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
    color: "grey",
  },
  formView: {
    flex: 1,
  },
  formTextInput: {
    height: 43,
    fontSize: 14,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#eaeaea",
    backgroundColor: "#fafafa",
    paddingLeft: 10,
    marginTop: 5,
    marginBottom: 5,
    color: "black",
  },
  numberTextInput: {
    height: 43,
    fontSize: 14,
    borderRadius: 5,
    width: 40,
    borderWidth: 2,
    borderColor: "#eaeaea",
    backgroundColor: "#fafafa",
    paddingLeft: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  loginButton: {
    backgroundColor: "#3897f1",
    borderRadius: 5,
    width: 350,
    alignItems: "center",
  },
  fixToTextBox: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  touchableButtonStyle: {
    backgroundColor: "dodgerblue",
    marginVertical: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
});

export default styles;
