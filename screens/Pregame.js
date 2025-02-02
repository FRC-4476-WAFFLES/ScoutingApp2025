import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    StatusBar,
    Platform,
    TouchableOpacity,
    TextInput,
    Modal,
    Image,
    TouchableWithoutFeedback,
    Keyboard
} from "react-native";

import * as FileSystem from "expo-file-system";
import Checkbox from 'expo-checkbox';

const getAllianceColor = (driverStation) => {
  if (!driverStation) return null;
  return driverStation.charAt(0) === 'R' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 0, 255, 0.1)';
};

const PregameScreen = props => {
  const { navigation, route } = props;

  const [toNavigate, setToNavigate] = React.useState("Match");

  const [matchNum, setMatchNum] = React.useState();
  const [teamNum, setTeamNum] = React.useState();

  const [scoutName, setScoutName] = React.useState();
  const [driverStation, setDriverStation] = React.useState();

  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [tempScoutName, setTempScoutName] = useState('');

  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [commentValue, setCommentValue] = useState('');

  const [isInitialized, setIsInitialized] = useState(false);

  const [maxMatchNum, setMaxMatchNum] = useState(0);
  const [minMatchNum, setMinMatchNum] = useState(1);

  const [hpAtProcessor, setHpAtProcessor] = useState(false);

  const scheduleFileUri = `${
      FileSystem.documentDirectory
  }${"MatchSchedule.json"}`;
  const scheduleCsvUri = `${
    FileSystem.documentDirectory
  }${"MatchScheduleCsv.json"}`;
  const settingsFileUri = `${
      FileSystem.documentDirectory
  }${"ScoutingAppSettings.json"}`;

  const docDir = `${FileSystem.documentDirectory}`;

  const positions = ["LEFT", "CENTER", "RIGHT"];
  const startingPositions = {
    LEFT: "l",
    CENTER: "c",
    RIGHT: "r",
  };

  const apiStations = {
    R1: "Red1",
    R2: "Red2",
    R3: "Red3",
    B1: "Blue1",
    B2: "Blue2",
    B3: "Blue3",
  };

  React.useEffect(() => {
    if (route.params?.matchNum) {
        setMatchNum(route.params.matchNum);
        findMatch();
    }
  }, [route.params])

  React.useEffect(() => {
    const loadScoutInfo = async () => {
      try {
        let settingsJSON = await JSON.parse(
          await FileSystem.readAsStringAsync(settingsFileUri)
        );
        setScoutName(settingsJSON["Settings"]["scoutName"]);
        setDriverStation(settingsJSON["Settings"]["driverStation"]);
      } catch (err) {
        console.log("No Settings File Saved.");
      }
    };
    
    loadScoutInfo();
  }, []);

  React.useEffect(() => {
    const loadExistingComment = async () => {
      if (!isInitialized && matchNum) {
        try {
          const csvURI = `${FileSystem.documentDirectory}match${matchNum}.csv`;
          const exists = await FileSystem.getInfoAsync(csvURI);
          
          if (exists.exists) {
            const data = await FileSystem.readAsStringAsync(csvURI);
            const values = data.split(',');
            const existingComment = values[values.length - 1];
            
            if (existingComment && existingComment !== "0") {
              setCommentValue(existingComment.replace(/^"|"$/g, ''));
            }
          }
          
          setIsInitialized(true);
        } catch (error) {
          console.error('Error loading existing comment:', error);
        }
      }
    };

    loadExistingComment();
  }, [matchNum, isInitialized]);

  React.useEffect(() => {
    const loadMatchRange = async () => {
      try {
        let tmp = await FileSystem.getInfoAsync(scheduleCsvUri);
        
        if (!tmp.exists) {
          let tmp1 = await FileSystem.getInfoAsync(scheduleFileUri);
          if (tmp1.exists) {
            let jsontext = await FileSystem.readAsStringAsync(scheduleFileUri);
            let matchjson = await JSON.parse(jsontext);
            setMaxMatchNum(matchjson["Schedule"].length);
          }
        } else {
          let jsontext = await FileSystem.readAsStringAsync(scheduleCsvUri);
          let matchjson = await JSON.parse(jsontext);
          setMaxMatchNum(matchjson["Schedule"].length);
        }
      } catch (error) {
        console.error('Error loading match range:', error);
      }
    };

    loadMatchRange();
  }, []);

  const openNameModal = () => {
    setTempScoutName(scoutName || '');
    setIsNameModalVisible(true);
  };

  const saveNameAndClose = async () => {
    await updateScoutName(tempScoutName);
    setIsNameModalVisible(false);
  };

  const updateScoutName = async (newName) => {
    try {
      let settingsJSON = await JSON.parse(
        await FileSystem.readAsStringAsync(settingsFileUri)
      );
      settingsJSON["Settings"]["scoutName"] = newName;
      await FileSystem.writeAsStringAsync(settingsFileUri, JSON.stringify(settingsJSON, null, 2));
      setScoutName(newName);
    } catch (err) {
      console.log("Error updating scout name:", err);
      alert("Failed to save scout name. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{flex: 1}}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>⬅</Text>
              </TouchableOpacity>
              <Text style={[styles.title, { marginHorizontal: 32 }]}>Pre-Game</Text>
              <TouchableOpacity
                style={styles.commentButton}
                onPress={() => setIsCommentModalVisible(true)}
              >
                <Image
                  source={require("../assets/images/comment-icon.png")}
                  style={styles.commentIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Match Info Row */}
            <View style={styles.rowContainer}>
              {/* Match Number Section */}
              <View style={[styles.section, styles.halfSection]}>
                <Text style={styles.sectionTitle}>Match Number</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={text => { 
                    const num = parseInt(text);
                    if (!text) {
                      setMatchNum(undefined);
                    } else if (num >= minMatchNum && num <= maxMatchNum) {
                      setMatchNum(num);
                    }
                  }}
                  value={matchNum ? String(matchNum) : undefined}
                  placeholder={`Enter match (${minMatchNum}-${maxMatchNum})...`}
                  placeholderTextColor="rgba(255, 215, 0, 0.5)"
                  keyboardType="numeric"
                />
                
                <TouchableOpacity 
                  style={styles.findButton}
                  onPress={async () => await findMatch()}
                >
                  <Text style={styles.buttonText}>Find Match</Text>
                </TouchableOpacity>
              </View>

              {/* Team Display Section */}
              <View style={[styles.section, styles.halfSection]}>
                <Text style={styles.sectionTitle}>Your Team</Text>
                <View style={[
                  styles.teamContainer,
                  driverStation && { backgroundColor: getAllianceColor(driverStation) }
                ]}>
                  {teamNum ? (
                    <Text style={[
                      styles.teamNumber,
                      { color: driverStation?.charAt(0) === 'R' ? '#cc0000' : '#0000cc' }
                    ]}>{teamNum}</Text>
                  ) : (
                    <View>
                      <Text style={styles.label}>
                        Enter match number and press Find Match
                      </Text>
                      <Text style={styles.matchRangeText}>
                        Valid matches: {minMatchNum}-{maxMatchNum}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Scout Info Section */}
            <View style={[styles.section, { marginBottom: 24 }]}>
              <Text style={styles.sectionTitle}>Scout Information</Text>
              
              {/* Scout Name Button */}
              <TouchableOpacity 
                style={styles.scoutNameButton}
                onPress={openNameModal}
              >
                <Text style={styles.scoutNameText}>
                  {scoutName || 'Set Scout Name...'}
                </Text>
              </TouchableOpacity>
              
              {/* Driver Station Display */}
              <View style={[
                styles.stationDisplay,
                driverStation && {
                  backgroundColor: driverStation?.charAt(0) === 'R' ? 
                    'rgba(255, 0, 0, 0.1)' : 
                    'rgba(0, 0, 255, 0.1)',
                }
              ]}>
                <Text style={[
                  styles.stationText,
                  driverStation && {
                    color: driverStation?.charAt(0) === 'R' ? '#cc0000' : '#0000cc'
                  }
                ]}>
                  {driverStation || 'Driver Station Not Set'}
                </Text>
              </View>
            </View>

            {/* Human Player Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Human Player</Text>
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setHpAtProcessor(!hpAtProcessor)}
                activeOpacity={0.7}
              >
                <Checkbox
                  style={styles.checkbox}
                  value={hpAtProcessor}
                  onValueChange={setHpAtProcessor}
                  color={hpAtProcessor ? '#000000' : undefined}
                />
                <Text style={styles.checkboxLabel}>HP at Processor</Text>
              </TouchableOpacity>
            </View>

            {/* Scout Name Edit Modal */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={isNameModalVisible}
              onRequestClose={() => setIsNameModalVisible(false)}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback>
                    <View style={[styles.modalContent, { marginTop: '10%' }]}>
                      <Text style={styles.modalTitle}>Edit Scout Name</Text>
                      <TextInput
                        style={styles.nameModalInput}
                        value={tempScoutName}
                        onChangeText={setTempScoutName}
                        placeholder="Enter scout name..."
                        placeholderTextColor="rgba(255, 215, 0, 0.5)"
                        textAlign="center"
                        autoFocus={true}
                      />
                      <View style={styles.modalButtons}>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.cancelButton]}
                          onPress={() => setIsNameModalVisible(false)}
                        >
                          <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.saveButton]}
                          onPress={saveNameAndClose}
                        >
                          <Text style={styles.modalButtonText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!matchNum || !teamNum) && styles.submitButtonDisabled
              ]}
              onPress={async () => {
                if (!matchNum || !teamNum) {
                  alert('Please enter a match number and find your team first');
                  return;
                }
                try {
                  await submitPrematch();
                  navigation.navigate("Match", {
                    matchNum: matchNum,
                    teamNum: teamNum,
                    hpAtProcessor: hpAtProcessor,
                  });
                } catch (error) {
                  console.error('Error in submitPrematch:', error);
                  alert('Error starting match. Please check your settings and try again.');
                }
              }}
            >
              <Text style={styles.buttonText}>Start Match</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Comment Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={isCommentModalVisible}
            onRequestClose={() => setIsCommentModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Pre-Game Comments</Text>
                    <TextInput
                      style={styles.modalInput}
                      multiline
                      value={commentValue}
                      onChangeText={setCommentValue}
                      placeholder="Enter pre-game comments..."
                      placeholderTextColor="rgba(255, 215, 0, 0.5)"
                    />
                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={() => setIsCommentModalVisible(false)}
                      >
                        <Text style={styles.modalButtonText}>Close</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.saveButton]}
                        onPress={() => setIsCommentModalVisible(false)}
                      >
                        <Text style={styles.modalButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );

  async function findMatch() {
      if (!matchNum) {
        alert('Please enter a match number');
        return;
      }

      if (matchNum < minMatchNum || matchNum > maxMatchNum) {
        alert(`Invalid match number. Please enter a match number between ${minMatchNum} and ${maxMatchNum}`);
        setTeamNum(undefined);
        return;
      }

      let settingsJSON = await JSON.parse(
        await FileSystem.readAsStringAsync(settingsFileUri)
      );

      let position = await settingsJSON["Settings"]["driverStation"];

      let tmp = await FileSystem.getInfoAsync(scheduleCsvUri);

      if (!tmp.exists) {

        let tmp1 = await FileSystem.getInfoAsync(scheduleFileUri);
        if (!tmp1.exists) {
          navigation.navigate("Settings");
          return;
        }

        let jsontext = await FileSystem.readAsStringAsync(scheduleFileUri);
        let matchjson = await JSON.parse(jsontext);
        if (!matchNum) return;

        let teams;

        try {
          teams = await matchjson["Schedule"][matchNum - 1]["teams"];
        } catch (e) {
          setTeamNum(undefined);
          console.warn(e)
          return;
        }

        await teams.forEach((team) => {
          // console.log(apiStations[position as keyof typeof apiStations])
          if (team["station"] == apiStations[position]) {
            setTeamNum(parseInt(team["teamNumber"]));
            return;
          }
        });

        return;
      }
  
      let jsontext = await FileSystem.readAsStringAsync(scheduleCsvUri);
      let matchjson = await JSON.parse(jsontext);
      
      if (!matchNum) return;
      
      let teams;
      try {
        teams = await matchjson["Schedule"][matchNum - 1]["Teams"];
      } catch (e) {
        setTeamNum(undefined);
        console.warn(e);
        return;
      }

      await teams.forEach((team) => {
        if (team["station"] == position) {
          setTeamNum(parseInt(team["teamNumber"]));
          console.log(team["teamNumber"]);
          return;
        }
      });

      setIsInitialized(false);
  }

  async function submitPrematch() {
      let tmp = await FileSystem.getInfoAsync(settingsFileUri);
      if (!tmp.exists) {
        setToNavigate("Settings");
        return;
      }
  
      let settingsJSON = await JSON.parse(
        await FileSystem.readAsStringAsync(settingsFileUri)
      );
  
      let team = teamNum;
      let match = matchNum;
      let position = await settingsJSON["Settings"]["driverStation"];
      let alliance = await settingsJSON["Settings"]["driverStation"].charAt(0);
      let allianceKey = `${await alliance}${match}`;
      let scout = await settingsJSON["Settings"]["scoutName"];
      //let startPos = await startingPositions[selectedPosition];
      let startPos = "N/A";
  
      let tmaKey = `${team}-${allianceKey}`;
  
      let csvText = `${team},${match},${tmaKey},${position},${alliance},${scout},${
        hpAtProcessor ? 1 : 0},${
        commentValue === `` ? 0 : `"${commentValue}"`
      }`;
  
      let csvURI = `${FileSystem.documentDirectory}match${match}.csv`;
      await FileSystem.writeAsStringAsync(csvURI, csvText);
      console.log(`CSV Text: ${await FileSystem.readAsStringAsync(csvURI)}`);
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
    fontSize: 22,
    color: '#FFD700',
    fontWeight: '900',
    height: 32,
    lineHeight: 32,
    textAlignVertical: 'center',
    includeFontPadding: false,
    paddingBottom: Platform.OS === 'ios' ? 4 : 2,
  },

  section: {
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
    marginBottom: 16,
  },

  input: {
    backgroundColor: '#1a1a1a',
    color: '#FFD700',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },

  findButton: {
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

  buttonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },

  label: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },

  teamNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  submitButton: {
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

  submitButtonDisabled: {
    backgroundColor: '#666666',
  },

  scoutNameButton: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },

  scoutNameText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },

  modalInput: {
    backgroundColor: '#1a1a1a',
    color: '#FFD700',
    borderRadius: 12,
    padding: 16,
    height: 300,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 16,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  modalButton: {
    flex: 0.48,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#666666',
  },

  saveButton: {
    backgroundColor: '#000000',
  },

  modalButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },

  stationDisplay: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },

  stationText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  halfSection: {
    flex: 0.48, // Slightly less than half to account for spacing
    marginBottom: 0, // Remove bottom margin since it's handled by rowContainer
  },

  teamContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
    borderRadius: 12,
    padding: 10,
  },

  commentButton: {
    backgroundColor: '#000000',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  commentIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFD700',
  },

  nameModalInput: {
    backgroundColor: '#1a1a1a',
    color: '#FFD700',
    borderRadius: 12,
    padding: 16,
    height: 50,
    fontSize: 16,
    textAlignVertical: 'center',
    marginBottom: 16,
  },

  matchRangeText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 15,
    paddingHorizontal: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },

  checkbox: {
    margin: 8,
    width: 36,
    height: 36,
    borderRadius: 6,
  },

  checkboxLabel: {
    fontSize: 20,
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default PregameScreen;