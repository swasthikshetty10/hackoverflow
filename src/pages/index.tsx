import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { useState } from "react";
import { api } from "~/utils/api";

function ConnectionTab() {
  const [liveKitUrl, setLiveKitUrl] = useState<string | undefined>();
  const [token, setToken] = useState<string | undefined>();
  const createRoom = api.rooms.createRoom.useMutation();
  const router = useRouter();
  const join = () => {
    router.push(`/custom/?liveKitUrl=${liveKitUrl}&token=${token}`);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-4">
      <h1 className="text-4xl font-bold">Jab We Meet</h1>

      <p className="text-sm text-gray-400">
        Multilingual Video Conferencing App
      </p>

      <button onClick={() => createRoom.mutate()} className="lk-button">
        Create Room
      </button>

      <div className="flex flex-col space-y-1 rounded-lg border border-gray-400 p-5">
        <label className="text-sm font-medium text-gray-400">LiveKit URL</label>
        <input
          type="url"
          placeholder="URL"
          className="rounded-lg"
          onChange={(ev) => setLiveKitUrl(ev.target.value)}
        ></input>

        <label className="text-sm font-medium text-gray-400">Token</label>
        <input
          type="text"
          placeholder="Token"
          className="rounded-lg"
          onChange={(ev) => setToken(ev.target.value)}
        ></input>
      </div>

      <button className="lk-button" onClick={join}>
        Connect
      </button>
    </div>
  );
}

const Home: NextPage = () => {
  return (
    <>
      <main data-lk-theme="default">
        <ConnectionTab />
      </main>
    </>
  );
};

export default Home;
