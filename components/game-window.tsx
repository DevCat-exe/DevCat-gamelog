"use client"

import type { GameMemory } from "@/lib/game-service"

interface GameWindowProps {
  memory: GameMemory
  onDoubleClick: (memory: GameMemory) => void
}

export function GameWindow({ memory, onDoubleClick }: GameWindowProps) {
  const getWindowStyle = (memory: GameMemory) => {
    let opacity = memory.isVisible ? 0.95 : 0

    switch (memory.memoryClarity) {
      case "vivid":
        opacity = memory.isVisible ? 0.95 : 0
        break
      case "faded":
        opacity = memory.isVisible ? 0.85 : 0
        break
      case "forgotten":
        opacity = memory.isVisible ? 0.75 : 0
        break
    }

    const isNewlyAdded = new Date().getTime() - new Date(memory.addedOn).getTime() < 2000

    return {
      position: "absolute" as const,
      left: `${memory.x}px`,
      top: `${memory.y}px`,
      width: `${memory.width}px`,
      height: `${memory.height}px`,
      zIndex: memory.zIndex,
      opacity,
      transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: memory.isVisible ? "translateZ(0) scale(1)" : "translateZ(0) scale(0.95)",
      pointerEvents: memory.isVisible ? "auto" : "none",
      userSelect: "none" as const,
      WebkitUserSelect: "none" as const,
      MozUserSelect: "none" as const,
      msUserSelect: "none" as const,
      animation: isNewlyAdded ? "gameAppear 0.8s cubic-bezier(0.4, 0, 0.2, 1)" : undefined,
    }
  }

  const getWindowClass = (memory: GameMemory) => {
    const baseClass = "border-2 backdrop-blur-sm cursor-pointer font-mono text-xs select-none"

    let statusAccent = ""
    switch (memory.status) {
      case "finished":
        statusAccent = "border-l-4 border-l-green-500/70"
        break
      case "unfinished":
        statusAccent = "border-l-4 border-l-yellow-500/70"
        break
      case "wishlist":
        statusAccent = "border-l-4 border-l-blue-500/70"
        break
    }

    switch (memory.windowType) {
      case "terminal":
        return `${baseClass} ${statusAccent} bg-black/80 border-green-500/50 text-green-400 hover:border-green-400/70 hover:bg-black/90`
      case "file":
        return `${baseClass} ${statusAccent} bg-slate-900/80 border-blue-500/50 text-blue-300 hover:border-blue-400/70 hover:bg-slate-900/90`
      case "glitch":
        return `${baseClass} ${statusAccent} bg-red-950/80 border-red-500/50 text-red-300 hover:border-red-400/70 hover:bg-red-950/90`
      case "memory":
        return `${baseClass} ${statusAccent} bg-purple-950/80 border-purple-500/50 text-purple-300 hover:border-purple-400/70 hover:bg-purple-950/90`
      default:
        return `${baseClass} ${statusAccent} bg-gray-900/80 border-gray-500/50 text-gray-300 hover:border-gray-400/70 hover:bg-gray-900/90`
    }
  }

  const getStatusSymbol = (status: string) => {
    switch (status) {
      case "finished":
        return "[✓]"
      case "unfinished":
        return "[~]"
      case "wishlist":
        return "[★]"
      default:
        return "[?]"
    }
  }

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
  }

  return (
    <div
      style={getWindowStyle(memory)}
      className={getWindowClass(memory)}
      onDoubleClick={() => memory.isVisible && onDoubleClick(memory)}
    >
      <div className="border-b border-current/30 p-1 text-xs flex justify-between items-center">
        <span className="truncate">{memory.title}</span>
        <span className="text-xs opacity-60">{getStatusSymbol(memory.status)}</span>
      </div>

      <div className="p-2 h-full overflow-hidden">
        <div className="space-y-1">
          <div className="text-xs font-bold truncate">{memory.title}</div>
          <div className="text-xs opacity-70">{memory.genre || "unknown"}</div>
          <div className="text-xs opacity-50">{formatTimestamp(memory.addedOn)}</div>
          {memory.personalNote && (
            <div className="text-xs opacity-60 italic truncate mt-2">
              "{memory.personalNote.substring(0, 30)}..."
            </div>
          )}
          {memory.metacritic && <div className="text-xs opacity-50">Score: {memory.metacritic}</div>}
        </div>
      </div>
    </div>
  )
}
