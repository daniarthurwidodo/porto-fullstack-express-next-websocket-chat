import { cn } from "@/lib/utils"

interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg"
  className?: string
  isOnline?: boolean
}

export function Avatar({ 
  src, 
  alt, 
  fallback, 
  size = "md", 
  className,
  isOnline = false 
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
  }

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "rounded-full bg-muted flex items-center justify-center overflow-hidden",
        sizeClasses[size]
      )}>
        {src ? (
          <img 
            src={src} 
            alt={alt || "Avatar"} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-medium text-muted-foreground">
            {fallback || "?"}
          </span>
        )}
      </div>
      {isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
      )}
    </div>
  )
}
