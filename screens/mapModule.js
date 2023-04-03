import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import { db } from "../firebaseConfig";
import {
  ref,
  onValue,
  orderByChild,
  query,
  equalTo,
  child,
  update,
  get,
} from "firebase/database";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
//export const mapRef=React.createRef();
export default function MapModule() {
  
  const [employee, setEmployeeData] = useState([]); //state variable for Employee information, This variable hols the data of Employee
  const [adminIDofEmployee, setAdminIDEmp] = useState(""); // state Variable for holding the Admin ID of which Admin does the driver belongs
  const [employeeId, setEmpID] = useState(""); // state Variable for holding the Employee ID
  console.log("Admin ID of this Employee", adminIDofEmployee);
  const [CustomerInformation, setUserInformation] = useState([]);
  const [orderInformation, setOrderInformation] = useState();
  console.log("Order information-->", orderInformation);

  //AsyncStorage to get the data of EMPLOYEE from login screen
  useEffect(() => {
    AsyncStorage.getItem("EMPLOYEE_DATA")
      .then((data) => {
        if (data !== null) {
          //console.log("inside this storages1", data);
          const parsedData = JSON.parse(data);
          setEmployeeData(parsedData);

          const AdminIDofEmployee = JSON.parse(data).adminId; //extract the admin ID of the Employee
          const EmployeeId = JSON.parse(data).emp_id; //extract the employee ID
          //console.log("emp ID",EmployeeId)
          setEmpID(EmployeeId);
          setAdminIDEmp(AdminIDofEmployee);
          //console.log("Admin ID of this Employee", AdminIDofEmployee);
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Error fetching data: " + error);
      });
  }, []);

  const [selectedPlace, setSelectedPlace] = useState(null);
  
   //hook to get the customer Data
   useEffect(() => {
    const starCountRef = ref(db, "CUSTOMER/");
    onValue(starCountRef, (snapshot) => {
      // const customerPic=snapshot.val();
      const data = snapshot.val();
      const customerDatainfo = Object.keys(data).map((key) => ({
        id: key,

        ...data[key],
      }));

       console.log("LINE 125--->MAP SCREEN---> CUSTOMER DATA INFORMATION", customerDatainfo); //test if successfully fetch the datas in UserInformation
      setUserInformation(customerDatainfo);
    });
  }, []);

  //hook to get the order details from ORDERS Collection
  useEffect(() => {
    console.log("inside this useEffect-->Admin of this employee", employeeId);
    if (adminIDofEmployee && employeeId) {
      const starCountRef = ref(db, "ORDERS/");
      console.log("Employee ID inside", employeeId);

      const orderQuery = query(
        starCountRef,
        orderByChild("admin_ID"),
        equalTo(adminIDofEmployee)
        
      );

      const unsubscribe = onValue(orderQuery, (snapshot) => {
        const data = snapshot.val();
        // console.log("inside this IF",data);
        if (data) {
          const orderDataInfo = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          const acceptedOrders = orderDataInfo.filter(
            (order) => order.order_OrderStatus === "Accepted" && order.driverId===employeeId
          );
            console.log("line 97",acceptedOrders)
          // Fetch customer information and add to each order object
          acceptedOrders.forEach((order) => {
            const customer = CustomerInformation.find(
              (cust) => cust.cusId === order.cusId
            );
            if (customer) {
              order.customerLatitude = customer.lattitudeLocation;
              order.customerLongitude = customer.longitudeLocation;
              order.customerAddress = customer.address;
            }
          });

          //const lastFiltered=acceptedOrders.filter((order)=>order.driverId===employeeId);
          
       //  console.log("LINE 112",customer)
          console.log(
            "MAP SCREEN---> ACCEPTED ORDER DATA INFORMATION",
            acceptedOrders
          );

          setOrderInformation(acceptedOrders);
        } else {
          setOrderInformation([]);
        }
      });
      return () => {
        unsubscribe();
      };
    }
  }, [adminIDofEmployee, employeeId]);

 

  const [location, setLocation] = useState();
  const [errorMsg, setErrorMsg] = useState(null);

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
          // onMapReady={() => {
          //   orderInformation.forEach((customer) => {
          //     handleMarkerPress(customer);
          //   });
          // }}
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
            description="User Location"
          ></Marker>
          {/* {orderInformation.map((order) => (
            <Marker
              key={order.id}
              coordinate={{
                latitude: order.customerLatitude,
                longitude: order.customerLongitude,
              }}
              title={order.customerAddress}
              description="Test1"
              pinColor={"#87cefa"}
              onPress={() => handleMarkerPress(order)}
              calloutOffset={{ y: -50 }}
              calloutVisible={true}
            >
              <Callout tooltip={true} stopPropagation={true}>
                <View style={styles.callout}>
                  <Text style={styles.calloutText}>
                    Ordered from {order.order_StoreName}
                  </Text>
                  <Text style={styles.calloutText}>
                    {order.customerAddress}
                  </Text>
                </View>
              </Callout>
            </Marker>
          ))} */}
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
    marginBottom: 5,
    borderColor: "transparent",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calloutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});
