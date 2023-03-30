import { StyleSheet, View, Text,TouchableOpacity } from "react-native";
import React from "react";
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import { db } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";
import { FontAwesome5 } from "@expo/vector-icons";
//export const mapRef=React.createRef();
export default function MapModule() {
  const [CustomerInformation, setUserInformation] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  // console.log('tst sa',UserInformation);

  //hook to get the information from database
  useEffect(() => {
    const starCountRef = ref(db, "CUSTOMER/");
    onValue(starCountRef, (snapshot) => {
      // const customerPic=snapshot.val();
      const data = snapshot.val();
      const customerDatainfo = Object.keys(data).map((key) => ({
        id: key,

        ...data[key],
      }));

      console.log("mapScreen", customerDatainfo); //test if successfully fetch the datas in UserInformation
      setUserInformation(customerDatainfo);
    });
  }, []);

  const [location, setLocation] = useState();
  const [errorMsg, setErrorMsg] = useState(null);
  //const [customerLocation, setcustomerLocation] = useState([]);
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const handleMarkerPress = (place) => {
    setSelectedPlace(place);
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
        onMapReady={() => {
          CustomerInformation.forEach((customer) => {
            handleMarkerPress(customer);
          });
        }}
          provider={PROVIDER_GOOGLE}
          mapType="hybrid"
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          minZoomLevel={10}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsBuildings={true}
          zoomEnabled={true}
          showsTraffic={true}
          showsCompass={true}
          showsIndoors={true}
          loadingEnabled={true}
          loadingIndicatorColor={"gray"}
          userInterfaceStyle={"dark"}
          userLocationPriority={"balanced"}
          showsIndoorLevelPicker={true}
          toolbarEnabled={true}
          
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="My Location"
            description="Tribo wakwak"
          ></Marker>
          {CustomerInformation.map((customer) => (
            <Marker
              key={customer.id}
              coordinate={{
                latitude: customer.lattitudeLocation,
                longitude: customer.longitudeLocation,
              }}
              title={customer.customerName}
              description="Test1"
              pinColor={"#87cefa"}
              onPress={() => handleMarkerPress(customer)}
              calloutOffset={{ y: -50 }} // <-- add this line
              calloutVisible={true} // <-- add this line
            >
               <Callout tooltip={true} stopPropagation={true}>
                <TouchableOpacity onPress={
                  () => {
                    navigation.navigate('toMapsProductScreen')
                    console.log("if click")
                  }
                  
                  }>

              
                <View style={styles.callout}>
                  <Text style={styles.calloutText}>
                    {customer.address}
                  </Text>
                </View>
                </TouchableOpacity>
              </Callout>
            
            </Marker>
          ))}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  Text: {
    borderStartColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
    //flex:1
    //...StyleSheet.absoluteFillObject,
  },
  callout: {
    backgroundColor: "lightblue",
   
    borderRadius: 6,
    padding: 5,
    marginBottom:5,
    borderColor: "transparent",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calloutText: {
    fontSize: 16,
    fontWeight: "bold",
    color:'black'
  },
});
