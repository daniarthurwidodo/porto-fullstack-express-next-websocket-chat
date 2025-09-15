import { cn } from "@/lib/utils"

interface TypingIndicatorProps {
  className?: string
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center space-x-1 text-muted-foreground", className)}>
      <span className="text-sm">typing</span>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-current rounded-full typing-dot"></div>
        <div className="w-1 h-1 bg-current rounded-full typing-dot"></div>
        <div className="w-1 h-1 bg-current rounded-full typing-dot"></div>
      </div>
    </div>
  )
}
