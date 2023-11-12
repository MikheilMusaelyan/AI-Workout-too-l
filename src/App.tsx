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
    // setInterval(() => {
    //   detect(detector);
    // }, 150);
    const A = [0, 0]
    const B = [0, 1]
    const C = [1, 0]
    printAngle(A, B, C)
  };

  const lengthSquare = (X: any, Y: any) => { 
    let xDiff = X[0] - Y[0]; 
    let yDiff = X[1] - Y[1]; 
    return xDiff*xDiff + yDiff*yDiff; 
  } 
  
  const printAngle = (A: any, B: any, C: any) => { 
    // Square of lengths be a2, b2, c2 
    let a2 = lengthSquare(B,C); 
    let b2 = lengthSquare(A,C); 
    let c2 = lengthSquare(A,B); 
  
    // length of sides be a, b, c 
    let a = Math.sqrt(a2); 
    let b = Math.sqrt(b2); 
    let c = Math.sqrt(c2); 
  
    // From Cosine law 
    let alpha = Math.acos((b2 + c2 - a2)/(2*b*c)); 
    let beta = Math.acos((a2 + c2 - b2)/(2*a*c)); 
    let gamma = Math.acos((a2 + b2 - c2)/(2*a*b)); 
  
    // Converting to degree 
    alpha = alpha * 180 / Math.PI; 
    beta = beta * 180 / Math.PI; 
    gamma = gamma * 180 / Math.PI; 
  
    // printing all the angles 
    console.log("alpha : ", alpha); 
    console.log("beta : ", beta); 
    console.log("gamma : ", gamma); 
  }
  


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
    if(leftLeg.score < 0.3 || leftHip.score < 0.3 || leftS.score < 0.3){return}

    const hl = leftLeg.y - leftHip.y; 
    const hs = leftHip.y - leftS.y
    setHL(hl); 
    setHS(hs);

    // const SE = { x: leftElbow.x - leftShoulder.x, y: leftElbow.y - leftShoulder.y };
    // const EW = { x: leftWrist.x - leftElbow.x, y: leftWrist.y - leftElbow.y };
    // const angleRadians = Math.acos((SE.x * EW.x + SE.y * EW.y) / (Math.hypot(SE.x, SE.y) * Math.hypot(EW.x, EW.y)))
    // let angle = (angleRadians * 180) / Math.PI;
    
    const IMG = { x: leftS.x, y: leftLeg.y }
    const SI = { x: IMG.x - leftS.x, y: IMG.y - leftS.y };
    const IL = { x: leftLeg.x - IMG.x, y: leftLeg.y - IMG.y };
    const angleRadians = Math.acos((SI.x * IL.x + SI.y * IL.y) / (Math.hypot(SI.x, SI.y) * Math.hypot(IL.x, IL.y)))
    let angle = (angleRadians * 180) / Math.PI;
    setCounter(angle)

    return

    if(hl/hs >= 1.3 && hl/hs <= 1.9 && extended == false){
      extended = true
      setCounter(counter => counter + 1)
      return
    } if (hl/hs < 1.1 && hl/hs > 0.1 && extended){
      extended = false
    }
  }

  const core = (shoulder: any, hip: any, foot: any) => {
    const SE = { x: hip.x - shoulder.x, y: hip.y - shoulder.y };
    const EW = { x: foot.x - hip.x, y: foot.y - hip.y };
    const angleRadians = Math.acos((SE.x * EW.x + SE.y * EW.y) / (Math.hypot(SE.x, SE.y) * Math.hypot(EW.x, EW.y)))
    let angle = (angleRadians * 180) / Math.PI;
    setCounter(angle)
  }

// ANGLES

  const dotProduct = (u: any, v: any) => {
    return u[0] * v[0] + u[1] * v[1];
  }

  const vectorMagnitude = (v: any) => {
    return Math.sqrt(v[0] ** 2 + v[1] ** 2);
  }

  const angleBetweenVectors = (u: any, v: any): number => {
    const dot = dotProduct(u, v);
    const magnitudeU = vectorMagnitude(u);
    const magnitudeV = vectorMagnitude(v);

    // Calculate the cosine of the angle
    const cosineValue = dot / (magnitudeU * magnitudeV);

    // Calculate the angle in radians
    const angleInRadians = Math.acos(cosineValue);

    // Convert radians to degrees
    const angleInDegrees: number = (180 / Math.PI) * angleInRadians;

    return Number(angleInDegrees.toFixed(1));
}

// ANGLES


  const detect = async (net: any) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current['video']['readyState'] === 4
    ) {
      const video = webcamRef.current['video'];
      const poses = await net.estimatePoses(video);

      if(!poses || !poses[0]['keypoints']) return
      
      // pushup(poses[0].keypoints[9], poses[0].keypoints[5], poses[0].keypoints[7], poses[0].keypoints[0])
      // squat(
      //   poses[0].keypoints[11], poses[0].keypoints[12], 
      //   poses[0].keypoints[15], poses[0].keypoints[16],
      //   poses[0].keypoints[5], poses[0].keypoints[6],
      // )
      core(poses[0].keypoints[5], poses[0].keypoints[11], poses[0].keypoints[15])
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
        <h1>{counter}</h1>
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