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
  getDatabase,
  ref,
  set,
  push,
  onValue,
  query,
  orderByChild,
  equalTo,
  update,
  get,
} from "firebase/database";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AllStatusScreen() {
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

  const [adminID, setAdminID] = useState("");
  const [customerData, setCustomerData] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  //get the customer ID from Async in login screen and extract it and Save to customerID
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
      console.log("line 88", customerDatainfo);
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
              order_Products: Object.values(data[key].order_Products || {}),
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
            )
            .sort((a, b) => {
              const dateA = new Date(a.dateOrderAccepted).getTime();
              const dateB = new Date(b.dateOrderAccepted).getTime();
              console.log("date", dateA);
              return dateA - dateB;
            });
          OrderInformation.forEach((order) => {
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
                order.customerPhone = customer.phoneNumber;
                order.fullName = customer.firstName + " " + customer.lastName;

              } else if (
                order.order_newDeliveryAddressOption === "New Delivery Address"
              ) {
                order.customerLatitude =
                  order.order_newDeliveryAddress.latitude;
                order.customerLongitude =
                  order.order_newDeliveryAddress.longitude;
                order.customerAddress = order.order_newDeliveryAddress.address;
                order.customerPhone =
                  order.order_newDeliveryAddress.order_newDeliveryAddContactNumber;

                order.fullName = customer.firstName + " " + customer.lastName;
              }

            }
          });
          setOrderInfo(OrderInformation);
          //console.log("OrderInformation", OrderInformation);
        } else {
          console.log("No orders found");
        }
      },
      (error) => {
        console.log("Error fetching orders", error);
      }
    );
  }, [adminID, CustomerInformation, customerId]);

  const [orderInfo, setOrderInfo] = useState([]);

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

  const handleStatusUpdate = (orderId, newStatus, order_overAllQuantities) => {
    const orderRef = ref(db, `ORDERS/${orderId}`);
    const updates = {
      order_OrderStatus: newStatus,
    };

    if (newStatus === "Out for Delivery") {
      updates.dateOrderOutforDelivery = currentDate;
    } else if (newStatus === "Delivered") {
      updates.dateOrderDelivered = currentDate;
    } else if (newStatus === "Payment Received") {
      updates.datePaymentReceived = currentDate;
      updates.paymentReceivedBy =
        employeeData.emp_firstname + " " + employeeData.emp_lastname;


      // Fetch the order data before creating a new scheduled notification
      get(orderRef)
        .then((snapshot) => {
          const orderData = snapshot.val();
          if (orderData) {
            let scheduledSentDays;
            if (order_overAllQuantities <= 2) {
              scheduledSentDays = 2;
            } else if (order_overAllQuantities <= 5) {
              scheduledSentDays = 4;
            } else if (order_overAllQuantities <= 8) {
              scheduledSentDays = 7;
            } else if (order_overAllQuantities <= 15) {
              scheduledSentDays = 10;
            } else {
              scheduledSentDays = 20;
            }

            const newScheduledNotification = {
              notificationID: Math.floor(Math.random() * 1000000),
              admin_ID: orderData.admin_ID,
              body: `It's been ${scheduledSentDays} days since your last tubig order! Order again to earn points!`,
              cusId: orderData.cusId,
              notificationDate: currentDate,
              scheduledSent: new Date(
                Date.now() + scheduledSentDays * 24 * 60 * 60 * 1000
              ).toISOString(),
              orderID: orderId,
              receiver: "Customer",
              sender: "Admin",
              status: "unread",
              title: "Order Reminder",
            };

            set(
              ref(
                db,
                `NOTIFICATION/${newScheduledNotification.notificationID}`
              ),
              newScheduledNotification
            )
              .then(() => {
                console.log("New scheduled notification created successfully");
              })
              .catch((error) => {
                console.log("Error creating scheduled notification", error);
              });
          } else {
            console.log("Order data not found");
          }
        })
        .catch((error) => {
          console.log("Error reading order data", error);
        });

    }

    update(orderRef, updates)
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
        console.log("Line 172", orderData);
        // Set the properties in USERSLOG table using the data from ORDER table
        set(ref(db, `DRIVERSLOG/${newUserLog}`), {
          date: currentDate,
          logsId: newUserLog,
          driverId: orderData.driverId,
          driverName: employeeData.emp_firstname + " " + employeeData.emp_lastname,
          admin_ID: orderData.admin_ID,
          actions: newStatus, // Add the "actions" property with the new status
          role: "Driver"
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

    // Generate new integer key for Customer's notification
    const notificationRef = ref(db, "NOTIFICATION");
    const notificationSnapshot = await get(notificationRef);
    const notificationKeys = Object.keys(notificationSnapshot.val());
    const maxKey = Math.max(...notificationKeys);
    const newKey = maxKey + 1;

    // Create new notification object with generated key
    const newNotification = {
      admin_ID: orderSnapshot.val().admin_ID,
      body: `Order Status: ${newStatus}.`,
      cusId: customerId,
      notificationDate: currentDate,
      notificationID: newKey,
      orderID: orderId,
      // dateDelivered: currentDate,
      receiver: "Customer",
      sender: "Driver",
      status: "unread",
      title: "Order Status",
    };

    // Save new notification object to database for customer
    await set(ref(db, `NOTIFICATION/${newKey}`), newNotification);

    // Generate new integer key for Admin's notification
    const notificationsRef = ref(db, "NOTIFICATION");
    const notificationsSnapshot = await get(notificationsRef);
    const notificationsKeys = Object.keys(notificationsSnapshot.val());
    const maxKeys = Math.max(...notificationsKeys);
    const newKeys = maxKeys + 2;

    // Create new notification object with generated key
    const newNotifications = {
      admin_ID: orderSnapshot.val().admin_ID,
      body: `Customer ${customerId} Order Status: ${newStatus}.`,
      cusId: customerId,
      notificationDate: currentDate,
      notificationID: newKeys,
      orderID: orderId,
     // dateDelivered: currentDate,
      receiver: "Admin",
      sender: "Driver",
      status: "unread",
      title: "Order Status",
    };
    // Save new notification object to database
    await set(ref(db, `NOTIFICATION/${newKeys}`), newNotifications);

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        title: `${storeName}`, // Update title with store name
        body: `Your order is ${newStatus}.`,
      }),
    });

    if (response.ok) {
      console.log("Push notification sent successfully.");
    } else {
      console.error("Failed to send push notification:", response.statusText);
    }
  }
  return (
    <View style={styles.container}>
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
                      {item.order_newDeliveryAddressOption ===
                      "Same as Home Address"
                        ? item.customerPhone
                        : item.order_newDeliveryAddressOption ===
                          "New Delivery Address"
                        ? `${item.order_newDeliveryAddContactNumber}`
                        : "No number to display"}
                    </Text>
                  </View>
                  <View style={styles.customerIDWrapper}>
                    <Text style={styles.customerIDLabel}>Delivery Address</Text>
                    <Text style={styles.customerIDValue}>
                      {item.order_newDeliveryAddressOption ===
                      "Same as Home Address"
                        ? item.customerAddress
                        : item.order_newDeliveryAddressOption ===
                          "New Delivery Address"
                        ? `${item.order_newDeliveryAddress} (${item.order_newDeliveryAddLandmark})`
                        : "No delivery address to display"}
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
                    <Text style={styles.customerIDLabel}>Status</Text>
                    <Text style={styles.valueStyle}>
                      {item.order_OrderStatus}
                    </Text>
                  </View>
                  <View style={styles.orderIDWrapper}>
                    <Text style={styles.customerIDLabel}>Payment Method</Text>
                    <Text style={styles.valueStyle}>
                      {item.orderPaymentMethod}
                    </Text>
                  </View>
                  {/* Products order by the customer */}
                  {/* <View style={{ marginTop: 5, height: 80 }}> */}
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      //  textAlign: "right",
                      //flex: 1,
                    }}
                  >
                    Order Product(s)
                  </Text>

                  <FlatList
                    showsHorizontalScrollIndicator={false}
                    horizontal={true}
                    contentContainerStyle={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                    data={item.order_Products}
                    nestedScrollEnabled={true}
                    keyExtractor={(product) =>
                      product.order_ProductId.toString()
                    }
                    renderItem={({ item: product }) => (
                      <View
                        style={styles.viewProducts}
                        key={product.order_ProductId}
                      >
                        <View
                          style={{
                            //   backgroundColor: "brown",
                            flexDirection: "row",
                            //alignItems: "flex-end",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "bold",
                              fontSize: 15,
                              marginTop: 0,
                            }}
                          >
                            Name -
                          </Text>
                          <Text
                            style={{
                              fontFamily: "bold",
                              fontSize: 15,
                              textAlign: "right",
                              left: 0,

                              flex: 1,
                              //flex: 1,
                            }}
                          >
                            {product.order_ProductName.length <= 8
                              ? product.order_ProductName
                              : product.order_ProductName.substring(0, 15) +
                                "..."}
                          </Text>
                        </View>
                        {/* size and unit */}
                        <View
                          style={{
                            //   backgroundColor: "brown",
                            flexDirection: "row",
                            //alignItems: "flex-end",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "bold",
                              fontSize: 15,
                              marginTop: 0,
                              textAlign: "right",
                            }}
                          >
                            Size/Unit -
                          </Text>
                          <Text
                            style={{
                              fontFamily: "bold",
                              fontSize: 15,
                              textAlign: "right",
                              flex: 1,
                              //flex: 1,
                            }}
                          >
                            {product.pro_refillQty}{" "}
                            {product.pro_refillUnitVolume}
                          </Text>
                        </View>

                        {/* product price */}
                        <View
                          style={{
                            // backgroundColor: "brown",
                            flexDirection: "row",
                            //alignItems: "flex-end",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "bold",
                              fontSize: 15,
                              marginTop: 0,
                            }}
                          >
                            Price -
                          </Text>
                          <Text
                            style={{
                              fontFamily: "bold",
                              fontSize: 15,
                              textAlign: "right",
                              flex: 1,
                            }}
                          >
                            {product.order_ProductPrice}
                          </Text>
                        </View>
                        <View
                          style={{
                            // backgroundColor: "brown",
                            flexDirection: "row",
                            //alignItems: "flex-end",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "bold",
                              fontSize: 15,
                              marginTop: 0,
                            }}
                          >
                            Qty -
                          </Text>
                          <Text
                            style={{
                              fontFamily: "bold",
                              fontSize: 15,
                              textAlign: "right",
                              flex: 1,
                            }}
                          >
                            {product.qtyPerItem}
                          </Text>
                        </View>
                      </View>
                    )}
                  />

                  <View style={styles.orderIDWrapper}>
                    <Text style={styles.customerIDLabel}>Overall Quantity</Text>
                    <Text style={styles.valueStyle}>
                      {item.order_overAllQuantities}
                    </Text>
                  </View>
                  {/* </View> */}
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
                    <View style={styles.outOrder1}>
                      <TouchableOpacity
                        style={[
                          {
                            backgroundColor: "green",
                            height: 50,
                            width: 80,
                            borderRadius: 10,
                            alignItems: "center",
                          },
                          // Update the disabled property to only disable the button if the order status is not "Delivered"
                          {
                            opacity:
                              item.order_OrderStatus === "Accepted" ||
                              item.order_OrderStatus === "Out for Delivery" ||
                              item.order_OrderStatus === "Payment Received" ||
                              item.orderPaymentMethod === "Gcash" ||
                              item.orderPaymentMethod === "Points"
                                ? 0.5
                                : 1,
                          },
                        ]}
                        // Update the onPress function to only allow button press if order status is "Delivered"
                        onPress={() => {
                          if (item.order_OrderStatus === "Delivered") {

                            handleStatusUpdate(
                              item.id,
                              "Payment Received",
                              item.order_overAllQuantities
                            );

                          }
                        }}
                        // Update the disabled property to only disable the button if the order status is not "Delivered"
                        disabled={
                          item.order_OrderStatus !== "Delivered" ||
                          item.orderPaymentMethod === "Gcash" ||
                          item.orderPaymentMethod === "Points"
                        }
                      >
                        <Text style={styles.buttonText}>Payment Received</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      ) : (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 20 }}>
            No Order Assigned
          </Text>
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
    marginTop: 50,
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
    height: 600,
    marginBottom: -15,
  },

  viewWaterItem: {
    backgroundColor: "#F8E2CF",
    padding: 3,
    marginTop: 0,
    width: "100%",
    height: 560,
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
    marginLeft: 110,
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
  valueStyle1: {
    fontFamily: "nunito-semibold",
    fontSize: 12,
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
  },
  outOrder1: {
    // backgroundColor: "yellow",
    marginLeft: 38,
    justifyContent: "flex-end",
  },
  viewProducts: {
    backgroundColor: "white",
    padding: 3,
    marginBottom: 0,
    width: 190,
    height: 90,
    //marginLeft: 5,
    borderRadius: 5,
    marginRight: 5,
    shadowColor: "black",
    shadowRadius: 5,
    shadowOffset: {
      height: 5,
      width: 5,
    },
    elevation: 4,
  },
});
