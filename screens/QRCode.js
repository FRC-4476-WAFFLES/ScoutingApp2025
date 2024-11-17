import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar
} from "react-native";
import QRCode from "react-qr-code";
import * as MediaLibrary from 'expo-media-library';
import { captureScreen } from "react-native-view-shot";

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
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>QR Code</Text>
          <View style={{width: 32}} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View ref={ref} style={styles.qrcodeContainer}>
          <View style={styles.qrCodeWrapper}>
            <QRCode 
              value={csvData || ' '}
              size={300}
              style={styles.qrCode}
            />
          </View>
        </View>

        <View style={styles.dataContainer}>
          <Text style={styles.dataLabel}>Match Data:</Text>
          <Text style={styles.dataText}>
            {getDataFormatted(route.params.data)}
          </Text>
          <Text style={styles.csvText} numberOfLines={3} ellipsizeMode="tail">
            {csvData || ''}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => captureQR()}
        >
          <Text style={styles.buttonText}>Save QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => nextMatch()}
        >
          <Text style={styles.buttonText}>Next Match</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  function nextMatch() {
    navigation.navigate("Pregame", {
      matchNum: route.params.matchNum + 1,
    });
  }

  async function captureQR() {
    try {
      const result = await captureScreen({
        result: "tmpfile",
        quality: 1,
        format: "png",
      });
      await MediaLibrary.saveToLibraryAsync(result);
      alert('QR Code saved to photo gallery!');
    } catch (e) {
      console.log(e);
      alert('Failed to save QR Code. Please try again.');
    }
  }

  function getDataFormatted(data) {
    if (!data) return '';
    let arr = CSVtoArray(data);
    if (!arr) return '';
    let match = arr[1];
    return match ? `Match: ${match}` : '';
  }

  // Return array of string values, or NULL if CSV string not well formed.
  function CSVtoArray(text) {
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    if (!re_valid.test(text)) return null;
    var a = [];
    text.replace(re_value,
      function(m0, m1, m2, m3) {
        if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
        else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
        else if (m3 !== undefined) a.push(m3);
        return '';
      });
    if (/,\s*$/.test(text)) a.push('');
    return a;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff00d",
  },

  headerContainer: {
    backgroundColor: '#fff00d',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    height: Platform.OS === "android" ? 
      StatusBar.currentHeight + 50 : 
      60,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 15,
  },

  backButton: {
    backgroundColor: '#000000',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: 'bold',
    marginTop: -2,
  },

  title: {
    flex: 1,
    fontSize: 28,
    fontFamily: 'Cooper-Black',
    color: "#000000",
    textAlign: "center",
  },

  scrollView: {
    flex: 1,
    backgroundColor: '#fff00d',
  },

  scrollViewContent: {
    padding: 20,
    alignItems: 'center',
  },

  qrcodeContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    marginVertical: 20,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },

  qrCode: {
    padding: 10,
  },

  dataContainer: {
    backgroundColor: '#ffffff',
    width: '100%',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },

  dataLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  dataText: {
    fontSize: 16,
    marginBottom: 10,
  },

  csvText: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
  },

  actionButton: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  buttonText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },

  qrCodeWrapper: {
    backgroundColor: '#ffffff',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default QRCodeScreen;
