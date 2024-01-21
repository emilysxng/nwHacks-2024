import { useEffect, useRef } from "react"
import Webcam from "react-webcam"
import { io } from "socket.io-client";

const socket = io('http://localhost:3001');

export default function WebcamWrapper() {
  const webcamRef = useRef<Webcam>(null);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    console.log(imageSrc);
    socket.emit('frame', imageSrc);
  };

  useEffect(() => {
    socket.emit('start_study');
    const interval = setInterval(capture, 200); // Adjust the interval as needed
    return () => {
      clearInterval(interval);
      socket.emit('end_study');
    };
  }, []);
  
  return (
    <Webcam
      audio={false}
      ref={webcamRef}
      screenshotFormat="image/jpeg"
    />
  )
}
