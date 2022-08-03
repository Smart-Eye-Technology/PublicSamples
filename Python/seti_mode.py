#Import Open CV Image Library for Capture
from pickle import GLOBAL
from tkinter import image_types
import cv2
import requests
import base64
import json
import numpy as np
import asyncio

#API Configuration for SETI
Enpoint='https://api.app.getsmarteye.mobi/v1'
X_API_KEY='your api key value'
Headers={'x-api-key' : X_API_KEY,'accept': 'application/json'}

#For screen lock
seti_screen = cv2.imread("lockscreen.png")


# define a video capture object (in this example we take the first capture device, usually the local camera on a laptop)
vid = cv2.VideoCapture(0)
FACES=0

#Helper for posting to API
posting=False
async def CountFaces(image:bytes):
    global posting
    global FACES
    posting=True
    try: 
        file_data = [('file', ('file.jpg',image, 'image/jpeg'))]
        faceReq = requests.post(Enpoint+'/faces', files=file_data, headers=Headers)
        response = faceReq.json()
        FACES= response['Faces']
        print(FACES)
    except Exception as inst:
        print('Error during post: '+inst+ " -- "+inst.args)
    finally:
        posting=False
  
#The Main loop
async def main():

    print("Detecting Viewers. Press q to stop:")
    while(True):
        # Capture the video frame by frame
        ret, frame = vid.read()
    
        # Display the resulting frame

        #Process the frame as FileData for posting to the API
        retval, buffer = cv2.imencode('.jpeg', frame,[cv2.IMWRITE_JPEG_QUALITY,100])

        #Determine Face Count
        #See: http://docs.getsmarteye.mobi/rest/#faces-post
        if not posting:
            asyncio.ensure_future(CountFaces(buffer))
            
        await asyncio.sleep(.050)

        if(FACES==1):
            #Show the application
            cv2.imshow('frame', frame)
        else:
            #Lock the screen
            cv2.imshow('frame', seti_screen)

        # the 'q' button is set as the
        # quitting button you may use any
        # desired button of your choice
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break


if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
    
# After the loop release the cap object
vid.release()
# Destroy all the windows
cv2.destroyAllWindows()