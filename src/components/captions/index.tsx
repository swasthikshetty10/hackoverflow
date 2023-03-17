import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { setCORS } from "google-translate-api-browser";

const translate = setCORS("https://corsanywhere.herokuapp.com/");

type Transcription = {
  sender: string;
  message: string;
  senderId: string;
  isFinal: boolean;
};

interface Props {
  transcriptionQueue: Transcription[];
  setTranscriptionQueue: Dispatch<SetStateAction<Transcription[]>>;
}

const Captions: React.FC<Props> = ({
  transcriptionQueue,
  setTranscriptionQueue,
}) => {
  const [caption, setCaption] = useState<{ sender: string; message: string }>();

  useEffect(() => {
    async function translateText() {
      if (transcriptionQueue.length > 0 ) {
        const res = await translate(transcriptionQueue[0]?.message as string, {
          to: "en",
        });
        setCaption({
          message: res.text,
          sender: transcriptionQueue[0]?.sender as string,
        });
        setTranscriptionQueue((prev) => prev.slice(1));
      }
    }
    translateText();
  }, [transcriptionQueue]);

  return (
    <div className="closed-captions-wrapper">
      <div className="closed-captions-container">
        {caption?.message ? (
          <>
            <div className="closed-captions-username">{caption.sender}</div>
            <span>:&nbsp;</span>
          </>
        ) : null}
        <div className="closed-captions-text">{caption?.message}</div>
      </div>
    </div>
  );
};

export default Captions;
