import { useRef, useState, useEffect } from "react";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from '@tensorflow-models/pose-detection';

import Webcam from "react-webcam";
// import { drawKeypoints, drawSkeleton } from "./utilities";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [state, setstate] = useState('')
  
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
    }, 250);
  };

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

      // Set video width\
      if (videoWidth !== null && webcamRef['current']['video']) {
        webcamRef.current['video']['width'] = videoWidth;
        webcamRef.current['video']['height'] = videoHeight;
      }
      
      // Make Detections
      const poses = await net.estimatePoses(video);
      const kp = poses[0].keypoints
      console.log(Math.abs(kp[6].y - kp[12].y) <= 70)
      if(kp == null || kp[6].score < 0.4 || kp[12].score < 0.4){
        setstate('move away from the camera, show shoulders and hips')
        return
      }
      if(Math.abs(kp[6].y - kp[12].y) <= 70){
        setstate('good')
      } else {
        setstate('bad')
      }
      // if(kp[6].x < kp[12].x){
      //   console.log('left')
      //   return
      // }
      // const activeHip = activeShoulder.name == 'right_shoulder' ? poses[12] : poses[11]

      // const pose = await net.estimateSinglePose(video);
      // isClose(
      //   poses[0].keypoints[9],
      //   poses[0].keypoints[10],
      //   poses[0].keypoints[0]
      // )
      // drawCanvas(pose, video, videoWidth, videoHeight, canvasRef);
    }
  };

  // const isClose = (leftHand: any, rightHand: any, mouth: any) => {
  //   if((leftHand.score < 0.4 && rightHand.score < 0.4) || mouth.score < 0.4){
  //     return
  //   }
  //   const distLeft = Math.sqrt((leftHand.x - mouth.x) ** 2 + (leftHand.y - mouth.y) ** 2)
  //   const distRight = Math.sqrt((rightHand.x - mouth.x) ** 2 + (rightHand.y - mouth.y) ** 2)
  //   console.log(distLeft, distRight)
  //   if(distLeft < 100 || distRight < 100){
  //     console.log('HAND CLOSE TO MOUTH')
  //   }
  // }

  // const drawCanvas = (pose: any, video: any, videoWidth: any, videoHeight: any, canvas: any) => {
  //   const ctx = canvas.current.getContext("2d");
  //   canvas.current.width = videoWidth;
  //   canvas.current.height = videoHeight;

  //   drawKeypoints(pose["keypoints"], 0.6, ctx);
  //   drawSkeleton(pose["keypoints"], 0.7, ctx);
  // };

  return (
    <div className="App">
      <header className="App-header">
        <h1>{state}</h1>
        <div className="beo">{state}</div>
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