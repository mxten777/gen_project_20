import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  // Extends React.HTMLAttributes for standard div props
}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50 shimmer",
        className
      )}
      {...props}
    />
  )
}

function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 shadow-md", className)} {...props}>
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  )
}

function SkeletonParticipant({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100", className)} {...props}>
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="space-y-1">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

function SkeletonTeam({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("bg-gradient-to-br rounded-xl p-6 shadow-md", className)} {...props}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-4/5 rounded-lg" />
        <Skeleton className="h-8 w-3/4 rounded-lg" />
      </div>
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonParticipant, SkeletonTeam }