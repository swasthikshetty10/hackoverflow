import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

const CreateRoom: NextPage = () => {
  const [liveKitUrl, setLiveKitUrl] = useState<string | undefined>();
  const [token, setToken] = useState<string | undefined>();

  const router = useRouter();
  const join = () => {
    
    router.push(`/custom/?liveKitUrl=${liveKitUrl}&token=${token}`);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-4">
      <p className="text-sm text-gray-400">Create Room</p>

      <div className="flex flex-col space-y-5 rounded-lg border border-gray-400 p-5">
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            LiveKit URL
          </label>
          <input
            type="url"
            placeholder="URL"
            className="rounded-lg"
            onChange={(ev) => setLiveKitUrl(ev.target.value)}
          ></input>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">Token</label>
          <input
            type="text"
            placeholder="Token"
            className="rounded-lg"
            onChange={(ev) => setToken(ev.target.value)}
          ></input>
        </div>

        <button
          className="rounded bg-gray-500 py-2 px-4 font-bold text-white hover:bg-gray-700"
          onClick={join}
        >
          Connect
        </button>
      </div>
    </div>
  );
};

export default CreateRoom;
