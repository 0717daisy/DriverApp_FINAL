import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';


export const globalStyles = StyleSheet.create({ 
    container: {
      flex: 1,
      backgroundColor: '#7C96AB',
    },
    imageStyle:{
      height:60,
      width:60,
      marginTop:125,
      marginLeft: 300,
      
      },
      imageStyle1:{
        height:100,
        width:160,
        //marginTop:310,
        marginLeft: 290,
        
        },
      imagebck:{
        flex: 1,
        width: "100%",
        height: "40%",
    justifyContent: 'center',
    marginTop:50,
        },
      textStyles:{
        fontSize:5,
        fontFamily:'nunito-medium',
        marginLeft: 305,
        color: "white",
      }, 
      txtStyles:{
        fontSize:30,
        fontFamily:'nunito-medium',
      },
      wrapper:{
        //backgroundColor:'skyblue',
        padding:30,
        height:200,
        width: '100%',
        marginTop: 20,
      },
      ViewemailTextInput:{
       flexDirection:'row',
       borderBottomColor:'white',
       borderBottomWidth:1,
       paddingBottom:2,
       marginBottom:20,
       width:270,
       marginLeft:20
      },
      login_Email_Icon:{
        marginRight:5
      },
      login_Email_textInput:{
        fontSize:18,
        fontFamily:'nunito-reg',
        width:'90%',
      },
    
      ViewPasswordTextInput:{
        flexDirection:'row',
        borderBottomColor:'white',
        borderBottomWidth:1,
        paddingBottom:2,
        marginBottom:25,
        width:270,
        marginLeft:20,
        marginTop:15,
       },
       login_Password_Icon:{
         marginRight:5
       },
       login_Password_textInput:{
         fontSize:18,
         fontSize:18,
         fontFamily:'nunito-reg',
        
       },
       btnClickEye:{
        position:'absolute',
        right:10,
    
       },
        viewForgotPass:{
        // backgroundColor:'red',
        marginTop:-15,
        fontFamily:'nunito-light',
        left:200,
        width:160,
        
    
      },
      viewButtonStyle:{
        borderRadius:10,
        paddingVertical:10,
        paddingHorizontal:10,
        backgroundColor:"skyblue",
        marginTop:85,
        width:250,
        left:30,
    
    }, 
    buttonText:{
      fontFamily:'nunito-bold',
      fontWeight:'bold',
      textTransform:'none',
      textAlign:'center',
      fontSize:18,
      color:'black',
    
    },
    loginIcon:{
      position:'absolute',
      right:20,
      marginTop:8,
    
    },
    createAccLabel:{
      marginTop:20,
      justifyContent:'center',
      textAlign:'center',
      fontFamily:'nunito-reg'
    },
    row:{
      flexDirection:'row',
      marginTop:15,
      justifyContent:'center'
    },
    clickHerestyle:{
      fontFamily:'nunito-bold',
      color:'#87cefa'
    },
    safeviewStyle:{
      flex:1
    }
  });
  