import { useState, useEffect } from "react";
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
import { MaterialIcons } from '@expo/vector-icons';

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

  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [commentValue, setCommentValue] = useState('');

  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [questionValue, setQuestionValue] = useState('');

  const [isAutoExpanded, setIsAutoExpanded] = useState(true);
  const [isTeleOpExpanded, setIsTeleOpExpanded] = useState(true);

  const [driverStation, setDriverStation] = useState(null);

  const [removedAlgae, setRemovedAlgae] = useState(false);

  useEffect(() => {
    const loadExistingMatchData = async () => {
      if (route.params?.matchNum) {
        const csvURI = `${FileSystem.documentDirectory}match${route.params.matchNum}.csv`;
        
        try {
          // First check if file exists
          const fileInfo = await FileSystem.getInfoAsync(csvURI);
          if (!fileInfo.exists) {
            console.log("No existing data file found for match", route.params.matchNum);
            return;
          }

          const data = await FileSystem.readAsStringAsync(csvURI);
          console.log("Raw data loaded:", data);
          
          // Split the CSV properly handling quoted values
          const values = data.split(',').map(val => val.replace(/^"|"$/g, ''));
          console.log("Split values:", values);
          
          // Only proceed if we have the minimum required values (team info + scoring)
          if (values.length >= 19) {
            // Auto values (indices 7-12)
            const autoValues = values.slice(7, 13).map(v => parseInt(v));
            console.log("Auto values:", autoValues);
            
            if (!autoValues.some(isNaN)) {
              setAutoL1Coral(autoValues[0]);
              setAutoL2Coral(autoValues[1]);
              setAutoL3Coral(autoValues[2]);
              setAutoL4Coral(autoValues[3]);
              setAutoAlgaeProcessor(autoValues[4]);
              setAutoAlgaeNet(autoValues[5]);
            }

            // TeleOp values (indices 13-18)
            const teleOpValues = values.slice(13, 19).map(v => parseInt(v));
            console.log("TeleOp values:", teleOpValues);
            
            if (!teleOpValues.some(isNaN)) {
              setTeleOpL1Coral(teleOpValues[0]);
              setTeleOpL2Coral(teleOpValues[1]);
              setTeleOpL3Coral(teleOpValues[2]);
              setTeleOpL4Coral(teleOpValues[3]);
              setTeleOpAlgaeProcessor(teleOpValues[4]);
              setTeleOpAlgaeNet(teleOpValues[5]);
            }

            // Removed Algae (index 19)
            if (values.length > 19) {
              setRemovedAlgae(values[19] === '1');
            }

            // Comments & Questions (indices 20-21)
            if (values.length > 20) {
              setCommentValue(values[20] || '');
            }
            if (values.length > 21) {
              setQuestionValue(values[21] || '');
            }
            console.log("Comment value:", commentValue);
            console.log("Question value:", questionValue);

            console.log("Successfully loaded all match data");
          } else {
            console.log("Not enough values in CSV. Expected >= 19, got:", values.length);
          }
        } catch (error) {
          console.error('Error loading match data:', error);
          console.error('Error details:', error.message);
        }
      }
    };

    loadExistingMatchData();
  }, [route.params?.matchNum]);

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
              try {
                // Save all match data before going back
                const match = route.params.matchNum;
                const csvURI = `${FileSystem.documentDirectory}match${match}.csv`;
                let currData = await FileSystem.readAsStringAsync(csvURI);
                
                // Split and get team info (first 7 fields)
                const values = currData.split(',');
                const teamInfo = values.slice(0, 7).join(',');
                
                // Build the new data string with proper formatting
                const newData = [
                  teamInfo,
                  autoL1Coral,
                  autoL2Coral,
                  autoL3Coral,
                  autoL4Coral,
                  autoAlgaeProcessor,
                  autoAlgaeNet,
                  teleOpL1Coral,
                  teleOpL2Coral,
                  teleOpL3Coral,
                  teleOpL4Coral,
                  teleOpAlgaeProcessor,
                  teleOpAlgaeNet,
                  removedAlgae ? 1 : 0,
                  `"${commentValue || ''}"`,
                  `"${questionValue || ''}"`,
                ].join(',');
                
                await FileSystem.writeAsStringAsync(csvURI, newData);
                console.log("Saved data:", newData);
                
                navigation.goBack();
              } catch (error) {
                console.error("Error saving data:", error);
              }
            }}
          >
            <Text style={styles.backButtonText}>⬅</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Match {route.params.matchNum}</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.questionButton}
              onPress={() => setIsQuestionModalVisible(true)}
            >
              <MaterialIcons name="help" size={30} color="#FFD700" />
            </TouchableOpacity>
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
                  label="L4 Coral (High)"
                  value={autoL4Coral}
                  onIncrement={() => updateStat(1, autoL4Coral, setAutoL4Coral)}
                  onDecrement={() => updateStat(-1, autoL4Coral, setAutoL4Coral)}
                />
                <CounterItem
                  label="L3 Coral (Middle)"
                  value={autoL3Coral}
                  onIncrement={() => updateStat(1, autoL3Coral, setAutoL3Coral)}
                  onDecrement={() => updateStat(-1, autoL3Coral, setAutoL3Coral)}
                />
                <CounterItem
                  label="L2 Coral (Low)"
                  value={autoL2Coral}
                  onIncrement={() => updateStat(1, autoL2Coral, setAutoL2Coral)}
                  onDecrement={() => updateStat(-1, autoL2Coral, setAutoL2Coral)}
                />
                <CounterItem
                  label="L1 Coral (Trough)"
                  value={autoL1Coral}
                  onIncrement={() => updateStat(1, autoL1Coral, setAutoL1Coral)}
                  onDecrement={() => updateStat(-1, autoL1Coral, setAutoL1Coral)}
                  showDivider={true}
                />
                <CounterItem
                  label="Algae Net"
                  value={autoAlgaeNet}
                  onIncrement={() => updateStat(1, autoAlgaeNet, setAutoAlgaeNet)}
                  onDecrement={() => updateStat(-1, autoAlgaeNet, setAutoAlgaeNet)}
                />
                <CounterItem
                  label="Algae Processor"
                  value={autoAlgaeProcessor}
                  onIncrement={() => updateStat(1, autoAlgaeProcessor, setAutoAlgaeProcessor)}
                  onDecrement={() => updateStat(-1, autoAlgaeProcessor, setAutoAlgaeProcessor)}
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
                  label="L4 Coral (High)"
                  value={teleOpL4Coral}
                  onIncrement={() => updateStat(1, teleOpL4Coral, setTeleOpL4Coral)}
                  onDecrement={() => updateStat(-1, teleOpL4Coral, setTeleOpL4Coral)}
                />
                <CounterItem
                  label="L3 Coral (Middle)"
                  value={teleOpL3Coral}
                  onIncrement={() => updateStat(1, teleOpL3Coral, setTeleOpL3Coral)}
                  onDecrement={() => updateStat(-1, teleOpL3Coral, setTeleOpL3Coral)}
                />
                <CounterItem
                  label="L2 Coral (Low)"
                  value={teleOpL2Coral}
                  onIncrement={() => updateStat(1, teleOpL2Coral, setTeleOpL2Coral)}
                  onDecrement={() => updateStat(-1, teleOpL2Coral, setTeleOpL2Coral)}
                />
                <CounterItem
                  label="L1 Coral (Trough)"
                  value={teleOpL1Coral}
                  onIncrement={() => updateStat(1, teleOpL1Coral, setTeleOpL1Coral)}
                  onDecrement={() => updateStat(-1, teleOpL1Coral, setTeleOpL1Coral)}
                  showDivider={true}
                />
                <CounterItem
                  label="Algae Net"
                  value={teleOpAlgaeNet}
                  onIncrement={() => updateStat(1, teleOpAlgaeNet, setTeleOpAlgaeNet)}
                  onDecrement={() => updateStat(-1, teleOpAlgaeNet, setTeleOpAlgaeNet)}
                />
                <CounterItem
                  label="Algae Processor"
                  value={teleOpAlgaeProcessor}
                  onIncrement={() => updateStat(1, teleOpAlgaeProcessor, setTeleOpAlgaeProcessor)}
                  onDecrement={() => updateStat(-1, teleOpAlgaeProcessor, setTeleOpAlgaeProcessor)}
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
                  placeholder={"Enter match comments..."}
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

      {/* Question Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isQuestionModalVisible}
        onRequestClose={() => setIsQuestionModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Questions/Clarifications {questionValue}</Text>
                <TextInput
                  style={styles.modalInput}
                  multiline
                  value={questionValue}
                  onChangeText={setQuestionValue}
                  placeholder="Enter questions or clarifications..."
                  placeholderTextColor="rgba(255, 215, 0, 0.5)"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton, { flex: 1 }]}
                    onPress={() => setIsQuestionModalVisible(false)}
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
    try {
      const match = route.params.matchNum;
      const csvURI = `${FileSystem.documentDirectory}match${match}.csv`;
      let currData = await FileSystem.readAsStringAsync(csvURI);
      
      // Split and get team info (first 7 fields)
      const values = currData.split(',');
      const teamInfo = values.slice(0, 7).join(',');
      
      // Build the new data string with proper formatting
      const newData = [
        teamInfo,
        autoL1Coral,
        autoL2Coral,
        autoL3Coral,
        autoL4Coral,
        autoAlgaeProcessor,
        autoAlgaeNet,
        teleOpL1Coral,
        teleOpL2Coral,
        teleOpL3Coral,
        teleOpL4Coral,
        teleOpAlgaeProcessor,
        teleOpAlgaeNet,
        removedAlgae ? 1 : 0,
        `"${commentValue || ''}"`,
        `"${questionValue || ''}"`,
      ].join(',');
      
      await FileSystem.writeAsStringAsync(csvURI, newData);
      console.log("Saved data on submit:", newData);
      
      await Clipboard.setStringAsync(newData);
    } catch (error) {
      console.error("Error submitting match:", error);
    }
  }

  async function getDataString() {
    let match = route.params.matchNum;
    let csvURI = `${FileSystem.documentDirectory}match${match}.csv`;
    let dataString = await FileSystem.readAsStringAsync(csvURI);

    console.log(dataString);

    return dataString;
  }

  function updateStat(num, stat, setStat) {
    let target = stat + num;
    if (target >= 0) {
      setStat(target);
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

  backButton: {
    backgroundColor: '#000000',
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 27,
    color: '#FFD700',
    fontWeight: '900',
    lineHeight: 48,
    width: 48,
    textAlign: 'center',
    textAlignVertical: 'center',
  },

  title: {
    flex: 1,
    fontSize: 28,
    fontFamily: 'Cooper-Black',
    color: "#000000",
    textAlign: "center",
  },

  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  questionButton: {
    backgroundColor: '#000000',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  commentButton: {
    backgroundColor: '#000000',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  commentIcon: {
    width: 30,
    height: 30,
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
    width: 80,
    height: 80,
    borderRadius: 40,
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

