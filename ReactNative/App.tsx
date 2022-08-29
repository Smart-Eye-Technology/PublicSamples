
import {Camera,CameraPermissionStatus} from 'react-native-vision-camera'
import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Routes } from './Routes';
import { PermissionsPage } from './PermissionsPage';
import { CameraPage } from './CameraPage';


const Stack = createNativeStackNavigator<Routes>();

export default function App() {
  const [cameraPermission, setCameraPermission] = useState<CameraPermissionStatus>();

  useEffect(() => {
    Camera.getCameraPermissionStatus().then(setCameraPermission);
  }, []);

  console.log(`Re-rendering Navigator. Camera: ${cameraPermission}`);

  if (cameraPermission == null) {
    // still loading
    return null;
  }

  const showPermissionsPage = cameraPermission !== 'authorized';
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          statusBarStyle: 'dark',
          animationTypeForReplace: 'push',
        }}
        initialRouteName={showPermissionsPage ? 'PermissionsPage' : 'CameraPage'}>
        <Stack.Screen name="PermissionsPage" component={PermissionsPage} />
        <Stack.Screen name="CameraPage" component={CameraPage} />
      </Stack.Navigator>
    </NavigationContainer>

  );
}
