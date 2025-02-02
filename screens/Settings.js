import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Image,
  Platform,
  StatusBar,
  Button,
  Alert,
} from "react-native";
import * as FileSystem from "expo-file-system";


const SettingsScreen = props => {
  const { navigation, route } = props;

  const [codeText, setCodeText] = React.useState();
  const [nameText, setNameText] = React.useState();

  const [jsonText, setJsonText] = React.useState();
  const [isLoaded, setIsLoaded] = React.useState(false);

  const [matchScheduleExists, setMatchScheduleExists] = React.useState(false);
  const [showMatchSchedule, setShowMatchSchedule] = React.useState(false);
  
  const [matchScheduleString, setMatchScheduleString] = React.useState();
  const [showScheduleCheckmark, setShowScheduleCheckmark] = React.useState(false);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialValues, setInitialValues] = useState({
    nameText: undefined,
    driverstation: undefined,
  });

  const scheduleFileUri = `${
      FileSystem.documentDirectory
  }${"MatchSchedule.json"}`;
  const settingsFileUri = `${
      FileSystem.documentDirectory
  }${"ScoutingAppSettings.json"}`;
  const scheduleCsvUri = `${
      FileSystem.documentDirectory
  }${"MatchScheduleCsv.json"}`;

  const [driverstation, setDriverstation] = React.useState();
  const [showPicker, setShowPicker] = React.useState(false);

  const [orientation, setOrientation] = useState('portrait');
  const [isTablet, setIsTablet] = useState(false);

  const [loadedEventCode, setLoadedEventCode] = useState(null);

  useEffect(() => {
    const updateLayout = () => {
      const dim = Dimensions.get('screen');
      setOrientation(dim.width > dim.height ? 'landscape' : 'portrait');
      setIsTablet(Math.min(dim.width, dim.height) >= 600);
    };

    updateLayout();
    const subscription = Dimensions.addEventListener('change', updateLayout);

    return () => {
      subscription.remove();
    };
  }, []);

  React.useEffect(() => {
    const setSettingsVars = async () => {
        try {
            let settingsJSON = await JSON.parse(
                await FileSystem.readAsStringAsync(settingsFileUri)
            );
            const name = await settingsJSON["Settings"]["scoutName"];
            const station = await settingsJSON["Settings"]["driverStation"];
            setNameText(name);
            setDriverstation(station);
            setInitialValues({
              nameText: name,
              driverstation: station,
            });
        } catch (err) {
            console.log("No Settings File Saved.");
        }
    }

    const checkMatchScheduleExists = async () => {
        let tmp = await FileSystem.getInfoAsync(scheduleFileUri);
        console.log(`Match Schedule Exists: ${tmp.exists}`);
        setMatchScheduleExists(tmp.exists);
        
        if (tmp.exists) {
          try {
            const scheduleData = await FileSystem.readAsStringAsync(scheduleFileUri);
            const parsedData = JSON.parse(scheduleData);
            const eventCode = parsedData.eventCode || parsedData.Schedule?.[0]?.eventCode;
            setLoadedEventCode(eventCode);
          } catch (err) {
            console.log("Error reading event code:", err);
          }
        }
    }

    setSettingsVars();
    checkMatchScheduleExists();
  }, []);

  async function fetchScheduleJSON() {
    setShowMatchSchedule(!showMatchSchedule);
    let scheduleRead = await FileSystem.readAsStringAsync(scheduleFileUri);
    let scheduleJSON = await JSON.parse(scheduleRead);
    let scheduleString = JSON.stringify(scheduleJSON, null, "\t");
    setMatchScheduleString(scheduleString);
  }

  async function saveSettings() {
    let theJSON = `
      {
        "Settings": {
          "scoutName": "${nameText}",
          "driverStation": "${driverstation}"
        }
      }
    `;

    await FileSystem.writeAsStringAsync(settingsFileUri, theJSON);
    console.log(await FileSystem.readAsStringAsync(settingsFileUri));
  }

  async function downloadMatchSchedule() {
    if (!codeText) {
      alert('Please enter an event code');
      return;
    }

    try {
      setShowScheduleCheckmark(false);
      const data = await getMatchSchedule();
      
      if (!data) {
        alert('Failed to download match schedule. Please check the event code and try again.');
        return;
      }

      try {
        const parsedData = JSON.parse(data);
        parsedData.eventCode = codeText;
        const formattedJSON = JSON.stringify(parsedData, null, "\t");
        
        await FileSystem.writeAsStringAsync(scheduleFileUri, formattedJSON);
        setShowScheduleCheckmark(true);
        setLoadedEventCode(codeText);
        console.log('Match schedule saved successfully');
      } catch (e) {
        alert('Invalid data received from the server. Please try again.');
        console.error('JSON parsing error:', e);
      }
    } catch (error) {
      alert('Error downloading match schedule. Please check your connection and try again.');
      console.error('Download error:', error);
    }
  }

  async function getMatchSchedule() {
    try {
      if (!codeText || codeText.length < 8) {
        throw new Error('Invalid event code format. Expected format: YYYYevent (e.g., 2024onwat)');
      }

      const year = codeText.substring(0, 4);
      const eventCode = codeText.substring(4);

      var base64 = require("base-64");
      var username = "faiazumaer";
      var password = "5fecfbc3-09ce-45a0-bad2-769fd4006781";

      var requestOptions = {
        method: "GET",
        headers: {
          Authorization: "Basic " + base64.encode(username + ":" + password),
          "If-Modified-Since": "",
        },
        redirect: "follow",
      };

      const response = await fetch(
        `https://frc-api.firstinspires.org/v3.0/${year}/schedule/${eventCode}?tournamentLevel=qual`,
        requestOptions
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      setJsonText(data);
      return data;
    } catch (error) {
      console.error('Error in getMatchSchedule:', error);
      return null;
    }
  }

  const handleNameChange = (text) => {
    setNameText(text);
    setHasUnsavedChanges(
      text !== initialValues.nameText || 
      driverstation !== initialValues.driverstation
    );
  };

  const handleDriverstationChange = (station) => {
    setDriverstation(station);
    setShowPicker(false);
    setHasUnsavedChanges(
      nameText !== initialValues.nameText || 
      station !== initialValues.driverstation
    );
  };

  const handleBackPress = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          {
            text: "Stay",
            style: "cancel"
          },
          {
            text: "Discard Changes",
            style: "destructive",
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Import Match Schedule Section - Combined */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Import Match Schedule</Text>
          <Text style={styles.warning}>DO NOT TOUCH IF AT EVENT</Text>
          
          {loadedEventCode && (
            <View style={styles.eventCodeDisplay}>
              <Text style={styles.eventCodeLabel}>Current Event:</Text>
              <Text style={styles.eventCodeText}>{loadedEventCode}</Text>
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              onChangeText={setCodeText}
              value={codeText}
              placeholder="Enter Event Code (e.g., 2024onwat)"
              placeholderTextColor="rgba(255, 215, 0, 0.5)"
            />
            {showScheduleCheckmark && (
              <Image 
                style={styles.checkmark} 
                source={require('../assets/images/checkmark-icon.png')}
              />
            )}
          </View>
          
          <Text style={styles.helperText}>
            Format: YYYYeventcode (e.g., 2024onwat)
          </Text>
          
          <TouchableOpacity
            style={styles.importButton}
            onPress={downloadMatchSchedule}
          >
            <Text style={styles.buttonText}>Import Using Event Code</Text>
          </TouchableOpacity>
        </View>

        {/* Scout Name Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scout Name</Text>
          <Text style={styles.warning}>*MUST SET</Text>
          <TextInput
            style={styles.input}
            onChangeText={handleNameChange}
            value={nameText == "undefined" ? undefined : nameText}
            placeholder="Scout Name"
            placeholderTextColor="rgba(255, 215, 0, 0.5)"
          />
        </View>

        {/* Driver Station Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Station</Text>
          <Text style={styles.warning}>*MUST SET</Text>
          <TouchableOpacity 
            style={styles.stationButton}
            onPress={() => setShowPicker(!showPicker)}
          >
            <Text style={styles.stationText}>
              {driverstation ? driverstation : 'Select Driver Station...'}
            </Text>
          </TouchableOpacity>

          {showPicker && (
            <View style={styles.stationPicker}>
              <View style={styles.redStations}>
                {['R1', 'R2', 'R3'].map(station => (
                  <TouchableOpacity 
                    key={station}
                    style={styles.stationOption}
                    onPress={() => handleDriverstationChange(station)}
                  >
                    <Text style={styles.stationOptionText}>{station}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.blueStations}>
                {['B1', 'B2', 'B3'].map(station => (
                  <TouchableOpacity 
                    key={station}
                    style={styles.stationOption}
                    onPress={() => handleDriverstationChange(station)}
                  >
                    <Text style={styles.stationOptionText}>{station}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={async () => {
            await saveSettings();
            setHasUnsavedChanges(false);
            setInitialValues({
              nameText,
              driverstation,
            });
            navigation.navigate("Home");
          }}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
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
      StatusBar.currentHeight + 70 : 
      80,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 25,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff00d',
    paddingTop: 20,
  },

  scrollViewContent: {
    paddingBottom: 20,
  },

  title: {
    flex: 1,
    fontSize: 28,
    fontFamily: 'Cooper-Black',
    color: "#000000",
    textAlign: "center",
    marginRight: 32,
  },

  backButton: {
    backgroundColor: '#000000',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  backButtonText: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: '900',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    marginTop: Platform.OS === 'ios' ? -2 : 0,
  },

  section: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },

  warning: {
    fontSize: 14,
    color: '#FF0000',
    fontWeight: 'bold',
    marginBottom: 10,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    color: '#FFD700',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 10,
    placeholderTextColor: 'rgba(255, 215, 0, 0.5)',
  },

  checkmark: {
    width: 24,
    height: 24,
    marginLeft: 10,
  },

  importButton: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
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
    fontSize: 16,
    fontWeight: 'bold',
  },

  stationButton: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  stationText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },

  stationPicker: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  redStations: {
    backgroundColor: 'rgba(255, 0, 0, 0.4)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },

  blueStations: {
    backgroundColor: 'rgba(0, 0, 255, 0.4)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },

  stationOption: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },

  stationOptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },

  saveButton: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  saveButtonText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },

  permissionText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 32,
  },

  permissionButton: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },

  permissionButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },

  orText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
    marginVertical: 16,
  },

  eventCodeDisplay: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  eventCodeLabel: {
    fontSize: 16,
    color: '#666666',
    marginRight: 8,
  },

  eventCodeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },

  helperText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default SettingsScreen;