import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
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
import { db } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SearchOrder() {
  const [searchedOrderId, setSearchedOrderId] = useState("");
  const [employeeData, setEmployeeData] = useState();
  const [customerId, setCustomerId] = useState(null);
  const [adminID, setAdminID] = useState("");
  const [orderInfo, setOrderInfo] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

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
                order.admin_ID === adminID
            )
            .sort((a, b) => {
              const dateA = new Date(a.dateOrderAccepted).getTime();
              const dateB = new Date(b.dateOrderAccepted).getTime();
              console.log("date", dateA);
              return dateA - dateB;
            });
          OrderInformation.forEach((order) => {
            if (
              order.order_newDeliveryAddressOption === "Same as Home Address"
            ) {
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
            } else if (
              order.order_newDeliveryAddressOption === "New Delivery Address"
            ) {
              order.customerLatitude = order.order_newDeliveryAddress.latitude;
              order.customerLongitude =
                order.order_newDeliveryAddress.longitude;
              order.customerAddress = order.order_newDeliveryAddress.address;
              order.customerPhone =
                order.order_newDeliveryAddress.order_newDeliveryAddContactNumber;
            }
          });
          setOrderInfo(OrderInformation);
          console.log("OrderInformation", OrderInformation);
        } else {
          console.log("No orders found");
        }
      },
      (error) => {
        console.log("Error fetching orders", error);
      }
    );
  }, [adminID, CustomerInformation]);

  const handleSearch = () => {
    if (!searchedOrderId || searchedOrderId.trim() === "") {
      setSearchResults([]);
      console.log("No order assigned");
      return;
    }

    const results = orderInfo.filter(
      (order) => order.id === searchedOrderId.trim()
    );

    if (results.length === 0) {
      setSearchResults([]);
      console.log("No order found");
      return;
    }

    setSearchResults(results);
    console.log("Results:", results);
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
      <FlatList
        keyExtractor={(item) => item.id}
        data={searchResults}
        renderItem={({ item }) => (
          <View style={styles.productWrapper}>
            <View style={styles.wrapperWaterProduct}>
              <View style={styles.viewWaterItem}>
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
                  keyExtractor={(product) => product.order_ProductId.toString()}
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
                          {product.order_size} {product.order_unit}
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
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // padding: 8,
    // marginLeft: 30,
    flex: 1,
    //backgroundColor: "lightcyan",
  },
  container: {
    // padding: 8,
    // marginLeft: 30,
    flex: 1,
    backgroundColor: "lightcyan",
  },
  searchInput: {
    height: 40,
    width: 330,
    backgroundColor: "#ffff",
    paddingLeft: 30,
    paddingRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#aaaaaa",
    top: 40,
    fontWeight: "bold",
    marginLeft: 37,
  },
  onPresssearch: {
    marginLeft: 330,
    top: 4,
  },
  searchResultsContainer: {
    marginTop: 50,
    backgroundColor: "#F8E2CF",
    borderRadius: 10,
    padding: 10,
    elevation: 3,
    marginRight: 15,
  },
  orderId: {
    fontFamily: "nunito-bold",
    fontSize: 15,
  },
  viewwatername: {
    //backgroundColor: "green",
    width: "100%",
    marginHorizontal: 100,
    marginTop: 40,
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
    fontSize: 20,
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
