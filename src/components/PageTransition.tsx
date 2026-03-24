import { motion } from "framer-motion";
import { ReactNode } from "react";

const animations = {
  initial: { opacity: 0, y: 5 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -5 },
};

export const PageTransition = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      variants={animations}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};
