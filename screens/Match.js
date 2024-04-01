import React from "react";
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
    Dimensions,
    StatusBar
} from "react-native";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

import Checkbox from 'expo-checkbox';

import * as FileSystem from "expo-file-system";
import * as Clipboard from 'expo-clipboard';

import ScreenTitle from "../components/ScreenTitle";
import PullUpArrow from "../components/PullUpArrow";
import DropDownArrow from "../components/DropDownArrow";

const MatchScreen = props => {
  const { navigation, route } = props;

  const [isAutoExpanded, setIsAutoExpanded] = React.useState(true);
  const [isTeleOpExpanded, setIsTeleOpExpanded] = React.useState(false);
  const [isEndgameExpanded, setIsEndgameExpanded] = React.useState(false);

  const [autoSpeaker, setAutoSpeaker] = React.useState(0);
  const [autoAmp, setAutoAmp] = React.useState(0);

  const [teleOpSpeaker, setTeleOpSpeaker] = React.useState(0);
  const [teleOpAmp, setTeleOpAmp] = React.useState(0);

  const [trapNotes, setTrapNotes] = React.useState(0);

  const [stashNotes, setStashNotes] = React.useState(0);

  const [isCommentBoxOpen, setIsCommentBoxOpen] = React.useState(false);
  const [commentValue, setCommentValue] = React.useState(``);

  return (
      <SafeAreaView>
      
          <TouchableOpacity
              onPress={() => handleCommentClick()}
              style={styles.commentIconContainer}
          >
              <Image
              source={require("../assets/images/comment-icon.png")}
              style={styles.commentIcon}
              />
          </TouchableOpacity>

          {isCommentBoxOpen && (
              <View style={styles.commentBox}>
                  <Text style={styles.commentTitle}>Comment</Text>
                  <View style={styles.commentBar}></View>
                  <TextInput
                      style={styles.commentInput}
                      multiline
                      onChangeText={(text) => setCommentValue(text)}
                      value={commentValue}
                  ></TextInput>
              </View>
          )}

          <ScrollView>

              <ScreenTitle title="Match" />

              <Text style={styles.header}>You are scouting Team {route.params.teamNum}</Text>

              <View style={[styles.collapsibleContainer]}>
                  <TouchableOpacity
                      style={[styles.row, isAutoExpanded ? styles.expandedRow : {}]}
                      onPress={() => toggleAutoExpand()}
                  >
                      
                      {isAutoExpanded ? (
                      <PullUpArrow style={styles.arrow} />
                      ) : (
                      <DropDownArrow style={styles.arrow} />
                      )}
                      <Text style={[styles.title, styles.font]}>Autonomous</Text>
                  
                  </TouchableOpacity>
                  
                  {isAutoExpanded && (
                      
                      <View style={styles.child}>
                          
                          <View style={styles.hubInput}>
                              <Text style={styles.text}>
                                  {autoSpeaker} Notes scored in Speaker
                              </Text>
                          <View style={styles.ballButtons}>
                          
                              <TouchableOpacity
                                  style={[styles.roundButton, styles.minusButton]}
                                  onPress={() => updateAutoSpeaker(-1)}
                              >
                                  <Image
                                  source={require("../assets/images/minus-icon.png")}
                                  style={styles.buttonIcon}
                                  />
                              </TouchableOpacity>
                          
                              <TouchableOpacity
                                  style={[styles.roundButton, styles.plusButton]}
                                  onPress={() => updateAutoSpeaker(1)}
                              >
                                  <Image
                                  source={require("../assets/images/plus-icon.png")}
                                  style={styles.buttonIcon}
                                  />
                              </TouchableOpacity>
                          </View>
                          </View>

                      <View style={styles.hubInput}>
                          <Text style={styles.text}>
                              {autoAmp} Notes scored in Amp
                          </Text>
                          
                          <View style={styles.ballButtons}>
                              <TouchableOpacity
                                  style={[styles.roundButton, styles.minusButton]}
                                  onPress={() => updateAutoAmp(-1)}
                              >
                                  <Image
                                  source={require("../assets/images/minus-icon.png")}
                                  style={styles.buttonIcon}
                              />
                              </TouchableOpacity>
                              
                              <TouchableOpacity
                                  style={[styles.roundButton, styles.plusButton]}
                                  onPress={() => updateAutoAmp(1)}
                              >
                                  <Image
                                  source={require("../assets/images/plus-icon.png")}
                                  style={styles.buttonIcon}
                              />
                              </TouchableOpacity>
                          </View>
                      </View>
                      </View>
                  )}
              </View>

              <View style={styles.collapsibleContainer}>
                  <TouchableOpacity
                      style={[styles.row, isTeleOpExpanded ? styles.expandedRow : {}]}
                      onPress={() => toggleTeleOpExpand()}
                  >
                      {isTeleOpExpanded ? (
                      <PullUpArrow style={styles.arrow} />
                      ) : (
                      <DropDownArrow style={styles.arrow} />
                      )}
                      <Text style={[styles.title, styles.font]}>Tele-Op</Text>
                  </TouchableOpacity>
                  {isTeleOpExpanded && (
                      <View style={styles.child}>
                        <View style={styles.hubInput}>
                          <Text style={styles.text}>
                          {teleOpSpeaker} Notes scored in Speaker
                          </Text>
                          <View style={styles.ballButtons}>
                          <TouchableOpacity
                              style={[styles.roundButton, styles.minusButton]}
                              onPress={() => updateTeleOpSpeaker(-1)}
                          >
                              <Image
                              source={require("../assets/images/minus-icon.png")}
                              style={styles.buttonIcon}
                              />
                          </TouchableOpacity>
                          <TouchableOpacity
                              style={[styles.roundButton, styles.plusButton]}
                              onPress={() => updateTeleOpSpeaker(1)}
                          >
                              <Image
                              source={require("../assets/images/plus-icon.png")}
                              style={styles.buttonIcon}
                              />
                          </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.hubInput}>
                          <Text style={styles.text}>
                            {teleOpAmp} Notes scored in Amp
                          </Text>
                          <View style={styles.ballButtons}>
                            <TouchableOpacity
                                style={[styles.roundButton, styles.minusButton]}
                                onPress={() => updateTeleOpAmp(-1)}
                            >
                                <Image
                                source={require("../assets/images/minus-icon.png")}
                                style={styles.buttonIcon}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.roundButton, styles.plusButton]}
                                onPress={() => updateTeleOpAmp(1)}
                            >
                                <Image
                                source={require("../assets/images/plus-icon.png")}
                                style={styles.buttonIcon}
                                />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.hubInput}>
                          <Text style={styles.text}>
                            {stashNotes} Notes Stashed
                          </Text>
                          <View style={styles.ballButtons}>
                            <TouchableOpacity
                                style={[styles.roundButton, styles.minusButton]}
                                onPress={() => updateStashNotes(-1)}
                            >
                                <Image
                                source={require("../assets/images/minus-icon.png")}
                                style={styles.buttonIcon}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.roundButton, styles.plusButton]}
                                onPress={() => updateStashNotes(1)}
                            >
                                <Image
                                source={require("../assets/images/plus-icon.png")}
                                style={styles.buttonIcon}
                                />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.hubInput}>
                              <Text style={styles.text}>
                                {trapNotes} Notes scored in Trap
                              </Text>
                              <View style={styles.ballButtons}>
                                <TouchableOpacity
                                    style={[styles.roundButton, styles.minusButton]}
                                    onPress={() => updateTrapNotes(-1)}
                                >
                                    <Image
                                    source={require("../assets/images/minus-icon.png")}
                                    style={styles.buttonIcon}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.roundButton, styles.plusButton]}
                                    onPress={() => updateTrapNotes(1)}
                                >
                                    <Image
                                    source={require("../assets/images/plus-icon.png")}
                                    style={styles.buttonIcon}
                                    />
                                </TouchableOpacity>
                              </View>
                          </View>

                      </View>
                  )}
                  </View>

                  <View>
                      <TouchableOpacity
                          onPress={async () => {
                              await matchSubmit();
                              navigation.navigate("QRCode", {
                                  matchNum: route.params.matchNum,
                                  data: await getDataString(),
                              });
                          }}
                      >
                          <Text style={styles.submit}>Submit</Text>
                      </TouchableOpacity>
                  </View>
          </ScrollView>
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
  
      currData = currData.slice(0, commaIndex + 1);
      console.log(`currData: ${currData}`)
  
      currData += `${autoAmp},${autoSpeaker},${teleOpAmp},${teleOpSpeaker},${stashNotes},${trapNotes},${
        commentValue === `` ? 0 : `"${commentValue}"`
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
  
  function toggleAutoExpand() {
      setIsAutoExpanded((current) => !current);
  }
  
  function toggleTeleOpExpand() {
      setIsTeleOpExpanded((current) => !current);
  }
  
  function toggleEndgameExpand() {
      setIsEndgameExpanded((current) => !current);
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


export default MatchScreen;

const styles = StyleSheet.create({
    font: {

    },

    header: {
        fontSize: RFPercentage(4),
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        marginBottom: 10,
        textAlign: "center",
    },

    commentIconContainer: {
      position: "absolute",
      right: "2.5%",
      top: Platform.OS === "android" ? 35 : 2,
      backgroundColor: "#C4C4C4",
      padding: 13,
      borderRadius: 100,
      zIndex: 1,
    },

    
    commentIcon: {

    },
  
    commentBox: {
      backgroundColor: "white",
      position: "absolute",
      right: "15%",
      top: Platform.OS === "android" ? 80 : 55,
      width: "75%",
      height: "70%",
      zIndex: 999,
      borderWidth: 7,
      borderRadius: 12,
    },
  
    commentTitle: {
      fontSize: RFPercentage(4),
      fontWeight: "bold",
      textAlign: "center",
    },
  
    commentBar: {
      width: "100%",
      height: 7,
      backgroundColor: "black",
    },
  
    commentInput: {
      width: "100%",
      height: "88%",
      padding: 5,
      fontSize: 25,
      fontWeight: "bold",
      textAlignVertical: "top",
    },
  
    collapsibleContainer: {
      borderWidth: 5,
      borderRadius: 25,
      marginHorizontal: 10,
      marginVertical: 5,
    },
  
    row: {
      flex: 1,
      flexDirection: "row",
      padding: 10,
    },
  
    expandedRow: {
      borderBottomWidth: 5,
    },
  
    text: {
      fontSize: 40,
      fontWeight: "bold",
    },
  
    title: {
      fontSize: 40,
      left: "75%",
    },
  
    arrow: {
      marginTop: 5,
      left: "10%",
    },
  
    child: {
      marginVertical: 20,
      flex: 1,
      alignItems: "center",
    },
  
    hubInput: {
      marginVertical: 10,
    },
  
    roundButton: {
      width: 150,
      height: 150,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 100,
    },
  
    minusButton: {
      backgroundColor: "#FFBCBC",
    },
  
    plusButton: {
      backgroundColor: "#C6FFBD",
    },
  
    ballButtons: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginVertical: 20,
    },
  
    buttonIcon: {},
  
    checkbox: {
        width: 100,
        height: 100,
        marginVertical: 25
    },

    checkboxHeader: {

    },
  
    traversalCheckContainer: {
      marginTop: 5,
    },
  
    submit: {
      fontSize: RFPercentage(4),
      width: "95%",
      backgroundColor: "#FFD27A",
      borderRadius: 100,
      padding: "2%",
      left: "2.5%",
      justifyContent: "center",
      textAlign: "center",
      marginTop: "5%",
      marginBottom: "5%",
    },
});

