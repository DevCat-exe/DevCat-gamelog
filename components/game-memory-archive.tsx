"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface GameMemory {
  id: string
  title: string
  status: "finished" | "unfinished" | "wishlist"
  personalNote?: string
  addedOn: string
  year?: number
  genre?: string
  developer?: string
  coverUrl?: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  windowType: "terminal" | "file" | "glitch" | "memory"
  memoryClarity: "vivid" | "faded" | "forgotten"
  isVisible?: boolean
  metacritic?: number
  platforms?: string[]
}

interface RAWGGame {
  id: number
  name: string
  released: string
  background_image: string
  genres: string[]
  developers: string[]
  metacritic: number
  description: string
  platforms: string[]
}

// Load games from localStorage
const loadGamesFromStorage = (): GameMemory[] => {
  if (typeof window === "undefined") return []
  try {
    const saved = localStorage.getItem("gamelog-memories")
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error("Error loading games from storage:", error)
    return []
  }
}

// Save games to localStorage
const saveGamesToStorage = (games: GameMemory[]) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("gamelog-memories", JSON.stringify(games))
  } catch (error) {
    console.error("Error saving games to storage:", error)
  }
}

export function GameMemoryArchive() {
  const [memories, setMemories] = useState<GameMemory[]>([])
  const [isBooting, setIsBooting] = useState(true)
  const [bootText, setBootText] = useState("")
  const [commandMode, setCommandMode] = useState(false)
  const [commandInput, setCommandInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [isAddingMemory, setIsAddingMemory] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [popupMemory, setPopupMemory] = useState<GameMemory | null>(null)
  const [isEditingMemory, setIsEditingMemory] = useState(false)
  const [editingMemory, setEditingMemory] = useState<Partial<GameMemory>>({})
  const [newMemory, setNewMemory] = useState({
    title: "",
    status: "unfinished" as "finished" | "unfinished" | "wishlist",
    personalNote: "",
  })
  const [gameSearchQuery, setGameSearchQuery] = useState("")
  const [gameSearchResults, setGameSearchResults] = useState<RAWGGame[]>([])
  const [isSearchingGames, setIsSearchingGames] = useState(false)
  const [selectedGameData, setSelectedGameData] = useState<RAWGGame | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load games from localStorage on mount
  useEffect(() => {
    const savedGames = loadGamesFromStorage()
    setMemories(savedGames)
  }, [])

  // Save games to localStorage whenever memories change
  useEffect(() => {
    if (memories.length > 0) {
      saveGamesToStorage(memories)
    }
  }, [memories])

  // Debounce search query to prevent glitches when typing fast
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Calculate dynamic height based on game positions
  const canvasHeight = useMemo(() => {
    if (memories.length === 0) return 800
    const maxY = Math.max(...memories.map((m) => m.y + m.height))
    return Math.max(800, maxY + 100)
  }, [memories])

  // Filter memories with better search grid positioning and status filtering
  const filteredMemories = useMemo(() => {
    const searchLower = debouncedSearchQuery.toLowerCase().trim()

    if (!searchLower) {
      return memories.map((memory) => ({ ...memory, isVisible: true }))
    }

    const matching: GameMemory[] = []
    const nonMatching: GameMemory[] = []

    memories.forEach((memory) => {
      let matches = false

      // Check for status-specific searches
      if (searchLower.startsWith("status:")) {
        const statusQuery = searchLower.replace("status:", "")
        matches = memory.status === statusQuery
      } else {
        // Regular text search
        matches =
          memory.title.toLowerCase().includes(searchLower) ||
          (memory.personalNote && memory.personalNote.toLowerCase().includes(searchLower)) ||
          (memory.genre && memory.genre.toLowerCase().includes(searchLower)) ||
          (memory.developer && memory.developer.toLowerCase().includes(searchLower))
      }

      if (matches) {
        matching.push({ ...memory, isVisible: true })
      } else {
        nonMatching.push({ ...memory, isVisible: false })
      }
    })

    // Better search result positioning - less clustered
    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1400
    const canvasWidth = screenWidth - 40
    const padding = 20
    const gameSpacing = 340 // More space between games in search
    const rowHeight = 260 // More vertical space

    const repositionedMatching = matching.map((memory, index) => {
      const cols = Math.floor(canvasWidth / gameSpacing)
      const col = index % cols
      const row = Math.floor(index / cols)

      const x = col * gameSpacing + padding + (Math.random() - 0.5) * 20 // Small random offset
      const y = row * rowHeight + padding + 80 + (Math.random() - 0.5) * 20

      return {
        ...memory,
        x: Math.min(x, canvasWidth - memory.width - padding),
        y,
      }
    })

    return [...repositionedMatching, ...nonMatching]
  }, [memories, debouncedSearchQuery])

  // Auto-scroll to top when searching
  useEffect(() => {
    if (debouncedSearchQuery && containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [debouncedSearchQuery])

  // Remove real-time search - only search when not in command mode
  useEffect(() => {
    if (!commandMode && commandInput) {
      setSearchQuery(commandInput)
    }
  }, [commandInput, commandMode])

  // Search for games using RAWG API
  const searchGames = async (query: string) => {
    if (!query.trim()) {
      setGameSearchResults([])
      return
    }

    setIsSearchingGames(true)
    try {
      const response = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (data.results) {
        setGameSearchResults(data.results)
      } else {
        setGameSearchResults([])
      }
    } catch (error) {
      console.error("Error searching games:", error)
      setGameSearchResults([])
    } finally {
      setIsSearchingGames(false)
    }
  }

  // Debounced game search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (gameSearchQuery) {
        searchGames(gameSearchQuery)
      } else {
        setGameSearchResults([])
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [gameSearchQuery])

  const selectGameFromSearch = (game: RAWGGame) => {
    setSelectedGameData(game)
    setNewMemory({
      title: game.name,
      status: "unfinished",
      personalNote: "",
    })
    setGameSearchResults([])
    setGameSearchQuery("")
  }

  // Improved random positioning with better collision detection
  const findRandomPosition = (gameWidth: number, gameHeight: number, existingGames: GameMemory[]) => {
    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1400
    const canvasWidth = screenWidth - 40
    const padding = 20
    const minGap = 40 // Minimum gap between games

    const maxAttempts = 200
    let attempts = 0

    while (attempts < maxAttempts) {
      // Generate random position
      const x = padding + Math.random() * (canvasWidth - gameWidth - padding * 2)
      const y = padding + 80 + Math.random() * 800 // Random Y with some vertical spread

      // Check for overlaps with existing games
      let hasOverlap = false
      for (const existing of existingGames) {
        const dx = Math.abs(x - existing.x)
        const dy = Math.abs(y - existing.y)
        const minDistanceX = (gameWidth + existing.width) / 2 + minGap
        const minDistanceY = (gameHeight + existing.height) / 2 + minGap

        if (dx < minDistanceX && dy < minDistanceY) {
          hasOverlap = true
          break
        }
      }

      if (!hasOverlap) {
        return { x, y }
      }

      attempts++
    }

    // Fallback: place it in a safe area at the bottom
    const fallbackY = Math.max(400, ...existingGames.map((g) => g.y + g.height + 50))
    return {
      x: padding + Math.random() * (canvasWidth - gameWidth - padding * 2),
      y: fallbackY,
    }
  }

  useEffect(() => {
    if (isBooting) {
      const bootSequence = [
        "Devcat/Gamelog.exe",
        "",
        "MEMORY_ARCHIVE_OS v2.3.0",
        "Initializing neural pathways...",
        "Loading game memories...",
        "Mounting nostalgia drive...",
        "Connecting to RAWG database...",
        "Restoring from local storage...",
        "Scanning memory fragments...",
        memories.length > 0 ? `Found ${memories.length} game files` : "Archive initialized - ready for new memories",
        "Optimizing random layout...",
        "Boot complete. Welcome to your archive.",
        "",
        "CTRL+K for commands | //add to start",
      ]

      let currentLine = 0
      const bootInterval = setInterval(() => {
        if (currentLine < bootSequence.length) {
          setBootText((prev) => prev + bootSequence[currentLine] + "\n")
          currentLine++
        } else {
          clearInterval(bootInterval)
          setTimeout(() => setIsBooting(false), 1000)
        }
      }, 300)

      return () => clearInterval(bootInterval)
    }
  }, [isBooting, memories.length])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCommandMode(false)
        setPopupMemory(null)
        setIsEditingMemory(false)
        setSearchQuery("")
        setCommandInput("")
        setGameSearchResults([])
        setSelectedGameData(null)
      }
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault()
        setCommandMode(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleCommand = (command: string) => {
    const cmd = command.toLowerCase().trim()

    if (cmd === "//add") {
      setIsAddingMemory(true)
      setCommandMode(false)
      setCommandInput("")
    } else if (cmd.startsWith("//search ")) {
      const query = cmd.replace("//search ", "")
      setSearchQuery(query)
      setCommandMode(false)
      setCommandInput("")
    } else if (cmd === "//status finished") {
      setSearchQuery("status:finished")
      setCommandMode(false)
      setCommandInput("")
    } else if (cmd === "//status unfinished") {
      setSearchQuery("status:unfinished")
      setCommandMode(false)
      setCommandInput("")
    } else if (cmd === "//status wishlist") {
      setSearchQuery("status:wishlist")
      setCommandMode(false)
      setCommandInput("")
    }
  }

  const handleAddMemory = () => {
    if (newMemory.title.trim()) {
      const gameWidth = 280
      const gameHeight = 200

      // Use selected game data if available
      const gameData = selectedGameData
      const releaseYear = gameData?.released ? new Date(gameData.released).getFullYear() : 2024

      // Find random position that doesn't overlap
      const { x, y } = findRandomPosition(gameWidth, gameHeight, memories)

      // Create new memory with random position
      const memory: GameMemory = {
        id: Date.now().toString(),
        title: newMemory.title,
        status: newMemory.status,
        personalNote: newMemory.personalNote,
        addedOn: new Date().toISOString(),
        year: releaseYear,
        genre: gameData?.genres?.[0] || "unknown",
        developer: gameData?.developers?.[0] || "Unknown",
        coverUrl: gameData?.background_image || "/placeholder.svg?height=300&width=200",
        metacritic: gameData?.metacritic,
        platforms: gameData?.platforms,
        x,
        y,
        width: gameWidth,
        height: gameHeight,
        zIndex: memories.length + 1,
        windowType: ["terminal", "file", "glitch", "memory"][Math.floor(Math.random() * 4)] as any, // Random window type
        memoryClarity: "vivid",
        isVisible: true,
      }

      // Add to beginning of array (newest first) and trigger animation
      const newMemories = [memory, ...memories]
      setMemories(newMemories)
      setNewMemory({ title: "", status: "unfinished", personalNote: "" })
      setSelectedGameData(null)
      setIsAddingMemory(false)

      // Scroll to the new game after a brief delay
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: Math.max(0, y - 100),
            behavior: "smooth",
          })
        }
      }, 100)
    }
  }

  const handleEditMemory = () => {
    if (editingMemory.id) {
      const updatedMemories = memories.map((memory) =>
        memory.id === editingMemory.id
          ? {
              ...memory,
              status: editingMemory.status || memory.status,
              personalNote: editingMemory.personalNote || memory.personalNote,
              title: editingMemory.title || memory.title,
              genre: editingMemory.genre || memory.genre,
              developer: editingMemory.developer || memory.developer,
              year: editingMemory.year || memory.year,
            }
          : memory,
      )
      setMemories(updatedMemories)
      setIsEditingMemory(false)
      setEditingMemory({})
      setPopupMemory(null)
    }
  }

  const startEditingMemory = (memory: GameMemory) => {
    setEditingMemory({
      id: memory.id,
      title: memory.title,
      status: memory.status,
      personalNote: memory.personalNote,
      genre: memory.genre,
      developer: memory.developer,
      year: memory.year,
    })
    setIsEditingMemory(true)
  }

  const getWindowStyle = (memory: GameMemory) => {
    let opacity = memory.isVisible ? 0.95 : 0
    const filter = "none"

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

    // Check if this is a newly added game (within last 2 seconds)
    const isNewlyAdded = new Date().getTime() - new Date(memory.addedOn).getTime() < 2000

    return {
      position: "absolute" as const,
      left: `${memory.x}px`,
      top: `${memory.y}px`,
      width: `${memory.width}px`,
      height: `${memory.height}px`,
      zIndex: memory.zIndex,
      opacity,
      filter,
      transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: memory.isVisible ? "translateZ(0) scale(1)" : "translateZ(0) scale(0.95)",
      pointerEvents: memory.isVisible ? "auto" : "none",
      userSelect: "none",
      WebkitUserSelect: "none",
      MozUserSelect: "none",
      msUserSelect: "none",
      // Add special animation for newly added games
      animation: isNewlyAdded ? "gameAppear 0.8s cubic-bezier(0.4, 0, 0.2, 1)" : undefined,
    }
  }

  const getWindowClass = (memory: GameMemory) => {
    const baseClass = "border-2 backdrop-blur-sm cursor-pointer font-mono text-xs select-none"

    // Add status-based accent colors
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

  const getMemoryClarityText = (clarity: string) => {
    switch (clarity) {
      case "vivid":
        return "CLEAR"
      case "faded":
        return "FADED"
      case "forgotten":
        return "FRAGMENTED"
      default:
        return "UNKNOWN"
    }
  }

  if (isBooting) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono p-8 overflow-hidden">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {bootText}
          <span className="animate-pulse">█</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative select-none">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-green-500 text-xs font-mono animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            >
              {String.fromCharCode(33 + Math.floor(Math.random() * 94))}
            </div>
          ))}
        </div>

        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-green-500/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="fixed top-0 left-0 right-0 bg-black/90 border-b border-green-500/30 p-2 text-xs z-40 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <span>Gamelog.exe</span>
            <span className="text-green-600">|</span>
            <span>{filteredMemories.filter((m) => m.isVisible).length} files</span>
            {debouncedSearchQuery && (
              <span className="text-yellow-400">
                |{" "}
                {debouncedSearchQuery.startsWith("status:")
                  ? `FILTER: ${debouncedSearchQuery.replace("status:", "").toUpperCase()}`
                  : `SEARCH: ${debouncedSearchQuery}`}
              </span>
            )}
            <span className="text-green-600">|</span>
            <span className="text-blue-400">
              ✓{memories.filter((m) => m.status === "finished").length}~
              {memories.filter((m) => m.status === "unfinished").length}★
              {memories.filter((m) => m.status === "wishlist").length}
            </span>
          </div>
          <div className="flex gap-4">
            <span>{currentTime.toLocaleTimeString()}</span>
            <span className="text-green-600">|</span>
            <span>CTRL+K:cmd</span>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div ref={containerRef} className="pt-12 overflow-y-auto" style={{ height: "calc(100vh - 48px)" }}>
        <div className="relative w-full" style={{ height: `${canvasHeight}px` }}>
          {filteredMemories.map((memory, index) => (
            <div
              key={memory.id}
              style={getWindowStyle(memory)}
              className={getWindowClass(memory)}
              onDoubleClick={() => memory.isVisible && setPopupMemory(memory)}
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
          ))}
        </div>
      </div>

      {commandMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-green-500/50 p-4 z-50 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2">
            <span className="text-green-500">$</span>
            <Input
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && commandInput.startsWith("//")) {
                  handleCommand(commandInput)
                }
              }}
              className="bg-transparent border-none text-green-400 font-mono focus:ring-0 focus:outline-none"
              placeholder="//command..."
              autoFocus
            />
          </div>
          <div className="text-xs opacity-60 mt-2">
            Commands: //add //search [term] //status [finished|unfinished|wishlist]
          </div>
        </div>
      )}

      {/* Popup Dialog */}
      {popupMemory && !isEditingMemory && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div
            className={`${getWindowClass(popupMemory)} w-[600px] max-w-[90vw] max-h-[90vh] overflow-auto animate-in zoom-in-95 duration-300 select-text`}
            style={{ animationDelay: "100ms" }}
          >
            <div className="border-b border-current/30 p-3 text-sm flex justify-between items-center">
              <span>{popupMemory.title} - PROPERTIES</span>
              <button
                onClick={() => setPopupMemory(null)}
                className="hover:bg-current/20 px-2 py-1 transition-colors duration-200"
              >
                [X]
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={popupMemory.coverUrl || "/placeholder.svg"}
                    alt={popupMemory.title}
                    className="w-32 h-44 object-cover border border-current/30 transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="text-lg font-bold">{popupMemory.title}</div>
                  <div>STATUS: {popupMemory.status.toUpperCase()}</div>
                  <div>CREATED: {formatTimestamp(popupMemory.addedOn)}</div>
                  <div>CLARITY: {getMemoryClarityText(popupMemory.memoryClarity)}</div>
                  {popupMemory.year && <div>YEAR: {popupMemory.year}</div>}
                  {popupMemory.genre && <div>GENRE: {popupMemory.genre.toUpperCase().replace(/_/g, " ")}</div>}
                  {popupMemory.developer && <div>DEVELOPER: {popupMemory.developer}</div>}
                  {popupMemory.metacritic && <div>METACRITIC: {popupMemory.metacritic}/100</div>}
                  {popupMemory.platforms && popupMemory.platforms.length > 0 && (
                    <div>PLATFORMS: {popupMemory.platforms.slice(0, 3).join(", ")}</div>
                  )}
                </div>
              </div>

              {popupMemory.personalNote && (
                <div className="border-t border-current/30 pt-4">
                  <div className="opacity-80 mb-2">MEMORY_FRAGMENT:</div>
                  <div className="italic opacity-90 leading-relaxed bg-current/10 p-3 border border-current/20">
                    "{popupMemory.personalNote}"
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-current/30">
                <button
                  onClick={() => startEditingMemory(popupMemory)}
                  className="px-4 py-2 border border-green-500/50 text-green-400 hover:bg-green-500/20 transition-all duration-200 hover:scale-105"
                >
                  EDIT
                </button>
                <button
                  onClick={() => setPopupMemory(null)}
                  className="px-4 py-2 border border-current/50 hover:bg-current/20 transition-all duration-200 hover:scale-105"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Memory Dialog */}
      {isEditingMemory && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-black/95 border-2 border-green-500/50 text-green-400 font-mono w-[600px] max-w-[90vw] max-h-[90vh] overflow-auto animate-in zoom-in-95 duration-300">
            <div className="border-b border-green-500/30 p-3 text-sm flex justify-between items-center">
              <span>EDIT_MEMORY_FILE</span>
              <button
                onClick={() => setIsEditingMemory(false)}
                className="hover:bg-current/20 px-2 py-1 transition-colors duration-200"
              >
                [X]
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs opacity-80">FILENAME:</label>
                <Input
                  value={editingMemory.title || ""}
                  onChange={(e) => setEditingMemory({ ...editingMemory, title: e.target.value })}
                  className="bg-transparent border border-green-500/30 text-green-400 font-mono mt-1 transition-all duration-200 focus:border-green-400/70"
                />
              </div>
              <div>
                <label className="text-xs opacity-80">STATUS:</label>
                <select
                  value={editingMemory.status || "unfinished"}
                  onChange={(e) => setEditingMemory({ ...editingMemory, status: e.target.value as any })}
                  className="w-full bg-black border border-green-500/30 text-green-400 font-mono p-2 mt-1 transition-all duration-200 focus:border-green-400/70"
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
                  className="bg-transparent border border-green-500/30 text-green-400 font-mono mt-1 transition-all duration-200 focus:border-green-400/70"
                  placeholder="e.g. horror, rpg, platformer"
                />
              </div>
              <div>
                <label className="text-xs opacity-80">DEVELOPER:</label>
                <Input
                  value={editingMemory.developer || ""}
                  onChange={(e) => setEditingMemory({ ...editingMemory, developer: e.target.value })}
                  className="bg-transparent border border-green-500/30 text-green-400 font-mono mt-1 transition-all duration-200 focus:border-green-400/70"
                  placeholder="Game developer"
                />
              </div>
              <div>
                <label className="text-xs opacity-80">YEAR:</label>
                <Input
                  type="number"
                  value={editingMemory.year || ""}
                  onChange={(e) => setEditingMemory({ ...editingMemory, year: Number.parseInt(e.target.value) })}
                  className="bg-transparent border border-green-500/30 text-green-400 font-mono mt-1 transition-all duration-200 focus:border-green-400/70"
                  placeholder="Release year"
                />
              </div>
              <div>
                <label className="text-xs opacity-80">MEMORY_FRAGMENT:</label>
                <Textarea
                  value={editingMemory.personalNote || ""}
                  onChange={(e) => setEditingMemory({ ...editingMemory, personalNote: e.target.value })}
                  className="bg-transparent border border-green-500/30 text-green-400 font-mono mt-1 resize-none transition-all duration-200 focus:border-green-400/70"
                  rows={3}
                  placeholder="// personal memory or note..."
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleEditMemory}
                  className="bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 font-mono transition-all duration-200 hover:scale-105"
                >
                  SAVE_CHANGES
                </Button>
                <Button
                  variant="ghost"
                  className="border border-red-500/50 text-red-400 hover:bg-red-500/20 font-mono transition-all duration-200 hover:scale-105"
                  onClick={() => setIsEditingMemory(false)}
                >
                  CANCEL
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Memory Dialog */}
      <Dialog open={isAddingMemory} onOpenChange={setIsAddingMemory}>
        <DialogContent className="bg-black/95 border-2 border-green-500/50 text-green-400 font-mono animate-in zoom-in-95 duration-300 max-w-2xl">
          <div className="space-y-4">
            <div className="text-sm border-b border-green-500/30 pb-2">CREATE_NEW_MEMORY_FILE</div>

            {/* Game Search */}
            <div>
              <label className="text-xs opacity-80">SEARCH_RAWG_DATABASE:</label>
              <div className="relative">
                <Input
                  value={gameSearchQuery}
                  onChange={(e) => setGameSearchQuery(e.target.value)}
                  className="bg-transparent border border-green-500/30 text-green-400 font-mono mt-1 transition-all duration-200 focus:border-green-400/70"
                  placeholder="search for game..."
                />
                {isSearchingGames && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin w-4 h-4 border border-green-400 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Search Results */}
              {gameSearchResults.length > 0 && (
                <div className="mt-2 border border-green-500/30 bg-black/80 max-h-48 overflow-y-auto">
                  {gameSearchResults.map((game) => (
                    <div
                      key={game.id}
                      onClick={() => selectGameFromSearch(game)}
                      className="p-2 hover:bg-green-500/20 cursor-pointer border-b border-green-500/20 last:border-b-0"
                    >
                      <div className="flex gap-3">
                        <img
                          src={game.background_image || "/placeholder.svg"}
                          alt={game.name}
                          className="w-12 h-16 object-cover border border-green-500/30"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-bold">{game.name}</div>
                          <div className="text-xs opacity-70">
                            {game.released && new Date(game.released).getFullYear()} •{" "}
                            {game.genres.slice(0, 2).join(", ")}
                          </div>
                          <div className="text-xs opacity-50">{game.developers.slice(0, 1).join(", ")}</div>
                          {game.metacritic && <div className="text-xs opacity-60">Score: {game.metacritic}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs opacity-80">FILENAME:</label>
              <Input
                value={newMemory.title}
                onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                className="bg-transparent border border-green-500/30 text-green-400 font-mono mt-1 transition-all duration-200 focus:border-green-400/70"
                placeholder="game_title.exe"
              />
            </div>

            {selectedGameData && (
              <div className="border border-green-500/30 p-3 bg-green-500/10">
                <div className="text-xs opacity-80 mb-2">SELECTED_GAME_DATA:</div>
                <div className="flex gap-3">
                  <img
                    src={selectedGameData.background_image || "/placeholder.svg"}
                    alt={selectedGameData.name}
                    className="w-16 h-20 object-cover border border-green-500/30"
                  />
                  <div className="text-xs space-y-1">
                    <div>
                      <strong>{selectedGameData.name}</strong>
                    </div>
                    <div>Released: {selectedGameData.released}</div>
                    <div>Genre: {selectedGameData.genres.slice(0, 2).join(", ")}</div>
                    <div>Developer: {selectedGameData.developers.slice(0, 1).join(", ")}</div>
                    {selectedGameData.metacritic && <div>Score: {selectedGameData.metacritic}/100</div>}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs opacity-80">STATUS:</label>
              <select
                value={newMemory.status}
                onChange={(e) => setNewMemory({ ...newMemory, status: e.target.value as any })}
                className="w-full bg-black border border-green-500/30 text-green-400 font-mono p-2 mt-1 transition-all duration-200 focus:border-green-400/70"
              >
                <option value="unfinished">UNFINISHED</option>
                <option value="finished">FINISHED</option>
                <option value="wishlist">WISHLIST</option>
              </select>
            </div>
            <div>
              <label className="text-xs opacity-80">MEMORY_FRAGMENT:</label>
              <Textarea
                value={newMemory.personalNote}
                onChange={(e) => setNewMemory({ ...newMemory, personalNote: e.target.value })}
                className="bg-transparent border border-green-500/30 text-green-400 font-mono mt-1 resize-none transition-all duration-200 focus:border-green-400/70"
                rows={3}
                placeholder="// personal memory or note..."
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleAddMemory}
                className="bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 font-mono transition-all duration-200 hover:scale-105"
              >
                SAVE_FILE
              </Button>
              <Button
                variant="ghost"
                className="border border-red-500/50 text-red-400 hover:bg-red-500/20 font-mono transition-all duration-200 hover:scale-105"
                onClick={() => {
                  setIsAddingMemory(false)
                  setSelectedGameData(null)
                  setGameSearchResults([])
                  setGameSearchQuery("")
                }}
              >
                CANCEL
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
