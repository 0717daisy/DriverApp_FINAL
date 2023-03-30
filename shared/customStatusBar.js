import { StyleSheet, Text, View,StatusBar } from 'react-native'

import React, { useState, useEffect } from 'react';

export default function CustomStatusBar() {
    const styleTypes = ['default', 'dark-content', 'light-content'];
    const [visibleStatusBar, setvisibleStatusbar] = useState(false);
    const [styleStatusBar, setstyleStatusBar] = useState(styleTypes[0]);
  return (
    <StatusBar backgroundColor='black' styleStatusBar={styleStatusBar} />
  )
}

const styles = StyleSheet.create({})