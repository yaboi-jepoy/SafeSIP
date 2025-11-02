import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Pressable } from 'react-native';
import Header from './components/Header';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// {showTitle && <Text style={styles.title}>SafeSIP</Text>}
export default function App() {
  const [isInHomeScreen, setIsInHomeScreen] = useState(true);
  const [isInRecordsScreen, setIsInRecordsScreen] = useState(false);
  const [isInScanScreen, setIsInScanScreen] = useState(false);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        {!isInHomeScreen && <Header showTitle={!isInHomeScreen} onGoHome={() => {
          setIsInHomeScreen(true);
          setIsInRecordsScreen(false);
          setIsInScanScreen(false);
        }} />}
        <View style={styles.container}>
          {/* <Text>Where could my pipe be?</Text>
          <Text>Garfield!</Text> */}
          <View style={styles.logoContainer}>
            <Image source={require('./assets/ai_logo.png')} style={styles.mainLogo} />
            <Text style={styles.title}>SafeSIP</Text>
            <View style={styles.buttonContainer}>
              {/* <Button title="History" color="pink" style={styles.mainButton} onPress={() => {
                setIsInHomeScreen(false);
                setIsInRecordsScreen(true);
                setIsInScanScreen(true);
              }} />
              <Button title="Scan" color="pink" onPress={() => {
                setIsInHomeScreen(false);
                setIsInRecordsScreen(false);
                setIsInScanScreen(true);
              }} /> */}
              {/* Replaced Button with TouchableOpacity for History */}
              <TouchableOpacity 
                style={styles.customButton} // Apply custom styles for size/color
                onPress={() => {
                  setIsInHomeScreen(false);
                  setIsInRecordsScreen(true);
                  setIsInScanScreen(true);
                }}
              >
                <Text style={styles.buttonText}>HISTORY</Text>
              </TouchableOpacity>

              {/* Replaced Button with TouchableOpacity for Scan */}
              <TouchableOpacity 
                style={styles.customButton} // Apply the same custom styles
                onPress={() => {
                  setIsInHomeScreen(false);
                  setIsInRecordsScreen(false);
                  setIsInScanScreen(true);
                }}
              >
                <Text style={styles.buttonText}>SCAN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 2,
    borderColor: 'pink',
    borderRadius: 10,
    padding: 10,
  },
  mainLogo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 54,
    fontWeight: 'bold',
    marginTop: -30,
    color: 'pink',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    margin: 10,
    gap: 16,
  },
  
  customButton: {
    backgroundColor: 'pink',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
