import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { db} from "../firebaseConfig";
import { ref, query, orderByChild, equalTo, onValue } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function fetchNotifications() {
      const employeeData = JSON.parse(await AsyncStorage.getItem('EMPLOYEE_DATA'));
      console.log("DRIVER:", employeeData);
      if (employeeData) {
        const driverId = employeeData.emp_id;
        console.log("CURRENT DRIVER:", driverId);
        const notificationsRef = ref(db, "NOTIFICATIONTEST");
        console.log("Notif Table:", notificationsRef);
        const notificationsQuery = query(notificationsRef, orderByChild('driverId'), equalTo(driverId));
        onValue(notificationsQuery, (snapshot) => {
          const notificationsData = snapshot.val();
          const newNotifications = [];
          for (const key in notificationsData) {
            if (notificationsData.hasOwnProperty(key)) {
              const notification = notificationsData[key];
              const { orderID, dateOrderAccepted, body } = notification;
              newNotifications.push({ orderID, dateOrderAccepted,body });
            }
          }
          setNotifications(newNotifications);
        });
      }
    }
    fetchNotifications();
  }, []);

  const handleDeleteNotification = (orderID) => {
    setNotifications(notifications.filter(notification => notification.orderID !== orderID));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text1}>Notifications</Text>
      {notifications.map((notification) => (
        <View key={notification.orderID} style={styles.notification}>
          {/* <Text style={styles.text}> {notification.dateOrderAccepted}</Text> */}
          <Text style={styles.text}>Order: {notification.orderID}</Text>
          <Text style={styles.text}> {notification.body}</Text>
          {/* <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteNotification(notification.orderID)}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity> */}
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
    backgroundColor: "white",
    borderRadius: 5,
    elevation: 3,
  },
  text: {
    fontSize: 15,
    fontWeight: 'bold',
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
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
