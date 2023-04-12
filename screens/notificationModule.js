import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import PushNotification from '../shared/pushNotification';

export default function notificationModule() {
  const { notification } = PushNotification();

  return (
    <View>
      {notification && (
        <View>
          <Text>{notification.request.content.title}</Text>
          <Text>{notification.request.content.body}</Text>
        </View>
      )}
      {/* Render other notification-related components here */}
    </View>
  );
}

const styles = StyleSheet.create({})