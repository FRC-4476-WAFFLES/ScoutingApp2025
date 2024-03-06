import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Button,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Image
} from "react-native";

import * as FileSystem from "expo-file-system";
import ScreenTitle from "../components/ScreenTitle";

import { CameraView, Camera } from "expo-camera/next";

const SettingsScreen = props => {
  const { navigation, route } = props;

  const [hasPermissions, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  const [shouldScan, setShouldScan] = React.useState(false);
  const [text, setText] = React.useState("Not yet scanned.")

  const [codeText, setCodeText] = React.useState();
  const [nameText, setNameText] = React.useState();

  const [jsonText, setJsonText] = React.useState();
  const [isLoaded, setIsLoaded] = React.useState(false);

  const [matchScheduleExists, setMatchScheduleExists] = React.useState(false);
  const [showMatchSchedule, setShowMatchSchedule] = React.useState(false);
  
  const [matchScheduleString, setMatchScheduleString] = React.useState();
  const [showScheduleCheckmark, setShowScheduleCheckmark] = React.useState(false);

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

  
  React.useEffect(() => {
      const getCameraPermissions = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      };

      const setSettingsVars = async () => {
          try {
              let settingsJSON = await JSON.parse(
                  await FileSystem.readAsStringAsync(settingsFileUri)
              );
              setNameText(await settingsJSON["Settings"]["scoutName"]);
              setDriverstation(await settingsJSON["Settings"]["driverStation"]);
          } catch (err) {
              console.log("No Settings File Saved.");
          }
      }

      const checkMatchScheduleExists = async () => {
          let tmp = await FileSystem.getInfoAsync(scheduleFileUri);
          console.log(`Match Schedule Exists: ${tmp.exists}`);
          setMatchScheduleExists(tmp.exists);
      }

      getCameraPermissions();
      setSettingsVars();
      checkMatchScheduleExists();
  }, []);

  const barcodeScanCheck = async ({type, data}) => {
    setScanned(true);
    setShouldScan(false);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  }

  const handleBarCodeScanned = async ({type, data}) => {
      setScanned(true);

      data = 'Match,R1,R2,R3,B1,B2,B3\\n' + data;
      setText(data);

      setShouldScan(false);

      console.log(`Type: ${type}, Data: ${data}`);

      // const csvtojson = require('csvtojson');
      // csvtojson()
      // .fromString(data)
      // .then((json: any) => {console.log(json)})

      let csvArray = data.split('\\n');
      
      let result = {"Schedule": []};
      let headers = csvArray[0].split(",");

      for (let i = 1; i < csvArray.length - 1; i++) {
          let values = csvArray[i].split(',');

          let obj = {
              "Match": values[0],
              "Teams": []
          }
          
          for (let j = 1; j < headers.length; j++) {
              let teamobj = {
                  "station": headers[j],
                  "teamNumber": parseInt(values[j]),
              }
              
              obj["Teams"].push(teamobj);
          }

          result.Schedule.push(obj);
      }
      
      await FileSystem.writeAsStringAsync(scheduleCsvUri, JSON.stringify(result));
      setShowScheduleCheckmark(true);
      console.log(JSON.stringify(JSON.parse(await FileSystem.readAsStringAsync(scheduleCsvUri)), null, '\t'));
  }

  const handleScanClicked = () => {
      setShouldScan(!shouldScan);
      setScanned(false);
  }

  if (hasPermissions === undefined) {
      return(
          <View style={styles.container}>
              <Text>Requesting for camera permission</Text>
          </View>
      )
  }

  if (hasPermissions === false) {
      <View style={styles.container}>
          <Text style={{margin: 10}}>No access to Camera</Text>
          <Button title={'allow Camera'} onPress={() => askForCameraPermission()} />
      </View>
  }

  return (
      <SafeAreaView style={styles.safeareaview} >
          <ScrollView>
              
              <ScreenTitle title="Settings" />

              <View style={[{marginVertical: 20}, styles.importSchedule]}>
                      <TouchableOpacity
                          style={styles.importScheduleButton}
                          onPress={handleScanClicked}
                      >
                      <Text style={styles.heading2}>{shouldScan ? "Stop Scanning" : "Scan Event Match Schedule"}</Text>
                      </TouchableOpacity>
              </View>

              {shouldScan && 
                  <View style={styles.container}>
                      <View style={styles.barcodeBox}>
                        <CameraView
                          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                          barcodeScannerSettings={{
                            barCodeTypes: ["qr"],
                          }}
                          style={{ width: 675, height: 675 }}
                        />

                      </View>
                  </View>
              }

              <View>
                  <Text style={styles.heading1}>Event Code</Text>
                  <Text style={styles.headingWarning}>DO NOT TOUCH IF SCOUTING AT MATCH</Text>
                  <View style={styles.eventCodeContainer}>
                      <TextInput
                          style={styles.codeInput}
                          onChangeText={setCodeText}
                          value={codeText}
                          placeholder="Event Code"
                      />

                      {
                          showScheduleCheckmark &&
                          <Image style={styles.scheduleCheckmark} source={require('../assets/images/checkmark-icon.png')} />
                      }
                  </View>
                  <View style={styles.importSchedule}>
                      <TouchableOpacity
                          style={styles.importScheduleButton}
                          onPress={downloadMatchSchedule}
                      >
                      <Text style={styles.heading2}>Import Event Match Schedule</Text>
                      </TouchableOpacity>
                  </View>
              </View>

              <View>
                  <Text style={styles.heading1}>Scout Name</Text>
                  <Text style={styles.headingWarning}>*MUST SET</Text>
                  <TextInput
                      style={styles.nameInput}
                      onChangeText={setNameText}
                      value={nameText == "undefined" ? undefined : nameText}
                      placeholder="Scout Name"
                  />
              </View>

              <TouchableOpacity 
                  style={styles.button}
                  onPress={() => setShowPicker(!showPicker)}
              >
                  <Text style={styles.driversationText}>{driverstation ? driverstation : 'Driverstation...'}</Text>
              </TouchableOpacity>

              {
              
              showPicker &&

              <View style={styles.picker}>
                  <View style={styles.redDriverstations}>
                      <TouchableOpacity 
                          style={styles.pickRedDriverstation}
                          onPress={() => onDriverstationPressed("R1")}
                      >
                          <Text style={styles.pickerText}>
                              R1
                          </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                          style={styles.pickRedDriverstation}
                          onPress={() => onDriverstationPressed("R2")}
                      >
                          <Text style={styles.pickerText}>
                              R2
                          </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                          style={styles.pickRedDriverstation}
                          onPress={() => onDriverstationPressed("R3")}
                      >
                          <Text style={styles.pickerText}>
                              R3
                          </Text>
                      </TouchableOpacity>
                  </View>
                  <View style={styles.blueDriverstations}>
                      <TouchableOpacity 
                          style={styles.pickBlueDriverstation}
                          onPress={() => onDriverstationPressed("B1")}
                      >
                          <Text style={styles.pickerText}>
                              B1
                          </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                          style={styles.pickBlueDriverstation}
                          onPress={() => onDriverstationPressed("B2")}
                      >
                          <Text style={styles.pickerText}>
                              B2
                          </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                          style={styles.pickBlueDriverstation}
                          onPress={() => onDriverstationPressed("B3")}
                      >
                          <Text style={styles.pickerText}>
                              B3
                          </Text>
                      </TouchableOpacity>
                  </View>
              </View>  

              }

              <TouchableOpacity
                  onPress={async () => {
                      await saveSettings();
                      navigation.navigate("Home");
                  }}
              >
                  <Text style={styles.save}>Save</Text>
              </TouchableOpacity>

              { // For Development Purposes
              
              /* <TouchableOpacity
                  onPress={async () => {
                      try {
                          await FileSystem.deleteAsync(scheduleFileUri);
                      } catch (e) { console.log(e) };
                      
                      try {
                          await FileSystem.deleteAsync(settingsFileUri);
                      } catch (e) { console.log(e) };

                      setDriverstation(undefined);
                      setCodeText(undefined);
                  }}
              >
                  <Text style={styles.clear}>Clear Data</Text>
              </TouchableOpacity> */}
              
          </ScrollView>
      </SafeAreaView>
  );

  function onDriverstationPressed(driverstation) {
      setDriverstation(driverstation);
      setShowPicker(false);
  }

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
      await getMatchSchedule();
      if (!jsonText) {
          console.warn('Failed Downloading Match Schedule. Please Retry.')
          return;
      }

      let theJSON = JSON.stringify(await JSON.parse(jsonText), null, "\t");
      console.log(theJSON)
      await FileSystem.writeAsStringAsync(scheduleFileUri, theJSON);
      setShowScheduleCheckmark(true);
      // console.log(await FileSystem.readAsStringAsync(scheduleFileUri));
  }

  async function getMatchSchedule() {
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
          `https://frc-api.firstinspires.org/v3.0/2024/schedule/${codeText}?tournamentLevel=qual`,
          requestOptions
      )
        .then((res) => res.text())
        .then((data) => {
          setJsonText(data);
        })
        .catch((error) => console.log(error));
  }
}

const styles = StyleSheet.create({
  safeareaview: {
      backgroundColor: "#FFCC00",
      flex: 1,
      justifyContent: 'center'
  },

  container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
  },

  barcodeBox: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 500,
      height: 500,
      overflow: 'hidden',
      borderRadius: 30,
      backgroundColor: 'tomato',
  },

  maintext: {
      fontsize: 16,
      margin: 20,
  },

  button: {
      paddingVertical: 35,
      alignItems: 'center',
      marginHorizontal: 30,
      backgroundColor: "#FFD27A",
      borderRadius: 100,
      marginTop: 40,
  },
  driversationText: {
      fontSize: 35,
  },
  picker: {
      alignItems: 'center',
      marginTop: 15,
      marginHorizontal: 50,
      backgroundColor: "#FFD27A",
      borderRadius: 25,
      paddingVertical: 5,
  },
  redDriverstations: {
      backgroundColor: "rgba(235, 36, 36, 0.53)",
      width: '95%',
      marginVertical: 3,
      alignItems: 'center',
      borderRadius: 25,
      paddingVertical: 3,
  },
  blueDriverstations: {
      backgroundColor: "rgba(36, 187, 235, 0.53)",
      width: '95%',
      marginVertical: 3,
      alignItems: 'center',
      borderRadius: 25,
      paddingVertical: 3,
  },
  pickRedDriverstation: {
      marginVertical: 0.5,
  },
  pickBlueDriverstation: {
      marginVertical: 0.5,
  },
  pickerText: {
      fontSize: 30,
      fontWeight: 'bold'
  },

  heading1: {
      fontSize: Dimensions.get("window").width * 0.08,
      fontWeight: "bold",
      marginHorizontal: 15,
      marginVertical: 10,
      },

  heading2: {
      fontSize: Dimensions.get("window").width * 0.05,
      fontStyle: "italic",
  },

  headingWarning: {
      fontSize: Dimensions.get("window").width * 0.04,
      fontWeight: "bold",
      marginHorizontal: 15,
      marginTop: -15,
      marginBottom: 10
  },

  codeInput: {
      fontSize: Dimensions.get("window").width * 0.05,
      backgroundColor: "#FFBCBC",
      borderRadius: 10,
      marginTop: 15,
      marginHorizontal: 10,
      paddingVertical: "2%",
      paddingHorizontal: 90,
      justifyContent: "center",
      textAlign: "center",
      marginBottom: "5%",
  },

  nameInput: {
      fontSize: Dimensions.get("window").width * 0.05,
      width: "80%",
      backgroundColor: "#FFBCBC",
      borderRadius: 10,
      padding: "2%",
      left: "10%",
      justifyContent: "center",
      textAlign: "center",
      marginBottom: "5%",
  },

  importSchedule: {
      width: Dimensions.get("window").width * 0.8,
      height: 85,
      backgroundColor: "#F5A900",
      marginLeft: Dimensions.get("window").width * 0.1,
      justifyContent: "center",
      textAlign: "center",
      alignItems: "center",
  },

  importScheduleButton: {

  },

  eventCodeContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
  },

  scheduleCheckmark: {
      resizeMode: 'contain',
      width: 50,
  },

  pickerContainer: {
      justifyContent: "center",
      alignItems: "center",
      transform: [{ scaleX: 2 }, { scaleY: 2 }],
  },

  save: {
      fontSize: Dimensions.get("window").width * 0.06,
      width: "95%",
      backgroundColor: "#FFD27A",
      borderRadius: 100,
      padding: "2%",
      left: Dimensions.get("window").width * 0.025,
      justifyContent: "center",
      textAlign: "center",
      marginTop: Dimensions.get("window").height * 0.05,
  },

  clear: {
      fontSize: Dimensions.get("window").width * 0.03,
      width: "60%",
      backgroundColor: "#ff4a4a",
      borderRadius: 100,
      padding: "2%",
      left: Dimensions.get("window").width * 0.2,
      justifyContent: "center",
      textAlign: "center",
      marginTop: Dimensions.get("window").height * 0.02,    
  },

  showMatchSchedule: {
      backgroundColor: "white",
      width: "80%",
      height: "80%",
      top: "10%",
      left: "10%",
      borderRadius: 10,
  },
})

export default SettingsScreen;