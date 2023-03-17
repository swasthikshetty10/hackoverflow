import React, { FC, ReactNode, useRef } from "react";
import { motion, useInView } from "framer-motion";

const PopAnimation: FC<{
  className?: string;
  children: ReactNode;
}> = ({ className, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: {
          opacity: 1,
          scale: 1,
          transition: {
            type: "spring",
            damping: 12,
            stiffness: 100,
          },
        },
        hidden: {
          opacity: 0,
          scale: 0,
          transition: {
            type: "spring",
            damping: 12,
            stiffness: 100,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export default PopAnimation;
