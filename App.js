import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, Image, TouchableOpacity,
  Modal, ActivityIndicator, ScrollView
} from 'react-native';
import Header from './components/Header';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { db, ref, onValue } from './firebaseConfig'; // 🔹 Firebase import

// ✅ Huawei DeepSeek API setup
const DEEPSEEK_API_URL = "https://api-ap-southeast-1.modelarts-maas.com/v1/chat/completions";
const DEEPSEEK_API_KEY = "vTq-UE2K7xcrt08Kn5LPQeTNfsYkA3CqAEKnK_wkhePATbk87UQY_byvmAHrfYKLGYefWvUUWoYms053d-xlog"; 
const SIMULATE_LLM = true;

// ✅ DeepSeek / AI comparison logic
async function analyzeDrinkWithLLM(ph, voltage, conductivity, lastData) {
  if (SIMULATE_LLM) {
    if (lastData) {
      const phDiff = Math.abs(parseFloat(ph) - parseFloat(lastData.ph));
      const condDiff = Math.abs(parseFloat(conductivity) - parseFloat(lastData.conductivity));
      if (phDiff >= 0.3 || condDiff >= 20) return false;
    }
    return parseFloat(ph) > 6.7;
  }
  return true;
}

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

  const [firebaseData, setFirebaseData] = useState([]);

  // ✅ Fetch scans from Firebase
  useEffect(() => {
    const dbRef = ref(db, 'scans');
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const value = snapshot.val();
      if (value) {
        const dataArray = Object.keys(value).map((key) => ({
          id: key,
          ...value[key],
        }));
        setFirebaseData(dataArray);
      } else {
        setFirebaseData([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Scan handler
  const handleScan = async () => {
    setIsLoading(true);
    setScanDone(false);

    setTimeout(async () => {
      if (firebaseData.length === 0) {
        setIsLoading(false);
        alert('No data available in Firebase.');
        return;
      }

      // Get current scan data from Firebase
      const currentData = firebaseData[scanCount % firebaseData.length];
      const phVal = currentData.ph_level ?? currentData.ph;
      const voltVal = currentData.voltage ?? 0;
      const condVal = currentData.conductivity ?? 0;

      const lastData = history.length > 0 ? history[0] : null;
      const isSafe = await analyzeDrinkWithLLM(phVal, voltVal, condVal, lastData);

      const result = {
        ph: phVal,
        voltage: voltVal,
        conductivity: condVal,
        safe: isSafe,
        timestamp: currentData.timestamp ?? 'N/A',
      };

      setScanCount(prev => prev + 1);
      setDrinkStatus(result);
      setHistory(prev => [result, ...prev]);

      setIsLoading(false);
      setScanDone(true);
      setDataModalVisible(true);
    }, 1500);
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
          {/* HOME SCREEN */}
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
                  }}
                >
                  <Text style={styles.buttonText}>HISTORY</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.customButton}
                  onPress={() => {
                    setIsInHomeScreen(false);
                    setIsInScanScreen(true);
                  }}
                >
                  <Text style={styles.buttonText}>SCAN</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* HISTORY SCREEN */}
          {isInRecordsScreen && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>Scan History</Text>
              {history.length === 0 ? (
                <Text style={styles.emptyText}>No data available yet.</Text>
              ) : (
                <ScrollView
                  style={styles.historyScroll}
                  contentContainerStyle={{ paddingVertical: 20, paddingBottom: 80 }}
                  showsVerticalScrollIndicator={true}
                >
                  {history.map((item, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.historyItem,
                        { backgroundColor: item.safe ? '#dff0d8' : '#f8d7da' },
                      ]}
                    >
                      <Text style={styles.dataText}>Timestamp: {item.timestamp}</Text>
                      <Text style={styles.dataText}>pH: {item.ph}</Text>
                      <Text style={styles.dataText}>Voltage: {item.voltage} V</Text>
                      <Text style={styles.dataText}>Conductivity: {item.conductivity} µS/cm</Text>
                      <Text style={[styles.dataText, { fontWeight: '600' }]}>
                        Status: {item.safe ? '🟢 Safe' : '🔴 Spiked'}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* SCAN SCREEN */}
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

        {/* DATA MODAL */}
        <Modal transparent visible={dataModalVisible} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.dataModalBox}>
              <Text style={styles.modalTitle}>Data Gathered Successfully!</Text>
              <Text style={styles.dataText}>pH Level: {drinkStatus?.ph}</Text>
              <Text style={styles.dataText}>Voltage: {drinkStatus?.voltage} V</Text>
              <Text style={styles.dataText}>Conductivity: {drinkStatus?.conductivity} µS/cm</Text>
              <Text style={styles.dataText}>Timestamp: {drinkStatus?.timestamp}</Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDataModalVisible(false)}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* RESULT MODAL */}
        <Modal transparent visible={resultModalVisible} animationType="fade">
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.resultBox,
                { backgroundColor: drinkStatus?.safe ? '#dff0d8' : '#f8d7da' },
              ]}
            >
              <Text style={styles.resultTitle}>
                {drinkStatus?.safe
                  ? 'Your drink is safe to enjoy!'
                  : '⚠️ Be careful! Your drink may be spiked!'}
              </Text>

              <Text style={styles.dataText}>pH Level: {drinkStatus?.ph}</Text>
              <Text style={styles.dataText}>Voltage: {drinkStatus?.voltage} V</Text>
              <Text style={styles.dataText}>Conductivity: {drinkStatus?.conductivity} µS/cm</Text>

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

// ✅ Styles (same as your original)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  logoContainer: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'pink', borderRadius: 10, padding: 10 },
  mainLogo: { width: 200, height: 200, resizeMode: 'contain' },
  title: { fontSize: 46, fontWeight: '700', marginTop: -20, color: 'pink', fontFamily: 'sans-serif-medium' },
  buttonContainer: { flexDirection: 'row', margin: 10, gap: 16 },
  customButton: { backgroundColor: 'pink', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, width: 150, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15, fontFamily: 'sans-serif' },
  historyContainer: { alignItems: 'center', width: '90%' },
  historyTitle: { fontSize: 28, fontWeight: '700', marginBottom: 10, color: 'pink' },
  historyScroll: { width: '100%', maxHeight: '70%' },
  historyItem: { padding: 14, borderRadius: 8, marginVertical: 6, width: '100%', elevation: 1 },
  dataText: { fontSize: 16, color: '#000', fontFamily: 'sans-serif' },
  emptyText: { fontSize: 16, color: '#555' },
  scanContainer: { alignItems: 'center' },
  scanTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: 'pink', fontFamily: 'sans-serif-medium' },
  checkButton: { backgroundColor: '#f8bbd0', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 10, marginTop: 8 },
  loadingBox: { alignItems: 'center', marginVertical: 20 },
  loadingText: { marginTop: 10, color: '#555' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  dataModalBox: { backgroundColor: '#fff', width: '80%', borderRadius: 15, padding: 25, alignItems: 'center', elevation: 4 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: 'pink' },
  resultBox: { width: '80%', borderRadius: 15, padding: 25, alignItems: 'center', elevation: 4 },
  resultTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8, color: '#000', textAlign: 'center' },
  closeButton: { marginTop: 15, backgroundColor: 'pink', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 10 },
  closeText: { color: 'white', fontWeight: 'bold', fontFamily: 'sans-serif' },
});
