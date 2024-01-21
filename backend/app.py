from io import BytesIO
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
import cv2, time, base64
from PIL import Image
import numpy as np
from backend.session import Classification, Session
from old.study_session import faceDetection, eyeDetection

app = Flask(__name__)
CORS(app, origins="*");
socketio = SocketIO(app, cors_allowed_origins="*", cors_credentials=True)
cascadeClassifierFace = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
cascadeClassifierEyes = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")
session: Session = None
FRAME_AVG_COUNT = 10
lastFrames = []

# sessionActive = False
# studyFrameCount = 0
# lookDownFrameCount = 0
# AFKFrameCount = 0
# isAFK = False
# AFKCount = 0
# AFKTimerActive = False
# AFKLongestLength = 0
# sittingTimerActive = False
# sittingLongestLength = 0
# totalFrameCount = 0

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
    global session, lastFrame
    lastFrame = None
    session = Session()
    session.start_stopwatch()
    print('Client started study')
    

@socketio.on('frame')
def handle_frame(data: str):
    if session is None:
        return
    encoded = data.split(",", 1)[1]
    decoded = base64.b64decode(encoded)
    image = Image.open(BytesIO(decoded))
    opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    face = faceDetection(opencv_image, cascadeClassifierFace)
    eyes = eyeDetection(opencv_image, cascadeClassifierEyes)
    session.increment_total_frame_count()
    if len(face) > 0 and len(eyes) >= 2:
        thisFrame = Classification.STUDY
        session.increment_study_frame_count()
    elif len(face) > 0 and len(eyes) < 2: 
        thisFrame = Classification.DISTRACTED
        session.increment_distr_frame_count()
    else:
        thisFrame = Classification.AFK
        session.increment_afk_frame_count()
    if majorityOfLastFrames(thisFrame, FRAME_AVG_COUNT):
        session.increment_class_count(thisFrame)
    else:
        session.reset_class_count()

def majorityOfLastFrames(thisFrame, frameCount):
    global lastFrames
    if len(lastFrames) < frameCount:
        lastFrames.append(thisFrame)
        return lastFrames.count(thisFrame) / len(lastFrames) >  0.7
    else:
        lastFrames.pop(0)
        lastFrames.append(thisFrame)
        return lastFrames.count(thisFrame) / frameCount >  0.7


@socketio.on('end_study')
def end_study():
    print('Client ended study session')
    session.stop_stopwatch()
    # clean up variables for analysis
    studyProportion = session.get_study_frame_count / session.get_total_frame_count
    lookDownProportion = session.get_distr_frame_count / session.get_total_frame_count;
    afkProportion = session.get_afk_frame_count / session.get_total_frame_count;

    avgFrameTime = session.get_elapsed_time / session.get_total_frame_count
    afkLongestLength = session.get_max_class_count(Classification.AFK) * avgFrameTime;
    sittingLongestLength = (session.get_max_class_count(Classification.STUDY)
                            + session.get_max_class_count(Classification.DISTRACTED)) * avgFrameTime;

    socketio.emit('study_session_end', {
        "studyProportion": studyProportion,
        "lookDownProportion": lookDownProportion,
        "afkProportion": afkProportion,
        "afkCount": session.get_afk_count(),
        "afkLongestLength": afkLongestLength,
        "sittingLongestLength": sittingLongestLength,
    })

    # print("Total study session length:", session.get_elapsed_time, "seconds")
    # print("Percent of time spent working:", studyPercent, "%")
    # print("Percent of time spent on your phone:", lookDownPercent, "%")
    # print("Percent of time spent AFK:", AFKPercent, "%")
    # print("Approximate number of times you left your desk:", AFKCount)
    # print("The longest time you spent AFK is", AFKLongestLength, "seconds")
    # print("The longest time you spent sitting down is", sittingLongestLength, "seconds")

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