# Typescipt Examples
The examples in this folder detail the use of Smart Eye Technologies API with React Native (TypeScript). These examples were created using Node/TypeScript v16.3.0.  

## SETI MODE
SETI Mode allows a developer to create a locking mechanism, wherein the application hides the user interface when multiple viewers are detected. This is specifically useful for the prevention of unauthorized viewing (or shoulder surfing) of critical documents.

### Running the sample

**Install Libraries**
Install the NodeJs dependencies using npm
```shell
npm i
```

Install the Pod dependencies using
```shell
cd ios
pod install
```
>   Note: M1 Mac users may need to run "arch --x86_64 pod install" 

**Run the sample**
```shell
npm run ios 
```

or  

```shell
npm run android 
```

## Using The Application
Once the application starts it will show you either a lock screen or a document. Two values will be shown for the detection of faces.  One will represent the number of faces detected locally (via onboard TensorFlow machine learning models). The other reflects the values calculated with the SETI Mode API.  Experiment with which values are detected first and how the application behaves when no faces and multiple faces are detected.

## Known Issues
If you receive an error regarding Apple Developer code signing, you may need to open the workspace from /ios and associate a developer profile. A Free individual profile is sufficient to run the sample locally.