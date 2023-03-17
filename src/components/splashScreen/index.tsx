import Image from "next/image";
import Loader from "../loader";

const SplashScreen = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center space-y-5">
      <Image
        src="/logo.png"
        alt="Logo"
        width={100}
        height={100}
        className="h-12 w-auto"
        priority
      />
      <div className="flex flex-col items-center justify-center">
        <h1 className="gradient-text text-4xl font-bold">Jab We Meet</h1>
        <div className="text-center text-gray-300">
          Loading your experience...
          <Loader />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
