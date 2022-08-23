# Python Examples
The examples in this folder detail the use of Smart Eye Technologies API with Python. These examples were created using Python3.8.

## SETI MODE
SETI Mode allows a developer to create a locking mechanism, wherein the application hides the user interface when multiple viewers are detected. This is specifically useful for the prevention of unauthorized viewing (or shoulder surfing) of critical documents.

### Running the sample
To run the samples, your environment must be setup according to [EXPO React Native Guide](https://reactnative.dev/docs/environment-setup)

**Install Libraries**
Install the Node dependencies using yarn  
```shell
yarn install
```

**Run the sample**
Running the sample requires a IOS or Android device. Unfortunately the simulated devices do not support interaction with Cameras.  If running with IOS, you may be prompted regarding code-signing certificates. If so, you must open the ios project generated in Expo with XCode and sign the project with a valid certificate. A self-signed developer certificate should work fine if you do not possess an Apple Developer certificate.

```shell
yarn ios
```

or

```shell
yarn android
```