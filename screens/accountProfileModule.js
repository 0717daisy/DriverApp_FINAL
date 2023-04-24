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
  Alert,
  Button,
  BackHandler,
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
import { ref, update, set } from "firebase/database";
import firebase from "firebase/compat";
import { db } from "../firebaseConfig";

export default function AccountProfileModule({ navigation }) {
  const [text, onChangeText] = React.useState("");
  const [number, onChangeNumber] = React.useState("");
  const [oldPassword, setOldPassword] = useState("");
  console.log("oldPassword:", oldPassword);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
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
  console.log("employeeData:", employeeData);

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
    // Define a regex pattern for a strong password
    const strongPasswordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  
    if (passwords.oldPassword === employeeData.emp_pass) {
      if (passwords.newPassword === passwords.confirmPassword) {
        if (strongPasswordPattern.test(passwords.newPassword)) { // Check if the new password matches the strong password pattern
          const employeeRef = ref(db, `EMPLOYEES/${employeeData.emp_id}`);
          update(employeeRef, { emp_pass: passwords.newPassword })
            .then(() => {
              Alert.alert("Success", "Password updated successfully");
              setPasswords({
                ...passwords,
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
            })
            .catch((error) => {
              console.log(error);
              Alert.alert(
                "Error",
                "Failed to update password. Please try again."
              );
            });
        } else {
          Alert.alert("Error", "New password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one digit, and one special character (!@#$%^&*()_+-=[]{};':\"\\|,.<>/?).");
        }
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

  //available or not available function
  const updateEmployeeStatus = (empId, status) => {
    const employeeRef = ref(db, `EMPLOYEES/${empId}`);
    update(employeeRef, {
      emp_availability: status,
    })
      .then(() => console.log("Employee status updated"))
      .catch((error) => console.log(error));
  };

  const onPress = (status) => {
    if (employeeData) {
      updateEmployeeStatus(employeeData.emp_id, status);
    }
  };


  const handleLogout = async () => {
    try {
      // Get the currently logged-in employee ID
      const currentUser = await AsyncStorage.getItem("EMPLOYEE_DATA");
      const empId = JSON.parse(currentUser).emp_id; // assuming emp_id is the property name for employee ID
  
      await AsyncStorage.multiRemove(["customerData", "email", "password"]);
      // navigate to login screen or any other screen
  
      // Get the current date and time
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const hours = String(today.getHours()).padStart(2, "0");
      const minutes = String(today.getMinutes()).padStart(2, "0");
      const seconds = String(today.getSeconds()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
      // Save the user log data
      const newUserLogId = Math.floor(Math.random() * 50000) + 100000;
      const newUserLog = newUserLogId;

      set(ref(db, `DRIVERSLOG/${newUserLog}`), {
        dateLogout: formattedDate, // Set the logout date and time
        empId: empId, // Set the current logged-in employee ID
      })
        .then(async () => {
          console.log("New:", newUserLog);
          Alert.alert("", "Do you want to logout?", [
            {
              text: "Yes",
              onPress: () => {
                navigation.navigate("Login", { email: "", password: "" });
              },
            },
            {
              text: "cancel",
            },
          ]);
        })
        .catch((error) => {
          console.log("Errroorrrr:", error);
        });
    } catch (error) {
      console.log(error);
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
            <TouchableOpacity onPress={handleLogout}>
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
              onPress={() => togglePasswordVisibility("showOldPassword")}
            >
              {getVisibilityIcon("showOldPassword")}
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
              onPress={() => togglePasswordVisibility("showNewPassword")}
            >
              {getVisibilityIcon("showNewPassword")}
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
              onPress={() => togglePasswordVisibility("showConfirmPassword")}
            >
              {getVisibilityIcon("showConfirmPassword")}
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={handleChangePassword}>
              <Text style={styles.txt}>Update Password</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text>No customer data found</Text>
        )}

        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={() => onPress("Available")}>
            <View style={styles.btn1}>
              <Text style={styles.txt}> Available</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onPress("Unavailable")}>
            <View style={styles.btn2}>
              <Text style={styles.txt}>Unavailable</Text>
            </View>
          </TouchableOpacity>
        </View>
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
    justifyContent: "center",
  },
  btn1: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    backgroundColor: "green",
    borderRadius: 40,
    margin: 10,
    marginLeft: 30,
  },
  btn2: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    backgroundColor: "red",
    borderRadius: 40,
    marginLeft: 160,
    marginTop: 9,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 30,
    marginLeft: 20,
  },
  input: {
    backgroundColor: "white",
    left: 40,
    width: "75%",
    height: 50,
    alignItems: "center",
    borderRadius: 5,
    paddingHorizontal: 10,
    borderColor: "gray",
    marginVertical: 5,
    marginTop: 20,
  },
  visibilityToggle1: {
    position: "absolute",
    right: 75,
    marginTop: 310,
  },
  visibilityToggle2: {
    position: "absolute",
    right: 75,
    marginTop: 380,
  },
  visibilityToggle3: {
    position: "absolute",
    right: 75,
    marginTop: 460,
  },
});
