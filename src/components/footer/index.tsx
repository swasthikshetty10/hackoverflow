import Image from "next/image";
import Link from "next/link";
import PopAnimation from "../animation/pop";
import TextAnimation from "../animation/text";

const Footer = () => {
  const links = [
    {
      label: "Home",
      path: "#",
    },
    {
      label: "About",
      path: "#about",
    },
    {
      label: "Contact",
      path: "#contact",
    },
  ];
  return (
    <footer id="contact" className="bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <PopAnimation className="flex justify-center text-primary">
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="h-12 w-auto"
          />
        </PopAnimation>
        <p className="mx-auto mt-6 max-w-md text-center leading-relaxed text-white">
          <TextAnimation text="Jab We Meet" className="flex justify-center" />

          <TextAnimation
            text="Multilingual Video Conferencing App"
            className="flex justify-center"
            textStyle="text-xs text-gray-300"
          />
        </p>
        <nav className="mt-12">
          <ul className="flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-12">
            {links.map((link) => (
              <li key={link.path}>
                <Link
                  className="text-white transition hover:text-gray-400"
                  href={link.path}
                >
                  <TextAnimation text={link.label} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
