import React from "react";
import { 
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform
} from "react-native";

const ScreenTitle = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.bar}></View>
    </View>
  );
}

export default ScreenTitle;

const styles = StyleSheet.create({
  container: {
    // flex: 0.176,
    flex: 1,
  },

  title: {
    fontSize: 40,
    paddingTop: Platform.OS === "android" ? 30 : 10,
    textAlign: "center",
  },

  bar: {
    marginTop: Platform.OS == "android" ? 14 : 18,
    width: Dimensions.get("screen").width,
    height: 5,
    backgroundColor: "black",
  },
});
