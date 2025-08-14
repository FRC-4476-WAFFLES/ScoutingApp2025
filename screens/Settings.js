import { useState, useEffect } from "react";
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system";

const SettingsScreen = (props) => {
  const { navigation } = props;

  const [codeText, setCodeText] = useState();
  const [nameText, setNameText] = useState();
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  const [showScheduleCheckmark, setShowScheduleCheckmark] = useState(false);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialValues, setInitialValues] = useState({
    nameText: undefined,
    driverstation: undefined,
    isPracticeMode: false,
  });

  const scheduleFileUri = `${
    FileSystem.documentDirectory
  }${"MatchSchedule.json"}`;
  const settingsFileUri = `${
    FileSystem.documentDirectory
  }${"ScoutingAppSettings.json"}`;

  const [driverstation, setDriverstation] = useState();
  const [showPicker, setShowPicker] = useState(false);

  const [loadedEventCode, setLoadedEventCode] = useState(null);

  // Set settings and match schedule on mount
  useEffect(() => {
    // Read from settings file and set initial settings variables
    const setSettingsVars = async () => {
      try {
        let settingsJSON = await JSON.parse(
          await FileSystem.readAsStringAsync(settingsFileUri)
        );
        const name = await settingsJSON["Settings"]["scoutName"];
        const station = await settingsJSON["Settings"]["driverStation"];
        const practiceMode = await settingsJSON["Settings"]["isPracticeMode"];
        setNameText(name);
        setDriverstation(station);
        setIsPracticeMode(practiceMode);
        setInitialValues({
          nameText: name,
          driverstation: station,
          practiceMode: practiceMode,
        });
      } catch (err) {
        console.log("No Settings File Saved.");
      }
    };

    // Read from match schedule file and set event code
    const checkMatchScheduleExists = async () => {
      let tmp = await FileSystem.getInfoAsync(scheduleFileUri);
      console.log(`Match Schedule Exists: ${tmp.exists}`);

      if (tmp.exists) {
        try {
          const scheduleData = await FileSystem.readAsStringAsync(
            scheduleFileUri
          );
          const parsedData = JSON.parse(scheduleData);
          const eventCode =
            parsedData.eventCode || parsedData.Schedule?.[0]?.eventCode;
          setLoadedEventCode(eventCode);
        } catch (err) {
          console.log("Error reading event code:", err);
        }
      }
    };

    setSettingsVars();
    checkMatchScheduleExists();
  }, []);

  // Save settings to file
  async function saveSettings() {
    let theJSON = `
      {
        "Settings": {
          "scoutName": "${nameText}",
          "driverStation": "${driverstation}",
          "isPracticeMode": ${isPracticeMode}
        }
      }
    `;

    await FileSystem.writeAsStringAsync(settingsFileUri, theJSON);
    console.log(await FileSystem.readAsStringAsync(settingsFileUri));
  }

  // Save match schedule to file
  async function downloadMatchSchedule() {
    if (!codeText) {
      alert("Please enter an event code.");
      return;
    }

    try {
      setShowScheduleCheckmark(false);
      const data = await getMatchSchedule();

      if (!data) {
        alert(
          "Failed to download match schedule. Please check the event code and try again."
        );
        return;
      }

      try {
        const parsedData = JSON.parse(data);
        parsedData.eventCode = codeText;
        const formattedJSON = JSON.stringify(parsedData, null, "\t");

        await FileSystem.writeAsStringAsync(scheduleFileUri, formattedJSON);
        setShowScheduleCheckmark(true);
        setLoadedEventCode(codeText);
        console.log("Match schedule saved successfully");
      } catch (e) {
        alert("Invalid data received from the server. Please try again.");
        console.error("JSON parsing error:", e);
      }
    } catch (error) {
      alert(
        "Error downloading match schedule. Please check your connection and try again."
      );
      console.error("Download error:", error);
    }
  }

  // Get match schedule from FIRST API
  async function getMatchSchedule() {
    try {
      if (!codeText || codeText.length < 8) {
        throw new Error(
          "Invalid event code format. Expected format: YYYYevent (e.g., 2024onwat)"
        );
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
      return data;
    } catch (error) {
      console.error("Error in getMatchSchedule:", error);
      return null;
    }
  }

  // Update scout name
  const handleNameChange = (text) => {
    setNameText(text);
    setHasUnsavedChanges(
      text !== initialValues.nameText ||
        driverstation !== initialValues.driverstation ||
        isPracticeMode !== initialValues.isPracticeMode
    );
  };

  // Update driver station
  const handleDriverstationChange = (station) => {
    setDriverstation(station);
    setShowPicker(false);
    setHasUnsavedChanges(
      nameText !== initialValues.nameText ||
        station !== initialValues.driverstation ||
        isPracticeMode !== initialValues.isPracticeMode
    );
  };

  // Update if app is in practice mode
  const handlePracticeModeChange = (value) => {
    setIsPracticeMode((prev) => !prev);
    setHasUnsavedChanges(
      nameText !== initialValues.nameText ||
        driverstation !== initialValues.driverstation ||
        value !== initialValues.isPracticeMode
    );
  };

  // Show alert if there are unsaved changes when user presses back button
  const handleBackPress = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          {
            text: "Stay",
            style: "cancel",
          },
          {
            text: "Discard Changes",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // Clear match data from filesystem
  const clearAllMatchData = async () => {
    try {
      // Get all files in the document directory
      const files = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory
      );

      // Filter for match CSV files
      const matchFiles = files.filter(
        (file) => file.startsWith("match") && file.endsWith(".csv")
      );

      // Delete each match file
      for (const file of matchFiles) {
        await FileSystem.deleteAsync(`${FileSystem.documentDirectory}${file}`);
      }

      Alert.alert("Success", `Cleared data for ${matchFiles.length} matches`, [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Error clearing match data:", error);
      Alert.alert("Error", "Failed to clear match data", [{ text: "OK" }]);
    }
  };

  // Show alert before clearing match data
  const confirmClearData = () => {
    Alert.alert(
      "Clear All Match Data",
      "Are you sure you want to delete all saved match data? This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          onPress: clearAllMatchData,
          style: "destructive",
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
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
        {/* Import Match Schedule Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Import Match Schedule</Text>
          <Text style={styles.warning}>DO NOT TOUCH IF AT EVENT</Text>

          {loadedEventCode && (
            <View style={styles.eventCodeDisplay}>
              <Text style={styles.eventCodeLabel}>Current Event:</Text>
              <Text style={[styles.smallerButtonText, styles.blackText]}>
                {loadedEventCode}
              </Text>
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
                source={require("../assets/images/checkmark-icon.png")}
              />
            )}
          </View>

          <Text style={styles.helperText}>
            Format: YYYYeventcode (e.g., 2024onwat)
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={downloadMatchSchedule}
          >
            <Text style={[styles.smallerButtonText, styles.yellowText]}>
              Import Using Event Code
            </Text>
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
            style={styles.button}
            onPress={() => setShowPicker(!showPicker)}
          >
            <Text style={[styles.smallerButtonText, styles.yellowText]}>
              {driverstation ? driverstation : "Select Driver Station..."}
            </Text>
          </TouchableOpacity>

          {showPicker && (
            <View style={styles.stationPicker}>
              <View style={[styles.stations, styles.redStations]}>
                {["R1", "R2", "R3"].map((station) => (
                  <TouchableOpacity
                    key={station}
                    style={styles.stationOption}
                    onPress={() => handleDriverstationChange(station)}
                  >
                    <Text style={[styles.biggerButtonText, styles.blackText]}>
                      {station}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={[styles.stations, styles.blueStations]}>
                {["B1", "B2", "B3"].map((station) => (
                  <TouchableOpacity
                    key={station}
                    style={styles.stationOption}
                    onPress={() => handleDriverstationChange(station)}
                  >
                    <Text style={[styles.biggerButtonText, styles.blackText]}>
                      {station}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Practice Mode Section */}
        <View style={styles.section}>
          <View style={styles.sectionFlexRow}>
            <Text style={styles.sectionTitle}>Practice Mode</Text>
            <Switch
              trackColor={{ false: "#666666", true: "#000000" }}
              thumbColor={isPracticeMode ? "#FFD700" : "#F6F6F6"}
              onValueChange={handlePracticeModeChange}
              value={isPracticeMode}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
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
          <Text style={[styles.biggerButtonText, styles.yellowText]}>
            Save Settings
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Clear Match Data Section */}
      <View style={styles.dangerZone}>
        <Text style={[styles.warning, styles.dangerZoneTitle]}>
          Danger Zone
        </Text>
        <TouchableOpacity
          style={styles.clearDataButton}
          onPress={confirmClearData}
        >
          <Text style={[styles.smallerButtonText, styles.whiteText]}>
            Clear All Match Data
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Settings stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff00d",
  },

  headerContainer: {
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
    height: Platform.OS === "android" ? StatusBar.currentHeight + 70 : 80,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 25,
  },

  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  scrollViewContent: {
    paddingBottom: 20,
  },

  title: {
    flex: 1,
    fontSize: 28,
    fontFamily: "Cooper-Black",
    color: "#000000",
    textAlign: "center",
    marginRight: 32,
  },

  backButton: {
    backgroundColor: "#000000",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 30,
    color: "#FFD700",
    fontWeight: "900",
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  },

  section: {
    marginBottom: 24,
    backgroundColor: "#ffffff",
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
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 5,
  },

  sectionFlexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  warning: {
    fontSize: 14,
    color: "#FF0000",
    fontWeight: "bold",
    marginBottom: 10,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    color: "#FFD700",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 10,
    placeholderTextColor: "rgba(255, 215, 0, 0.5)",
  },

  checkmark: {
    width: 24,
    height: 24,
    marginLeft: 10,
  },

  button: {
    backgroundColor: "#000000",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
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

  smallerButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  biggerButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },

  whiteText: {
    color: "#ffffff",
  },

  blackText: {
    color: "#000000",
  },

  yellowText: {
    color: "#FFD700",
  },

  stationPicker: {
    marginTop: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  stations: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
  },

  redStations: {
    backgroundColor: "rgba(255, 0, 0, 0.4)",
  },

  blueStations: {
    backgroundColor: "rgba(0, 0, 255, 0.4)",
  },

  stationOption: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },

  saveButton: {
    marginTop: 20,
  },

  eventCodeDisplay: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  eventCodeLabel: {
    fontSize: 16,
    color: "#666666",
    marginRight: 8,
  },

  helperText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 10,
  },

  dangerZone: {
    marginTop: 20,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#ff0000",
  },

  dangerZoneTitle: {
    fontSize: 18,
  },

  clearDataButton: {
    backgroundColor: "#ff0000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
});

export default SettingsScreen;
