import { signIn, useSession } from "next-auth/react";
import Card from "~/components/card";
import SplashScreen from "~/components/splashScreen";
import { api } from "~/utils/api";

function profile() {
  const { data: session, status } = useSession();
  const { data: rooms, isLoading, error } = api.rooms.getRoomsByUser.useQuery();

  if (status === "loading") return <SplashScreen />;
  if (!session && status === "unauthenticated") return signIn("google");

  return (
    <div className="flex bg-black text-gray-100">
      <div className="flex  items-center justify-center">
        <h2 className="text-2xl font-bold text-primary">
          Hello {session?.user.name}!👋🏻
        </h2>
      </div>
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-secondary font-bold">Your Rooms</h2>
        {rooms?.map((room) => {
          return room.OwnerId === session?.user.id ? (
            <Card room={room} key={room.name} />
          ) : null;
        })}
      </div>
      <div>
        <h2 className="text-secondary font-bold">Rooms you are a part of</h2>
        {rooms?.map((room) => {
          return room.OwnerId != session?.user.id ? (
            <Card room={room} key={room.name} />
          ) : null;
        })}
      </div>
    </div>
  );
}

export default profile;
