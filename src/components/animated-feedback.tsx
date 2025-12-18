import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnimatedFeedbackProps {
  type: "success" | "error" | "warning" | "info"
  message: string
  isVisible: boolean
  onClose?: () => void
  duration?: number
}

const feedbackConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-success-50",
    borderColor: "border-success-200",
    textColor: "text-success-800",
    iconColor: "text-success-600",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-error-50",
    borderColor: "border-error-200",
    textColor: "text-error-800",
    iconColor: "text-error-600",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-warning-50",
    borderColor: "border-warning-200",
    textColor: "text-warning-800",
    iconColor: "text-warning-600",
  },
  info: {
    icon: Info,
    bgColor: "bg-info-50",
    borderColor: "border-info-200",
    textColor: "text-info-800",
    iconColor: "text-info-600",
  },
}

export function AnimatedFeedback({
  type,
  message,
  isVisible,
  onClose,
  duration = 3000
}: AnimatedFeedbackProps) {
  const config = feedbackConfig[type]
  const Icon = config.icon

  React.useEffect(() => {
    if (isVisible && duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.4
          }}
          className={cn(
            "fixed top-4 left-1/2 transform -translate-x-1/2 z-50",
            "flex items-center gap-3 px-6 py-4 rounded-xl border shadow-xl backdrop-blur-md",
            "max-w-sm w-full mx-4",
            config.bgColor,
            config.borderColor,
            config.textColor
          )}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Icon className={cn("h-6 w-6", config.iconColor)} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="font-medium text-sm flex-1"
          >
            {message}
          </motion.p>

          {onClose && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              onClick={onClose}
              className="ml-2 p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Success animation for specific actions
export function CheckInSuccess({ isVisible, onClose, participantCount }: { isVisible: boolean, onClose?: () => void, participantCount?: number }) {
  React.useEffect(() => {
    if (isVisible && onClose) {
      const timer = setTimeout(onClose, 3000); // 3초 후 자동 사라짐
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.4
          }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-xl border shadow-xl bg-white border-primary-200 max-w-sm w-full mx-4"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="h-6 w-6 text-primary-600" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1"
          >
            <h4 className="font-semibold text-gray-800">체크인 완료!</h4>
            <p className="text-sm text-gray-600">
              이벤트 참가가 확인되었습니다{participantCount ? ` (총 ${participantCount}명)` : ''}
            </p>
          </motion.div>

          {onClose && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              onClick={onClose}
              className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Team assignment success animation
export function TeamAssignmentSuccess({ isVisible, teamCount, onComplete }: { isVisible: boolean, teamCount: number, onComplete?: () => void }) {
  React.useEffect(() => {
    if (isVisible) {
      // 4초 후 자동으로 사라지도록 설정
      const timer = setTimeout(() => {
        onComplete?.();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.5, rotate: 10 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md mx-4"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2"
            >
              팀 배정 완료!
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 mb-6"
            >
              {teamCount}개의 팀으로 참가자들이 배정되었습니다
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              className="flex justify-center gap-2"
            >
              {Array.from({ length: teamCount }, (_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.8 + i * 0.1,
                    type: "spring",
                    stiffness: 300
                  }}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold"
                >
                  {String.fromCharCode(65 + i)}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}