# Python Examples
The examples in this folder detail the use of Smart Eye Technologies API with Python. These examples were created using Python3.8.

## SETI MODE
SETI Mode allows a developer to create a locking mechanism, wherein the application hides the user interface when multiple viewers are detected. This is specifically useful for the prevention of unauthorized viewing (or shoulder surfing) of critical documents.

### Running the sample

**Install Libraries**
Install the Python dependencies using pip  
```shell
pip install -r r requirements.txt
```

**Run the sample**
```shell
python seti_mode.py
```

> **Note** Some operating systems may prompt for access to the capture device. You must accept this prompt and restart the example if prompted for the example to function properly.

> **Note** If you are running the sample with OS X and receive errors regarding _tkinter, install the tk library via ```brew install python-tk```


## Using The Application
Once the application starts it will show you your face, assuming you are the only viewer. If another face is detected or you look away, the lock screen will replace the view. This provides a basis for the experience developers can create in their own apps leveraging the SETI API operations.