import React, { useEffect, useState } from "react";
import { setCORS } from "google-translate-api-browser";

const translate = setCORS("https://corsanywhere.herokuapp.com/");

interface Props {
  transcripts: {
    sender: string;
    message: string;
  }[];
  isFinal: boolean;
  //   language: string;
}

const Captions: React.FC<Props> = ({
  transcripts,
  isFinal,
  // , language
}) => {
  const [caption, setCaption] = useState<string>("");

  useEffect(() => {
    const lastMessage = transcripts[transcripts.length - 1];
    if (lastMessage) {
      //   translate(lastMessage.message, { to: language })
      translate(lastMessage.message, { to: "en" })
        .then((res) => {
          setCaption(`${lastMessage.sender}: ${res.text}`);
        })
        .catch((err) => {
          console.error(err);
        });
    }

    if (isFinal) {
        setCaption("");
    }
  }, [
    transcripts,
    // , language
  ]);

  return (
    <div className="absolute bottom-0 bg-gray-800 p-2 text-white">
      <p>{caption}</p>
    </div>
  );
};

export default Captions;
