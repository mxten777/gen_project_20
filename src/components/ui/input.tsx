import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border-2 border-gray-300 bg-transparent px-4 py-3 text-base shadow-sm transition-all duration-300 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 focus-visible:ring-offset-2 focus-visible:border-primary-500 hover:border-primary-400 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transform-gpu",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
