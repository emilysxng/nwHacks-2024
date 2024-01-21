from io import BytesIO
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
import cv2, time, base64
from PIL import Image
import numpy as np
from old.study_session import faceDetection, eyeDetection

app = Flask(__name__)
CORS(app, origins="*");
socketio = SocketIO(app, cors_allowed_origins="*", cors_credentials=True)
cascadeClassifierFace = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
cascadeClassifierEyes = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")
sessionActive = False
studyFrameCount = 0
lookDownFrameCount = 0
AFKFrameCount = 0
isAFK = False
AFKCount = 0
AFKTimerActive = False
AFKLongestLength = 0
sittingTimerActive = False
sittingLongestLength = 0
totalFrameCount = 0

@app.route('/')
def index():
    return "Hello World!"

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

# THIS IS WHERE TO DO OPEN CV STUFF

@socketio.on('start_study')
def start_study():
    global startTime, sessionActive
    print('Client started study')
    startTime = time.time()
    sessionActive = True

@socketio.on('frame')
def handle_frame(data: str):
    global studyFrameCount, lookDownFrameCount, AFKFrameCount, totalFrameCount, AFKCount, startTime
    global AFKTimerActive, AFKLongestLength, AFKTimeStart, AFKElapsedTime, sittingTimerActive, sittingLongestLength
    print('Client sent frame')
    totalFrameCount += 1
    if not sessionActive:
        return
    encoded = data.split(",", 1)[1]
    # print(encoded)
    decoded = base64.b64decode(encoded)
    # convert the bytes to a PIL image
    image = Image.open(BytesIO(decoded))
    # convert the PIL image to an OpenCV image
    # note: PIL reads in RGB by default, openCV reads in BGR
    opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    face = faceDetection(opencv_image, cascadeClassifierFace)
    eyes = eyeDetection(opencv_image, cascadeClassifierEyes)

    if len(face) > 0 and len(eyes) >= 2:
        print("Studying")
        studyFrameCount += 1
        isAFK = False
        AFKTimerEnd()
        if (sittingTimerActive is False):
            sittingTimeStart = time.time()
            sittingTimerActive = True

    elif len(face) > 0 and len(eyes) < 2: 
        print("Looking away")
        lookDownFrameCount += 1
        isAFK = False
        AFKTimerEnd()
        if (sittingTimerActive is False):
            sittingTimeStart = time.time()
            sittingTimerActive = True

    else:
        print("AFK")
        AFKFrameCount += 1
        if (isAFK is False):
            isAFK = True
            AFKCount += 1
            if (AFKTimerActive is False):
                AFKTimeStart = time.time()
                AFKTimerActive = True
        if (sittingTimerActive is True):
            sittingTimerActive = False
            elapsedSittingTime = round(time.time() - sittingTimeStart, 2)
            if (elapsedSittingTime > sittingLongestLength):
                sittingLongestLength = elapsedSittingTime

@socketio.on('end_study')
def end_study():
    print('Client ended study session')
    # clean up variables for analysis
    studyPercent = round(studyFrameCount / totalFrameCount * 100, 2)
    lookDownPercent = round(lookDownFrameCount / totalFrameCount * 100, 2)
    AFKPercent = round(AFKFrameCount / totalFrameCount * 100, 2)
    elapsedTime = round(time.time() - startTime, 2)

    print("Total study session length:", elapsedTime, "seconds")
    print("Percent of time spent working:", studyPercent, "%")
    print("Percent of time spent on your phone:", lookDownPercent, "%")
    print("Percent of time spent AFK:", AFKPercent, "%")
    print("Approximate number of times you left your desk:", AFKCount)
    print("The longest time you spent AFK is", AFKLongestLength, "seconds")
    print("The longest time you spent sitting down is", sittingLongestLength, "seconds")

    socketio.emit()

def faceDetection(videoFrame, cascadeClassifierFace):
    greyVideoFrame = cv2.cvtColor(videoFrame, cv2.COLOR_BGR2GRAY)
    # arguments for detectMultiScale: image to be searched, scale factor, min neighbors, min size of face
    # returns top left, bottom right corner of the face
    face = cascadeClassifierFace.detectMultiScale(greyVideoFrame, 1.1, 6, minSize=(40, 40))
    # draw a rectangle on the face
    for (x, y, w, h) in face:
        #arguments for rectangle: frame to draw on, start pt, end pt, colour, thickness
        cv2.rectangle(videoFrame, (x, y), (x + w, y + h), (255, 0, 0), 2)
    return face

def eyeDetection(videoFrame, cascadeClassifierEyes):
    greyVideoFrame = cv2.cvtColor(videoFrame, cv2.COLOR_BGR2GRAY)
    eyes = cascadeClassifierEyes.detectMultiScale(greyVideoFrame, scaleFactor=1.1, minNeighbors=6, minSize=(30, 30))
    for (x, y, w, h) in eyes:
        cv2.rectangle(videoFrame, (x, y), (x + w, y + h), (0, 255, 0), 2)
    return eyes

def AFKTimerEnd():
    global AFKTimerActive, AFKElapsedTime, AFKLongestLength
    if (AFKTimerActive is True):
            AFKElapsedTime = round(time.time() - AFKTimeStart, 2)
            AFKTimerActive = False
            if (AFKElapsedTime > AFKLongestLength):
                AFKLongestLength = AFKElapsedTime
        
if __name__ == '__main__':
    socketio.run(app, port=3001)