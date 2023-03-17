import Image from "next/image";
import Link from "next/link";
import CharacterAnimation from "../animation/character";
import { BiMenuAltRight as MenuIcon } from "react-icons/bi";
import { AiOutlineClose as XIcon } from "react-icons/ai";
import { useState } from "react";

const Navbar = () => {
  const links = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "About",
      path: "/about",
    },
    {
      label: "Contact",
      path: "/contact",
    },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="top-0 z-10 w-full border-b border-gray-200 bg-white bg-opacity-10 backdrop-blur-lg backdrop-filter">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              className="rounded-full bg-white bg-opacity-30 p-1 backdrop-blur-lg backdrop-filter"
              src="/favicon.ico"
              alt="Logo"
              width={40}
              height={40}
              priority
            />
            <span className={`font-bold text-white`}>Jab We Meet</span>
          </Link>

          <div className="hidden space-x-6 text-white lg:flex">
            {links.map((link) => (
              <Link
                className="transition-colors duration-300 hover:text-white"
                key={link.path}
                href={link.path}
              >
                <CharacterAnimation
                  text={link.label}
                  textStyle="text-lg font-medium"
                />
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-4 lg:hidden">
            {isMenuOpen ? (
              <XIcon className="h-6 w-6 text-white" onClick={toggleMenu} />
            ) : (
              <MenuIcon className="h-6 w-6 text-white" onClick={toggleMenu} />
            )}
          </div>
        </div>

        {isMenuOpen && (
          <div>
            {links.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="block py-2 px-4 text-sm hover:bg-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
