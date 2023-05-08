import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import OrderModule from "../screens/orderModule";
import MapModule from "../screens/mapModule";
import NotificationModule from "../screens/notificationModule";
import ProfileModule from "../screens/accountProfileModule";
import customInput from "../shared/customInput";
import { NotificationContext } from '../shared/NotificationContext'
import notificationModule from "../screens/notificationModule";
import { FontAwesome } from "@expo/vector-icons";

import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, {useState, useEffect, useContext} from "react";
import LoginModule from "../screens/loginModule";


//import { Badge } from "react-native-elements";
//import { Button } from '@rneui/base';



const Tab = createBottomTabNavigator();
function MyTabsNavigator() {
  const Stack = createNativeStackNavigator();
 

  function OrderStack() {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Orders" component={OrderModule} />
      </Stack.Navigator>
    );
  }

  function StationStack() {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
      </Stack.Navigator>
    );
  }
  function MapStack() {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Maps" component={MapModule} />
      </Stack.Navigator>
    );
  }

  function ProfileStack() {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Profiles" component={ProfileModule} />
      </Stack.Navigator>
    );
  }
  
  
  // const [unreadCount, setUnreadCount] = useState(0);
  const { unreadCount, updateUnreadCount } = useContext(NotificationContext);
  console.log("unreadCount:", unreadCount);
  

  return (
    <Tab.Navigator
      initialRouteName="Map"
      independent={true}
      tabBarVisible={true}
      screenOptions={({ route }) => ({
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, size, color }) => {
          let iconName;
          if (route.name === "Order") {
            //  iconName ='first-order';
            iconName = "reorder";
            // <Image source={require('../assets/purchase-order.png')}/>
            size = focused ? 30 : 19;
            color = focused ? "white" : "black";
          } else if (route.name === "Map") {
            //iconName ='map-marked-alt';
            iconName = "map";
            size = focused ? 30 : 19;
            color = focused ? "white" : "black";
          } else if (route.name === "Notification") {
            iconName = "bell";

            size = focused ? 30 : 19;
            color = focused ? "white" : "black";
          } else if (route.name === "Profile") {
            iconName = "user-circle";
            size = focused ? 30 : 19;
            color = focused ? "white" : "black";
          }
          return <FontAwesome name={iconName} size={size} color={color} />;
        },

        headerShown: false,
        tabBarStyle: {
          bottom: 15,
          left: 10,
          right: 10,
          elevation: 0,
          backgroundColor: `lightseagreen`,
          borderRadius: 15,
          height: 65,
          width: "95%",
          ...style.shadow,
        },
        tabBarLabelStyle: {
          color: "white",
          fontSize: 12,
          paddingBottom: 8,
        },
      })}
    >

      <Tab.Screen
        name="Order"
        component={OrderModule}
        options={{
          tabBarVisible: true,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapModule}
        options={{
          tabBarVisible: true,
        }}
      />

      <Tab.Screen
        name="Notification"
        component={notificationModule}
        options={{
          tabBarBadge: unreadCount === 0 ? null : unreadCount,
          //tabBarBadge: 1
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileModule}
        options={{
          tabBarVisible: true,
        }}
      />

  

    </Tab.Navigator>
  );

}
const style = StyleSheet.create({
  shadow: {
    shadowColor: "#7F5DF0",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
});

export default MyTabsNavigator;