// import React, { createContext, useState , useContext} from 'react';

// export const NotificationContext = createContext();

// export const NotificationProvider = ({ children }) => {
//   //const { unreadCount, setUnreadCount } = useContext(NotificationContext);
//   console.log("JJJJ",unreadCount);

//   const updateUnreadCount = (count) => {
//     setUnreadCount(count);
//   };

//   return (
//     <NotificationContext.Provider value={{ unreadCount, updateUnreadCount }}>
//       {children}
//     </NotificationContext.Provider>
//   );
// };
// import React, { createContext, useState } from 'react';

// export const NotificationContext = createContext();

// export const NotificationProvider = ({ children }) => {
//   const [unreadCount, setUnreadCount] = useState(0);

//   const updateUnreadCount = (count) => {
//     setUnreadCount(count);
//   };

//   return (
//     <NotificationContext.Provider value={{ unreadCount, updateUnreadCount }}>
//       {children}
//     </NotificationContext.Provider>
//   );
// };

import React, { useState } from 'react';

export const NotificationContext = React.createContext();

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const updateUnreadCount = (count) => {
    setUnreadCount(count);
  };

  const value = {
    unreadCount,
    updateUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};


// import { createContext, useState } from "react";

// export const NotificationContext = createContext();

// export const NotificationProvider = ({ children }) => {
//   const [unreadCount, setUnreadCount] = useState(0);

//   const updateUnreadCount = (count) => {
//     setUnreadCount(count);
//   };

//   return (
//     <NotificationContext.Provider value={{ unreadCount, updateUnreadCount }}>
//       {children}
//     </NotificationContext.Provider>
//   );
// };
// import React, { createContext, useState } from 'react';

// export const NotificationContext = React.createContext({
//     notifications: [],
//     updateNotifications: () => {},
//   });
  
//   export const NotificationProvider = ({ children, updateUnreadCount }) => {
//     const [notifications, setNotifications] = useState([]);
  
//     const addNotification = (notification) => {
//       setNotifications((notifications) => [...notifications, notification]);
//       updateUnreadCount((count) => count + 1); // update unreadCount when a new notification is added
//     };
  
//     const removeNotification = (notification) => {
//       setNotifications((notifications) =>
//         notifications.filter((n) => n.id !== notification.id)
//       );
//     };
  
//     const updateNotifications = (newNotifications) => {
//       setNotifications(newNotifications);
//     };
  
//     const contextValue = {
//       notifications,
//       addNotification,
//       removeNotification,
//       updateNotifications,
//     };
  
//     return (
//       <NotificationContext.Provider value={contextValue}>
//         {children}
//       </NotificationContext.Provider>
//     );
//   };
  
