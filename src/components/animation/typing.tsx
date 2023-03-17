import { TypeAnimation } from "react-type-animation";

export default function Typing() {
  return (
    <TypeAnimation
      cursor={true}
      sequence={[
        "Jab We Meet",
        3000,
        "जब हम मिले",
        3000,
        "ジャブ・ウィー・メット",
        3000,
      ]}
      wrapper="h2"
      className="animated-text text-3xl font-semibold sm:text-3xl lg:text-3xl xl:text-5xl 2xl:text-6xl"
      repeat={Infinity}
    />
  );
}
