// @refresh reset
import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import Typing from "~/components/animation/typing";
import Navbar from "~/components/navbar";
import { api } from "~/utils/api";
import { AiOutlineVideoCameraAdd } from "react-icons/ai";
import JoinRoom from "~/components/join";
import Image from "next/image";
import Features from "~/components/features";
import CharacterAnimation from "~/components/animation/character";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import TextAnimation from "~/components/animation/text";
import Loader from "~/components/loader";
import Footer from "~/components/footer";

function ConnectionTab() {
  const { data: session, status } = useSession();
  const createRoom = api.rooms.createRoom.useMutation();
  const router = useRouter();
  const { RiveComponent: Hero } = useRive({
    src: `hero.riv`,
    stateMachines: ["State Machine 1"],
    autoplay: true,
    layout: new Layout({
      fit: Fit.FitWidth,

      alignment: Alignment.Center,
    }),
  });

  const [roomLoading, setRoomLoading] = React.useState(false);
  const createRoomHandler = async () => {
    if (status === "unauthenticated") signIn("google");
    else {
      setRoomLoading(true);
      const data = await createRoom.mutateAsync();
      setRoomLoading(false);
      router.push(`/rooms/${data.roomName}`);
    }
  };

  if (status === "loading") return <div>Loading...</div>;

  return (
    <>
      <Navbar status={status} session={session} />

      <div className="isolate overflow-x-hidden">
        <div className="flex h-screen w-screen flex-col items-center justify-center space-y-4 p-5 text-center md:flex-row">
          <div className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden opacity-80 blur-3xl sm:top-[-20rem]">
            <svg
              className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
              viewBox="0 0 1155 678"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
                fillOpacity=".3"
                d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
              />
              <defs>
                <linearGradient
                  id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
                  x1="1155.49"
                  x2="-78.208"
                  y1=".177"
                  y2="474.645"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#9089FC" />
                  <stop offset={1} stopColor="#FF80B5" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="w-full max-w-md space-y-4">
            <Typing />

            <TextAnimation
              className="flex justify-center"
              textStyle="text-sm text-gray-400"
              text="Multilingual Video Conferencing App"
            />

            <div className="flex flex-col items-center justify-center space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
              <button onClick={createRoomHandler} className="lk-button h-fit">
                {roomLoading ? (
                  <Loader />
                ) : (
                  <>
                    <AiOutlineVideoCameraAdd />
                    <CharacterAnimation
                      text="Create Room"
                      textStyle="text-sm"
                    />
                  </>
                )}
              </button>

              {!roomLoading && <JoinRoom />}
            </div>
          </div>

          <div className="flex w-full max-w-md items-center justify-center">
            <Hero className="h-[40vh] w-full md:h-screen" />
          </div>
        </div>

        <Features />

        <Footer />

        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden opacity-80 blur-3xl sm:top-[calc(100%-30rem)]">
          <svg
            className="relative left-[calc(50%+3rem)] h-[21.1875rem] max-w-none -translate-x-1/2 sm:left-[calc(50%+36rem)] sm:h-[42.375rem]"
            viewBox="0 0 1155 678"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="url(#ecb5b0c9-546c-4772-8c71-4d3f06d544bc)"
              fillOpacity=".3"
              d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
            />
            <defs>
              <linearGradient
                id="ecb5b0c9-546c-4772-8c71-4d3f06d544bc"
                x1="1155.49"
                x2="-78.208"
                y1=".177"
                y2="474.645"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#9089FC" />
                <stop offset={1} stopColor="#FF80B5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
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
