import {
  LiveKitRoom,
  PreJoin,
  LocalUserChoices,
  VideoConference,
  formatChatMessageLinks,
} from "@livekit/components-react";
import { LogLevel, RoomOptions, VideoPresets } from "livekit-client";

import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { DebugMode } from "../../lib/Debug";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import useTranscribe from "~/hooks/useTranscribe";
import Captions from "~/components/captions";

const Home: NextPage = () => {
  const router = useRouter();
  const { name: roomName } = router.query;
  const { data: session, status } = useSession();
  const [preJoinChoices, setPreJoinChoices] = useState<
    LocalUserChoices | undefined
  >(undefined);
  const [selectedCode, setSelectedCode] = useState("en");
  if (status === "loading") return <div>Loading...</div>;
  if (!session) router.push(`api/auth/signin?callbackUrl=/rooms/${roomName}`);

  const languageCodes = [
    {
      language: "English",
      code: "en",
    },
    {
      language: "Hindi",
      code: "hi",
    },
    {
      language: "Japanese",
      code: "ja",
    },
  ];

  return (
    <>
      <Head>
        <title>JabWeMeet</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main data-lk-theme="default">
        {roomName && !Array.isArray(roomName) && preJoinChoices ? (
          <ActiveRoom
            roomName={roomName}
            userChoices={preJoinChoices}
            onLeave={() => setPreJoinChoices(undefined)}
            userId={session?.user.id as string}
            selectedLanguage={selectedCode}
          ></ActiveRoom>
        ) : (
          <div className="flex h-fit flex-row items-center justify-center">
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
            <div className="flex flex-col items-start justify-center gap-3 rounded-lg border border-gray-300 p-5">
              <label>
                <span>Your Language</span>
              </label>
              <select
                className="rounded-lg border border-gray-300 p-2"
                onChange={(e) => setSelectedCode(e.target.value)}
              >
                {languageCodes.map((language) => (
                  <option value={language.code}>{language.language}</option>
                ))}
              </select>
            </div>
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
