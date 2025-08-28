import React, { useState } from "react";
import { useSpeechRecognition } from "../../../utility/useSpeechRecognition";

const VoiceSearchButton = () => {
  const [transcript, setTranscript] = useState("");

  const { startListening, stopListening, listening } = useSpeechRecognition({
    lang: "en-US",
    continuous: false,
    interimResults: false,
    onResult: (result) => setTranscript(result),
  });

  return ( <div className="p-4 text-center flex justify-start"> <div style={{ marginLeft: "2em" }} className="flex items-center gap-3"> <button onMouseDown={startListening} onMouseUp={stopListening} className="flex items-center justify-center bg-white hover:bg-orange-50 transition" style={{ width: "3em", height: "3em", borderRadius: "50%", border: "2px solid orange", color: "orange", padding: 0, overflow: "hidden", }} > <img src="/mic.png" alt="Mic" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> </button> <span className="text-orange-500 font-medium">Hold to speak</span> </div> {transcript && ( <p className="mt-3 text-gray-700"> <strong>You said:</strong> {transcript} </p> )} </div> );
};

export default VoiceSearchButton;
