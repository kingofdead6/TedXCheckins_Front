import { motion } from 'framer-motion';
import HomePic from "../../assets/HomePic.jpg";

function HomeContent() {
  // Animation variants for text elements and button
  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: "easeOut" 
      }
    }
  };

  // Animation for background image
  const imageVariants = {
    hidden: { scale: 1.2, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { 
        duration: 1.2, 
        ease: "easeOut" 
      }
    }
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center text-white overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HomePic})` }}
        variants={imageVariants}
        initial="hidden"
        animate="visible"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#380101] to-[#00000000] opacity-80" />
      <motion.div 
        className="relative z-10 text-center px-4 max-w-[90%] sm:max-w-[80%] md:max-w-[70%]"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.2 } }
        }}
      >
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6"
          variants={textVariants}
        >
          TED<span className="text-[#ff0000]">x</span> Check-ins
        </motion.h1>
        <motion.p 
          className="text-xl sm:text-2xl md:text-3xl mb-6 sm:mb-8"
          variants={textVariants}
        >
          TEDx is a hub for groundbreaking ideas, innovation, and thought-provoking discussions.
          Explore our past events that have left a mark and stay updated on upcoming editions that
          continue to push the boundaries of knowledge and creativity.
        </motion.p>
      </motion.div>
    </div>
  );
}

export default HomeContent;