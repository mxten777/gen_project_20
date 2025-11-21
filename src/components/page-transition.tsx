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

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4,
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
        transition={pageTransition}
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

  const slideTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
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
        transition={slideTransition}
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

  const blurTransition = {
    type: "tween",
    ease: [0.25, 0.46, 0.45, 0.94],
    duration: 0.6,
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={blurVariants}
        transition={blurTransition}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}