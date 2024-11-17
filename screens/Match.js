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

const MatchScreen = props => {
  const { navigation, route } = props;

  const [autoSpeaker, setAutoSpeaker] = useState(0);
  const [autoAmp, setAutoAmp] = useState(0);

  const [teleOpSpeaker, setTeleOpSpeaker] = useState(0);
  const [teleOpAmp, setTeleOpAmp] = useState(0);

  const [trapNotes, setTrapNotes] = useState(0);
  const [stashNotes, setStashNotes] = useState(0);

  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [commentValue, setCommentValue] = useState('');

  const [isInitialized, setIsInitialized] = useState(false);

  const [isAutoExpanded, setIsAutoExpanded] = useState(true);
  const [isTeleOpExpanded, setIsTeleOpExpanded] = useState(false);

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

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={styles.mainContent}>
          <Text style={styles.teamHeader}>Team {route.params.teamNum}</Text>

          {/* Auto Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
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
                  label="Speaker Notes"
                  value={autoSpeaker}
                  onIncrement={() => updateAutoSpeaker(1)}
                  onDecrement={() => updateAutoSpeaker(-1)}
                />
                <CounterItem
                  label="Amp Notes"
                  value={autoAmp}
                  onIncrement={() => updateAutoAmp(1)}
                  onDecrement={() => updateAutoAmp(-1)}
                />
              </View>
            )}
          </View>

          {/* TeleOp Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
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
                  label="Speaker Notes"
                  value={teleOpSpeaker}
                  onIncrement={() => updateTeleOpSpeaker(1)}
                  onDecrement={() => updateTeleOpSpeaker(-1)}
                />
                <CounterItem
                  label="Amp Notes"
                  value={teleOpAmp}
                  onIncrement={() => updateTeleOpAmp(1)}
                  onDecrement={() => updateTeleOpAmp(-1)}
                />
                <CounterItem
                  label="Stashed Notes"
                  value={stashNotes}
                  onIncrement={() => updateStashNotes(1)}
                  onDecrement={() => updateStashNotes(-1)}
                />
                <CounterItem
                  label="Trap Notes"
                  value={trapNotes}
                  onIncrement={() => updateTrapNotes(1)}
                  onDecrement={() => updateTrapNotes(-1)}
                />
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
  
      currData += `${autoAmp},${autoSpeaker},${teleOpAmp},${teleOpSpeaker},${stashNotes},${trapNotes},${
        finalComment === `` ? 0 : `"${finalComment}"`
      }`;
  
      await FileSystem.writeAsStringAsync(csvURI, currData);
      console.log(await FileSystem.readAsStringAsync(csvURI));
  
      await Clipboard.setStringAsync(currData);
  
      // const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      
      // if (status === "granted") {
      //   console.log(csvURI);
      //   await FileSystem.writeAsStringAsync(csvURI, currData, { encoding: FileSystem.EncodingType.UTF8 });
      //   //console.log(await FileSystem.readAsStringAsync(csvURI));
      //   const asset = await MediaLibrary.createAssetAsync(csvURI)
      //   await MediaLibrary.createAlbumAsync("Download", asset, false)
      // }
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
}

// Counter component for reusability
const CounterItem = ({ label, value, onIncrement, onDecrement }) => (
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

  teamHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
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

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  sectionContent: {
    padding: 20,
  },

  counterContainer: {
    marginBottom: 20,
  },

  counterLabel: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
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
    fontSize: 24,
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
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
  },
});

export default MatchScreen;

