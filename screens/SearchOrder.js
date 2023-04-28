import {
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
  } from "react-native";
  import React, { useState, useEffect } from "react";
  import { FontAwesome5 } from "@expo/vector-icons";
  import { getDatabase, ref, set, push, onValue, query, orderByChild, equalTo, update, get} from "firebase/database";
  import { db } from "../firebaseConfig";
  import AsyncStorage from "@react-native-async-storage/async-storage";
  
  export default function SearchOrder() {
    const [searchedOrderId, setSearchedOrderId] = useState("");
    const [employeeData, setEmployeeData] = useState();
    const [customerId, setCustomerId] = useState(null);
    const [CustomerInformation, setUserInformation] = useState([]);
    const [adminID, setAdminID] = useState("");
    const [orderInfo, setOrderInfo] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        AsyncStorage.getItem("EMPLOYEE_DATA") //e get ang Asycn sa login screen
          .then((data) => {
            if (data !== null) {
              const parsedData = JSON.parse(data); //then e store ang Data into parsedData
              setEmployeeData(parsedData); //passed the parsedData to customerDta
              const CustomerUID = parsedData.emp_id;
              const adminID = parsedData.adminId;
              setAdminID(adminID);
              setCustomerId(CustomerUID);
            }
          })
          .catch((error) => {
            console.log(error);
            alert("Hi Error fetching data: ", error);
          });
      }, []);
    
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
    
          // console.log("LINE 125--->MAP SCREEN---> CUSTOMER DATA INFORMATION", customerDatainfo); //test if successfully fetch the datas in UserInformation
          setUserInformation(customerDatainfo);
        });
      }, []);
  
    useEffect(() => {
      console.log("driver", adminID);
      const orderRef = ref(db, "ORDERS/");
      console.log("OrderREF", orderRef);
      const Orderquery = query(orderRef, orderByChild("cusId"));
      onValue(
        Orderquery,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("data:",data);
            const OrderInformation = Object.keys(data)
              .map((key) => ({
                id: key,
                ...data[key],
              }))
              .filter(
                (order) =>
                  (order.order_OrderStatus === "Accepted" ||
                    order.order_OrderStatus === "Out for Delivery" ||
                    order.order_OrderStatus === "Received Order" ||
                    order.order_OrderStatus === "Delivered" ||
                    order.order_OrderStatus === "Payment Received") &&
                  order.order_OrderTypeValue === "Delivery" &&
                  order.driverId === customerId &&
                  order.admin_ID === adminID
              );
              console.log("Check",customerId);
             console.log("line 113",OrderInformation);
            OrderInformation.forEach((order) => {
              const customer = CustomerInformation.find(
                (cust) => cust.cusId === order.cusId
              );
              if (customer) {
                order.customerLatitude = customer.lattitudeLocation;
                order.customerLongitude = customer.longitudeLocation;
                order.customerAddress = customer.address;
                order.customerPhone = customer.phoneNumber;
                order.fullName = customer.firstname + " " + customer.lastName;
              }
            });
            setOrderInfo(OrderInformation);
            console.log("line 96", OrderInformation);
          } else {
            console.log("No orders found");
          }
        },
        (error) => {
          console.log("Error fetching orders", error);
        }
      );
    }, [customerId, adminID, CustomerInformation]);
  
    const handleSearch = () => {
      const results = orderInfo.filter(
        (order) => order.id === searchedOrderId.trim()
      );
      setSearchResults(results);
      console.log("REsults:", results);
    };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Order..."
        placeholderTextColor="#aaaaaa"
        value={searchedOrderId}
        onChangeText={(text) => setSearchedOrderId(text)}
      />
      <View style={styles.onPresssearch}>
        <TouchableOpacity onPress={handleSearch}>
          <FontAwesome5
            name="search"
            size={25}
            color="black"
            style={styles.searchIcon}
          />
        </TouchableOpacity>
        </View>
    {searchResults.length > 0 && (
      <View style={styles.searchResultsContainer}>
        {searchResults.map((result) => (
          <View style={styles.searchResult} key={result.id}>
            <Text style={styles.orderId}>Date Delivered: {result.dateOrderDelivered}</Text>
            <Text style={styles.orderId}>Order ID: {result.id}</Text>
            <Text style={styles.orderId}>Customer ID: {result.cusId}</Text>
            <Text style={styles.orderId}>Product:  {result.order_ProductName}</Text>
            <Text style={styles.orderId}>Quantity:  {result.order_Quantity}</Text>
            <Text style={styles.orderId}>Total: {result.order_TotalAmount}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    marginLeft: 30,
  },
  searchInput: {
    height: 40,
    width: 330,
    backgroundColor: "#ffff",
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#aaaaaa",
    top: 40,
  },
  onPresssearch: {
    marginLeft: 280,
    top: 4,
  },
  searchResultsContainer: {
    marginTop: 50,
    backgroundColor: '#F8E2CF',
    borderRadius: 10,
    padding: 10,
    elevation:3,
    marginRight:15,
  },
  orderId:{
    fontFamily: "nunito-bold",
    fontSize: 15,
  }
});
