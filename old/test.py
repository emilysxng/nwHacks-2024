import soundmeter
from statistics import mean

def measure_decibels():
    meter = soundmeter.Meter()
    meter.start()

    print("Measuring decibels. Press Ctrl+C to stop.")

    try:
        while True:
            decibels = []
            decibels.append(meter.get_db())
            print(f"Current decibel level: {decibels:.2f} dB")
    except KeyboardInterrupt:
        meter.stop()
        avgDecibels = mean(decibels)
        print(f"\nAverage decibel level: {avgDecibels:.2f} dB")


import cv2
import time

def startStudySession():
    # the cascadeClassifier class constructor takes a trained classifier file as its argument
    cascadeClassifierFace = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    cascadeClassifierEyes = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
    videoFeed = cv2.VideoCapture(0)
    startTime = time.time()
    studyFrameCount = 0
    lookDownFrameCount = 0
    AFKFrameCount = 0
    totalFrameCount = 0
    isAFK = False
    AFKCount = 0

    while True:
        isSuccess, videoFrame = videoFeed.read() # from handle_frame

        if isSuccess is False:
            break

        totalFrameCount += 1
        face = faceDetection(videoFrame, cascadeClassifierFace)
        eyes = eyeDetection(videoFrame, cascadeClassifierEyes)
        cv2.imshow("Active Study Session", videoFrame) 

        if len(face) > 0 and len(eyes) >= 2:
            print("Studying")
            studyFrameCount += 1
            isAFK = False
        elif len(face) > 0 and len(eyes) < 2: 
            print("Looking away")
            lookDownFrameCount += 1
            isAFK = False
        else:
            print("AFK")
            AFKFrameCount += 1

            if (isAFK is False):
                isAFK = True
                AFKCount += 1
            else:
                continue

        # quit if q is pressed
        if cv2.waitKey(1) & 0xFF == ord("q"):
            studyPercent = round(studyFrameCount / totalFrameCount * 100, 2)
            lookDownPercent = round(lookDownFrameCount / totalFrameCount * 100, 2)
            AFKPercent = round(AFKFrameCount / totalFrameCount * 100, 2)
            elapsedTime = round(time.time() - startTime, 2)

            print("Total study session length:", elapsedTime, "seconds")
            print("Percent of time spent working:", studyPercent, "%")
            print("Percent of time spent on your phone:", lookDownPercent, "%")
            print("Percent of time spent AFK:", AFKPercent, "%")
            print("Approximate number of times you left your desk:", AFKCount)
            break
        
    videoFeed.release()
    cv2.destroyAllWindows()


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
