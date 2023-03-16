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

const Transcriptions = ({ audioEnabled }: { audioEnabled: boolean }) => {
  const {
    transcript,
    listening,
    resetTranscript,
    finalTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();


  useEffect(() => {
    if (finalTranscript !== '') {
      resetTranscript();
    }
  }, [finalTranscript, resetTranscript]);

  useEffect(() => {
    if (audioEnabled) {
      SpeechRecognition.startListening({ continuous: true });
    }
  }, [audioEnabled]);

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
          <Transcriptions audioEnabled={userChoices.audioEnabled} />
          <VideoConference chatMessageFormatter={formatChatMessageLinks} />
          <DebugMode logLevel={LogLevel.info} />
        </LiveKitRoom>
      )}
    </>
  );
};
