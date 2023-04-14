import { useState, useEffect, useRef } from "react";
import { Text, View, Platform, StyleSheet } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { db, auth } from "../firebaseConfig";
import { ref,update } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function pushNotification() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const [customerData, setCustomerData] = useState();
  console.log('2', expoPushToken);
  registerForPushNotificationsAsync(customerData,expoPushToken);
  //const customerID =customerData.cusId;
  // console.log("test",customerID);
  //get the async Storage of the customer Data
  useEffect(() => {
    AsyncStorage.getItem("EMPLOYEE_DATA")
      .then((data) => {
        if (data !== null) {
          setCustomerData(JSON.parse(data));
          //console.log("customer data",data);
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Error fetching data: ", error);
      });
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return <View />;
}

async function registerForPushNotificationsAsync(customerData,expoPushToken) {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
    // Update the user's token in the database
    const user = auth.currentUser;

    if (user && customerData && customerData.emp_id) {
      console.log('Hey expoPushToken:', expoPushToken)
     const customerRef=ref(db,`EMPLOYEES/${customerData.emp_id}`);
     console.log("line 92",customerData.emp_id);
     update(customerRef,{
      deviceToken:expoPushToken
     })
     .then(()=>{
     // alert("Profile Updated Succesfully");
     })
     .catch((error) => {
      console.log(error);
      alert("Error updating customer data: ", error);
    });
    }
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}
