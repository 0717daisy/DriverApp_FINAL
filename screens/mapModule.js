import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import { db } from "../firebaseConfig";
import { FontAwesome } from "@expo/vector-icons";
import { GOOGLEMAP_APIKEY } from "../APIKEY";
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
import MapViewDirections from "react-native-maps-directions";

//export const mapRef=React.createRef();
export default function MapModule({ navigation }) {
  const [employee, setEmployeeData] = useState([]); //state variable for Employee information, This variable hols the data of Employee
  const [adminIDofEmployee, setAdminIDEmp] = useState(""); // state Variable for holding the Admin ID of which Admin does the driver belongs
  const [employeeId, setEmpID] = useState(""); // state Variable for holding the Employee ID
  // console.log("Admin ID of this Employee", employeeId);
  const [CustomerInformation, setUserInformation] = useState([]);

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
          //   console.log("emp ID",EmployeeId) //9330
          setEmpID(EmployeeId);
          setAdminIDEmp(AdminIDofEmployee);
          // console.log("Admin ID of this Employee", AdminIDofEmployee); //5648
        }
      })
      .catch((error) => {
        console.log("line 49", error);
        alert("Error fetching data: " + error);
      });
  }, []);

  const [selectedPlace, setSelectedPlace] = useState(null);

  //hook to get the customer Data
  useLayoutEffect(() => {
    const starCountRef = ref(db, "CUSTOMER/");
    onValue(starCountRef, (snapshot) => {
      // const customerPic=snapshot.val();
      const data = snapshot.val();
      const customerDatainfo = Object.keys(data).map((key) => ({
        id: key,

        ...data[key],
      }));

      //console.log("LINE 125--->MAP SCREEN---> CUSTOMER DATA INFORMATION", customerDatainfo); //test if successfully fetch the datas in UserInformation
      setUserInformation(customerDatainfo);
    });
  }, []);

  //hook to get the order details from ORDERS Collection
  useLayoutEffect(() => {
    // console.log("inside this 74",CustomerInformation)
    //console.log("inside this useEffect-->Admin of this employee", employeeId);
    if (adminIDofEmployee && employeeId) {
      const starCountRef = ref(db, "ORDERS/");

      const orderQuery = query(
        starCountRef,
        orderByChild("admin_ID"),
        equalTo(adminIDofEmployee)
      );
      //console.log("line 79",orderQuery)
      const unsubscribe = onValue(orderQuery, (snapshot) => {
        const data = snapshot.val();
        //console.log("Whole Data in Order Table, aint filtered", data);
        if (data) {
          const orderDataInfo = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          //  console.log("line 90",orderDataInfo)

          const acceptedOrders = orderDataInfo.filter(
            (order) =>
              (order.order_OrderStatus === "Accepted" ||
                (order.order_OrderStatus === "Out for Delivery" &&
                  order.order_OrderTypeValue === "Delivery" &&
                  order.order_OrderStatus === "Received Order" &&
                  order.order_OrderStatus === "Payment Received" &&
                  order.order_OrderStatus !== "Delivered" &&
                  order.driverId === employeeId)) &&
              order.order_OrderTypeValue !== "PickUp"
          );

          //console.log("line 1121", acceptedOrders);

          // Fetch customer information and add to each order object
          acceptedOrders.forEach((order) => {
            const customer = CustomerInformation.find(
              (cust) => cust.cusId === order.cusId
            );
            if (customer) {
              if (
                order.order_newDeliveryAddressOption === "Same as Home Address"
              ) {
                order.customerLatitude = customer.lattitudeLocation;
                order.customerLongitude = customer.longitudeLocation;

                order.customerAddress = customer.address;
              } else {
                // Add new delivery address information
                order.customerLatitude = order.order_newDeliveryAddLattitude;
                order.customerLongitude = order.order_newDeliveryAddLongitude;
                order.customerAddress = order.order_newDeliveryAddress;
                order.receiverContactNumber =
                  order.order_newDeliveryAddContactNumber;

                order.newdeliveryaddLandmark =
                  order.order_newDeliveryAddLandmark;
              }
            }
          });
          setOrderInformation(acceptedOrders);
          if (acceptedOrders.length === 0) {
          }
        } else {
          setOrderInformation([]);
        }
      });
      return () => {
        unsubscribe();
      };
    }
  }, [adminIDofEmployee, employeeId, CustomerInformation]);

  const [orderInformation, setOrderInformation] = useState();
  //console.log("Order information-->", orderInformation);

  const [location, setLocation] = useState();
  const [previousLocation, setPreviousLocation] = useState(null);
  // console.log("location",location)
  const [markerPosition, setMarkerPosition] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  //console.log("line 146",location);
  const [title, setTitle] = useState("My Location");
  const mapRef = useRef(null);

  //get user's/driver location
  useEffect(() => {
    let subscription;
    let interval;
    let isMounted = true;
    let previousLocation = null;

    const getLocation = async () => {
      let { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced },
        (location) => {
          if (isMounted) {
            setLocation(location);
            setMarkerPosition({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        }
      );
    };

    getLocation();

    interval = setInterval(() => {
      getLocation();
    }, 30000);

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.remove();
      }
      clearInterval(interval);
    };
  }, []);

  //when click the marker of the customer it will create an polyline
  const [polylineCoordsDriverToCustomer, setpolylineCoordsDriverToCustomer] =
    useState([]);

  const handleCustomerMarkerPress = (order, location) => {
    // console.log("line 147", order.id);
    //addLongitude
    const polylineCoordinates = [
      {
        latitude: location?.coords.latitude || 0,
        longitude: location?.coords.longitude || 0,
      },
      {
        latitude: order?.customerLatitude || 0,
        longitude: order?.customerLongitude || 0,
      },
    ];

    // Add your current location to the beginning of the polyline
    if (location && location.coords) {
      polylineCoordinates.push({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
    console.log("line 240", polylineCoordinates);
    setpolylineCoordsDriverToCustomer(polylineCoordinates);
    // setSelectedStore(item);
  };

  const handleMarkerPress = (place) => {
    setSelectedPlace(place);
  };

  //update EMPLOYEES COllection with latlong

  useEffect(() => {
    if (!employeeId || !location || !location.coords) {
      return;
    }

    const updateEmployeeLocation = async () => {
      try {
        const ordersRef = ref(db, "EMPLOYEES/");
        const orderRef = child(ordersRef, employeeId.toString());

        await update(orderRef, {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // console.log("Update Success");
      } catch (error) {
        console.log("Error updating", error);
      }
    };

    updateEmployeeLocation();
  }, [employeeId, location]);

  // useEffect(() => {
  //   //console.log("Admin ID of this Employee", employeeId);
  //   if (!employeeId || !location || !location.coords) {
  //     return;
  //   }
  //   const ordersRef = ref(db, "EMPLOYEES/");
  //   const orderRef = child(ordersRef, employeeId.toString());
  //   update(orderRef, {
  //     lattitude: location.coords.latitude,
  //     longitude: location.coords.longitude,
  //   })
  //     .then(() => {
  //       // console.log("Update Success");
  //     })
  //     .catch((error) => {
  //       console.log("Error updating", error);
  //     });
  // }, [employeeId, location,previousLocation]);

  // useEffect(() => {

  //   const interval = setInterval(() => {
  //     if (!employeeId || !location || !location.coords) {
  //       return;
  //     }

  //     if (
  //       !previousLocation ||
  //       Math.abs(location.coords.latitude - previousLocation.coords.latitude) > 0.0001 ||
  //       Math.abs(location.coords.longitude - previousLocation.coords.longitude) > 0.0001
  //     ) {
  //       const ordersRef = ref(db, "EMPLOYEES/");
  //       const orderRef = child(ordersRef, employeeId.toString());
  //       update(orderRef, {
  //         lattitude: location.coords.latitude,
  //         longitude: location.coords.longitude,
  //       })
  //         .then(() => {
  //           // console.log("Update Success");
  //           setPreviousLocation(location); // Update the previous location

  //         })
  //         .catch((error) => {
  //           console.log("Error updating", error);
  //         });
  //     }
  //   }, 15000); // 30000 milliseconds = 15 seconds

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [employeeId, location, previousLocation]);

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          // onMapReady={() => {
          //   orderInformation.forEach((customer) => {
          //     handleMarkerPress(customer);
          //   });
          // }}
          ref={mapRef}
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
          showsTraffic={false}
          showsCompass={true}
          showsIndoors={true}
          loadingEnabled={true}
          loadingIndicatorColor={"gray"}
          userInterfaceStyle={"dark"}
          userLocationPriority={"balanced"}
          showsIndoorLevelPicker={true}
          toolbarEnabled={true}
        >
          {/* {markerPosition && (
            <Marker
              //  coordinate={{
              //    latitude: location.coords.latitude,
              //    longitude: location.coords.longitude,
              //  }}
              coordinate={markerPosition}
              showCallout={true}
              title="My Location"
            >
              <FontAwesome name="motorcycle" size={23} color="yellow" />


            </Marker>
          )} */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            //coordinate={markerPosition}
            showCallout={true}
            title={title}
          >
            <FontAwesome name="motorcycle" size={23} color="yellow" />
          </Marker>
          {/* {orderInformation &&
            orderInformation.length > 0 &&
            orderInformation.map((order) => (
              <Marker
                key={order.id}
                coordinate={{
                  latitude: order.customerLatitude,
                  longitude: order.customerLongitude,
                }}
                title={order.customerAddress}
                description="Test1"
                pinColor={"#87cefa"}
                onPress={() => handleCustomerMarkerPress(order, location)}
                calloutOffset={{ y: 0 }}
                calloutVisible={true}
              >
                <Callout
                  tooltip={true}
                  stopPropagation={true}
                  onPress={() => {
                    navigation.navigate("Accepted");
                  }}
                >
                  <View style={styles.callout}>
                    <Text style={styles.calloutText}>
                      Ordered from {order.order_StoreName}
                    </Text>
                    <Text style={styles.calloutText}>
                      {order.customerAddress}
                    </Text>
                    <Text style={styles.calloutText}>{order.orderID}</Text>
                  </View>
                </Callout>
              </Marker>
            ))} */}

          {polylineCoordsDriverToCustomer.length >= 2 && (
            <MapViewDirections
              origin={polylineCoordsDriverToCustomer[0]}
              //destination={polylineCoordsDriverToCustomer[polylineCoordsDriverToCustomer.length - 1]}
              destination={polylineCoordsDriverToCustomer[1]}
              strokeWidth={3}
              waypoints={polylineCoordsDriverToCustomer.slice(2, -1)}
              strokeColor="red"
              apikey={GOOGLEMAP_APIKEY}
            />
          )}
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
    height: 50,
  },
  calloutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});
