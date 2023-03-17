import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

function profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return <div>Loading...</div>;
  if (!session && status === "unauthenticated")
    return router.push("/api/auth/signin");

  return <div className="flex"></div>;
}

export default profile;
