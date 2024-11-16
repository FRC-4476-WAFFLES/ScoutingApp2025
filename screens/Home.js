import React, { useState, useEffect } from "react";
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
import * as Font from 'expo-font';

import { ScreenHeight, ScreenWidth } from "../components/shared";

const HomeScreen = props => {
  const { navigation, route } = props;
  const [orientation, setOrientation] = useState('portrait');
  const [isTablet, setIsTablet] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Cooper-Black': require('../assets/fonts/CooperBlackRegular.ttf'),
      });
      setFontsLoaded(true);
    }

    loadFonts();
    const updateLayout = () => {
      const dim = Dimensions.get('screen');
      setOrientation(dim.width > dim.height ? 'landscape' : 'portrait');
      // Check if device is tablet based on screen size
      setIsTablet(Math.min(dim.width, dim.height) >= 600);
    };

    updateLayout();
    const subscription = Dimensions.addEventListener('change', updateLayout);

    return () => {
      subscription.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return null; // Or a loading indicator
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.backdrop}
        source={require("../assets/images/HomeScreen/backdrop.png")}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.titleContainer}>
            <Text style={[
              styles.title,
              orientation === 'landscape' && !isTablet && styles.titleLandscape
            ]}>W.A.F.F.L.E.S.</Text>
            <Text style={[
              styles.subtitle,
              orientation === 'landscape' && !isTablet && styles.subtitleLandscape
            ]}>Scouting</Text>
          </View>

          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                orientation === 'landscape' && !isTablet && styles.buttonLandscape
              ]}
              onPress={() => navigation.navigate("Pregame", {})}
            >
              <Text style={styles.buttonText}>Start Scouting</Text>
            </TouchableOpacity>

            <View style={styles.rowIcons}>
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
          </View>
        </View>
      </ImageBackground>
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
      flex: 1,
    },

    overlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 20,
    },

    titleContainer: {
      alignItems: 'center',
      marginTop: 40,
    },
  
    title: {
      fontSize: 48,
      fontFamily: 'Cooper-Black',
      color: "#000000",
      textAlign: "center",
    },

    titleLandscape: {
      fontSize: 36,
      marginTop: 0,
    },

    subtitle: {
      fontSize: 24,
      fontFamily: 'Cooper-Black',
      color: "#000000",
      textAlign: "center",
      marginTop: 8,
    },

    subtitleLandscape: {
      fontSize: 20,
    },
  
    button: {
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 32,
      backgroundColor: "#000000",
      width: ScreenWidth * 0.85,
      marginBottom: 20,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },

    buttonLandscape: {
      width: ScreenHeight * 0.4,
    },
  
    buttonText: {
      color: "#FFD700",
      fontWeight: "600",
      fontSize: 18,
      textAlign: "center",
    },
  
    rowIcons: {
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

    bottomContainer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 20,
    },
});