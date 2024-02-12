import React from "react";
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    Button,
    StyleSheet,
    StatusBar,
    Image,
    Platform,
    TouchableOpacity,
    TextInput
} from "react-native";

import { RFPercentage } from "react-native-responsive-fontsize";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as FileSystem from "expo-file-system";

import ScreenTitle from "../components/ScreenTitle";

const PregameScreen = props => {
  const { navigation, route } = props;

  const [toNavigate, setToNavigate] = React.useState("Match");

  const [matchNum, setMatchNum] = React.useState();
  const [teamNum, setTeamNum] = React.useState();

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

  return (
      <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
          <ScreenTitle title="Pre-Game" />
        </View>

        <Text style={styles.header2}>Match #</Text>
        <TextInput
          style={styles.input}
          onChangeText={text => { setMatchNum(parseInt(text)) }}
          value={matchNum ? String(matchNum) : undefined}
          placeholder="Match #..."
          keyboardType="numeric"
        />

        <TouchableOpacity onPress={async () => await findMatch()} >
          <Text style={styles.findMatch}>Find Match</Text>
        </TouchableOpacity>

        { teamNum ? 
        
        <View>
          <Text style={styles.header}>You are scouting Team...</Text>
          <Text style={styles.header}>{teamNum}</Text>
        </View>
        : <Text style={styles.header}>Please enter a valid Match Number and press Find Match</Text>
        }

        <TouchableOpacity
          onPress={async () => {
              await submitPrematch();
              console.log(matchNum);
              if (!matchNum) return;
              if (!teamNum) return;
              navigation.navigate("Match", {
                matchNum: matchNum,
                teamNum: teamNum,
              });
          }}
        >
          <Text style={styles.submit}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )

  async function findMatch() {
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
  
      let csvText = `${team},${match},${tmaKey},${position},${alliance},${scout},`;
  
      let csvURI = `${FileSystem.documentDirectory}match${match}.csv`;
      await FileSystem.writeAsStringAsync(csvURI, csvText);
      console.log(`CSV Text: ${await FileSystem.readAsStringAsync(csvURI)}`);
  }
}

export default PregameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    fontSize: RFPercentage(4),
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    textAlign: "center",
  },

  header2: {
    fontSize: RFPercentage(4),
    left: "5%",
    paddingTop: "2%",
  },

  input: {
    fontSize: 25,
    width: "80%",
    backgroundColor: "#FFBCBC",
    borderRadius: 10,
    marginTop: "5%",
    padding: "2%",
    left: "10%",
    justifyContent: "center",
    textAlign: "center",
    marginBottom: "5%",
  },

  submit: {
    fontSize: 25,
    width: "95%",
    backgroundColor: "#FFD27A",
    borderRadius: 100,
    padding: "2%",
    left: "2.5%",
    justifyContent: "center",
    textAlign: "center",
    marginBottom: "5%",
    marginTop: 30,
  },

  startPosContainer: {
    flexWrap: "wrap",
    flexDirection: "column",
    justifyContent: "center",
    left: "10%",
    marginBottom: "10%",
  },

  findMatch: {
    fontSize: RFPercentage(3),
    width: "50%",
    backgroundColor: "#FFD27A",
    borderRadius: 100,
    padding: "2%",
    left: "25%",
    justifyContent: "center",
    textAlign: "center",
    marginBottom: "5%",
  },
});