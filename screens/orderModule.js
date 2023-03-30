import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { globalStyles } from "../ForStyle/GlobalStyles";
import { db } from "../firebaseConfig";
import { ref, onValue, orderByChild, query,  get } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function ProductComponent({}) {
  const styleTypes = ["default", "dark-content", "light-content"];
  const [visibleStatusBar, setvisibleStatusbar] = useState(false);
  const [styleStatusBar, setstyleStatusBar] = useState(styleTypes[0]);
  const [customerLocation, setCustomerLocation] = useState("");
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
  const [showDetails, setShowDetails] = useState(true);
  const handleCheckIconClick = () => {
    setShowDetails(false);
    setOrderInfo([]);
    console.log("naay sud or wala?", setOrderInfo());
  };
  const [customerData, setCustomerData] = useState();
  const [customerId, setCustomerId] = useState(null);
  const [orderInfo, setOrderInfo] = useState([]);

  //get the customer ID from Async in login screen and extract it and Save to customerID
  useEffect(() => {
    AsyncStorage.getItem("customerData") //e get ang Asycn sa login screen
      .then((data) => {
        if (data !== null) {
          //if data is not null
          const parsedData = JSON.parse(data); //then e store ang Data into parsedData
          setCustomerData(parsedData); //passed the parsedData to customerDta
          const CustomerUID = parsedData.cusId;
          setCustomerId(CustomerUID);
          getLocationFromCustomerTable(CustomerUID);
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Error fetching data: ", error);
      });
  }, []);
  const getLocationFromCustomerTable = (cusId) => {
    const customerRef = ref(db, "CUSTOMER/" + cusId);
    console.log('Yey',customerRef);
    onValue(
      customerRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          //console.log('lisud', data);
          const latitude = get(data, "lattitudeLocation", "");
          const longitude = get(data, "longitudeLocation", "");
          setCustomerLatitude(latitude);
          setCustomerLongitude(longitude);
        }
      },
      (error) => {
        console.log("Error fetching customer location", error);
      }
    );
  };

  useEffect(() => {
    const orderRef = ref(db, "ORDERS/");
    const Orderquery = query(orderRef, orderByChild("cusId"));
    onValue(
      Orderquery,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const OrderInformation = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          })).filter(order => order.order_OrderStatus === "Accepted");
          setOrderInfo(OrderInformation);
        } else {
          console.log("No orders found");
        }
      },
      (error) => {
        console.log("Error fetching orders", error);
      }
    );
  }, [customerId]);
  

  // return () => {
  //   onValue(Orderquery, null);
  // };
  // }, [customerId]);
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

                <Text style={styles.orderText}>
                Customer Location: {customerLocation.latitude}, {customerLocation.longitude}
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
                    Total Value
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "transparent",
                    height: 50,
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <TouchableOpacity onPress={onPressHandlerShowModal}>
                    <View
                      style={{
                        // backgroundColor: "red",
                        marginTop: 15,
                        height: 25,
                        borderRadius: 5,
                        padding: 4,
                        flexDirection: "row",
                        width: 30,
                        height: 30,
                        justifyContent: "center",
                        marginLeft: 85,
                        marginRight: 5,
                        // elevation: 4,
                        alignItems: "center",
                      }}
                    >
                      {/* <Text style={{ fontFamily: "nunito-semibold" }}>
            Feedback
          </Text> */}
                      <MaterialIcons name="feedback" size={24} color="black" />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert("Confirmation", "Order received?", [
                        {
                          text: "Not yet",
                          onPress: () => {
                            console.log("not yet pressed!");
                          },
                        },
                        {
                          text: "Yes",
                          onPress: () => {
                            // console.log("Yes pressed!");
                            handleCheckIconClick();
                            console.log(
                              'After Click the "Yes" Button',
                              orderInfo
                            );
                          },
                        },
                      ]);
                    }}
                  >
                    <View
                      style={{
                        //  backgroundColor: "red",
                        marginTop: 15,
                        height: 25,
                        //borderRadius: 5,
                        padding: 4,
                        flexDirection: "row",
                        width: 30,
                        justifyContent: "center",
                        marginRight: 1,
                        height: 30,
                      }}
                    >
                      {/* <Text style={{ fontFamily: "nunito-semibold" }}>
            Received
          </Text> */}
                      <MaterialIcons
                        name="done"
                        size={24}
                        color="black"
                        style={{ marginBottom: -10 }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.viewBackBtn}>
            <MaterialIcons
              name="arrow-back-ios"
              size={24}
              color="black"
              onPress={onPresshandler_toStationPage}
            />
            <View style={styles.viewwatername}>
              <Text style={styles.textwatername}>Order Details</Text>
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
    padding: 10,
    flex: 1,

    marginTop: 10,
  },
  viewwatername: {
    // backgroundColor: "green",
    width: 150,
    marginHorizontal: 100,
  },
  textwatername: {
    fontSize: 20,
    fontFamily: "nunito-bold",
    fontWeight: "bold",
  },
  wrapperWaterProduct: {
    // backgroundColor: "red",
    height: 300,
    marginBottom: -15,
  },

  viewWaterItem: {
    backgroundColor: "white",
    padding: 3,
    marginTop: 0,
    width: "100%",
    height: 290,
    marginLeft: 0,
    borderRadius: 10,
    marginRight: 5,
    shadowColor: "black",
    shadowRadius: 5,
    shadowOffset: {
      height: 5,
      width: 5,
    },
    elevation: 7,
  },
  productNameStyle: {
    fontSize: 20,
    fontFamily: "nunito-semibold",
    marginLeft: 0,
  },
  FeedbackModal: {
    width: 300,
    height: 250,
    backgroundColor: "#F8E2CF",
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    borderRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    // backgroundColor:'red',
    justifyContent: "center",
    padding: 0,
    flexDirection: "row",
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
    width: 270,
    marginTop: 10,
    marginLeft: 20,
  },
  ratingsInputStyle: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 5,
    width: 270,
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
  },
});
