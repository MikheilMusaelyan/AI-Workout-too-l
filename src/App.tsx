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
  
  useEffect(() => {
    tf.ready().then(() => {
      runPose();
    });
  }, []);

  const runPose = async () => {
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet, 
      {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
      }
    );
    setInterval(() => {
      detect(detector);
    }, 200);
  };

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;  
    return Math.sqrt(deltaX ** 2 + deltaY ** 2);
  }

  const detect = async (net: any) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current['video']['readyState'] === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current['video'];
      const videoWidth = webcamRef.current['video']['videoWidth'];
      const videoHeight = webcamRef.current['video']['videoWidth'];

      // Set video width
      if (videoWidth !== null && webcamRef['current']['video']) {
        webcamRef.current['video']['width'] = videoWidth;
        webcamRef.current['video']['height'] = videoHeight;
      }
      
      // Make Detections
      const poses = await net.estimatePoses(video);
      let kp = null

      if(poses && poses[0]['keypoints']) { kp = poses[0]['keypoints'] }
      
      if(kp == null || kp[6].score < 0.4 || kp[12].score < 0.4) {
        return
      }     

      console.log(`shoulder to wrist: ${(kp[10].y - kp[6].y)} shoulder to foot:  ${(kp[16].y - kp[16].y)}`)

      // const SE = { x: kp[8].x - kp[6].x, y: kp[8].y - kp[6].y };
      // const EW = { x: kp[10].x - kp[8].x, y: kp[10].y - kp[8].y };
      // const angleRadians = Math.acos((SE.x * EW.x + SE.y * EW.y) / (Math.hypot(SE.x, SE.y) * Math.hypot(EW.x, EW.y)))
      // const angleDegrees = (angleRadians * 180) / Math.PI;

      // if(angleDegrees <= 30 && extended == false){
      //   extended = true
      //   setCounter((counter) => counter + 1)
      // } else if (angleDegrees >= 100 && extended == true){
      //   extended = false
      // }

      // if((kp[10].y - kp[6].y) > 270 && extended == false){
      //   extended = true
      //   console.log('extended')
      //   setCounter((counter) => counter + 1)
      // } else if ((kp[10].y - kp[6].y) > 0 && (kp[10].y - kp[6].y) < 150 && extended == true){
      //   extended = false
      //   console.log('npy extended')
      // }

      // if(extended == false &&  )
      // if(Math.abs(kp[6].y - kp[12].y) <= 70){
      //   setstate('good')
      // } else {
      //   setstate('bad')
      // }
      // if(kp[6].x < kp[12].x){
      //   console.log('left')
      //   return
      // }
      // const activeHip = activeShoulder.name == 'right_shoulder' ? poses[12] : poses[11]
    }
  };

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
            width: 640,
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