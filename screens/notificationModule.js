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
import { NotificationContext } from "../shared/NotificationContext";

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
    const orderID = notification.orderID;
    console.log("OrderID:", orderID);

    if (notification.orderID) {
      const orderID = notification.orderID;
      console.log("OrderID:", orderID);
      navigation.navigate("All", { orderID });
    } else {
      console.log("Notification does not have an orderID property.");
    }
  };

  const handleClickMarkAll = async () => {
    // Update the status of all unread notifications to "read"
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

            // Update the status of all unread notifications to "read"
            unreadNotifications.forEach(async (notification) => {
              const notificationRef = ref(
                db,
                `NOTIFICATION/${notification.id}`
              );
              await update(notificationRef, { status: "read" });
            });

            // Update the unread count in the state to 0
            updateUnreadCount(unreadNotifications.length);
          }
        },
        (error) => {
          console.error(error);
        }
      );
    }
  };

  const handleDeleteNotification = (notificationID) => {
    setNotifications(
      notifications.filter(
        (notification) => notification.notificationID !== notificationID
      )
    );

    const deletedNotification = readNotifications.find(
      (notification) => notification.notificationID === notificationID
    );
    if (deletedNotification) {
      setReadNotifications(
        readNotifications.filter(
          (notification) => notification.notificationID !== notificationID
        )
      );
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {notifications.length > 0 ? (
        <ScrollView>
          <View>
            <Text style={styles.text1}>Notifications</Text>
          </View>
          <View style={{ marginLeft: 220 }}>
            <TouchableOpacity onPress={handleClickMarkAll}>
              <Text style={styles.text3}> Mark all as read</Text>
            </TouchableOpacity>
          </View>
          {notifications
            .sort(
              (a, b) =>
                new Date(b.notificationDate) - new Date(a.notificationDate)
            )
            .map((notification) => (
              <View
                key={notification.notificationID}
                style={[
                  styles.notification,
                  readNotifications.includes(notification) &&
                    styles.readNotification,
                ]}
              >
                <TouchableOpacity
                  onPress={
                    notification.status === "read"
                      ? () => {}
                      : () => handleNotificationPress(notification)
                  }
                >
                  <Text
                    style={[
                      styles.text,
                      notification.status === "unread" && styles.unreadText,
                      notification.status === "read" && styles.readText, // add a conditional style for read notifications
                    ]}
                  >
                    {moment(notification.notificationDate).format(
                      "MMMM Do YYYY, h:mm:ss a"
                    )}
                  </Text>
                </TouchableOpacity>
                <View style={{ flexDirection: "row" }}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={require("../assets/storeNoBG.png")}
                      style={styles.image}
                    />
                  </View>
                  <View
                    style={{
                      top: 5,
                      right: 10,
                      width: 260,
                      alignItems: "center",
                    }}
                  >
                    <Text style={styles.text2}> {notification.body}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    handleDeleteNotification(notification.notificationID)
                  }
                >
                  <Fontisto name="trash" size={13} color="#DFD8C8"></Fontisto>
                </TouchableOpacity>
              </View>
            ))}
        </ScrollView>
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.noNotificationText}>No Notification</Text>
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
    height: 120,
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
  text3: {
    color: "black",
    textDecorationLine: "underline",
    fontWeight: "bold",
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
    marginTop: -20,
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
  noNotificationText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
