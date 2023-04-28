import { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { db } from "../firebaseConfig";
import {
  ref,
  query,
  orderByChild,
  equalTo,
  onValue,
  update,
} from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Fontisto } from "@expo/vector-icons";
import moment from "moment";
import { NotificationContext } from '../shared/NotificationContext'

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  //const { unreadCount, setUnreadCount } = useContext(NotificationContext);
  const { unreadCount, updateUnreadCount } = useContext(NotificationContext);

  const navigation = useNavigation();
  //const { unreadCount } = useContext(NotificationContext);

  console.log("unreadCount:", unreadCount);
  useEffect(() => {
    async function fetchNotifications() {
      const employeeData = JSON.parse(
        await AsyncStorage.getItem("EMPLOYEE_DATA")
      );
      if (employeeData) {
        const driverId = employeeData.emp_id;
        const notificationsRef = ref(db, "NOTIFICATION/");
        const notificationsQuery = query(
          notificationsRef,
          orderByChild("driverId"),
          equalTo(driverId)
        );
        onValue(
          notificationsQuery,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              const NotifInformation = Object.keys(data)
                .map((key) => ({
                  id: key,
                  ...data[key],
                }))
                .filter((notification) => notification.receiver === "Driver");
              setNotifications(NotifInformation);
              setReadNotifications(
                NotifInformation.filter(
                  (notification) => notification.status === "read"
                )
              );
              const unreadNotifications = NotifInformation.filter(
                (notification) => notification.status === "unread"
              );
              updateUnreadCount(unreadNotifications.length);
            }
          },
          (error) => {
            console.error(error);
          }
        );
      }
    }
    fetchNotifications();
  
    // Update the current time every minute
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
  
    return () => clearInterval(intervalId);
  }, []);
  
  const handleNotificationPress = async (notification) => {
    if (notification.status === "unread") {
      const notificationRef = ref(db, `NOTIFICATION/${notification.id}`);
      await update(notificationRef, { status: "read" });
      setReadNotifications([...readNotifications, notification]);
      
    }
    console.log("NOTIFI:", notification);
    console.log("NOTIFI:", typeof notification);
    const orderID=notification.orderID;
    console.log("OrderID:", orderID);

    if (notification.orderID) {
      const orderID = notification.orderID;
      console.log("OrderID:", orderID);
      navigation.navigate("All" ,{orderID});
    } else {
      console.log("Notification does not have an orderID property.");
    }
  };

  // const getTimeDifference = (notificationTime) => {
  //   const timeDifference = moment.duration(
  //     currentTime.diff(moment(notificationTime))
  //   );
  //   const days = timeDifference.days();
  //   const hours = timeDifference.hours();
  //   if (days > 0) {
  //     return `${days} day${days > 1 ? "s" : ""} ago`;
  //   } else if (hours > 0) {
  //     return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  //   } else {
  //     return "just now";
  //   }
  // };
  const handleDeleteNotification = (notificationID) => {
    setNotifications(
      notifications.filter((notification) => notification.notificationID !== notificationID)
    );
  
    const deletedNotification = readNotifications.find((notification) => notification.notificationID === notificationID);
    if (deletedNotification) {
      setReadNotifications(readNotifications.filter((notification) => notification.notificationID !== notificationID));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {notifications.length > 0 ? (
        <ScrollView>
          <Text style={styles.text1}>Notifications</Text>
          {notifications
            .sort((a, b) => new Date(b.notificationDate) - new Date(a.notificationDate))
            .map((notification) => (
              <View
                key={notification.notificationID} 
                style={[
                  styles.notification,
                  readNotifications.includes(notification) && styles.readNotification,
                ]}
              >
                <TouchableOpacity onPress={() => handleNotificationPress(notification)}>
                  <Text
                    style={[
                      styles.text,
                      notification.status === "unread" && styles.unreadText,
                    ]}
                  >
                    {moment(notification.notificationDate).format("MMMM Do YYYY, h:mm:ss a")}
                  </Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={require("../assets/storeNoBG.png")}
                      style={styles.image}
                    />
                  </View>
                  <View style={{ top: 5, right: 10, width: 260, alignItems: "center" }}>
                    <Text style={styles.text2}> {notification.body}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteNotification(notification.notificationID)}
                >
                  <Fontisto name="trash" size={13} color="#DFD8C8"></Fontisto>
                </TouchableOpacity>
              </View>
            ))}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.noNotificationText}></Text>
        </View>
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightcyan",
    alignItems: "center",
    
  },
  notification: {
    marginVertical: 10,
    padding: 20,
    backgroundColor: "#F8E2CF",
    //backgroundColor: "red",
    borderRadius: 10,
    elevation: 5,
    height:120,
    //  flexDirection: "row",
    // alignItems: "center",
  },
  readNotification: {
    backgroundColor: "white",
  },
  unreadText: {
    fontWeight: "bold",
  },
  text: {
    fontSize: 15,
    //marginBottom: 15,
    fontWeight: "bold",
    marginLeft: 90,
  },
  text1: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 220,
    marginTop: 50,
  },
  text2: {
    marginLeft: 20,
    marginBottom: 20,
   
  },
  deleteButton: {
    backgroundColor: "black",
    marginTop: 5,
    //marginRight:-10,
    padding: 5,
    borderRadius: 5,
    alignSelf: "flex-end",
    justifyContent: "space-between",
    position: "absolute",
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop:-20,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 20,
  },
  badge: {
    backgroundColor: "red",
    borderRadius: 10,
    padding: 5,
    position: "absolute",
    top: 745,
    right: 130,
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
  },
});
