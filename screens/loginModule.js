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
import React, { useState, useEffect} from "react";
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
 

  // State variables for emp_id and password
  const [empId, setEmpId] = useState("");
  console.log(empId);
  const [empPassword, setEmpPassword] = useState("");
  console.log(empPassword);
  const [employeeData, setEmployeeData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [visible, setVisible] = useState(true);

  // Clear text inputs when user logs out
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setEmpId('');
      setEmpPassword('');
    });
    return unsubscribe;
  }, [navigation]);

  const handleLogin = () => {
    const starCountRef = ref(db, 'EMPLOYEES/' + empId);
    console.log('starCountRef:',starCountRef);
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
