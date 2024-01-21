# CramCam: A nwHacks 2024 Submission
## Inspiration
As students, we recognize that we study a lot. And we mean a lot. But, we started thinking... maybe the reason we work  so much is because our time is spent inefficiently. Whether it be going on our phones, doodling on paper, or leaving our desks entirely, there are tons of distractions everywhere. CramCam aims to solve this problem by analyzing your study habits, helping you manage your working time more efficiently.

## What it does
CramCam is a study habit analyzer where you can start a study session through the webapp, and it will use your camera and microphone to analyse your working habits and working environment. If you wish, you can enter a goal for your work session, how long you want the session your breaks to be, and the amount of sessions you want to complete. Then, throughout your sessions CramCam will look at how much time you spend working, on your phone, or AFK, as well as the volume of your work environment. At the end it provides statistics on your session (e.g., longest time spent sitting down and AFK), which you can use to improve your next session! 

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

