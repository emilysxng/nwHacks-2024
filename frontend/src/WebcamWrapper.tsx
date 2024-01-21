import { forwardRef, useImperativeHandle, useRef } from "react"
import Webcam from "react-webcam"
import { io } from "socket.io-client";

const socket = io('http://localhost:3001');

export interface WebcamWrapperMethods {
  capture: () => void;
}

export default forwardRef<WebcamWrapperMethods, object>(function WebcamWrapper(_props: any, ref: any) {
  const webcamRef = useRef<Webcam>(null);
  
  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    socket.emit('frame', imageSrc);
  };

  useImperativeHandle(ref, () => ({
    capture
  }));
  
  return (
    <Webcam
      audio={false}
      ref={webcamRef}
      screenshotFormat="image/jpeg"
    />
  )
});
