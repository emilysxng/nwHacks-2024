from io import BytesIO
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
import cv2, time, base64
from PIL import Image
import numpy as np
from study_session import faceDetection, eyeDetection

app = Flask(__name__)
CORS(app, origins="*");
socketio = SocketIO(app, cors_allowed_origins="*", cors_credentials=True)
cascadeClassifierFace = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
cascadeClassifierEyes = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")
startTime = time.time()
studying = False
studyFrameCount = 0
lookDownFrameCount = 0
AFKFrameCount = 0

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
    global startTime, studying
    print('Client started study')
    startTime = time.time()
    studying = True
    

@socketio.on('frame')
def handle_frame(data: str):
    global studyFrameCount, lookDownFrameCount, AFKFrameCount
    print('Client sent frame')
    if not studying:
        return
    encoded = data.split(",", 1)[1]
    # print(encoded)
    decoded = base64.b64decode(encoded)
    # Convert the bytes to a PIL image
    image = Image.open(BytesIO(decoded))
    # Convert the PIL image to an OpenCV image
    # Note: PIL reads in RGB by default, OpenCV reads in BGR
    opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    face = faceDetection(opencv_image, cascadeClassifierFace)
    eyes = eyeDetection(opencv_image, cascadeClassifierEyes)
    # cv2.imshow("Active Study Session", videoFrame) 
    if len(face) > 0 and len(eyes) > 0:
        print("Studying")
        studyFrameCount += 1
    elif len(face) > 0 and len(eyes) == 0: 
        print("Looking away")
        lookDownFrameCount += 1
    else:
        print("AFK")
        AFKFrameCount += 1

@socketio.on('end_study')
def end_study():
    print('Client ended study')
    # clean up variables
    socketio.emit()
        

if __name__ == '__main__':
    socketio.run(app, port=3001)