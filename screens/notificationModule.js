// import React, { useState, useEffect } from 'react';
// import { StyleSheet, Text, View, FlatList } from 'react-native';
// import * as Permissions from 'expo-permissions';
// import { Notifications } from 'expo-notifications';


// export default function notificationModule() {

//   const [notifications, setNotifications] = useState([]);

//   useEffect(() => {
//     // Ask for permission to receive notifications
//     getNotificationPermission();

//     // Set up a listener for incoming notifications
//     Notifications.addNotificationReceivedListener(handleNotification);

//     // Fetch any notifications that were received while the app was closed
//     Notifications.getExpoPushTokenAsync()
//       .then(token => fetchNotifications(token))
//       .catch(error => console.log(error));
//   }, []);

//   const getNotificationPermission = async () => {
//     const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);

//     if (status !== 'granted') {
//       alert('You need to enable permissions to receive notifications.');
//     }
//   };

//   const fetchNotifications = async (token) => {
//     const response = await fetch('https://exp.host/--/api/v2/push/getReceipts', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         ids: [token]
//       })
//     });

//     const { data } = await response.json();
//     const notifications = data[0].notifications;

//     setNotifications(notifications);
//   };

//   const handleNotification = (notification) => {
//     // Add the new notification to the list
//     setNotifications(prevNotifications => [notification, ...prevNotifications]);
//   };
//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>Notifications</Text>
//       <FlatList
//         data={notifications}
//         keyExtractor={item => item.request.identifier}
//         renderItem={({ item }) => (
//           <View style={styles.notification}>
//             <Text style={styles.notificationTitle}>{item.request.content.title}</Text>
//             <Text style={styles.notificationBody}>{item.request.content.body}</Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20
//   },
//   heading: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20
//   },
//   notification: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc'
//   },
//   notificationTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 5
//   },
//   notificationBody: {
//     fontSize: 16
//   }
// });
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationScreen() {
  const [pushToken, setPushToken] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('You need to enable push notifications in your device settings.');
      return;
    }

    try {
      // Get the device's push token
      const { data: pushToken } = await Notifications.getExpoPushTokenAsync();
      setPushToken(pushToken);

      // Handle receiving notifications
      Notifications.addNotificationReceivedListener((notification) => {
        // Do something with the notification data
        console.log(notification);
      });

      // Handle tapping on a notification
      Notifications.addNotificationResponseReceivedListener((response) => {
        // Do something with the response data
        console.log(response);
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <SafeAreaView>
    <View>
      {pushToken ? (
        <Text>
          Your device's push token: {pushToken}
        </Text>
      ) : (
        <Text>
          Registering for push notifications...
        </Text>
      )}
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  notificationContainer: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notificationBody: {
    fontSize: 14,
  },
  noNotificationsText: {
    fontSize: 16,
    color: '#888',
  },
});