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
    marginTop: 90,
    marginBottom: 30,
    textAlign: "center",
  },
  headerText: {
    fontSize: 30,
    fontWeight: "800",
    marginTop: 50,
    marginBottom: 30,
    textAlign: "center",
  },
  formView: {
    flex: 1,
    justifyContent: "flex-start",
    width: 300,
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
  },
  loginButton: {
    backgroundColor: "#3897f1",
    borderRadius: 5,
    width: 350,
    alignItems: "center",
  },
  touchableButtonStyle: {
    backgroundColor: "dodgerblue",
    marginVertical: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  loginButtonStyle: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "transparent",
    borderColor: "dodgerblue",
    borderRadius: 5,
    borderWidth: 1,
  },
});

export default styles;
