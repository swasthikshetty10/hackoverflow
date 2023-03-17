import { RiTranslate } from "react-icons/ri";
import { MdHighQuality } from "react-icons/md";
import { BsGlobe2 } from "react-icons/bs";
import { GrDocumentConfig } from "react-icons/gr";
import { HiUserGroup } from "react-icons/hi";
import { BsFillBookmarkHeartFill } from "react-icons/bs";

const Features = () => {
  const perks = [
    {
      icon: <BsGlobe2 className="h-10 w-10 text-secondary" />,
      title: "Multilingual Meeting Support",
      desc: "Our app allows users who speak different languages to communicate with each other. The app translates the text and speaks it out to other participants in the language they have selected.",
    },
    {
      icon: <RiTranslate className="h-10 w-10 text-secondary" />,
      title: "Real-time Translation",
      desc: "Our app provides real-time translation, so you can focus on the conversation without worrying about the language barrier. The translation is done quickly and accurately, ensuring smooth communication.",
    },
    {
      icon: <GrDocumentConfig className="h-10 w-10 text-secondary" />,
      title: "Meeting Minutes",
      desc: "Our app automatically generates a summary of the entire meeting or conference. This feature saves time and helps ensure that all participants are on the same page.",
    },
    {
      icon: <HiUserGroup className="h-10 w-10 text-secondary" />,
      title: "Large Capacity",
      desc: "Our app can support up to 100 concurrent users. This means that even large meetings and conferences can be easily accommodated, making it ideal for businesses, schools, and other organizations.",
    },
    {
      icon: <MdHighQuality className="h-10 w-10 text-secondary" />,
      title: "High-quality Video and Screen Sharing",
      desc: "Our app provides high-quality video and screen sharing, ensuring that everyone can see and hear each other clearly. This feature helps to ensure that the meeting is productive and engaging.",
    },
    {
      icon: <BsFillBookmarkHeartFill className="h-10 w-10 text-secondary" />,
      title: "User-friendly Interface",
      desc: "Our app has a user-friendly interface that is easy to navigate. This ensures that everyone can participate in the meeting or conference without any technical difficulties, making it ideal for users of all skill levels.",
    },
  ];

  return (
    <section className="bg-white text-black transition-colors duration-500 dark:bg-gray-900/10 dark:text-white">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-28">
        <div>
          <div className="mx-auto max-w-lg text-center">
            <h2 className="heading text-3xl font-bold sm:text-4xl">
              What makes us special!
            </h2>
          </div>
        </div>
        <div>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {perks.map((perk, index) => (
              <a
                key={index}
                className="block rounded-xl border border-primary p-8 shadow-xl transition-all duration-300 hover:scale-[1.05] hover:border-secondary hover:shadow-primary/25"
              >
                {perk.icon}
                <h3 className="mt-4 text-xl font-bold text-black dark:text-white">
                  {perk.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-200">
                  {perk.desc}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
