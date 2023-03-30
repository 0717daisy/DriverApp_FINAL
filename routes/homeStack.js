import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import AppLoading from "expo-app-loading";
import LoginModule from "../screens/loginModule";
import BottomTabNavigator from "../routes/bottomTabNavigation";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
    const [fontLoaded] = useFonts({
        "nunito-light": require("../assets/fonts/Nunito-Light.ttf"),
        "nunito-medium": require("../assets/fonts/Nunito-Medium.ttf"),
        "nunito-reg": require("../assets/fonts/Nunito-Regular.ttf"),
        "nunito-semibold": require("../assets/fonts/Nunito-SemiBold.ttf"),
        "nunito-bold": require("../assets/fonts/Nunito-Bold.ttf"),
      });
      if (!fontLoaded) {
        return <AppLoading />;
      }
      
    
      return (
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
            initialRouteName="Login"
          >
            <Stack.Screen
              name="TabNavigator"
              component={BottomTabNavigator}
              options={{
                tabBarVisible: true,
              }}
            />
    
            <Stack.Screen name="Login" component={LoginModule} />
          </Stack.Navigator>
    
        </NavigationContainer>
      );
}
