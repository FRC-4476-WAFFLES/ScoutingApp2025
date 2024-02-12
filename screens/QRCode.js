import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions
} from "react-native";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import ViewShot, { captureScreen, captureRef } from "react-native-view-shot";

import QRCode from "react-qr-code";

import * as MediaLibrary from 'expo-media-library';

import ScreenTitle from "../components/ScreenTitle";


const QRCodeScreen = props => {
  const { navigation, route } = props;
  const csvData = route.params.data;

  const ref = React.useRef(null);

  React.useEffect(() => {
      const getPermissions = async () => {
          const permission = await MediaLibrary.requestPermissionsAsync()
          if (!permission) {
              // Do something
          }
      }
  
      getPermissions();

      
  })

  return (
      <SafeAreaView>
          <ScrollView>
              <ScreenTitle title={"QR Code"} />

              <View ref={ref} style={styles.qrcodeContainer}>
                  <QRCode value={csvData} size={400} />
              </View>

              <View style={styles.displayText}>
                  <Text style={styles.text}>
                  CSV: {csvData}
                  </Text>
                  <Text style={styles.text}>
                  {getDataFormatted(route.params.data)}
                  </Text>
              </View>

              <TouchableOpacity onPress={() => captureQR()} style={styles.button}>
                  <Text style={styles.buttonText}>Save Image</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { nextMatch() } } >
                  <Text style={styles.buttonText}>Next Match</Text>
              </TouchableOpacity>
          </ScrollView>
      </SafeAreaView>
  );

  function nextMatch() {
      navigation.navigate("Pregame", {
        matchNum: route.params.matchNum + 1,
      })
  }

  async function captureQR() {
      try {
        const result = await captureScreen({
          result: "tmpfile",
          quality: 1,
          format: "png",
        });
        // const result = await captureRef(ref, {
        //     result: "tmpfile",
        //     quality: 1,
        //     format: "png",            
        // })
        await MediaLibrary.saveToLibraryAsync(result);
      } catch (e) {
        console.log(e);
      }
  }
  
  function getDataFormatted(data) {
      let arr = CSVtoArray(data);
  
      if (arr == null) return;
      let match = arr[1];
      return `Match: ${match}`;
  }
  
  // BY ridgerunner OF STACK OVREFLOW
  // Return array of string values, or NULL if CSV string not well formed.
  function CSVtoArray(text) {
      var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
      var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
      // Return NULL if input string is not well formed CSV string.
      if (!re_valid.test(text)) return null;
      var a = [];                     // Initialize array to receive values.
      text.replace(re_value, // "Walk" the string using replace with callback.
          function(m0, m1, m2, m3) {
              // Remove backslash from \' in single quoted values.
              if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
              // Remove backslash from \" in double quoted values.
              else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
              else if (m3 !== undefined) a.push(m3);
              return ''; // Return empty string.
          });
      // Handle special case of empty last value.
      if (/,\s*$/.test(text)) a.push('');
      return a;
  };
}

export default QRCodeScreen;

const styles = StyleSheet.create({
  qrcodeContainer: {
    marginTop: "10%",
    marginBottom: "10%",
    alignItems: 'center'
  },

  text: {
    fontSize: 40,
    marginTop: 40
  },

  displayText: {

  },

  button: {
    justifyContent: "center",
    marginTop: 75
  },

  buttonText: {
    fontSize: RFPercentage(3),
    width: "50%",
    backgroundColor: "#FFD27A",
    borderRadius: 100,
    padding: "2%",
    left: "25%",
    justifyContent: "center",
    textAlign: "center",
    marginBottom: "5%",
  }
});
