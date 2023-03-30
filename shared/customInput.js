

   import { StyleSheet, Text, View, TextInput } from 'react-native'
   import React from 'react'
   
   export default function customInput({value, editable, setValue, onChangeText, placeholder}) {
     return (
       <View style={ styles.container}>
         <TextInput style={{textAlign: 'center', fontWeight:"bold", justifyContent:"center", marginTop:10}}
         value ={value}
         onChangeText={onChangeText}
         placeholder={placeholder}
         editable = {editable}
          />
       </View>
     )
   }
   
   const styles = StyleSheet.create({
    container:{
        backgroundColor: 'white',
        left: 40,
        width: '75%',
        height: 50,
        alignItems:"center",
        borderRadius: 5,
        paddingHorizontal: 10,
        borderColor: "gray",
        marginVertical: 5,
        marginTop: 20,
    }

   })