import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, FlatList } from "react-native";
import { db } from "../firebaseConfig";
import { onValue, ref } from "firebase/database";
import * as Notifications from "expo-notifications";

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);

  // useEffect(() => {
  //   const unsubscribe = Notifications.addNotificationReceivedListener(
  //     (notification) => {
  //       setNotifications((currentNotifications) => [
  //         notification,
  //         ...currentNotifications,
  //       ]);
  //     }
  //   );

  //   return () => {
  //     unsubscribe();
  //   };
  // }, []);

  useEffect(() => {
    const notificationsRef = ref(db, "NOTIFICATION");

    onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const newNotifications = Object.values(data).map((notification) => {
          return {
            request: {
              identifier: notification.orderID.toString(),
              content: {
                
                title: notification.datedateOrderAccepted,
                body: notification.bodyDriver,
              },
            },
          };
        });
        setNotifications((currentNotifications) => [
          ...currentNotifications,
          ...newNotifications,
        ]);
      }
    });

    return () => {
      Notifications.removeAllNotificationListeners();
    };
  }, []);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.notification}>
        <Text style={styles.title}>{item.request.content.title}</Text>
        <Text style={styles.message}>{item.request.content.body}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
     <Text style ={{fontWeight:"bold", fontSize: 20}}> Notifications</Text> 
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.request.identifier}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightcyan",
    marginTop: 40,
  },
  list: {
    padding: 10,
  },
  notification: {
    backgroundColor: "#F8E2CF",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  message: {
    color: "#666",
  },
});
