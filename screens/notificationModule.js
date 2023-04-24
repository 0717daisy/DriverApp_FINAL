import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { db } from "../firebaseConfig";
import { ref, query, orderByChild, equalTo, onValue, update } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {Fontisto} from "@expo/vector-icons";

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    async function fetchNotifications() {
      const employeeData = JSON.parse(await AsyncStorage.getItem('EMPLOYEE_DATA'));
      if (employeeData) {
        const driverId = employeeData.emp_id;
        const notificationsRef = ref(db, "NOTIFICATION/");
        const notificationsQuery = query(notificationsRef, orderByChild("driverId"), equalTo(driverId));
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
                .filter((notification) => notification.receiver === "Driver" );
              setNotifications(NotifInformation);
              setReadNotifications(NotifInformation.filter((notification) => notification.status === "read"));
            }
          },
          (error) => {
            console.error(error);
          }
        );
      }
    }
    fetchNotifications();
  }, []);


const handleNotificationPress = async (notification) => {
  if (notification.status === "unread") {
    const notificationRef = ref(db, `NOTIFICATION/${notification.id}`);
    await update(notificationRef, { status: "read" });
    setReadNotifications([...readNotifications, notification]);
  }
  navigation.navigate('AllStatusScreen');
}


  const handleDeleteNotification = (orderID) => {
    setNotifications(notifications.filter(notification => notification.orderID !== orderID));
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.text1}>Notifications</Text>
      {notifications.map((notification) => (
        <View key={notification.orderID} style={[styles.notification, readNotifications.includes(notification) && styles.readNotification]}>
          <TouchableOpacity onPress={() => handleNotificationPress(notification)}>
            <Text style={[styles.text, notification.status === "unread" && styles.unreadText]}> {notification.notificationDate}</Text>
          </TouchableOpacity>
          <Text style={styles.text}> {notification.body}</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteNotification(notification.orderID)}>
          <Fontisto
                name="trash"
                size={13}
                color="#DFD8C8"
              ></Fontisto>
              <View></View>
          </TouchableOpacity>
          
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightcyan",
    alignItems: 'center',
  },
  notification: {
    marginVertical: 30,
    padding: 20,
    backgroundColor: "#F8E2CF",
    borderRadius: 5,
    elevation: 3,
  },
  readNotification: {
    backgroundColor: "white",
  },
  unreadText: {
    fontWeight: 'bold',
  },
  text: {
    fontSize: 15,
    marginBottom: 5,
  },
  text1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 220,
    marginTop: 50,
    
  },
  deleteButton: {
    backgroundColor: 'red',
    marginTop: 5,
    marginRight:15,
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-end',
    justifyContent: 'space-between',
    position: 'absolute',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
