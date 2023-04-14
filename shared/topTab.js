import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { StyleSheet, Dimensions, View, Text } from 'react-native';
import AcceptedScreen from '../screens/AcceptedScreen';
import DeliveredScreen from '../screens/DeliveredScreen';
import OutforDelivery from '../screens/OutforDelivery';
import AllStatusScreen from '../screens/AllStatusScreen';

const Tab = createMaterialTopTabNavigator();

const OrderStatusTopTabNavigation = () => {
  

  return (
    <Tab.Navigator
      tabBarOptions={{
        labelStyle: styles.labelStyle,
        style: styles.tabBarStyle,
        indicatorStyle: styles.indicatorStyle,
        scrollEnabled: true,
        activeTintColor: 'red', // Set the color for active tab label
      }}
      tabBar={({ state, descriptors, navigation }) => (
        <View style={styles.customTabBarStyle}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <View style={styles.tabItemStyle} key={index}>
                <Text
                  style={[
                    styles.labelStyle,
                    { color: isFocused ? 'white' : 'black' },
                  ]}
                  onPress={onPress}
                  onLongPress={onLongPress}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    >
      <Tab.Screen name="All" component={AllStatusScreen} />
      <Tab.Screen name="Accepted" component={AcceptedScreen} />
      <Tab.Screen name="Out for Delivery" component={OutforDelivery} />
      <Tab.Screen name="Delivered" component={DeliveredScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  labelStyle: {
    fontSize: 17,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    color: 'black', // Set the default color for tab label
  },
  tabBarStyle: {
    backgroundColor: 'white',
    height: 70,
  },
  indicatorStyle: {
    backgroundColor: "blue",
    height: 3,
  },
  customTabBarStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: 'deepskyblue',
    marginTop: 40,
    borderRadius:15,
  },
  tabItemStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OrderStatusTopTabNavigation;
