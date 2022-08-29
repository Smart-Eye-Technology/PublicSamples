import * as React from 'react';
import { useRef, useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { PinchGestureHandler } from 'react-native-gesture-handler';
import {
    CameraDeviceFormat,
    CameraRuntimeError,
    sortFormats,
    useCameraDevices,
    useFrameProcessor,
} from 'react-native-vision-camera';
import { Camera, frameRateIncluded } from 'react-native-vision-camera';
import { CONTENT_SPACING, MAX_ZOOM_FACTOR, SAFE_AREA_PADDING } from './Constants';
import Reanimated, { useAnimatedProps, useSharedValue } from 'react-native-reanimated';
import { useEffect } from 'react';
import { PressableOpacity } from 'react-native-pressable-opacity';
import type { Routes } from './Routes';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/core';
import { AppState, AppStateStatus } from 'react-native';
import IonIcon from 'react-native-ionicons'
import { scanFaces, Face } from 'vision-camera-face-detector';
import { runOnJS } from 'react-native-reanimated';
import { decode as atob } from 'base-64';
import FormData2 from 'form-data';


//The SETI Mode ENdpoint
const setiEndpoint = 'https://api.app.getsmarteye.mobi/v1';

//Your SETI API Key
const setiAPIKey = 'your-api-key';

const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

//Support for rapid camera activation (if the app is focused)
const useIsForeground = (): boolean => {
    const [isForeground, setIsForeground] = useState(true);

    useEffect(() => {
        const onChange = (state: AppStateStatus): void => {
            setIsForeground(state === 'active');
        };
        const listener = AppState.addEventListener('change', onChange);
        return () => listener.remove();
    }, [setIsForeground]);

    return isForeground;
};

//The Reanimated camera component
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
    zoom: true,
});


type Props = NativeStackScreenProps<Routes, 'CameraPage'>;
export function CameraPage({ navigation }: Props): React.ReactElement {
    const camera = useRef<Camera>(null);
    const [faces, setFaces] = React.useState<Face[]>();
    const [setiFaces, setSetiFaces] = React.useState(-1);
    const [tick, setTick] = React.useState(false);
    const [isCameraInitialized, setIsCameraInitialized] = useState(false);
    const zoom = useSharedValue(0);
    const isFocussed = useIsFocused();
    const isForeground = useIsForeground();
    const isActive = isFocussed && isForeground;
    const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back');
    const devices = useCameraDevices();
    const device = devices[cameraPosition];
    const formats = useMemo<CameraDeviceFormat[]>(() => {
        if (device?.formats == null) return [];
        return device.formats.sort(sortFormats);
    }, [device?.formats]);

    const fps = 30;
    const supportsCameraFlipping = useMemo(() => devices.back != null && devices.front != null, [devices.back, devices.front]);

    const format = useMemo(() => {
        let result = formats;
        return result.find((f) => f.frameRateRanges.some((r) => frameRateIncluded(r, fps)));
    }, [formats]);

    const minZoom = device?.minZoom ?? 1;
    const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR);

    const cameraAnimatedProps = useAnimatedProps(() => {
        const z = Math.max(Math.min(zoom.value, maxZoom), minZoom);
        return {
            zoom: z,
        };
    }, [maxZoom, minZoom, zoom]);

    const onError = useCallback((error: CameraRuntimeError) => {
        console.error(error);
    }, []);
    const onInitialized = useCallback(() => {
        setIsCameraInitialized(true);
    }, []);

    const onFlipCameraPressed = useCallback(() => {
        setCameraPosition((p) => (p === 'back' ? 'front' : 'back'));
    }, []);

    const frameProcessor = useFrameProcessor((frame) => {
        'worklet';
        const scannedFaces = scanFaces(frame);
        runOnJS(setFaces)(scannedFaces);
    }, []);

    /*
  
          faces - contains an array of faces detected by a reanimated frame-processor. This processor uses a basic
          tensorflow model for face detection.  We can take advantage of this ability in react_native to detect
          when faces are generally detected (and the number of faces changes) to intelligently call the SETI API
          only as needed for authentication and/or verification.  In this example, we capture a full image and
          send to the API for an evaluation
  
    */
    React.useEffect(() => {

        //Take a snapshot (to a temp file) if we think there are faces present
        if (camera && camera.current) {

            try {
                camera.current.takePhoto({
                    qualityPrioritization: 'speed',
                    flash: 'off',
                }).then(async (file) => {
                    const endpoint = `${setiEndpoint}/faces`;

                    var data = new FormData2();
                    data.append('file', {
                        uri: file.path,
                        name: 'file.jpg',
                        type: 'image/jpg'
                    });

                    const opts: any = {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'multipart/form-data',
                            'X-API-Key': setiAPIKey
                        },
                        method: 'POST',
                        body: data
                    };
                    const res = await fetch(endpoint, opts);
                    const response = await res.json();
                    if (response.Faces) {
                        setSetiFaces(response.Faces);
                    }
                    else{
                        setSetiFaces(0);
                    }
                    console.log("SETI Detected " + JSON.stringify(response));
                    setTick(!tick);//loop
                });
            }
            catch (ex) {
                console.log("ERROR -> " + ex);
                setTick(!tick);//loop
            }

        }
    }, [tick,faces]);

    return (
        <View style={styles.container}>
            <View
                style={styles.doc}

            >
                <Image source={require('./document.jpg')} />
            </View>

            {/* 
        The following view uses the faces state to lock the screen
        when the on-board frame-processor detects changes to faces.
        This can be used for offline scenarios when authentication is not needed
*/}
            { (setiFaces!=1) || (faces?.length != 1)   ? (
                <View
                    style={styles.lock}
                ><Image source={require('./lockscreen.png')} />
                </View>
            ):(<></>)}
            <View style={styles.rightButtonRow}>
                {supportsCameraFlipping && (
                    <PressableOpacity style={styles.button} onPress={onFlipCameraPressed} disabledOpacity={0.4}>
                        <IonIcon name="refresh" color="white" size={32} />
                    </PressableOpacity>
                )}

            </View>

            <View style={styles.camera}>
                {device != null && (
                    <PinchGestureHandler enabled={isActive}>
                        <Reanimated.View style={StyleSheet.absoluteFill}>
                            <ReanimatedCamera
                                ref={camera}
                                style={StyleSheet.absoluteFill}
                                device={device}
                                format={format}
                                fps={fps}
                                isActive={isActive}
                                onInitialized={onInitialized}
                                onError={onError}
                                enableZoomGesture={false}
                                animatedProps={cameraAnimatedProps}
                                photo={true}
                                video={true}
                                frameProcessor={device.supportsParallelVideoProcessing ? frameProcessor : undefined}
                                orientation="portrait"
                                frameProcessorFps={1}
                            />
                        </Reanimated.View>
                    </PinchGestureHandler>
                )}
            </View>
                <View style={styles.footer}>
                    <Text style={styles.warnText}>Faces detected locally {faces?.length.toString()|| "0"}</Text>
                    <Text style={styles.warnText}>Faces detected by SETI {setiFaces.toString()}</Text>
                </View>
        
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        position: 'absolute',
        flex: 1,
        backgroundColor: 'black',
        height: 90,
        width: '100%',
        top: SAFE_AREA_PADDING.paddingTop,
        fontSize: 10

    },
    warnText: {
        color: 'red',
        fontSize: 24

    },
    lock: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: '#3f3f3f',
        alignItems: 'center',
        textAlignVertical: 'middle',
        paddingTop: 400

    },
    doc: {
        flex: 1,
        position: 'absolute',
        top: SAFE_AREA_PADDING.paddingTop,
        marginTop: 200
    },
    container: {
        flex: 1,
        background: 'white'
    },
    camera: {
        flex: 0,
        width: 200,
        height: 200,
        marginLeft: 20,
        borderRadius: 20,
        backgroundColor: 'black',
        position: 'absolute',
        top: SAFE_AREA_PADDING.paddingTop + 99,
        alignSelf: 'flex-start'
    },
    button: {
        marginBottom: CONTENT_SPACING,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(140, 140, 140, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        top: SAFE_AREA_PADDING.paddingTop + 40
    },
    rightButtonRow: {
        position: 'absolute',
        right: SAFE_AREA_PADDING.paddingRight,
        top: SAFE_AREA_PADDING.paddingTop,
    },
}); 