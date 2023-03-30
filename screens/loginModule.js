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
  ImageBackground, ToastAndroid
} from "react-native";
import React, { useState } from "react";
import Custombtn from "../shared/customButton";
import { FontAwesome5 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from "../ForStyle/GlobalStyles";
import { db } from "../firebaseConfig";
import {
  ref,
  get,
  query,
  orderByChild,
  equalTo,
  signInWithEmailAndPassword,
  onValue,
} from "firebase/database";

export default function LoginModule({ navigation, route }) {
  const onPressHandler_toMainPage = () => {
    navigation.navigate("TabNavigator");
  };
  // const [password, setPassword] = useState('');
 
  // State variables for emp_id and password
  const [empId, setEmpId] = useState("");
  console.log("ID number:", empId);
  const [password, setPassword] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [employeeData, setEmployeeData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [visible, setVisible] = useState(true);

  // function to Login
  // const handleLogin = () => {
  //   console.log("inside the handleLogin", empPassword);
  //   const starCountRef = ref(db, `EMPLOYEES/${empId}`);
  //   onValue(starCountRef, (snapshot) => {
  //     const data = snapshot.val();
  //     console.log("inside", data);
  //     if (data && data.emp_pass === empPassword) {
  //       AsyncStorage.setItem('employeeData', JSON.stringify(data));
  //       setEmployeeData(data);
  //       console.log("123123", data);
  //       alert("Successfully login! \nPlease update your password.");
  //       AsyncStorage.removeItem('employeeData');
  //       navigation.navigate("TabNavigator");
  //       // Render the employee data in your React Native component
  //     } else {
  //       alert("Employee not found");
  //       // Display an error message in your React Native component
  //     }
  //   });
  // };
  const handleLogin = () => {
    console.log("inside the handleLogin", empPassword);
    const starCountRef = ref(db, `EMPLOYEES/${empId}`);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      console.log("inside", data);
      if (data && data.emp_pass === empPassword) {
        AsyncStorage.setItem('EMPLOYEE_DATA', JSON.stringify(data));
        setEmployeeData(data);
        navigation.navigate("TabNavigator");
      } else {
        alert("Employee not found");
      }
    });
  };

  const handleChangePassword = () => {
    if (oldPassword === employeeData.emp_pass) {
      if (newPassword === confirmPassword) {
        const employeeRef = ref(db, `EMPLOYEES/${employeeData.emp_id}`);
        update(employeeRef, { emp_pass: newPassword })
          .then(() => {
            Alert.alert("Success", "Password updated successfully");
          })
          .catch((error) => {
            console.log(error);
            Alert.alert("Error", "Failed to update password. Please try again.");
          });
      } else {
        Alert.alert("Error", "New password and confirm password do not match.");
      }
    } else {
      Alert.alert("Error", "Old password is incorrect. Please try again.");
    }
  };
  

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
              source={require("../assets/rider.jpg")}
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
                    name="user-ninja"
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
