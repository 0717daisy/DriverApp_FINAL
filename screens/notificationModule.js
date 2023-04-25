import { useEffect, useState } from "react";
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

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const navigation = useNavigation();

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
    navigation.navigate("AllStatusScreen");
  };

  const handleDeleteNotification = (orderID) => {
    setNotifications(
      notifications.filter((notification) => notification.orderID !== orderID)
    );
  };

  const getTimeDifference = (notificationTime) => {
    const timeDifference = moment.duration(
      currentTime.diff(moment(notificationTime))
    );
    const days = timeDifference.days();
    const hours = timeDifference.hours();
    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      return "just now";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.text1}>Notifications</Text>

        {notifications
          .sort((a, b) => {
            console.log("a:", a.notificationDate, "b:", b.notificationDate);
            return new Date(b.notificationDate) - new Date(a.notificationDate);
          }) // sort notifications in descending order
          .map((notification) => (
            <View
              key={notification.orderID}
              style={[
                styles.notification,
                readNotifications.includes(notification) &&
                  styles.readNotification,
              ]}
            >
              <TouchableOpacity
                onPress={() => handleNotificationPress(notification)}
              >
                <Text
                  style={[
                    styles.text,
                    notification.status === "unread" && styles.unreadText,
                  ]}
                >
                  {" "}
                  {moment(notification.notificationDate).format(
                    "MMMM Do YYYY, h:mm:ss a"
                  )}
                </Text>
              </TouchableOpacity>
              <View style={{flexDirection:'row',}}>
              <View style={styles.imageContainer}>
                <Image
                  source={require("../assets/storeNoBG.png")}
                  style={styles.image}
                />
              </View>
              <View style={{top:5,right:10,width:260,  alignItems: "center",}}>
                <Text style={styles.text2}> {notification.body}</Text>

              </View>
              </View>
             
             <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteNotification(notification.orderID)}
              >
                <Fontisto name="trash" size={13} color="#DFD8C8" ></Fontisto>
                
              </TouchableOpacity>

            
             
              {/* <View>
       <Text style={styles.notificationTimeDifference}>{getTimeDifference(notification.notificationDate)}</Text>
      </View> */}
            </View>
          ))}
      </ScrollView>
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
    marginVertical: 20,
    padding: 20,
    backgroundColor: "#F8E2CF",
    borderRadius: 10,
    elevation: 5,
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
    marginBottom: 5,
    fontWeight: "bold",
    marginLeft: 70,
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
    backgroundColor: "red",
    marginTop: 5,
    // marginRight:10,
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
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 20,
  },
});
