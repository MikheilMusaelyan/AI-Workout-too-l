import { useRef, useState, useEffect } from "react";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from '@tensorflow-models/pose-detection';

import Webcam from "react-webcam";
// import { drawKeypoints, drawSkeleton } from "./utilities";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  let extended: boolean = true
  const [counter, setCounter] = useState(0)
  let count = 0
  
  useEffect(() => {
    tf.ready().then(() => {
      runPose();
    });
  }, []);

  const runPose = async () => {
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet, 
      {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER}
    );
    setInterval(() => {
      detect(detector);
    }, 150);
  };

  // const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  //   const deltaX = x2 - x1;
  //   const deltaY = y2 - y1;  
  //   return Math.sqrt(deltaX ** 2 + deltaY ** 2);
  // }

  
  // 
  const pushup = (leftWrist: any, leftShoulder: any, leftElbow: any, nose: any) => {
      // let angle = (
      //   Math.atan2(
      //     leftWrist.y - leftElbow.y,
      //     leftWrist.x - leftElbow.x
      //   ) - Math.atan2(
      //     leftShoulder.y - leftElbow.y,
      //     leftShoulder.x - leftElbow.x
      //   )
      // ) * (180 / Math.PI);

      const SE = { x: leftElbow.x - leftShoulder.x, y: leftElbow.y - leftShoulder.y };
      const EW = { x: leftWrist.x - leftElbow.x, y: leftWrist.y - leftElbow.y };
      const angleRadians = Math.acos((SE.x * EW.x + SE.y * EW.y) / (Math.hypot(SE.x, SE.y) * Math.hypot(EW.x, EW.y)))
      let angle = (angleRadians * 180) / Math.PI;
    
      if (leftWrist.score < 0.3 && leftElbow.score < 0.3 && leftShoulder.score < 0.3) {
        return
      }

      if (angle >= 0 && angle < 95 && extended == false) {
        var msg = new SpeechSynthesisUtterance(String(count+1));
        window.speechSynthesis.speak(msg);
        setCounter(counter => counter + 1) 
        count += 1
        extended = true
        return
      }

      if ((angle > 100 && angle < 175) && extended == true && nose.y > leftElbow.y) {
        extended = false
      }
  }
  


  const detect = async (net: any) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current['video']['readyState'] === 4
    ) {
      const video = webcamRef.current['video'];
      // const videoWidth = webcamRef.current['video']['videoWidth'];
      // const videoHeight = webcamRef.current['video']['videoWidth'];

      // if (videoWidth !== null && webcamRef['current']['video']) {
      //   webcamRef.current['video']['width'] = videoWidth;
      //   webcamRef.current['video']['height'] = videoHeight;
      // }
      
      const poses = await net.estimatePoses(video);

      if(!poses || !poses[0]['keypoints']) { return }
      pushup(poses[0].keypoints[9], poses[0].keypoints[5], poses[0].keypoints[7], poses[0].keypoints[0])
  };
  }

  // const drawCanvas = (pose: any, video: any, videoWidth: any, videoHeight: any, canvas: any) => {
  //   const ctx = canvas.current.getContext("2d");
  //   canvas.current.width = videoWidth;
  //   canvas.current.height = videoHeight;

  //   drawKeypoints(pose["keypoints"], 0.6, ctx);
  //   drawSkeleton(pose["keypoints"], 0.7, ctx);
  // };

  return (
    <div className="App">
      <header className="App-header" style={{background: 'var(--background)', padding: '10px'}}>
        <h1 className="card">{counter}</h1>
        <input type="text" placeholder="sa"/>
        <h1>{String(extended)}</h1>
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 940,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;