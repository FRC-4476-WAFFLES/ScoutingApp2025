import React from "react";
import {
    Text,
    SafeAreaView,
    ImageBackground,
    Image,
    TouchableOpacity,
    View,
    StyleSheet,
    Dimensions,
    StatusBar,
    Platform,
} from "react-native";

import { ScreenHeight, ScreenWidth } from "../components/shared";

const HomeScreen = props => {
  const { navigation, route } = props;

  const [toNavigate, setToNavigate] = React.useState("Pregame");

  return (
    <SafeAreaView style={styles.container}>
      {/* Background and title */}
      <ImageBackground
        style={styles.backdrop}
        resizeMode="cover"
        source={require("../assets/images/HomeScreen/backdrop.png")}
      >
        <Text style={styles.title}>W.A.F.F.L.E.S Scouting</Text>
      </ImageBackground>

      {/* LESS GO button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("Pregame", {})
        }
      >
        <View>
          <Text style={styles.buttonText}>
            <View>
              <Image
                style={styles.buttonImage}
                source={require("../assets/images/HomeScreen/paper-mario.png")}
              />
            </View>
            LES GOOOO!
            <View>
              <Image
                style={styles.buttonImageDababy}
                source={require("../assets/images/HomeScreen/dababy.png")}
              />
            </View>
          </Text>
        </View>
      </TouchableOpacity>

      {/* Bottom Row Icons */}
      <View style={styles.rowIcons}>
        {/* Settings Icon */}
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Image
            source={require("../assets/images/HomeScreen/settings-icon.png")}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "orange",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
  
    backdrop: {
      flex: 1,
      width: ScreenWidth,
      height: ScreenHeight,
    },
  
    title: {
      fontSize: 50,
      color: "white",
      textAlign: "center",
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 30,
    },
  
    button: {
      // marginTop: 20,
      borderRadius: 100,
      padding: 10,
      backgroundColor: "white",
      width: ScreenWidth * 0.8,
      bottom: ScreenHeight * 0.1,
    },
  
    buttonText: {
      color: "black",
      fontWeight: "bold",
      textTransform: "uppercase",
      fontSize: 20,
      textAlign: "center",
    },
  
    buttonImage: {
      width: 30,
      height: 30,
      alignContent: "flex-start",
      marginRight: ScreenWidth * 0.05,
    },
  
    buttonImageDababy: {
      width: 30,
      height: 30,
      alignContent: "flex-end",
      marginLeft: ScreenWidth * 0.05,
    },
  
    rowIcons: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      bottom: ScreenWidth * 0.05,
      width: "100%",
    },
});