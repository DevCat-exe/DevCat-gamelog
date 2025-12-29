"use client"

import { Input } from "@/components/ui/input"
import type { GameMemory } from "@/lib/game-service"

interface GameDetailsPopupProps {
  memory: GameMemory
  onClose: () => void
  onEdit: (memory: GameMemory) => void
  onDelete: (id: string) => void
  isEditing: boolean
  isLoading: boolean
  editingMemory: Partial<GameMemory>
  setEditingMemory: (memory: Partial<GameMemory>) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
}

export function GameDetailsPopup({
  memory,
  onClose,
  onEdit,
  onDelete,
  isEditing,
  isLoading,
  editingMemory,
  setEditingMemory,
  onSaveEdit,
  onCancelEdit,
}: GameDetailsPopupProps) {
  
  const getWindowClass = (windowType: string, status: string) => {
    const baseClass = "border-2 backdrop-blur-sm font-mono text-xs"
    // Using simple styling logic similar to main window, but tailored for popup
    let colorClass = ""
    switch (windowType) {
        case "terminal": colorClass = "bg-black/95 border-green-500/50 text-green-400"; break;
        case "file": colorClass = "bg-slate-900/95 border-blue-500/50 text-blue-300"; break;
        case "glitch": colorClass = "bg-red-950/95 border-red-500/50 text-red-300"; break;
        case "memory": colorClass = "bg-purple-950/95 border-purple-500/50 text-purple-300"; break;
        default: colorClass = "bg-gray-900/95 border-gray-500/50 text-gray-300";
    }
    return `${baseClass} ${colorClass}`
  }
  
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
  }

  const getMemoryClarityText = (clarity: string) => {
    switch (clarity) {
      case "vivid": return "CLEAR"
      case "faded": return "FADED"
      case "forgotten": return "FRAGMENTED"
      default: return "UNKNOWN"
    }
  }

  if (isEditing) {
     return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-black/95 border-2 border-green-500/50 text-green-400 font-mono w-[600px] max-w-[90vw] max-h-[90vh] overflow-auto animate-in zoom-in-95 duration-300">
            <div className="border-b border-green-500/30 p-3 text-sm flex justify-between items-center">
              <span>EDIT_MEMORY_FILE</span>
              <button onClick={onCancelEdit} className="hover:bg-current/20 px-2 py-1">[X]</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs opacity-80">FILENAME:</label>
                <Input
                  value={editingMemory.title || ""}
                  onChange={(e) => setEditingMemory({ ...editingMemory, title: e.target.value })}
                  className="bg-transparent border border-green-500/30 text-green-400 font-mono mt-1"
                />
              </div>
              <div>
                <label className="text-xs opacity-80">STATUS:</label>
                <select
                  value={editingMemory.status || "unfinished"}
                  onChange={(e) => setEditingMemory({ ...editingMemory, status: e.target.value as any })}
                  className="w-full bg-black border border-green-500/30 text-green-400 font-mono p-2 mt-1"
                >
                  <option value="unfinished">UNFINISHED</option>
                  <option value="finished">FINISHED</option>
                  <option value="wishlist">WISHLIST</option>
                </select>
              </div>
              <div>
                <label className="text-xs opacity-80">GENRE:</label>
                <Input
                  value={editingMemory.genre || ""}
                  onChange={(e) => setEditingMemory({ ...editingMemory, genre: e.target.value })}
                  className="bg-transparent border border-green-500/30 text-green-400 font-mono mt-1"
                />
              </div>
              <div>
                <label className="text-xs opacity-80">PERSONAL_NOTE:</label>
                <textarea
                  value={editingMemory.personalNote || ""}
                  onChange={(e) => setEditingMemory({ ...editingMemory, personalNote: e.target.value })}
                  className="w-full bg-black border border-green-500/30 text-green-400 font-mono p-2 mt-1 min-h-[100px]"
                />
              </div>

              <div className="flex justify-between pt-4 border-t border-green-500/30">
                <div className="flex gap-2">
                    <button
                    onClick={onSaveEdit}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-900/30 border border-green-500/50 hover:bg-green-500/20"
                    >
                    {isLoading ? "SAVING..." : "SAVE_CHANGES"}
                    </button>
                    <button onClick={onCancelEdit} className="px-4 py-2 border border-green-500/30 hover:bg-green-500/10">
                    CANCEL
                    </button>
                </div>
                <button 
                    onClick={() => {
                        if (confirm("Are you sure you want to delete this memory permanently?")) {
                            onDelete(memory.id)
                        }
                    }}
                    className="px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-950/30"
                >
                    DELETE
                </button>
              </div>
            </div>
          </div>
        </div>
     )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div
        className={`${getWindowClass(memory.windowType, memory.status)} w-[600px] max-w-[90vw] max-h-[90vh] overflow-auto animate-in zoom-in-95 duration-300 select-text`}
      >
        <div className="border-b border-current/30 p-3 text-sm flex justify-between items-center">
          <span>{memory.title} - PROPERTIES</span>
          <button onClick={onClose} className="hover:bg-current/20 px-2 py-1">[X]</button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <img
                src={memory.coverUrl || "/placeholder.svg"}
                alt={memory.title}
                className="w-32 h-44 object-cover border border-current/30 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="text-lg font-bold">{memory.title}</div>
              <div>STATUS: {memory.status.toUpperCase()}</div>
              <div>CREATED: {formatTimestamp(memory.addedOn)}</div>
              <div>CLARITY: {getMemoryClarityText(memory.memoryClarity)}</div>
              {memory.year && <div>YEAR: {memory.year}</div>}
              {memory.genre && <div>GENRE: {memory.genre.toUpperCase().replace(/_/g, " ")}</div>}
              {memory.developer && <div>DEVELOPER: {memory.developer}</div>}
              {memory.metacritic && <div>METACRITIC: {memory.metacritic}/100</div>}
              {memory.platforms && memory.platforms.length > 0 && (
                <div>PLATFORMS: {memory.platforms.slice(0, 3).join(", ")}</div>
              )}
            </div>
          </div>

          {memory.personalNote && (
            <div className="border-t border-current/30 pt-4">
              <div className="opacity-80 mb-2">MEMORY_FRAGMENT:</div>
              <div className="italic opacity-90 leading-relaxed bg-current/10 p-3 border border-current/20">
                "{memory.personalNote}"
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-current/30">
            <button
              onClick={() => onEdit(memory)}
              className="px-4 py-2 border border-current/50 hover:bg-current/20 transition-all duration-200"
              disabled={isLoading}
            >
              EDIT / DELETE
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-current/50 hover:bg-current/20 transition-all duration-200"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
