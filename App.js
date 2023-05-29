import React from "react";
import HomeStack from "./routes/homeStack";
import PushNotification from "./shared/pushNotification";
import { NotificationProvider } from "./shared/NotificationContext";

export default function App() {
  return (
    <>
      <NotificationProvider>
        <HomeStack />
        <PushNotification />
      </NotificationProvider>
    </>
  );
}
