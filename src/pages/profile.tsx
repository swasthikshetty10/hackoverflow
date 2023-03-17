import { signIn, useSession } from "next-auth/react";

function profile() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (!session && status === "unauthenticated") return signIn("google");

  return <div className="flex"></div>;
}

export default profile;
