import { BiLoader } from "react-icons/bi";

const Loader = ({ className }: { className?: string }) => {
  return (
    <div
      className={`${className} mx-auto my-auto flex h-full w-full items-center justify-center`}
    >
      <BiLoader className="animate-spin" />
    </div>
  );
};

export default Loader;
