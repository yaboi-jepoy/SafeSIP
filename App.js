import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Modal, ActivityIndicator, Pressable } from 'react-native';
import Header from './components/Header';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const [isInHomeScreen, setIsInHomeScreen] = useState(true);
  const [isInRecordsScreen, setIsInRecordsScreen] = useState(false);
  const [isInScanScreen, setIsInScanScreen] = useState(false);

  const [scanCount, setScanCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [drinkStatus, setDrinkStatus] = useState(null);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [dataModalVisible, setDataModalVisible] = useState(false);
  const [history, setHistory] = useState([]);

  // --- Simulate Scan (replace later with ESP32 data) ---
  const handleScan = () => {
    setIsLoading(true);
    setScanDone(false);

    setTimeout(() => {
      // Simulated sensor readings
      const simulatedPh = 6.3 + Math.random() * 1.0;
      const simulatedVoltage = 3.0 + Math.random() * 1.2;
      const simulatedConductivity = 100 + Math.random() * 50; // µS/cm
      const simulatedTemperature = 20 + Math.random() * 10; // Celsius

      // ✅ DECISION PLACEHOLDER: Replace this random logic with actual ESP32 input
      const isSpiked = Math.random() > 0.5; // Random for now

      const result = {
        ph: simulatedPh.toFixed(2),
        voltage: simulatedVoltage.toFixed(2),
        conductivity: simulatedConductivity.toFixed(2),
        temperature: simulatedTemperature.toFixed(2),
        safe: !isSpiked,
        timestamp: new Date().toLocaleString(),
      };

      const newScanCount = scanCount + 1;
      setScanCount(newScanCount);
      setDrinkStatus(result);
      setHistory((prev) => [result, ...prev]);
      setIsLoading(false);
      setScanDone(true);
      setDataModalVisible(true); // Show gathered data immediately
    }, 3000);
  };

  const handleCheckResult = () => setResultModalVisible(true);

  const canShowResultButton = scanDone && scanCount % 2 === 0;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        {!isInHomeScreen && (
          <Header
            showTitle={!isInHomeScreen}
            onGoHome={() => {
              setIsInHomeScreen(true);
              setIsInRecordsScreen(false);
              setIsInScanScreen(false);
            }}
          />
        )}

        <View style={styles.container}>
          {/* --- HOME SCREEN --- */}
          {isInHomeScreen && (
            <View style={styles.logoContainer}>
              <Image source={require('./assets/ai_logo.png')} style={styles.mainLogo} />
              <Text style={styles.title}>SafeSIP</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.customButton}
                  onPress={() => {
                    setIsInHomeScreen(false);
                    setIsInRecordsScreen(true);
                    setIsInScanScreen(false);
                  }}
                >
                  <Text style={styles.buttonText}>HISTORY</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.customButton}
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
          )}

          {/* --- HISTORY SCREEN --- */}
          {isInRecordsScreen && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>Scan History</Text>
              {history.length === 0 ? (
                <Text>No data available yet.</Text>
              ) : (
                history.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.historyItem,
                      { backgroundColor: item.safe ? '#c8e6c9' : '#ffcdd2' },
                    ]}
                  >
                    <Text style={styles.historyText}>Timestamp: {item.timestamp}</Text>
                    <Text style={styles.historyText}>pH: {item.ph}</Text>
                    <Text style={styles.historyText}>Voltage: {item.voltage} V</Text>
                    <Text style={styles.historyText}>Conductivity: {item.conductivity} µS/cm</Text>
                    <Text style={styles.historyText}>Temperature: {item.temperature} °C</Text>
                    <Text style={styles.historyText}>
                      Status: {item.safe ? 'Safe' : 'Spiked'}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}

          {/* --- SCAN SCREEN --- */}
          {isInScanScreen && (
            <View style={styles.scanContainer}>
              <Text style={styles.scanTitle}>Drink Scanning</Text>

              {isLoading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color="pink" />
                  <Text style={styles.loadingText}>Analyzing your drink...</Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity style={styles.customButton} onPress={handleScan}>
                    <Text style={styles.buttonText}>
                      {scanDone ? 'RE-TEST SCAN' : 'START SCAN'}
                    </Text>
                  </TouchableOpacity>

                  {canShowResultButton && (
                    <TouchableOpacity
                      style={styles.checkButton}
                      onPress={handleCheckResult}
                    >
                      <Text style={styles.buttonText}>CHECK RESULT</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}
        </View>

        {/* --- POPUP: DATA GATHERED MODAL --- */}
        <Modal transparent visible={dataModalVisible} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.dataModalBox}>
              <Text style={styles.modalTitle}>Data Gathered Successfully!</Text>
              <Text style={styles.modalText}>pH Level: {drinkStatus?.ph}</Text>
              <Text style={styles.modalText}>Voltage: {drinkStatus?.voltage} V</Text>
              <Text style={styles.modalText}>Conductivity: {drinkStatus?.conductivity} µS/cm</Text>
              <Text style={styles.modalText}>Temperature: {drinkStatus?.temperature} °C</Text>
              <Text style={styles.modalText}>Timestamp: {drinkStatus?.timestamp}</Text>
              <Text style={styles.modalSubtext}>
                The values have been saved to your scan history.
              </Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDataModalVisible(false)}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* --- RESULT MODAL (EVEN SCANS) --- */}
        <Modal transparent visible={resultModalVisible} animationType="fade">
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.resultBox,
                { backgroundColor: drinkStatus?.safe ? '#c8e6c9' : '#ffcdd2' },
              ]}
            >
              <Text style={styles.resultTitle}>
                {drinkStatus?.safe
                  ? 'Your drink is safe to enjoy!'
                  : 'Be careful! Your drink may be spiked!'}
              </Text>

              <Text style={styles.modalText}>pH Level: {drinkStatus?.ph}</Text>
              <Text style={styles.modalText}>Voltage: {drinkStatus?.voltage} V</Text>
              <Text style={styles.modalText}>Conductivity: {drinkStatus?.conductivity} µS/cm</Text>
              <Text style={styles.modalText}>Temperature: {drinkStatus?.temperature} °C</Text>
              <Text style={styles.modalText}>Timestamp: {drinkStatus?.timestamp}</Text>

              <Text style={styles.resultMessage}>
                {drinkStatus?.safe
                  ? 'No anomalies detected. Please enjoy responsibly.'
                  : 'Warning! Unusual readings detected — do not consume this beverage.'}
              </Text>

              <TouchableOpacity
                onPress={() => setResultModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  logoContainer: {
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 2, borderColor: 'pink', 
    borderRadius: 10, padding: 10,
  },
  mainLogo: { 
    width: 200, 
    height: 200, 
    resizeMode: 'contain' 
  },
  title: { 
    fontSize: 54, 
    fontWeight: 'bold', 
    marginTop: -30, 
    color: 'pink' 
  },
  buttonContainer: { 
    flexDirection: 'row', 
    margin: 10, 
    gap: 16 
  },
  customButton: {
    backgroundColor: 'pink', 
    paddingVertical: 10, 
    paddingHorizontal: 20,
    borderRadius: 5, 
    width: 140, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  historyContainer: { 
    alignItems: 'center', 
    width: '90%' 
  },
  historyTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    color: 'pink' },
  historyItem: { 
    padding: 10, 
    borderRadius: 8, 
    marginVertical: 6, 
    width: '100%' },
  historyText: { 
    fontSize: 16 
  },
  scanContainer: { 
    alignItems: 'center' 
  },
  scanTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    color: 'pink' 
  },
  checkButton: {
    backgroundColor: '#f8bbd0', 
    paddingVertical: 10, 
    paddingHorizontal: 25,
    borderRadius: 10, 
    marginTop: 8,
  },
  loadingBox: { 
    alignItems: 'center',
    marginVertical: 20 
  },
  loadingText: { 
    marginTop: 10, 
    color: 'gray' 
  },
  modalContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dataModalBox: {
    backgroundColor: '#fff', 
    width: '80%', 
    borderRadius: 15, 
    padding: 25, 
    alignItems: 'center',
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    color: 'pink' },
  modalText: { 
    fontSize: 16, 
    marginVertical: 3 
  },
  modalSubtext: { 
    color: '#555', 
    fontSize: 14, 
    marginTop: 5, 
    textAlign: 'center' 
  },
  resultBox: { 
    width: '80%', 
    borderRadius: 15, 
    padding: 25, 
    alignItems: 'center' 
  },
  resultTitle: { 
    fontSize: 22, 
    fontWeight: 'bold',
    marginBottom: 8, 
    color: '#333'
  },
  resultMessage: { 
    fontSize: 16, 
    textAlign: 'center', 
    marginTop: 10, 
    color: '#444' },
  closeButton: {
    marginTop: 15, 
    backgroundColor: 'pink',
    paddingVertical: 8, 
    paddingHorizontal: 20, 
    borderRadius: 10,
  },
  closeText: { 
    color: 'white', 
    fontWeight: 'bold' },
});
