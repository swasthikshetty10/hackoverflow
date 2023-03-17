import { useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { api } from "~/utils/api";

type UseTranscribeProps = {
  roomName: string;
  audioEnabled: boolean;
};

const useTranscribe = ({ roomName, audioEnabled }: UseTranscribeProps) => {
  const {
    transcript,
    resetTranscript,
    finalTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const pusherMutation = api.pusher.send.useMutation();

  useEffect(() => {
    if (finalTranscript !== "") {
      pusherMutation.mutate({
        message: transcript,
        roomName: roomName,
        isFinal: true,
      });
      resetTranscript();
    } else {
      pusherMutation.mutate({
        message: transcript,
        roomName: roomName,
        isFinal: false,
      });
    }
  }, [finalTranscript, resetTranscript, transcript, roomName]);

  useEffect(() => {
    if (audioEnabled) {
      SpeechRecognition.startListening({ continuous: true});
    }
  }, [audioEnabled]);

  return null;
};

export default useTranscribe;
