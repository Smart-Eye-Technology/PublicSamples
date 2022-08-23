import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, CameraType } from 'expo-camera';

//import LoadingView from './LoadingView';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default function App() { 
  const [type, setType] = useState(CameraType.front);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  function toggleCameraType() {
    setType((current) => (
      current === CameraType.back ? CameraType.front : CameraType.back
    ));
  }

  /* @hide if (!permission) ... */
  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }
  /* @end */

  /* @hide if (!permission.granted) ... */
  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop:'10%' }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }
  else{
    return (
      <View style={styles.container}>
      <Camera style={styles.camera} type={type}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={toggleCameraType}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>

    )
  }
  /* @end */

}