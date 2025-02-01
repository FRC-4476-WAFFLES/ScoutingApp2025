import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Image,
    TextInput,
    Platform,
    StatusBar,
    Modal,
    TouchableWithoutFeedback,
    Keyboard
} from "react-native";

import * as FileSystem from "expo-file-system";
import * as Clipboard from 'expo-clipboard';
import Checkbox from 'expo-checkbox';

const getAllianceColor = (driverStation) => {
  if (!driverStation) return null;
  return driverStation.charAt(0) === 'R' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 0, 255, 0.1)';
};

const MatchScreen = props => {
  const { navigation, route } = props;

  // Auto state variables
  const [autoL1Coral, setAutoL1Coral] = useState(0);
  const [autoL2Coral, setAutoL2Coral] = useState(0);
  const [autoL3Coral, setAutoL3Coral] = useState(0);
  const [autoL4Coral, setAutoL4Coral] = useState(0);
  const [autoAlgaeProcessor, setAutoAlgaeProcessor] = useState(0);
  const [autoAlgaeNet, setAutoAlgaeNet] = useState(0);

  // TeleOp state variables
  const [teleOpL1Coral, setTeleOpL1Coral] = useState(0);
  const [teleOpL2Coral, setTeleOpL2Coral] = useState(0);
  const [teleOpL3Coral, setTeleOpL3Coral] = useState(0);
  const [teleOpL4Coral, setTeleOpL4Coral] = useState(0);
  const [teleOpAlgaeProcessor, setTeleOpAlgaeProcessor] = useState(0);
  const [teleOpAlgaeNet, setTeleOpAlgaeNet] = useState(0);

  const [trapNotes, setTrapNotes] = useState(0);
  const [stashNotes, setStashNotes] = useState(0);

  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [commentValue, setCommentValue] = useState('');

  const [isInitialized, setIsInitialized] = useState(false);

  const [isAutoExpanded, setIsAutoExpanded] = useState(true);
  const [isTeleOpExpanded, setIsTeleOpExpanded] = useState(false);

  const [driverStation, setDriverStation] = useState(null);

  const [removedAlgae, setRemovedAlgae] = useState(false);

  useEffect(() => {
    const loadExistingComment = async () => {
      if (!isInitialized && route.params?.matchNum) {
        try {
          const csvURI = `${FileSystem.documentDirectory}match${route.params.matchNum}.csv`;
          const data = await FileSystem.readAsStringAsync(csvURI);
          
          // Split the CSV and get the last value which should be the comment
          const values = data.split(',');
          const existingComment = values[values.length - 1];
          
          // If comment exists and isn't "0", set it (remove quotes if present)
          if (existingComment && existingComment !== "0") {
            setCommentValue(existingComment.replace(/^"|"$/g, ''));
          }
          
          setIsInitialized(true);
        } catch (error) {
          console.error('Error loading existing comment:', error);
        }
      }
    };

    loadExistingComment();
  }, [route.params?.matchNum, isInitialized]);

  useEffect(() => {
    const loadDriverStation = async () => {
      try {
        const settingsFileUri = `${FileSystem.documentDirectory}ScoutingAppSettings.json`;
        let settingsJSON = await JSON.parse(
          await FileSystem.readAsStringAsync(settingsFileUri)
        );
        setDriverStation(settingsJSON["Settings"]["driverStation"]);
      } catch (err) {
        console.log("Error loading driver station:", err);
      }
    };
    
    loadDriverStation();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={async () => {
              // Save current comment state before going back
              const match = route.params.matchNum;
              const csvURI = `${FileSystem.documentDirectory}match${match}.csv`;
              let currData = await FileSystem.readAsStringAsync(csvURI);
              
              let commaIndex = 0;
              let commas = 0;
              
              for (let i = 0; i < currData.length; i++) {
                if (currData.charAt(i) == ',') commas++;
                if (commas == 6) {
                  commaIndex = i;
                  break;
                }
              }

              currData = currData.slice(0, commaIndex + 1);
              currData += `${commentValue === `` ? 0 : `"${commentValue}"`}`;
              
              await FileSystem.writeAsStringAsync(csvURI, currData);
              
              navigation.goBack();
            }}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Match</Text>
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

      {/* Team Number Header - Now outside ScrollView */}
      <View style={[
        styles.teamHeaderContainer,
        driverStation && { backgroundColor: getAllianceColor(driverStation) }
      ]}>
        <Text style={[
          styles.teamHeader,
          driverStation && { 
            color: driverStation?.charAt(0) === 'R' ? '#cc0000' : '#0000cc'
          }
        ]}>
          Team {route.params.teamNum}
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={styles.mainContent}>
          {/* Auto Section */}
          <View style={[styles.section, styles.autoSection]}>
            <TouchableOpacity
              style={[styles.sectionHeader, styles.autoHeader]}
              onPress={() => setIsAutoExpanded(!isAutoExpanded)}
            >
              <Text style={styles.sectionTitle}>Autonomous</Text>
              <Text style={styles.expandButton}>
                {isAutoExpanded ? '−' : '+'}
              </Text>
            </TouchableOpacity>
            
            {isAutoExpanded && (
              <View style={styles.sectionContent}>
                <CounterItem
                  label="L4 Coral"
                  value={autoL4Coral}
                  onIncrement={() => updateAutoL4Coral(1)}
                  onDecrement={() => updateAutoL4Coral(-1)}
                />
                <CounterItem
                  label="L3 Coral"
                  value={autoL3Coral}
                  onIncrement={() => updateAutoL3Coral(1)}
                  onDecrement={() => updateAutoL3Coral(-1)}
                />
                <CounterItem
                  label="L2 Coral"
                  value={autoL2Coral}
                  onIncrement={() => updateAutoL2Coral(1)}
                  onDecrement={() => updateAutoL2Coral(-1)}
                />
                <CounterItem
                  label="L1 Coral"
                  value={autoL1Coral}
                  onIncrement={() => updateAutoL1Coral(1)}
                  onDecrement={() => updateAutoL1Coral(-1)}
                  showDivider={true}
                />
                <CounterItem
                  label="Algae Net"
                  value={autoAlgaeNet}
                  onIncrement={() => updateAutoAlgaeNet(1)}
                  onDecrement={() => updateAutoAlgaeNet(-1)}
                />
                <CounterItem
                  label="Algae Processor"
                  value={autoAlgaeProcessor}
                  onIncrement={() => updateAutoAlgaeProcessor(1)}
                  onDecrement={() => updateAutoAlgaeProcessor(-1)}
                />
              </View>
            )}
          </View>

          {/* TeleOp Section */}
          <View style={[styles.section, styles.teleOpSection]}>
            <TouchableOpacity
              style={[styles.sectionHeader, styles.teleOpHeader]}
              onPress={() => setIsTeleOpExpanded(!isTeleOpExpanded)}
            >
              <Text style={styles.sectionTitle}>Tele-Op</Text>
              <Text style={styles.expandButton}>
                {isTeleOpExpanded ? '−' : '+'}
              </Text>
            </TouchableOpacity>
            
            {isTeleOpExpanded && (
              <View style={styles.sectionContent}>
                <CounterItem
                  label="L4 Coral"
                  value={teleOpL4Coral}
                  onIncrement={() => updateTeleOpL4Coral(1)}
                  onDecrement={() => updateTeleOpL4Coral(-1)}
                />
                <CounterItem
                  label="L3 Coral"
                  value={teleOpL3Coral}
                  onIncrement={() => updateTeleOpL3Coral(1)}
                  onDecrement={() => updateTeleOpL3Coral(-1)}
                />
                <CounterItem
                  label="L2 Coral"
                  value={teleOpL2Coral}
                  onIncrement={() => updateTeleOpL2Coral(1)}
                  onDecrement={() => updateTeleOpL2Coral(-1)}
                />
                <CounterItem
                  label="L1 Coral"
                  value={teleOpL1Coral}
                  onIncrement={() => updateTeleOpL1Coral(1)}
                  onDecrement={() => updateTeleOpL1Coral(-1)}
                  showDivider={true}
                />
                <CounterItem
                  label="Algae Net"
                  value={teleOpAlgaeNet}
                  onIncrement={() => updateTeleOpAlgaeNet(1)}
                  onDecrement={() => updateTeleOpAlgaeNet(-1)}
                />
                <CounterItem
                  label="Algae Processor"
                  value={teleOpAlgaeProcessor}
                  onIncrement={() => updateTeleOpAlgaeProcessor(1)}
                  onDecrement={() => updateTeleOpAlgaeProcessor(-1)}
                />
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setRemovedAlgae(!removedAlgae)}
                  activeOpacity={0.7}
                >
                  <Checkbox
                    style={styles.checkbox}
                    value={removedAlgae}
                    onValueChange={setRemovedAlgae}
                    color={removedAlgae ? '#000000' : undefined}
                  />
                  <Text style={styles.checkboxLabel}>Removed Algae From Reef</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={async () => {
              await matchSubmit();
              navigation.navigate("QRCode", {
                matchNum: route.params.matchNum,
                data: await getDataString(),
              });
            }}
          >
            <Text style={styles.buttonText}>Submit Match</Text>
          </TouchableOpacity>
        </View>
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
                <Text style={styles.modalTitle}>Match Comments</Text>
                <TextInput
                  style={styles.modalInput}
                  multiline
                  value={commentValue}
                  onChangeText={setCommentValue}
                  placeholder="Enter match comments..."
                  placeholderTextColor="rgba(255, 215, 0, 0.5)"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton, { flex: 1 }]}
                    onPress={() => setIsCommentModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );

  async function matchSubmit() {
    let match = route.params.matchNum;
    let csvURI = `${FileSystem.documentDirectory}match${match}.csv`;

    let currData = await FileSystem.readAsStringAsync(csvURI);
    console.log(currData)
    
    let commaIndex = 0;
    let commas = 0;
    
    for (let i = 0; i < currData.length; i++) {
      if (currData.charAt(i) == ',') commas++;

      if (commas == 6) {
        commaIndex = i;
        console.log(commaIndex)
        break;
      }
    }

    // Keep the original comment if no new comment was added
    const originalComment = currData.split(',')[6];
    const finalComment = commentValue || (originalComment !== "0" ? originalComment : "0");

    currData = currData.slice(0, commaIndex + 1);
    console.log(`currData: ${currData}`)

    // Add the new data fields
    currData += `${autoL1Coral},${autoL2Coral},${autoL3Coral},${autoL4Coral},${autoAlgaeProcessor},${autoAlgaeNet},`;
    currData += `${teleOpL1Coral},${teleOpL2Coral},${teleOpL3Coral},${teleOpL4Coral},${teleOpAlgaeProcessor},${teleOpAlgaeNet},`;
    currData += `${removedAlgae ? 1 : 0},`;  // Add the removedAlgae boolean as 1 or 0
    currData += `${finalComment === `` ? 0 : `"${finalComment}"`}`;

    await FileSystem.writeAsStringAsync(csvURI, currData);
    console.log(await FileSystem.readAsStringAsync(csvURI));

    await Clipboard.setStringAsync(currData);
  }

  async function getDataString() {
    let match = route.params.matchNum;
    let csvURI = `${FileSystem.documentDirectory}match${match}.csv`;
    let dataString = await FileSystem.readAsStringAsync(csvURI);

    console.log(dataString);

    return dataString;
  }
  
  function handleCommentClick() {
    setIsCommentBoxOpen(!isCommentBoxOpen);
  }
  
  function updateAutoSpeaker(num) {
    let target = autoSpeaker + num;
    if (target >= 0) {
      setAutoSpeaker(target);
    }
  }
  
  function updateAutoAmp(num) {
    let target = autoAmp + num;
    if (target >= 0) {
      setAutoAmp(target);
    }
  }
  
  function updateTeleOpSpeaker(num) {
    let target = teleOpSpeaker + num;
    if (target >= 0) {
      setTeleOpSpeaker(target);
    }
  }
  
  function updateTeleOpAmp(num) {
    let target = teleOpAmp + num;
    if (target >= 0) {
      setTeleOpAmp(target);
    }
  }

  function updateStashNotes(num) {
    let target = stashNotes + num;
    if (target >= 0) {
      setStashNotes(target);
    }
  }

  function updateTrapNotes(num) {
    let target = trapNotes + num;
    if (target >= 0 && target <= 3) {
      setTrapNotes(target);
    }
  }

  function updateAutoL1Coral(num) {
    let target = autoL1Coral + num;
    if (target >= 0) {
      setAutoL1Coral(target);
    }
  }

  function updateAutoL2Coral(num) {
    let target = autoL2Coral + num;
    if (target >= 0) {
      setAutoL2Coral(target);
    }
  }

  function updateAutoL3Coral(num) {
    let target = autoL3Coral + num;
    if (target >= 0) {
      setAutoL3Coral(target);
    }
  }

  function updateAutoL4Coral(num) {
    let target = autoL4Coral + num;
    if (target >= 0) {
      setAutoL4Coral(target);
    }
  }

  function updateAutoAlgaeProcessor(num) {
    let target = autoAlgaeProcessor + num;
    if (target >= 0) {
      setAutoAlgaeProcessor(target);
    }
  }

  function updateAutoAlgaeNet(num) {
    let target = autoAlgaeNet + num;
    if (target >= 0) {
      setAutoAlgaeNet(target);
    }
  }

  function updateTeleOpL1Coral(num) {
    let target = teleOpL1Coral + num;
    if (target >= 0) {
      setTeleOpL1Coral(target);
    }
  }

  function updateTeleOpL2Coral(num) {
    let target = teleOpL2Coral + num;
    if (target >= 0) {
      setTeleOpL2Coral(target);
    }
  }

  function updateTeleOpL3Coral(num) {
    let target = teleOpL3Coral + num;
    if (target >= 0) {
      setTeleOpL3Coral(target);
    }
  }

  function updateTeleOpL4Coral(num) {
    let target = teleOpL4Coral + num;
    if (target >= 0) {
      setTeleOpL4Coral(target);
    }
  }

  function updateTeleOpAlgaeProcessor(num) {
    let target = teleOpAlgaeProcessor + num;
    if (target >= 0) {
      setTeleOpAlgaeProcessor(target);
    }
  }

  function updateTeleOpAlgaeNet(num) {
    let target = teleOpAlgaeNet + num;
    if (target >= 0) {
      setTeleOpAlgaeNet(target);
    }
  }
}

// Counter component for reusability
const CounterItem = ({ label, value, onIncrement, onDecrement, showDivider }) => (
  <View>
    <View style={styles.counterContainer}>
      <Text style={styles.counterLabel}>{label}</Text>
      <View style={styles.counterControls}>
        <TouchableOpacity 
          style={[styles.counterButton, styles.decrementButton]} 
          onPress={onDecrement}
        >
          <Text style={styles.counterButtonText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.counterValue}>{value}</Text>
        <TouchableOpacity 
          style={[styles.counterButton, styles.incrementButton]} 
          onPress={onIncrement}
        >
          <Image
            source={require("../assets/images/plus-icon.png")}
            style={styles.buttonIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
    {showDivider && <View style={styles.divider} />}
  </View>
);

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

  scrollView: {
    flex: 1,
    backgroundColor: '#fff00d',
  },

  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  mainContent: {
    flex: 1,
    minHeight: '100%',
  },

  teamHeaderContainer: {
    padding: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    backgroundColor: '#fff00d',
    zIndex: 1,
  },

  teamHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  section: {
    backgroundColor: '#ffffff',
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

  autoSection: {
    backgroundColor: '#fff0d9', // More noticeable warm color for Auto
  },

  teleOpSection: {
    backgroundColor: '#ffffff', // Keep TeleOp white
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },

  autoHeader: {
    backgroundColor: '#ffe0b3', // Darker warm color for auto header
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  teleOpHeader: {
    backgroundColor: '#f0f0f0', // Slightly darker gray for teleop header
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  sectionContent: {
    padding: 20,
  },

  counterContainer: {
    marginBottom: 20,
  },

  counterLabel: {
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },

  counterControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  counterButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  decrementButton: {
    backgroundColor: '#FFBCBC',
  },

  incrementButton: {
    backgroundColor: '#C6FFBD',
  },

  counterValue: {
    fontSize: 28,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'center',
  },

  buttonIcon: {
    width: 24,
    height: 24,
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

  buttonText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1001,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
    justifyContent: 'center',
  },

  modalButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#666666',
  },

  modalButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },

  counterButtonText: {
    fontSize: 30,
    color: '#000000',
    fontWeight: 'bold',
    lineHeight: 30,
  },

  expandButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    position: 'absolute',
    right: 20,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
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

  divider: {
    height: 2,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#999',
    marginVertical: 15,
    marginHorizontal: 20,
  },
});

export default MatchScreen;

