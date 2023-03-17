import {
  LiveKitRoom,
  PreJoin,
  LocalUserChoices,
  useToken,
  VideoConference,
  formatChatMessageLinks,
} from "@livekit/components-react";
import { LogLevel, RoomOptions, VideoPresets } from "livekit-client";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { FC, useEffect, useMemo, useState } from "react";
import { DebugMode } from "../../lib/Debug";
import { useServerUrl } from "../../lib/client-utils";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";

// THis is join room page, provide room name to join as a participant

const Home: NextPage = () => {
  const router = useRouter();
  const { name: roomName } = router.query;
  const { data: session, status } = useSession();
  const [preJoinChoices, setPreJoinChoices] = useState<
    LocalUserChoices | undefined
  >(undefined);
  if (status === "loading") return <div>Loading...</div>;
  if (!session) router.push(`api/auth/signin?callbackUrl=/rooms/${roomName}`);
  return (
    <>
      <Head>
        <title>LiveKit Meet</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main data-lk-theme="default">
        {roomName && !Array.isArray(roomName) && preJoinChoices ? (
          <ActiveRoom
            roomName={roomName}
            userChoices={preJoinChoices}
            onLeave={() => setPreJoinChoices(undefined)}
          ></ActiveRoom>
        ) : (
          <div
            style={{ display: "grid", placeItems: "center", height: "100%" }}
          >
            <PreJoin
              onError={(err) =>
                console.log("error while setting up prejoin", err)
              }
              defaults={{
                username: session?.user.name as string,
                videoEnabled: true,
                audioEnabled: true,
              }}
              onSubmit={(values) => {
                console.log("Joining with: ", values);
                setPreJoinChoices(values);
              }}
            ></PreJoin>
          </div>
        )}
      </main>
    </>
  );
};

export default Home;

type ActiveRoomProps = {
  userChoices: LocalUserChoices;
  roomName: string;
  region?: string;
  onLeave?: () => void;
};

const Transcriptions = ({
  audioEnabled,
  roomName,
}: {
  audioEnabled: boolean;
  roomName: string;
}) => {
  const {
    transcript,
    listening,
    resetTranscript,
    finalTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (finalTranscript !== "") {
      resetTranscript();
    }
  }, [finalTranscript, resetTranscript]);

  useEffect(() => {
    if (audioEnabled) {
      SpeechRecognition.startListening({ continuous: true });
    }
  }, [audioEnabled]);

  const pusherMutation = api.pusher.send.useMutation();

  useEffect(() => {
    let isFinal = false;
    if (transcript != "") {
      if (finalTranscript !== "") {
        isFinal = true;
      }
      pusherMutation.mutate({
        message: transcript,
        roomName: roomName,
        isFinal: isFinal,
      });
    }
  }, [transcript, roomName]);

  if (!browserSupportsSpeechRecognition || !audioEnabled) {
    return null;
  }

  return (
    <div className="bg-black p-4 text-center">
      <a>{transcript}</a>
    </div>
  );
};

const ActiveRoom = ({ roomName, userChoices, onLeave }: ActiveRoomProps) => {
  const { data, error, isLoading } = api.rooms.joinRoom.useQuery({ roomName });

  const router = useRouter();
  const { region, hq } = router.query;

  //   const liveKitUrl = useServerUrl(region as string | undefined);

  const roomOptions = useMemo((): RoomOptions => {
    return {
      videoCaptureDefaults: {
        deviceId: userChoices.videoDeviceId ?? undefined,
        resolution: hq === "true" ? VideoPresets.h2160 : VideoPresets.h720,
      },
      publishDefaults: {
        videoSimulcastLayers:
          hq === "true"
            ? [VideoPresets.h1080, VideoPresets.h720]
            : [VideoPresets.h540, VideoPresets.h216],
      },
      audioCaptureDefaults: {
        deviceId: userChoices.audioDeviceId ?? undefined,
      },
      adaptiveStream: { pixelDensity: "screen" },
      dynacast: true,
    };
  }, [userChoices, hq]);

  const [transcripts, setTranscripts] = useState<
    {
      sender: string;
      message: string;
    }[]
  >([]);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    });

    const channel = pusher.subscribe(roomName);
    channel.bind(
      "transcribe-event",
      function (data: { sender: string; message: string }) {
        console.info("heree", data);
        setTranscripts((prev) =>
          prev.find((t) => t.sender === data.sender)
            ? prev.map((t) =>
                t.sender === data.sender
                  ? { sender: data.sender, message: data.message }
                  : t
              )
            : [...prev, data]
        );
      }
    );
  }, []);

  return (
    <>
      {data && (
        <LiveKitRoom
          token={data.accessToken}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_API_HOST}
          options={roomOptions}
          video={userChoices.videoEnabled}
          audio={userChoices.audioEnabled}
          onDisconnected={onLeave}
        >
          <Transcriptions
            roomName={roomName}
            audioEnabled={userChoices.audioEnabled}
          />
          <VideoConference chatMessageFormatter={formatChatMessageLinks} />
          <DebugMode logLevel={LogLevel.info} />
        </LiveKitRoom>
      )}
    </>
  );
};
