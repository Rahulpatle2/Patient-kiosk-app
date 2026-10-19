import React, { useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { View, Text, StyleSheet, Button, ScrollView, SafeAreaView } from 'react-native';

export default function QRTestScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [rawData, setRawData] = useState('');
  const [apiResult, setApiResult] = useState(null);
  const [error, setError] = useState('');

  const BACKEND_URL = 'http://192.168.1.18:8000';

  const handleBarcodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setRawData(data);
    setError('');
    sendToBackend(data);
  };

  const sendToBackend = async (qrData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_data: qrData }),
      });
      const result = await response.json();

      if (response.ok) {
        setApiResult(result);
      } else {
        setError(result.detail || 'Unknown error');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  const resetScan = () => {
    setScanned(false);
    setRawData('');
    setApiResult(null);
    setError('');
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Loading permissions...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ marginBottom: 12 }}>Camera permission चाहिए</Text>
        <Button title="Permission दें" onPress={requestPermission} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {!scanned && (
        <>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarcodeScanned}
          />
          {/* Debug overlay — ये दिखना चाहिए अगर CameraView mount हुआ है */}
          <View style={styles.overlay} pointerEvents="none">
            <Text style={styles.overlayText}>📷 Camera Active — QR दिखाइए</Text>
          </View>
        </>
      )}

      {scanned && (
        <ScrollView style={styles.resultBox}>
          <Text style={styles.label}>Raw Data Length: {rawData.length}</Text>
          <Text selectable style={styles.rawText}>{rawData}</Text>

          {error ? (
            <Text style={styles.errorText}>Error: {error}</Text>
          ) : apiResult ? (
            <>
              <Text style={styles.label}>API Result:</Text>
              <Text selectable style={styles.rawText}>
                {JSON.stringify(apiResult, null, 2)}
              </Text>
            </>
          ) : (
            <Text>Loading...</Text>
          )}

          <Button title="फिर से Scan करें" onPress={resetScan} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  overlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
  },
  resultBox: { flex: 1, padding: 16, marginTop: 40, backgroundColor: '#fff' },
  label: { fontWeight: 'bold', fontSize: 16, marginTop: 10 },
  rawText: { fontSize: 12, marginVertical: 8 },
  errorText: { color: 'red', fontSize: 14, marginTop: 10 },
});