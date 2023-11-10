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
  const [HS, setHS] = useState(0)
  const [HL, setHL] = useState(0)

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

  const [ang, setAng] = useState(0)
  
  const squat = (
    leftHip: any, rightHip: any, 
    leftLeg: any, rightLeg: any,
    leftS: any, rightS: any
  ) => {
    if(leftHip.score < 0.3 || leftHip.score < 0.3 || leftS.score < 0.3){return}

    const hl = leftLeg.y - leftHip.y; 
    const hs = leftHip.y - leftS.y
    setHL(hl); 
    setHS(hs);
    
    const magnitudeA = Math.sqrt((leftS.x ** 2) + (leftS.y ** 2))
    const magnitudeB = Math.sqrt((leftLeg.x ** 2) + (leftLeg.y ** 2))
    const product = (leftS.x * leftS.y) + (leftLeg.x * leftLeg.y)
    const cosTheta = product / (magnitudeA * magnitudeB)

    // Ensure that cosTheta is within the valid range [-1, 1]
    const clampedCosTheta = Math.max(-1, Math.min(1, cosTheta));

    // Calculate the angle in radians
    const angle = Math.acos(clampedCosTheta);

    // Convert the angle to degrees if needed
    const angleDegrees = angle * (180 / Math.PI);
    console.log(angleDegrees)
    setAng(angleDegrees)
   
    return

    // if(angleDegrees <= 40 && angleDegrees >= 0 && hl/hs >= 1.3 && hl/hs <= 1.9 && extended == false){
    //   extended = true
    //   setCounter(counter => counter + 1)
    //   return
    // } if (angleDegrees >= 70 && hl/hs < 1.1 && hl/hs > 0.1 && extended){
    //   extended = false
    // }
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
      // pushup(poses[0].keypoints[9], poses[0].keypoints[5], poses[0].keypoints[7], poses[0].keypoints[0])
      squat(
        poses[0].keypoints[11], poses[0].keypoints[12], 
        poses[0].keypoints[15], poses[0].keypoints[16],
        poses[0].keypoints[5], poses[0].keypoints[6],
      )
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
        <input type="text" placeholder="sa"/>
        <h1>{ang}</h1>
        <h1>Relative: {String(HL/HS)}</h1>
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