import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import Typing from "~/components/animation/typing";
import Navbar from "~/components/navbar";
import { api } from "~/utils/api";

function ConnectionTab() {
  const createRoom = api.rooms.createRoom.useMutation();
  const router = useRouter();

  const createRoomHandler = async () => {
    const data = await createRoom.mutateAsync();
    router.push(`/rooms/${data.roomName}`);
  };

  return (
    <>
      <Navbar />
      <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-4">
        <Typing/>

        <p className="text-sm text-gray-400">
          Multilingual Video Conferencing App
        </p>

        <button onClick={createRoomHandler} className="lk-button">
          Create Room
        </button>
      </div>
    </>
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
