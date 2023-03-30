import {
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  View,
  StatusBar,
  styleStatusBar,
  TextInput,
  onChangeText,
  TouchableOpacity,
  onPress,
  Modal,
  Alert, Button, BackHandler
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import CustomInput from "../shared/customInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, update } from "firebase/database";
import { db } from "../firebaseConfig";

export default function AccountProfileModule({ navigation }) {
  const [text, onChangeText] = React.useState("");
  const [number, onChangeNumber] = React.useState("");
  const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [passwords, setPasswords] = useState({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
    });

  const onPressHandler_toMainPage = () => {
    navigation.navigate("TabNavigator");
  };
  //Modal codes
  const [showModal, setShowModal] = useState(false);
  const onPressHandlerShowModal = () => {
    setShowModal(true);
  };

  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem("EMPLOYEE_DATA")
      .then((data) => {
        if (data !== null) {
          setEmployeeData(JSON.parse(data));
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Error fetching data: " + error);
      });
  }, []);
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
  const togglePasswordVisibility = (key) => {
    setPasswords({
      ...passwords,
      [key]: !passwords[key],
    });
  };

  const getVisibilityIcon = (key) => {
    if (passwords[key]) {
      return <MaterialIcons name="visibility-off" size={24} color="black" />;
    } else {
      return <MaterialIcons name="visibility" size={24} color="black" />;
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ alignSelf: "center", marginTop: 40 }}>
          <View style={styles.profileImage}>
            <FontAwesome
              name="user-circle"
              size={100}
              // color="#DFD8C8"
            ></FontAwesome>
          </View>
          <View style={styles.out}>
            <TouchableOpacity onPress={onPress}>
              <MaterialIcons
                name="logout"
                size={18}
                color="#DFD8C8"
              ></MaterialIcons>
              <View></View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.text}>
          <Text style={{ fontWeight: "bold", left: 20, marginTop: 25 }}>
            Basic Information
          </Text>
        </View>

        {employeeData !== null ? (
          <View>
            <CustomInput
              placeholder="First Name"
              value={employeeData.emp_firstname}
              onChangeText={(text) =>
                setEmployeeData({ ...employeeData, emp_firstname: text })
              }
            />
            <CustomInput
              placeholder="First Name"
              value={employeeData.emp_lastname}
              onChangeText={(text) =>
                setEmployeeData({ ...employeeData, emp_lastname: text })
              }
            />
            <CustomInput
              placeholder="Contact Number"
              value={employeeData.emp_contactnum}
              onChangeText={(text) =>
                setEmployeeData({ ...employeeData, emp_contactnum: text })
              }
            />
            
            
        <Text style={styles.title}>Change Password</Text>
        <TextInput
        style={styles.input}
        placeholder="Old Password"
        secureTextEntry={!passwords.showOldPassword}
        value={passwords.oldPassword}
        onChangeText={(text) =>
          setPasswords({ ...passwords, oldPassword: text })
        }
      />
      <TouchableOpacity
        style={styles.visibilityToggle1}
        onPress={() => togglePasswordVisibility('showOldPassword')}
      >
        {getVisibilityIcon('showOldPassword')}
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry={!passwords.showNewPassword}
        value={passwords.newPassword}
        onChangeText={(text) =>
          setPasswords({ ...passwords, newPassword: text })
        }
      />
      <TouchableOpacity
        style={styles.visibilityToggle2}
        onPress={() => togglePasswordVisibility('showNewPassword')}
      >
        {getVisibilityIcon('showNewPassword')}
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry={!passwords.showConfirmPassword}
        value={passwords.confirmPassword}
        onChangeText={(text) =>
          setPasswords({ ...passwords, confirmPassword: text })
        }
      />
      <TouchableOpacity
        style={styles.visibilityToggle3}
        onPress={() => togglePasswordVisibility('showConfirmPassword')}
      >
        {getVisibilityIcon('showConfirmPassword')}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btn}
         onPress={handleChangePassword}
>
      <Text style={styles.txt}>Update Password</Text>
       </TouchableOpacity>
      </View>
            
        ) : (
          <Text>No customer data found</Text>
        )}

        {/* 
        <TouchableOpacity onPress={onPress}>
          <View style={styles.btn}>
            <Text style={styles.txt}> UPDATE</Text>
          </View>
        </TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightcyan",
  },

  image: {
    flex: 1,
    height: undefined,
    width: undefined,
  },

  profileImage: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 200,
    //overflow: "hidden",
    // backgroundColor:'skyblue'
  },

  out: {
    backgroundColor: "#41444B",
    position: "absolute",
    top: 40,
    width: 40,
    height: 40,
    marginLeft: 150,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 5,
    backgroundColor: "dodgerblue",
    marginTop: 20,
    alignItems: "center",
    width: 200,
    height: 45,
    left: 100,
    justifyContent: "center",
  },
  txt: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 30,
    marginLeft: 20,
  },
  input: {
    backgroundColor: 'white',
    left: 40,
    width: '75%',
    height: 50,
    alignItems:"center",
    borderRadius: 5,
    paddingHorizontal: 10,
    borderColor: "gray",
    marginVertical: 5,
    marginTop: 20,
  },
  visibilityToggle1: {
    position:'absolute',
    right:75,
    marginTop: 310,
  },
  visibilityToggle2: {
    position:'absolute',
    right:75,
    marginTop: 380,
  },
  visibilityToggle3: {
    position:'absolute',
    right:75,
    marginTop: 460,
  }
});
