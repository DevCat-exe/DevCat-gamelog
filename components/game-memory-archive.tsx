"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { gameService, type GameMemory } from "@/lib/game-service"

// New Components
import { BootScreen } from "./boot-screen"
import { BackgroundEffects } from "./background-effects"
import { GameWindow } from "./game-window"
import { GameDetailsPopup } from "./game-details-popup"
import { CommandBar } from "./command-bar"
import { StatsWindow } from "./stats-window"

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

export function GameMemoryArchive() {
  const [memories, setMemories] = useState<GameMemory[]>([])
  const [isBooting, setIsBooting] = useState(true)
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
  const [isLoading, setIsLoading] = useState(false)
  const [showStats, setShowStats] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Load games from Supabase on mount
  useEffect(() => {
    loadGamesFromDatabase()
  }, [])

  const loadGamesFromDatabase = async () => {
    try {
      setIsLoading(true)
      const isDatabaseAvailable = await gameService.isDatabaseAvailable()
      if (!isDatabaseAvailable) {
        console.warn("Database not available. Using localStorage.")
        const saved = localStorage.getItem("gamelog-memories")
        if (saved) setMemories(JSON.parse(saved))
        return
      }
      const games = await gameService.getAllGames()
      setMemories(games)
    } catch (error) {
      console.error("Failed to load games:", error)
      const saved = localStorage.getItem("gamelog-memories")
      if (saved) setMemories(JSON.parse(saved))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const canvasHeight = useMemo(() => {
    if (memories.length === 0) return 800
    const maxY = Math.max(...memories.map((m) => m.y + m.height))
    return Math.max(800, maxY + 100)
  }, [memories])

  const filteredMemories = useMemo(() => {
    const searchLower = debouncedSearchQuery.toLowerCase().trim()

    if (!searchLower) {
      return memories.map((memory) => ({ ...memory, isVisible: true }))
    }

    const matching: GameMemory[] = []
    const nonMatching: GameMemory[] = []

    memories.forEach((memory) => {
      let matches = false

      if (searchLower.startsWith("status:")) {
        const statusQuery = searchLower.replace("status:", "")
        matches = memory.status === statusQuery
      } else {
        matches =
          memory.title.toLowerCase().includes(searchLower) ||
          (memory.personalNote?.toLowerCase().includes(searchLower) ?? false) ||
          (memory.genre?.toLowerCase().includes(searchLower) ?? false) ||
          (memory.developer?.toLowerCase().includes(searchLower) ?? false)
      }

      if (matches) {
        matching.push({ ...memory, isVisible: true })
      } else {
        nonMatching.push({ ...memory, isVisible: false })
      }
    })

    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1400
    const canvasWidth = screenWidth - 40
    const padding = 20
    const gameSpacing = 340
    const rowHeight = 260

    const repositionedMatching = matching.map((memory, index) => {
      const cols = Math.floor(canvasWidth / gameSpacing)
      const col = index % cols
      const row = Math.floor(index / cols)

      const x = col * gameSpacing + padding + (Math.random() - 0.5) * 20
      const y = row * rowHeight + padding + 80 + (Math.random() - 0.5) * 20

      return {
        ...memory,
        x: Math.min(x, canvasWidth - memory.width - padding),
        y,
      }
    })

    return [...repositionedMatching, ...nonMatching]
  }, [memories, debouncedSearchQuery])

  useEffect(() => {
    if (debouncedSearchQuery && containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [debouncedSearchQuery])

  useEffect(() => {
    if (!commandMode && commandInput) {
      setSearchQuery(commandInput)
    }
  }, [commandInput, commandMode])

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

  const findRandomPosition = (gameWidth: number, gameHeight: number, existingGames: GameMemory[]) => {
    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1400
    const canvasWidth = screenWidth - 40
    const padding = 20
    const minGap = 40

    const maxAttempts = 200
    let attempts = 0

    while (attempts < maxAttempts) {
      const x = padding + Math.random() * (canvasWidth - gameWidth - padding * 2)
      const y = padding + 80 + Math.random() * 800

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

    const fallbackY = Math.max(400, ...existingGames.map((g) => g.y + g.height + 50))
    return {
      x: padding + Math.random() * (canvasWidth - gameWidth - padding * 2),
      y: fallbackY,
    }
  }

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
        setShowStats(false)
        setIsAddingMemory(false)
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
    } else if (cmd === "//stats") {
      setShowStats(true)
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

  const handleAddMemory = async () => {
    if (newMemory.title.trim()) {
      const gameWidth = 280
      const gameHeight = 200
      const gameData = selectedGameData
      const releaseYear = gameData?.released ? new Date(gameData.released).getFullYear() : 2024
      const { x, y } = findRandomPosition(gameWidth, gameHeight, memories)

      const memory: Omit<GameMemory, "id"> = {
        title: newMemory.title,
        status: newMemory.status,
        personalNote: newMemory.personalNote,
        addedOn: new Date().toISOString(),
        year: releaseYear,
        genre: gameData?.genres?.[0] || "unknown",
        developer: gameData?.developers?.[0] || "Unknown",
        coverUrl: gameData?.background_image || "/placeholder.svg?height=300&width=200", // Fallback to RAWG/Placeholder
        metacritic: gameData?.metacritic,
        platforms: gameData?.platforms,
        x,
        y,
        width: gameWidth,
        height: gameHeight,
        zIndex: memories.length + 1,
        windowType: ["terminal", "file", "glitch", "memory"][Math.floor(Math.random() * 4)] as any,
        memoryClarity: "vivid",
        isVisible: true,
      }

      try {
        setIsLoading(true)
        const savedMemory = await gameService.addGame(memory)
        setMemories((prev) => [savedMemory, ...prev])
        setNewMemory({ title: "", status: "unfinished", personalNote: "" })
        setSelectedGameData(null)
        setIsAddingMemory(false)
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: Math.max(0, y - 100),
              behavior: "smooth",
            })
          }
        }, 100)
      } catch (error) {
        console.error("Failed to add game:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSaveEdit = async () => {
    if (editingMemory.id) {
      try {
        setIsLoading(true)
        const updatedMemory = await gameService.updateGame(editingMemory.id, editingMemory)
        setMemories((prev) => prev.map((memory) => (memory.id === editingMemory.id ? updatedMemory : memory)))
        setIsEditingMemory(false)
        setEditingMemory({})
        setPopupMemory(prev => prev && prev.id === updatedMemory.id ? updatedMemory : prev)
      } catch (error) {
        console.error("Failed to update game:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

    const handleDeleteGame = async (id: string) => {
        try {
            setIsLoading(true)
            await gameService.deleteGame(id)
            setMemories(prev => prev.filter(m => m.id !== id))
            setPopupMemory(null)
            setIsEditingMemory(false)
        } catch (error) {
            console.error("Failed to delete game:", error)
        } finally {
            setIsLoading(false)
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

  if (isBooting) {
    return <BootScreen onBootComplete={() => setIsBooting(false)} gameCount={memories.length} />
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative select-none">
      <BackgroundEffects />

      {/* Header */}
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
            <span className="text-blue-400 cursor-pointer hover:text-blue-300" onClick={() => setShowStats(true)}>STATS_MODULE</span>
            {isLoading && <span className="text-yellow-400 animate-pulse">| SYNCING...</span>}
          </div>
          <div className="flex gap-4">
            <span>{currentTime.toLocaleTimeString()}</span>
            <span className="text-green-600">|</span>
            <span>CTRL+K:cmd</span>
          </div>
        </div>
      </div>

      {/* Game windows */}
      <div ref={containerRef} className="pt-12 overflow-y-auto" style={{ height: "calc(100vh - 48px)" }}>
        <div className="relative w-full" style={{ height: `${canvasHeight}px` }}>
          {filteredMemories.map((memory) => (
             <GameWindow 
                key={memory.id} 
                memory={memory} 
                onDoubleClick={setPopupMemory} 
             />
          ))}
        </div>
      </div>

      <CommandBar 
          isVisible={commandMode} 
          commandInput={commandInput} 
          setCommandInput={setCommandInput} 
          onExecute={handleCommand} 
      />

      {/* Popups */}
      {showStats && <StatsWindow memories={memories} onClose={() => setShowStats(false)} />}

      {popupMemory && (
          <GameDetailsPopup 
            memory={popupMemory}
            onClose={() => { setPopupMemory(null); setIsEditingMemory(false); }}
            onEdit={startEditingMemory}
            onDelete={handleDeleteGame}
            isEditing={isEditingMemory}
            isLoading={isLoading}
            editingMemory={editingMemory}
            setEditingMemory={setEditingMemory}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={() => { setIsEditingMemory(false);  }}
          />
      )}

      {/* Add Memory Dialog - Kept inline as it's complex and interacts with RAWG search */}
       <Dialog open={isAddingMemory} onOpenChange={setIsAddingMemory}>
        <DialogContent className="bg-black/95 border-2 border-green-500 text-green-400 font-mono sm:max-w-[500px]">
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b border-green-500/30 pb-2">ADD_NEW_MEMORY_FRAGMENT</h2>

            <div>
              <label className="text-xs opacity-80">SEARCH_DATABASE:</label>
              <div className="relative">
                <Input
                  value={gameSearchQuery}
                  onChange={(e) => setGameSearchQuery(e.target.value)}
                  className="bg-black border border-green-500/30 text-green-400 font-mono mt-1"
                  placeholder="Type game title..."
                  autoFocus
                />
                {isSearchingGames && (
                  <div className="absolute right-2 top-3 text-xs opacity-50 animate-pulse">SCANNING...</div>
                )}
              </div>

              {gameSearchResults.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-green-500/30 bg-black/90 absolute w-full z-50">
                  {gameSearchResults.map((game) => (
                    <div
                      key={game.id}
                      onClick={() => selectGameFromSearch(game)}
                      className="p-2 hover:bg-green-500/20 cursor-pointer text-xs flex justify-between items-center border-b border-green-500/10"
                    >
                      <span>{game.name}</span>
                      <span className="opacity-50">{game.released?.substring(0, 4)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedGameData && (
              <div className="p-2 border border-green-500/30 bg-green-500/5 text-xs">
                <div>SELECTED: {selectedGameData.name}</div>
                <div className="opacity-70">
                   GENRE: {selectedGameData.genres?.[0] || "N/A"} | DEV: {selectedGameData.developers?.[0] || "N/A"}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs opacity-80">MANUAL_OVERRIDE_TITLE:</label>
              <Input
                value={newMemory.title}
                onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                className="bg-black border border-green-500/30 text-green-400 font-mono mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs opacity-80">STATUS:</label>
                <select
                  value={newMemory.status}
                  onChange={(e) => setNewMemory({ ...newMemory, status: e.target.value as any })}
                  className="w-full bg-black border border-green-500/30 text-green-400 font-mono p-2 mt-1"
                >
                  <option value="unfinished">UNFINISHED</option>
                  <option value="finished">FINISHED</option>
                  <option value="wishlist">WISHLIST</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs opacity-80">PERSONAL_NOTE:</label>
              <Textarea
                value={newMemory.personalNote}
                onChange={(e) => setNewMemory({ ...newMemory, personalNote: e.target.value })}
                className="w-full bg-black border border-green-500/30 text-green-400 font-mono p-2 mt-1 min-h-[80px]"
                placeholder="Initial thoughts..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                onClick={() => setIsAddingMemory(false)}
                className="bg-transparent border border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                ABORT
              </Button>
              <Button
                onClick={handleAddMemory}
                disabled={!newMemory.title || isLoading}
                className="bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500/40"
              >
                {isLoading ? "WRITING..." : "INITIALIZE_MEMORY"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
