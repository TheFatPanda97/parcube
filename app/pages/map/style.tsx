import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchBar: {
    alignSelf: "center",
    textAlign: "center",
    width: "98%",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "rgb(130,170,230)",
    height: 50,
    marginTop: 25,
    backgroundColor: "white",
  },
  filterButton: {
    alignSelf: "center",
    textAlign: "center",
    width: "50%",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "rgb(130,170,230)",
    marginTop: 5,
    backgroundColor: "white",
  },
  filter: {
    textAlign: "center",
    width: "95%",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "rgb(130,170,230)",
    height: 50,
    marginTop: 5,
    marginHorizontal: "2.5%",
  },
  filter2: {
    textAlign: "center",
    width: "95%",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "rgb(130,170,230)",
    height: 50,
    marginTop: 5,
    marginLeft: "1.5%",
  },
});

export default styles;
