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
  update,
  set,
} from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DeliveredScreen() {
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
  const [customerData, setCustomerData] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  console.log("Line 65", customerData);
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

  const [CustomerInformation, setUserInformation] = useState([]);
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
                (order.order_OrderStatus === "Delivered") &&
                order.order_OrderTypeValue === "Delivery" &&
                order.driverId === customerId &&
                order.admin_ID === adminID
            );
          // console.log("line 113",CustomerInformation);
          OrderInformation.forEach((order) => {
            const customer = CustomerInformation.find(
              (cust) => cust.cusId === order.cusId
            );
            if (customer) {
              order.customerLatitude = customer.lattitudeLocation;
              order.customerLongitude = customer.longitudeLocation;
              order.customerAddress = customer.address;
              order.customerPhone = customer.phoneNumber;
              order.fullName = customer.firstName + " " + customer.lastName;
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
     const actions = newStatus;
    console.log("USERSLOG ACTIONS:", actions);

    // Read the data from the orderRef reference
    get(orderRef)
      .then((snapshot) => {
        const orderData = snapshot.val();
        console.log("Line 172", orderData.admin_ID);
        // Set the properties in USERSLOG table using the data from ORDER table
        set(ref(db, `DRIVERSLOG/${newUserLog}`), {
          dateDelivered: currentDate,
          orderId: orderId,
          driverId: orderData.driverId,
          admin_ID: orderData.admin_ID,
          actions: newStatus,
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

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
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
      console.log("Push notification sent successfully.");
    } else {
      console.error("Failed to send push notification:", response.statusText);
    }
  }

  return (
    // <ScrollView contentContainerStyle={{flexGrow:1}}
    <View style={{ flex: 1 }}>
      {orderInfo && orderInfo.length > 0 ? (
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

                <View style={styles.orderIDWrapper}>
                  <Text style={styles.orderIDLabel}>Order ID</Text>
                  <Text style={styles.orderIDValue}>{item.orderID}</Text>
                </View>
                <View style={styles.customerIDWrapper}>
                  <Text style={styles.customerIDLabel}>Customer ID</Text>
                  <Text style={styles.customerIDValue}>{item.cusId}</Text>
                </View>
                <View style={styles.customerIDWrapper}>
                  <Text style={styles.customerIDLabel}>Customer Name</Text>
                  <Text style={styles.customerIDValue}>{item.fullName}</Text>
                </View>
                <View style={styles.customerIDWrapper}>
                  <Text style={styles.customerIDLabel}>Phone Number</Text>
                  <Text style={styles.customerIDValue}>
                    {item.customerPhone}
                  </Text>
                </View>
                <View style={styles.customerIDWrapper}>
                  <Text style={styles.customerIDLabel}>Address</Text>
                  <Text style={styles.customerIDValue}>
                    {item.customerAddress}
                  </Text>
                </View>
                <View style={styles.orderIDWrapper}>
                  <Text style={styles.customerIDLabel}>Product Name</Text>
                  <Text style={styles.valueStyle}>
                    {item.order_ProductName}
                  </Text>
                </View>
                <View style={styles.orderIDWrapper}>
                  <Text style={styles.customerIDLabel}>Delivery Type</Text>
                  <Text style={styles.valueStyle}>
                    {item.order_DeliveryTypeValue}
                  </Text>
                </View>
                <View style={styles.orderIDWrapper}>
                  <Text style={styles.customerIDLabel}>Reservation Date</Text>
                  <Text style={styles.valueStyle}>
                    {item.order_ReservationDate || "-"}
                  </Text>
                </View>
                <View style={styles.orderIDWrapper}>
                  <Text style={styles.customerIDLabel}>Order Method</Text>
                  <Text style={styles.valueStyle}>
                    {item.order_OrderMethod}
                  </Text>
                </View>
                <View style={styles.orderIDWrapper}>
                  <Text style={styles.customerIDLabel}>Product Price</Text>
                  <Text style={styles.valueStyle}>
                    {item.order_WaterPrice} x {item.order_Quantity}
                  </Text>
                </View>
                <View style={styles.orderIDWrapper}>
                  <Text style={styles.customerIDLabel}>Status</Text>
                  <Text style={styles.valueStyle}>
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
                <View style={styles.orderIDWrapper}>
                  <Text style={styles.customerIDLabel2}>Total</Text>
                  <Text style={styles.valueStyle2}>
                    {item.order_TotalAmount}
                  </Text>
                </View>

                {/* Start Here */}
                <View style={{ flexDirection: "row" }}>
                  <View style={styles.outOrder}>
                    <TouchableOpacity
                      style={[
                        {
                          backgroundColor: "dodgerblue",
                          borderRadius: 10,
                          alignItems: "center",
                          width: 120,
                        },
                        // Add the disabled property to conditionally disable the button
                        {
                          opacity:
                            item.order_OrderStatus === "Out for Delivery" ||
                            item.order_OrderStatus === "Delivered" ||
                            item.order_OrderStatus === "Payment Received"
                              ? 0.5
                              : 1,
                        },
                      ]}
                      // Add a check to only allow button press if order status is not "Out for Delivery", "Delivered", or "Payment Received"
                      onPress={() => {
                        if (
                          item.order_OrderStatus !== "Out for Delivery" &&
                          item.order_OrderStatus !== "Delivered" &&
                          item.order_OrderStatus !== "Payment Received"
                        ) {
                          handleStatusUpdate(item.id, "Out for Delivery");
                        }
                      }}
                      // Add a check to only allow button press if order status is not "Out for Delivery", "Delivered", or "Payment Received"
                      disabled={
                        item.order_OrderStatus === "Out for Delivery" ||
                        item.order_OrderStatus === "Delivered" ||
                        item.order_OrderStatus === "Payment Received"
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
                        // Add the disabled property to conditionally disable the button
                        {
                          opacity:
                            item.order_OrderStatus === "Accepted" ||
                            item.order_OrderStatus === "Delivered" ||
                            item.order_OrderStatus === "Payment Received"
                              ? 0.5
                              : 1,
                        },
                      ]}
                      // Add a check to only allow button press if order status is not "Accepted", "Delivered", or "Payment Received"
                      onPress={() => {
                        if (
                          item.order_OrderStatus !== "Accepted" &&
                          item.order_OrderStatus !== "Delivered" &&
                          item.order_OrderStatus !== "Payment Received"
                        ) {
                          handleStatusUpdate(item.id, "Delivered");
                        }
                      }}
                      // Add a check to only allow button press if order status is not "Accepted", "Delivered", or "Payment Received"
                      disabled={
                        item.order_OrderStatus === "Accepted" ||
                        item.order_OrderStatus === "Delivered" ||
                        item.order_OrderStatus === "Payment Received"
                      }
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
          <View style={{ marginTop: 5 }}>
            <Text style={styles.textwatername}> Order Details</Text>
            </View>
          }
        />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{fontWeight:'bold', fontSize: 20}}>No "Delivered" Order Available</Text>
        </View>
      )}
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

  productWrapper: {
    //backgroundColor: "yellowgreen",
    padding: 15,
    flex: 1,
    marginTop: 7,
  },
  viewwatername: {
    //backgroundColor: "green",
    width: "100%",
    marginHorizontal: 100,
    marginTop: 40,
  },
  textwatername: {
    fontSize: 15,
    fontFamily: "nunito-bold",
    fontWeight: "bold",
    marginTop: 10,
    //backgroundColor: "red",
  },
  wrapperWaterProduct: {
    //backgroundColor: "red",
    height: 420,
    marginBottom: -15,
  },

  viewWaterItem: {
    backgroundColor: "#F8E2CF",
    padding: 3,
    marginTop: 0,
    width: "100%",
    height: 370,
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
  orderIDWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 4,
  },
  orderIDLabel: {
    fontFamily: "nunito-semibold",
    fontSize: 15,
  },
  orderIDValue: {
    fontFamily: "nunito-semibold",
    fontSize: 15,
    textAlign: "right",
    flex: 1,
  },
  customerIDWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 4,
  },
  customerIDLabel: {
    fontFamily: "nunito-semibold",
    fontSize: 15,
  },
  customerIDLabel2: {
    fontFamily: "nunito-bold",
    fontSize: 17,
  },
  customerIDValue: {
    fontFamily: "nunito-semibold",
    fontSize: 15,
    textAlign: "right",
    flex: 1,
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
  valueStyle: {
    fontFamily: "nunito-semibold",
    fontSize: 15,
    textAlign: "right",
    flex: 1,
  },
  valueStyle2: {
    fontFamily: "bold",
    fontSize: 17,
    textAlign: "right",
    flex: 1,
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
