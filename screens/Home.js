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

  return (
    <SafeAreaView style={styles.container}>
      {/* Background and title */}
      <ImageBackground
        style={styles.backdrop}
        resizeMode="cover"
        source={require("../assets/images/HomeScreen/backdrop.png")}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>W.A.F.F.L.E.S</Text>
          <Text style={styles.subtitle}>Scouting</Text>
        </View>
      </ImageBackground>

      {/* Main action button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Pregame", {})}
      >
        <Text style={styles.buttonText}>Start Scouting</Text>
      </TouchableOpacity>

      {/* Bottom Row Icons */}
      <View style={styles.rowIcons}>
        {/* Settings Icon */}
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate("Settings")}
        >
          <Image
            style={styles.settingsIcon}
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
      backgroundColor: "#1a1a1a",
    },
  
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: ScreenWidth,
      height: ScreenHeight,
    },

    overlay: {
      flex: 1,
      alignItems: 'center',
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 40 : 60,
    },
  
    title: {
      fontSize: 48,
      fontWeight: 'bold',
      color: "#000000",
      textAlign: "center",
    },

    subtitle: {
      fontSize: 24,
      color: "#000000",
      textAlign: "center",
      marginTop: 8,
      fontWeight: '600',
    },
  
    button: {
      position: 'absolute',
      bottom: 100,
      alignSelf: 'center',
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 32,
      backgroundColor: "#000000",
      width: ScreenWidth * 0.85,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
  
    buttonText: {
      color: "#FFD700",
      fontWeight: "600",
      fontSize: 18,
      textAlign: "center",
    },
  
    rowIcons: {
      position: 'absolute',
      bottom: 20,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },

    settingsButton: {
      padding: 12,
      backgroundColor: '#000000',
      borderRadius: 12,
    },

    settingsIcon: {
      width: 24,
      height: 24,
      tintColor: '#FFD700',
    },
});