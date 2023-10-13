"use client"
import { useState, useRef } from "react";
import toWav from "audiobuffer-to-wav";

const IndexPage = () => {
  const [audioURL, setAudioURL] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const localAudioChunksRef = useRef([]);
  const [wavBlob, setWavBlob] = useState(null); 

  const getMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch (error) {
      console.error("Error getting microphone permission:", error);
    }
  };
  const downloadWavFile = () => {
    const link = document.createElement('a');
    link.href = audioURL;
    link.download = 'audio.wav';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const startRecording = async () => {
    setIsRecording(true);
    if (!streamRef.current) {
      await getMicrophonePermission();
    }

    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: "audio/webm" });
    mediaRecorderRef.current = mediaRecorder;
    localAudioChunksRef.current = [];

    mediaRecorder.start();
    mediaRecorder.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunksRef.current.push(event.data);
    };
  };
  const apiServer = async () => {
    try {
      const formData = new FormData();
      formData.append('audio', wavBlob, 'audio.wav');
  
      const response = await fetch('/api/record', {
        method: 'POST',
        body: formData, 
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error sending audio to server:', error);
    }
  };
  const stopRecording = async () => {
    setIsRecording(false);
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(localAudioChunksRef.current, { type: "audio/webm" });
      const audioBuffer = await blobToAudioBuffer(audioBlob);
      const wavBlob = new Blob([new Uint8Array(toWav(audioBuffer))], { type: "audio/wav" });
      const audioURL = URL.createObjectURL(wavBlob);
      setAudioURL(audioURL);
      setWavBlob(wavBlob);
    };
  };

  return (
    <div className="flex flex-col items-center">
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4" onClick={startRecording}>Start Recording</button>
      <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg mt-2" onClick={stopRecording}>Stop Recording</button>
      {isRecording && (
        <img className="mt-4" src="https://i.gifer.com/YdBO.gif" alt="Recording" />
      )}
    {audioURL && (
        <>
          <audio className="mt-4" src={audioURL} controls />
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mt-2" onClick={downloadWavFile}>Download WAV</button>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mt-2" onClick={apiServer}>Authenticate</button>
        </>
      )}
    </div>
  );
};
// Helper function to convert Blob to AudioBuffer
const blobToAudioBuffer = async (blob) => {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return await audioContext.decodeAudioData(arrayBuffer);
};

export default IndexPage;