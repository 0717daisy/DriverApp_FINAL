import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";

import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { db } from "../firebaseConfig";
import {
  ref,
  onValue,
  orderByChild,
  query,
  get,
  update, set
} from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProductComponent({}) {
  const [customerInfo, setCustomerInfo] = useState({});
  const navigation = useNavigation();
  const onPresshandler_toStationPage = () => {
    navigation.goBack();
  };
  const onPressHandler_toProducDetails = () => {
    navigation.navigate("ProductDetailsAndOrder");
  };

  const [showModal, setShowModal] = useState(false);
  const onPressHandlerShowModal = () => {
    setShowModal(true);
  };

  const [employeeData, setEmployeeData] = useState();
  const [customerId, setCustomerId] = useState(null);
  console.log("Driver:", customerId);
  const [orderInfo, setOrderInfo] = useState([]);
  const [adminID, setAdminID] = useState("");
  const [customerData, setCustomerData] = useState('');
  const [currentDate, setCurrentDate] = useState("");
 console.log("Line 65",customerData);
  //get the customer ID from Async in login screen and extract it and Save to customerID
  useEffect(() => {
    AsyncStorage.getItem("EMPLOYEE_DATA") //e get ang Asycn sa login screen
      .then((data) => {
        if (data !== null) {
          console.log("2", data);
          //if data is not null
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

  useEffect(() => {
    console.log("driver", adminID);
    const orderRef = ref(db, "ORDERS/");
    const Orderquery = query(orderRef, orderByChild("cusId"));
    onValue(
      Orderquery,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
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
                order.order_OrderTypeValue === "delivery" &&
                order.driverId === customerId &&
                order.admin_ID === adminID
            );
          setOrderInfo(OrderInformation);
        } else {
          console.log("No orders found");
        }
      },
      (error) => {
        console.log("Error fetching orders", error);
      }
    );
  }, [customerId, adminID]);

  useEffect(() => {
    const functionsetCurrentDate = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const hours = String(today.getHours()).padStart(2, "0");
      const minutes = String(today.getMinutes()).padStart(2, "0");
      const seconds = String(today.getSeconds()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      setCurrentDate(formattedDate);

      return formattedDate;
    };

    functionsetCurrentDate();
  }, []);
  
  // const handleStatusUpdate = (orderId, newStatus) => {
  //   const orderRef = ref(db, `ORDERS/${orderId}`);
  //   update(orderRef, { order_OrderStatus: newStatus })
  //     .then(() => {
  //       console.log("Order status updated successfully");
  //       sendNotification(orderId, newStatus);
  //     })
  //     .catch((error) => {
  //       console.log("Error updating order status", error);
  //     });
      
  //     const userLogId = Math.floor(Math.random() * 50000) + 100000;
  //     const newUserLog = userLogId;
  //     const newData = orderRef;
  //     set(ref(db, `USERSLOGDCtest/${newUserLog}`), {
  //       dateDelivered: currentDate,
  //       orderId: orderId,


  //     })
  //       .then(async () => {
  //         console.log("New:", newUserLog);
  //       })
  //       .catch((error) => {
  //         console.log("Errroorrrr:", error);
  //         Alert();
  //       })
  //       .finally(() => {
  //         // Set isLoggingIn flag to false after completion
  //         setIsLoggingIn(false);
  //       });
  // };
  
 const handleStatusUpdate = (orderId, newStatus) => {
  const orderRef = ref(db, `ORDERS/${orderId}`);
  update(orderRef, { order_OrderStatus: newStatus })
    .then(() => {
      console.log("Order status updated successfully");
      sendNotification(orderId, newStatus);
    })
    .catch((error) => {
      console.log("Error updating order status", error);
    });

      const userLogId = Math.floor(Math.random() * 50000) + 100000;
     const newUserLog = userLogId;

     // Read the data from the orderRef reference
       get(orderRef)
       .then((snapshot) => {
      const orderData = snapshot.val();
      console.log("Line 172",orderData.admin_ID);
      // Set the properties in USERSLOG table using the data from ORDER table
      set(ref(db, `USERSLOG/${newUserLog}`), {
        dateDelivered: currentDate,
        orderId: orderId,
       driverId: orderData.driverId,
        admin_ID: orderData.admin_ID,
        cusId: orderData.cusId,
        order_DeliveryTypeValue: orderData.order_DeliveryTypeValue,
        order_OrderMethod: orderData.order_OrderMethod,
        order_OrderStatus: orderData.order_OrderStatus,
        order_OrderTypeValue: orderData.order_OrderTypeValue,
        order_ProductName: orderData.order_ProductName,
        order_Quantity: orderData.order_Quantity,
        order_ReservationDate: orderData.order_ReservationDate,
        order_StoreName: orderData.order_StoreName,
        order_TotalAmount: orderData.order_TotalAmount,
        order_WaterPrice: orderData.order_WaterPrice,
      })
        .then(async () => {
          console.log("New:", newUserLog);
        })
        .catch((error) => {
          console.log("Errroorrrr:", error);
          Alert();
        })
        .finally(() => {
          // Set isLoggingIn flag to false after completion
          setIsLoggingIn(false);
        });
    })
    .catch((error) => {
      console.log("Error reading order data", error);
    });
};


 

  async function sendNotification(orderId, newStatus) {
    console.log("Line 136", orderId);
    console.log("New Status:", newStatus);
    const orderRef = ref(db, `ORDERS/${orderId}`);
    console.log("Line 138", orderRef);
    const orderSnapshot = await get(orderRef);
    console.log("Line 142 ", orderSnapshot);
    const customerId = orderSnapshot.val().cusId;
    const storeName = orderSnapshot.val().order_StoreName;
    console.log("Line 144", storeName);
    const customerRef = ref(db, `CUSTOMER/${customerId}`);
    console.log("Line 147", customerRef);
    const customerSnapshot = await get(customerRef);
    const pushToken = customerSnapshot.val().deviceToken;
    console.log("Line 149", pushToken);
  
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
         to: pushToken,
          //to: 'ExponentPushToken[70r7cBJhMn8ZJiQBGwmSxY]',
        title: `${storeName}`, // Update title with store name
        body: `Your order is ${newStatus}.`,
      }),
    });
  
    console.log("response:", response);
  
    if (response.ok) {
      console.log('Push notification sent successfully.');
    } else {
      console.error('Failed to send push notification:', response.statusText);
    }
  }
  
  
  
  
  

 

  return (
    // <ScrollView contentContainerStyle={{flexGrow:1}}
    <View style={styles.container}>
      <FlatList
        keyExtractor={(item) => item.id}
        data={orderInfo}
        renderItem={({ item }) => (
          <View style={styles.productWrapper}>
            <View style={styles.wrapperWaterProduct}>
              <View style={styles.viewWaterItem}>
                <Text style={styles.productNameStyle}>
                  {item.order_StoreName || "No Store name to display"}
                </Text>

                <View
                  style={{
                    //backgroundColor: "green",
                    flexDirection: "row",
                    alignItems: "flex-end",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                    }}
                  >
                    Order ID
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.orderID}
                  </Text>
                </View>
                <View
                  style={{
                    //  backgroundColor: "green",
                    flexDirection: "row",
                    alignItems: "flex-end",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                    }}
                  >
                    Customer ID
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.cusId}
                  </Text>
                </View>
                {/* Product template and its value  */}
                <View
                  style={{
                    // backgroundColor: "green",
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                    }}
                  >
                    <Text>Customer Name {`${customerInfo.firstname} ${customerInfo.middleName} ${customerInfo.lastName}`}</Text>
                    Product Name
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.order_ProductName}
                  </Text>
                </View>
                {/*delivery type  template and its value */}
                <View
                  style={{
                    // backgroundColor: "red",
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 5,
                    }}
                  >
                    Delivery Type
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.order_DeliveryTypeValue}
                  </Text>
                </View>
                {/*order  template and its value */}
                {/*order  template and its value */}
                <View
                  style={{
                    //  backgroundColor: "coral",
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 5,
                    }}
                  >
                    Order Type
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.order_OrderTypeValue}
                  </Text>
                </View>

                {/*reservation  template and its value */}
                <View
                  style={{
                    //  backgroundColor: "blue",
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 5,
                    }}
                  >
                    Reservation Date
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.order_ReservationDate || "-"}
                  </Text>
                </View>
                {/*Borrow gallon types  template and its value */}
                <View
                  style={{
                    // backgroundColor: "red",
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 5,
                    }}
                  >
                    Borrow Gallon
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.order_SwapGallonTypeValue}
                  </Text>
                </View>

                {/*product  template and its value */}
                <View
                  style={{
                    // backgroundColor: "brown",
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 5,
                    }}
                  >
                    Product price
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.order_InitialAmount} x {item.order_Quantity}
                  </Text>
                </View>

                {/*status  template and its value */}
                <View
                  style={{
                    // backgroundColor: "brown",
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 5,
                    }}
                  >
                    Status
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.order_OrderStatus}
                  </Text>
                </View>
                <View
                  style={{
                    borderBottomWidth: 0.5,
                    borderColor: "gray",
                    marginTop: 10,
                  }}
                ></View>

                <View
                  style={{
                    // backgroundColor: "brown",
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 17,
                      marginTop: 6,
                    }}
                  >
                    Total
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                   {item.order_TotalAmount}
                  </Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  {/* Start Here */}
                  <View style={styles.outOrder}>
                    <TouchableOpacity
                      style={[
                        {
                          backgroundColor: "dodgerblue",
                          borderRadius: 10,
                          alignItems: "center",
                          width: 120,
                        },
                      ]}
                      onPress={() =>
                        handleStatusUpdate(item.id, "Out for Delivery")
                      }
                    >
                      <Text style={styles.buttonText}>Out for Delivery</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.outOrder1}>
                    <TouchableOpacity
                      style={[
                        {
                          backgroundColor: "red",
                          height: 50,
                          width: 80,
                          borderRadius: 10,
                          alignItems: "center",
                        },
                      ]}
                      onPress={() => handleStatusUpdate(item.id, "Delivered")}
                    >
                      <Text style={styles.buttonText}>Delivered</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.viewBackBtn}>
            <View style={styles.viewwatername}>
              <Text style={styles.textwatername}> Order Details</Text>
              
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightcyan",
    // justifyContent:'center',
    //alignItems:'center'
  },
  viewBackBtn: {
    // backgroundColor: "orange",
    marginTop: 10,
    marginLeft: 15,
    // width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  productWrapper: {
    //backgroundColor: "yellowgreen",
    padding: 15,
    flex: 1,
    marginTop: 10,
  },
  viewwatername: {
    //backgroundColor: "green",
    width: 150,
    marginHorizontal: 100,
  },
  textwatername: {
    fontSize: 20,
    fontFamily: "nunito-bold",
    fontWeight: "bold",
    marginTop: 30,
    //backgroundColor: "red",
  },
  wrapperWaterProduct: {
    // backgroundColor: "red",
    height: 390,
    marginBottom: -15,
  },

  viewWaterItem: {
    backgroundColor: "white",
    padding: 3,
    marginTop: 0,
    width: "100%",
    height: 320,
    marginLeft: 0,
    borderRadius: 10,
    marginRight: 5,
    marginTop: 15,
    shadowColor: "black",
    shadowRadius: 5,
    shadowOffset: {
      height: 5,
      width: 5,
    },
    elevation: 7,
  },
  productNameStyle: {
    fontSize: 24,
    fontFamily: "nunito-bold",
    marginLeft: 80,
  },

  inputwrapper: {
    // backgroundColor: "green",
    paddingVertical: 5,
    marginTop: 10,
    height: 120,
  },
  reviewInputStyle: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 5,
    width: 280,
    marginTop: 10,
    marginLeft: 20,
  },

  //station screen styles

  storeWrapper: {
    //paddingTop: 80,
    paddingHorizontal: 15,
    backgroundColor: "yellow",
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "nunito-bold",
    fontWeight: "bold",
  },
  items: {
    marginTop: 15,
    // backgroundColor: 'red',
  },

  writeTaskWrapper: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  //from storeinfo.js
  item: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    elevation: 4,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewforStoreInfos: {
    flexDirection: "column",
    alignItems: "center",
  },
  square: {
    width: 65,
    height: 65,
    //  backgroundColor: "red",
    // opacity: 0.4, #55BCF6
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#55BCF6",
  },
  itemText: {
    maxWidth: "80%",
  },
  circular: {
    width: 12,
    height: 12,
    borderColor: "#55BCF6",
    borderWidth: 2,
    borderRadius: 5,
  },

  itemShaun: {
    padding: 15,
    marginTop: 16,
    borderColor: "#bbb",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 10,
  },
  contentShaun: {
    padding: 40,
  },
  listShaun: {
    marginTop: 20,
  },
  storePhotoStyle: {
    width: 53,
    height: 53,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  storeNameStyles: {
    fontSize: 20,
    fontFamily: "nunito-bold",
  },
  storeStatusStyles: {
    fontSize: 16,
    fontFamily: "nunito-light",
  },

  safeviewStyle: {
    flex: 1,
  },
  buttonPressed: {
    backgroundColor: "green",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    paddingTop: 10,
    fontWeight: "bold",
  },
  buttonContainer1: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 5,
    width: 120,
    height: 50,
    marginTop: 10,
    marginLeft: 0,
  },
  outOrder: {
    height: 50,
    flexDirection: "row",
    borderRadius: 15,
    marginTop: 15,

    //textAlign: "center",
  },
  outOrder1: {
    // backgroundColor: "yellow",

    marginLeft: 160,
    justifyContent: "flex-end",
  },
});
