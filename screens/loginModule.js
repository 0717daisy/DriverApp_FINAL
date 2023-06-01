import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  SafeAreaView,
  Alert,
  ImageBackground,
  ToastAndroid,
} from "react-native";
import React, { useState, useEffect, useLayoutEffect } from "react";
import Custombtn from "../shared/customButton";
import { FontAwesome5 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { globalStyles } from "../ForStyle/GlobalStyles";
import { db } from "../firebaseConfig";
import { SHA256 } from "crypto-js";
import {
  ref,
  get,
  query,
  orderByChild,
  equalTo,
  signInWithEmailAndPassword,
  onValue,
  push,
  update,
  set,
} from "firebase/database";

export default function LoginModule({ navigation }) {
  const [empId, setEmpId] = useState("");
  console.log(empId);
  const [empPassword, setEmpPassword] = useState("");
  console.log(empPassword);
  const [employeeData, setEmployeeData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [visible, setVisible] = useState(true);
  const [currentDate, setCurrentDate] = useState("");
  // Define state variable for isLoggingIn flag
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Clear text inputs when user logs out
  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setEmpId("");
      setEmpPassword("");
    });
    return unsubscribe;
  }, [navigation]);

  useLayoutEffect(() => {
    const functionsetCurrentDate = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const hours = String(today.getHours()).padStart(2, "0");
      const minutes = String(today.getMinutes()).padStart(2, "0");
      const seconds = String(today.getSeconds()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      setCurrentDate(formattedDate);

      return formattedDate;
    };

    functionsetCurrentDate();
  }, []);

  const handleLogin = async () => {
    const starCountRef = ref(db, "EMPLOYEES/" + empId);
    console.log("starCountRef:", starCountRef);
  
    try {
      const snapshot = await get(starCountRef);
      const data = snapshot.val();
      const hashedInputPassword = SHA256(empPassword).toString();
      console.log("Hashed input password:", hashedInputPassword);
      console.log("Stored hashed password:", data.emp_pass);
  
      if (data && data.emp_pass === hashedInputPassword) {
        AsyncStorage.setItem("EMPLOYEE_DATA", JSON.stringify(data));
        setEmployeeData(data);
        navigation.navigate("TabNavigator");

        // Only create new entry in DRIVERSLOG if login is successful
        const userLogId = Math.floor(Math.random() * 50000) + 100000;
        const newUserLog = userLogId;
        set(ref(db, `DRIVERSLOG/${newUserLog}`), {
                  dateLogin: currentDate,
                  empId: empId,
                  action: "login",
                })
                  .then(async () => {
                    console.log("New:", newUserLog);
                  })
                  .catch((error) => {
                    console.log("Error:", error);
                  });
      } else {
        console.log("Password does not match");
        alert("Incorrect password");
      }
    } catch (error) {
      console.log("Error retrieving data from Firebase:", error);
      alert("An error occurred. Please try again later.");
    }
  };
  
  // const handleLogin = () => {
  //   const starCountRef = ref(db, "EMPLOYEES/" + empId);
  //   console.log("starCountRef:", starCountRef);
  //   onValue(starCountRef,(snapshot)=>{
  //     const data = snapshot.val();
  //     const hashedInputPassword = SHA256(empPassword).toString();
  //       console.log("Hashed input password:", hashedInputPassword);
  //       console.log("Stored hashed password:", data.emp_pass);
  //       if(data){
  //         if(data.emp_pass === hashedInputPassword){
  //           AsyncStorage.setItem("EMPLOYEE_DATA", JSON.stringify(data));
  //               setEmployeeData(data);
  //               navigation.navigate("TabNavigator");
  //         }
  //         else{
  //           Alert.alert("Warning","No employee found.")
  //         }
  //       }
  //       else{
  //         console.log("No data found");
  //       }
  //   })

  //   // onValue(starCountRef, (snapshot) => {
  //   //   const data = snapshot.val();
  //   //   //console.log("inside", data);
  //   //   const hashedInputPassword = SHA256(empPassword).toString();
  //   //   //console.log("Hashed input password:", hashedInputPassword);
  //   //   //console.log("Stored hashed password:", data.emp_pass);
  //   //   if (data && data.emp_pass === hashedInputPassword) {
  //   //     AsyncStorage.setItem("EMPLOYEE_DATA", JSON.stringify(data));
  //   //     setEmployeeData(data);
  //   //     navigation.navigate("TabNavigator");
  //   //     // Only create new entry in DRIVERSLOG if login is successful
  //   //     const userLogId = Math.floor(Math.random() * 50000) + 100000;
  //   //     const newUserLog = userLogId;

  //   //     set(ref(db, `DRIVERSLOG/${newUserLog}`), {
  //   //       dateLogin: currentDate,
  //   //       empId: empId,
  //   //       action: "login",
  //   //     })
  //   //       .then(async () => {
  //   //         console.log("New:", newUserLog);
  //   //       })
  //   //       .catch((error) => {
  //   //         console.log("Error:", error);
  //   //       });
  //   //   } else {
  //   //     console.log("not match");
  //   //     Alert.alert("Warning","Incorrect employee ID or password");
  //   //   }
  //   // });
  // };

  return (
    <SafeAreaView style={globalStyles.safeviewStyle}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}
        >
          <View style={globalStyles.container}>
            <ImageBackground
              source={require("../assets/riders.png")}
              resizeMode="cover"
              style={globalStyles.imagebck}
            >
              {/* our own logo */}
              <Image
                source={require("../assets/logo_dic.png")}
                style={globalStyles.imageStyle}
              />
              <Text style={globalStyles.textStyles}>
                Meet the expectations.{" "}
              </Text>

              <View style={globalStyles.wrapper}>
                {/* <Image
                source={require("../assets/line.png")}
                style={globalStyles.imageStyle1}
              /> */}
                {/* wrapper for driver input */}
                <View style={globalStyles.ViewemailTextInput}>
                  <FontAwesome5
                    name="user-ninja"
                    size={23}
                    color="white"
                    style={globalStyles.login_Email_Icon}
                  />
                  <TextInput
                    placeholder="ID Number"
                    value={empId}
                    onChangeText={(text) => setEmpId(text)}
                    placeholderTextColor="white"
                    style={globalStyles.login_Email_textInput}
                  />
                </View>

                {/* wrapper for password input */}
                <View style={globalStyles.ViewemailTextInput}>
                  <FontAwesome5
                    name="lock"
                    size={23}
                    color="white"
                    style={globalStyles.login_Email_Icon}
                  />
                  <TextInput
                    placeholder="Password"
                    value={empPassword}
                    secureTextEntry={visible}
                    onChangeText={(text) => setEmpPassword(text)}
                    placeholderTextColor="white"
                    style={globalStyles.login_Email_textInput}
                  />
                  <TouchableOpacity
                    style={globalStyles.btnClickEye}
                    onPress={() => {
                      setVisible(!visible);
                      setShowPassword(!showPassword);
                    }}
                  >
                    <Ionicons
                      name={showPassword === false ? "eye" : "eye-off"}
                      size={23}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>

                {/*login btn */}

                <Custombtn text="Login" onPress={handleLogin} />
              </View>
            </ImageBackground>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </SafeAreaView>
  );
}
