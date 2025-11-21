import { motion, AnimatePresence } from "framer-motion"
import { useLocation } from "react-router-dom"
import { type ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
  },
}



export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.4 }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Alternative slide transition for more dramatic effect
export function SlideTransition({ children }: PageTransitionProps) {
  const location = useLocation()

  const slideVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    in: {
      x: 0,
      opacity: 1,
    },
    out: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }



  return (
    <AnimatePresence mode="wait" custom={location.pathname} initial={false}>
      <motion.div
        key={location.pathname}
        custom={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={slideVariants}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Fade transition with blur effect
export function BlurTransition({ children }: PageTransitionProps) {
  const location = useLocation()

  const blurVariants = {
    initial: {
      opacity: 0,
      filter: "blur(10px)",
      scale: 0.95,
    },
    in: {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
    },
    out: {
      opacity: 0,
      filter: "blur(10px)",
      scale: 1.05,
    },
  }



  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={blurVariants}
        transition={{ duration: 0.6 }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}