import { signIn, useSession } from "next-auth/react";
import SplashScreen from "~/components/splashScreen";

function profile() {
  const { data: session, status } = useSession();

  if (status === "loading") return <SplashScreen />;
  if (!session && status === "unauthenticated") return signIn("google");

  return <div className="flex"></div>;
}

export default profile;
