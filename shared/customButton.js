import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,Image,Button,TextInput,TouchableOpacity,TouchableWithoutFeedback,Keyboard,ScrollView } from 'react-native';
import React, {useState}  from 'react';
import { globalStyles } from '../ForStyle/GlobalStyles';
import {MaterialIcons} from '@expo/vector-icons';

export default function CustomButton({text,onPress}){
    return(
       
        <TouchableOpacity onPress={onPress}> 
            <View style={globalStyles.viewButtonStyle}>
                    <Text style={globalStyles.buttonText}>{text}</Text> 
                    <MaterialIcons 
                    name="login" 
                    size={24} 
                    color="black" 
                    style={globalStyles.loginIcon}
                    />
            </View>
        </TouchableOpacity>
    )
}

