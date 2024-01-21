# CramCam: A nwHacks 2024 Submission
## Inspiration
A friend of one of our teammates did a similar project at a hackathon they did, but it sucked. We took this as an opportunity to add cool features, and transform the idea it into something that had more practicality - especially all being students ourselves.

## What it does
CramCam is a study habit manager where you can start a study session through the webapp an it will use your camera and microphone to analyse your working habits and working environment. If you wish, you can enter a goal for your work session, how long you want the session your breaks to be, and the amount of sessios you want to complete. Then, throughout your sessions CramCam will look at how much time you spend working, on your phone, or AFK, as well as the volume of your work environment. At the end it provides statistics on your session (e.g., longest time spent sitting down and AFK), which you can use to improve your next session! 

## How we built it
- For the web interface, we used Typecript, Javascript, HTML, React, Chakra, Flask
- For the facial and eye detection, we used Python, OpenCV and the Haar Cascade trained classifiers.
- For the working environment audio recording, we used PyAudio and Scipy.

## Challenges we ran into
-  It's easy to discern between looking at your screen versus being AFK, but looking down, not so much. After trying many different solutions like using shapes, colours, sihouettes, and contours, we landed upon the solution of using eyes.
- Integrating the webcam OpenCV stuff with the web interface proved to be difficult, but it was finished with some elblow grease.

## Accomplishments that we're proud of
- Learning how to work with facial and eye detection
- Learning how to access the microphone to analyse working environment audio
- Overcoming the many hurdles we thought we couldn't get past

## What's next for CramCam
We would like to work on providing more detailed feedback on your study habits at the end of your session, like what you did well/didn't do well and how to improve.

Happy studying!
