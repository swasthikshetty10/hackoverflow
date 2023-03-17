import {
  LiveKitRoom,
  PreJoin,
  LocalUserChoices,
  VideoConference,
  formatChatMessageLinks,
} from "@livekit/components-react";
import { LogLevel, RoomOptions, VideoPresets } from "livekit-client";

import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { DebugMode } from "../../lib/Debug";
import { api } from "~/utils/api";
import { signIn, useSession } from "next-auth/react";
import Pusher from "pusher-js";
import useTranscribe from "~/hooks/useTranscribe";
import Captions from "~/components/captions";
import SplashScreen from "~/components/splashScreen";

const Home: NextPage = () => {
  const router = useRouter();
  const { name: roomName } = router.query;
  const { data: session, status } = useSession();
  const [preJoinChoices, setPreJoinChoices] = useState<
    LocalUserChoices | undefined
  >(undefined);
  const [selectedCode, setSelectedCode] = useState("en");
  if (status === "loading") return <SplashScreen />;
  if (!session) signIn("google");

  const languageCodes = [
    {
      language: "English",
      code: "en-US",
    },
    {
      language: "Hindi",
      code: "hi-IN",
    },
    {
      language: "Japanese",
      code: "ja-JP",
    },
    {
      language: "French",
      code: "fr-FR",
    },
    {
      language: "Deutsch",
      code: "de-DE",
    },
  ];

  return (
    <main data-lk-theme="default">
      {roomName && !Array.isArray(roomName) && preJoinChoices ? (
        <>
          <ActiveRoom
            roomName={roomName}
            userChoices={preJoinChoices}
            onLeave={() => setPreJoinChoices(undefined)}
            userId={session?.user.id as string}
            selectedLanguage={selectedCode}
          ></ActiveRoom>
          <div className="lk-prejoin"
          style={{
            width: "100%",
          }}
          >
            <select
              className="lk-button"
              onChange={(e) => setSelectedCode(e.target.value)}
            >
              {languageCodes.map((language) => (
                <option value={language.code}>{language.language}</option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <div className="flex h-screen flex-col items-center justify-center">
          <div className="lk-prejoin flex flex-col gap-3">
            <div className="text-2xl font-bold">Hey, {session?.user.name}!</div>
            <div className="text-sm font-normal">
              You are joining{" "}
              <span className="gradient-text font-semibold">{roomName}</span>
            </div>
            <label>
              <span>Choose your Language</span>
            </label>
            <select
              className="lk-button"
              onChange={(e) => setSelectedCode(e.target.value)}
            >
              {languageCodes.map((language) => (
                <option value={language.code}>{language.language}</option>
              ))}
            </select>
          </div>
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
  );
};

export default Home;

type ActiveRoomProps = {
  userChoices: LocalUserChoices;
  roomName: string;
  region?: string;
  onLeave?: () => void;
  userId: string;
  selectedLanguage: string;
};

const ActiveRoom = ({
  roomName,
  userChoices,
  onLeave,
  userId,
  selectedLanguage,
}: ActiveRoomProps) => {
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

  const [transcriptionQueue, setTranscriptionQueue] = useState<
    {
      sender: string;
      message: string;
      senderId: string;
      isFinal: boolean;
    }[]
  >([]);
  useTranscribe({
    roomName,
    audioEnabled: userChoices.audioEnabled,
    languageCode: selectedLanguage,
  });
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    });

    const channel = pusher.subscribe(roomName);
    channel.bind(
      "transcribe-event",
      function (data: {
        sender: string;
        message: string;
        senderId: string;
        isFinal: boolean;
      }) {
        if (data.isFinal && userId !== data.senderId) {
          setTranscriptionQueue((prev) => {
            return [...prev, data];
          });
        }
      }
    );

    return () => {
      pusher.unsubscribe(roomName);
    }
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
          <Captions
            transcriptionQueue={transcriptionQueue}
            setTranscriptionQueue={setTranscriptionQueue}
            languageCode={selectedLanguage}
          />
          <VideoConference chatMessageFormatter={formatChatMessageLinks} />
          <DebugMode logLevel={LogLevel.info} />
        </LiveKitRoom>
      )}
    </>
  );
};
