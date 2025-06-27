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
}

// Generate better positioned memories with NO overlapping guaranteed
const generateMemoryPositions = () => {
  const memories = [
    {
      id: "1",
      title: "OMORI.exe",
      status: "finished" as const,
      personalNote: "dreams within dreams within dreams...",
      addedOn: "2022-02-03T14:15:00",
      year: 2020,
      genre: "psychological_horror",
      developer: "OMOCAT",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 280,
      height: 200,
      zIndex: 5,
      windowType: "memory" as const,
      memoryClarity: "vivid" as const,
    },
    {
      id: "2",
      title: "detention_v1.2",
      status: "finished" as const,
      personalNote: "the weight of history in every pixel",
      addedOn: "2024-01-28T11:20:00",
      year: 2017,
      genre: "horror",
      developer: "Red Candle Games",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 260,
      height: 180,
      zIndex: 3,
      windowType: "terminal" as const,
      memoryClarity: "vivid" as const,
    },
    {
      id: "3",
      title: "disco_elysium.dat",
      status: "finished" as const,
      personalNote: "what kind of cop are you?",
      addedOn: "2023-06-10T21:15:00",
      year: 2019,
      genre: "rpg",
      developer: "ZA/UM",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 300,
      height: 220,
      zIndex: 7,
      windowType: "file" as const,
      memoryClarity: "vivid" as const,
    },
    {
      id: "4",
      title: "hollow_knight_backup",
      status: "unfinished" as const,
      personalNote: "lost in hallownest's depths...",
      addedOn: "2023-12-20T19:45:00",
      year: 2017,
      genre: "metroidvania",
      developer: "Team Cherry",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 240,
      height: 160,
      zIndex: 2,
      windowType: "glitch" as const,
      memoryClarity: "vivid" as const,
    },
    {
      id: "5",
      title: "celeste.save",
      status: "finished" as const,
      personalNote: "climbing the mountain within",
      addedOn: "2023-08-15T20:00:00",
      year: 2018,
      genre: "platformer",
      developer: "Maddy Makes Games",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 270,
      height: 190,
      zIndex: 4,
      windowType: "memory" as const,
      memoryClarity: "vivid" as const,
    },
    {
      id: "6",
      title: "outer_wilds.tmp",
      status: "wishlist" as const,
      personalNote: "waiting for the right moment...",
      addedOn: "2024-02-01T10:00:00",
      year: 2019,
      genre: "exploration",
      developer: "Mobius Digital",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 250,
      height: 170,
      zIndex: 1,
      windowType: "terminal" as const,
      memoryClarity: "vivid" as const,
    },
    {
      id: "7",
      title: "hades_run.exe",
      status: "finished" as const,
      personalNote: "one more run... always one more run",
      addedOn: "2023-05-12T16:30:00",
      year: 2020,
      genre: "roguelike",
      developer: "Supergiant Games",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 260,
      height: 180,
      zIndex: 6,
      windowType: "file" as const,
      memoryClarity: "vivid" as const,
    },
    {
      id: "8",
      title: "stardew_valley.farm",
      status: "finished" as const,
      personalNote: "peaceful mornings in pelican town",
      addedOn: "2023-03-20T09:15:00",
      year: 2016,
      genre: "simulation",
      developer: "ConcernedApe",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 280,
      height: 200,
      zIndex: 3,
      windowType: "memory" as const,
      memoryClarity: "vivid" as const,
    },
    {
      id: "9",
      title: "undertale.sav",
      status: "finished" as const,
      personalNote: "determination fills you with... feelings",
      addedOn: "2022-11-08T20:45:00",
      year: 2015,
      genre: "rpg",
      developer: "Toby Fox",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 250,
      height: 170,
      zIndex: 2,
      windowType: "terminal" as const,
      memoryClarity: "vivid" as const,
    },
    {
      id: "10",
      title: "spiritfarer.journey",
      status: "finished" as const,
      personalNote: "saying goodbye has never been so beautiful",
      addedOn: "2023-07-14T18:20:00",
      year: 2020,
      genre: "adventure",
      developer: "Thunder Lotus Games",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 290,
      height: 210,
      zIndex: 4,
      windowType: "memory" as const,
      memoryClarity: "vivid" as const,
    },
    {
      id: "11",
      title: "a_short_hike.trail",
      status: "finished" as const,
      personalNote: "sometimes the smallest journeys...",
      addedOn: "2023-04-02T14:10:00",
      year: 2019,
      genre: "adventure",
      developer: "adamgryu",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 240,
      height: 160,
      zIndex: 1,
      windowType: "file" as const,
      memoryClarity: "vivid" as const,
    },
    {
      id: "12",
      title: "night_in_woods.exe",
      status: "finished" as const,
      personalNote: "mae's story hit too close to home",
      addedOn: "2022-09-18T21:30:00",
      year: 2017,
      genre: "adventure",
      developer: "Infinite Fall",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 270,
      height: 190,
      zIndex: 5,
      windowType: "memory" as const,
      memoryClarity: "vivid" as const,
    },
    {
      id: "13",
      title: "gris.art",
      status: "finished" as const,
      personalNote: "watercolor emotions",
      addedOn: "2023-01-25T12:45:00",
      year: 2018,
      genre: "platformer",
      developer: "Nomada Studio",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 250,
      height: 170,
      zIndex: 2,
      windowType: "terminal" as const,
      memoryClarity: "vivid" as const,
    },
    {
      id: "14",
      title: "ori_blind_forest.light",
      status: "finished" as const,
      personalNote: "light in the darkness",
      addedOn: "2022-12-03T19:20:00",
      year: 2015,
      genre: "metroidvania",
      developer: "Moon Studios",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 260,
      height: 180,
      zIndex: 3,
      windowType: "file" as const,
      memoryClarity: "faded" as const,
    },
    {
      id: "15",
      title: "firewatch.tower",
      status: "finished" as const,
      personalNote: "conversations across the void",
      addedOn: "2023-08-30T15:55:00",
      year: 2016,
      genre: "adventure",
      developer: "Campo Santo",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 280,
      height: 200,
      zIndex: 4,
      windowType: "memory" as const,
      memoryClarity: "vivid" as const,
    },
    {
      id: "16",
      title: "what_remains_edith.house",
      status: "finished" as const,
      personalNote: "family stories carved in wood and memory",
      addedOn: "2023-02-14T17:40:00",
      year: 2017,
      genre: "adventure",
      developer: "Giant Sparrow",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 290,
      height: 210,
      zIndex: 6,
      windowType: "terminal" as const,
      memoryClarity: "vivid" as const,
    },
    {
      id: "17",
      title: "journey.sand",
      status: "finished" as const,
      personalNote: "wordless connection with strangers",
      addedOn: "2022-07-22T13:25:00",
      year: 2012,
      genre: "adventure",
      developer: "thatgamecompany",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 250,
      height: 170,
      zIndex: 1,
      windowType: "file" as const,
      memoryClarity: "vivid" as const,
    },
    {
      id: "18",
      title: "inside.limbo",
      status: "finished" as const,
      personalNote: "wordless horror and beauty",
      addedOn: "2023-06-05T20:15:00",
      year: 2016,
      genre: "puzzle_platformer",
      developer: "Playdead",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 240,
      height: 160,
      zIndex: 2,
      windowType: "glitch" as const,
      memoryClarity: "vivid" as const,
    },
    {
      id: "19",
      title: "kentucky_route_zero.act",
      status: "unfinished" as const,
      personalNote: "magical realism in the american south",
      addedOn: "2023-10-12T22:10:00",
      year: 2013,
      genre: "adventure",
      developer: "Cardboard Computer",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 300,
      height: 220,
      zIndex: 7,
      windowType: "memory" as const,
      memoryClarity: "faded" as const,
    },
    {
      id: "20",
      title: "papers_please.checkpoint",
      status: "finished" as const,
      personalNote: "glory to arstotzka... the weight of small choices",
      addedOn: "2022-05-18T16:50:00",
      year: 2013,
      genre: "simulation",
      developer: "Lucas Pope",
      coverUrl: "/placeholder.svg?height=300&width=200",
      width: 270,
      height: 190,
      zIndex: 5,
      windowType: "terminal" as const,
      memoryClarity: "vivid" as const,
    },
  ]

  // Sort by date - newest first (reverse chronological)
  const sortedMemories = [...memories].sort((a, b) => new Date(b.addedOn).getTime() - new Date(a.addedOn).getTime())

  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1400
  const canvasWidth = screenWidth - 40
  const padding = 20
  const minGap = 20 // Increased gap for better separation

  const positionedMemories: GameMemory[] = []

  // Helper function to check if two rectangles overlap
  const isOverlapping = (
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number,
    gap: number,
  ) => {
    return !(
      (
        x1 + w1 + gap <= x2 || // rect1 is to the left of rect2
        x2 + w2 + gap <= x1 || // rect2 is to the left of rect1
        y1 + h1 + gap <= y2 || // rect1 is above rect2
        y2 + h2 + gap <= y1
      ) // rect2 is above rect1
    )
  }

  // Improved positioning with guaranteed no overlaps
  for (let i = 0; i < sortedMemories.length; i++) {
    const memory = sortedMemories[i]
    let positioned = false
    let attempts = 0
    const maxAttempts = 300

    // Calculate preferred Y based on chronological order (newer games higher up)
    const baseY = Math.floor(i / 3) * 280 + padding + 80 // 3 games per row roughly, more vertical space
    const yVariation = 80 // Allow some vertical variation

    while (!positioned && attempts < maxAttempts) {
      const x = Math.random() * (canvasWidth - memory.width - padding * 2) + padding
      const y = Math.max(baseY + (Math.random() - 0.5) * yVariation, padding + 80)

      // Check for overlaps with ALL existing games
      let hasOverlap = false
      for (const existing of positionedMemories) {
        if (
          isOverlapping(
            x,
            y,
            memory.width,
            memory.height,
            existing.x,
            existing.y,
            existing.width,
            existing.height,
            minGap,
          )
        ) {
          hasOverlap = true
          break
        }
      }

      if (!hasOverlap) {
        positionedMemories.push({
          ...memory,
          x,
          y,
          isVisible: true,
        })
        positioned = true
      }

      attempts++
    }

    // Guaranteed fallback - use a reliable grid system
    if (!positioned) {
      const cols = Math.floor(canvasWidth / 350) // Wider columns to prevent overlap
      const col = i % cols
      const row = Math.floor(i / cols)

      let gridX = col * 350 + padding
      let gridY = row * 280 + padding + 80

      // Make sure grid position doesn't overlap either
      let gridAttempts = 0
      while (gridAttempts < 50) {
        let gridHasOverlap = false
        for (const existing of positionedMemories) {
          if (
            isOverlapping(
              gridX,
              gridY,
              memory.width,
              memory.height,
              existing.x,
              existing.y,
              existing.width,
              existing.height,
              minGap,
            )
          ) {
            gridHasOverlap = true
            break
          }
        }

        if (!gridHasOverlap) {
          break
        }

        // Try next grid position
        gridX += 350
        if (gridX + memory.width > canvasWidth - padding) {
          gridX = padding
          gridY += 280
        }
        gridAttempts++
      }

      positionedMemories.push({
        ...memory,
        x: gridX,
        y: gridY,
        isVisible: true,
      })
    }
  }

  return positionedMemories
}

const sampleMemories = generateMemoryPositions()

export function GameMemoryArchive() {
  const [memories, setMemories] = useState<GameMemory[]>(sampleMemories)
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
  const containerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (isBooting) {
      const bootSequence = [
        "Devcat/Gamelog.exe",
        "",
        "MEMORY_ARCHIVE_OS v2.1.5",
        "Initializing neural pathways...",
        "Loading game memories...",
        "Mounting nostalgia drive...",
        "Scanning memory fragments...",
        `Found ${memories.length} game files`,
        "Optimizing chronological layout...",
        "Boot complete. Welcome to your archive.",
        "",
        "CTRL+K for commands",
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
      const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1400
      const canvasWidth = screenWidth - 40
      const padding = 20

      // Place new games at the TOP (newest first)
      const memory: GameMemory = {
        id: Date.now().toString(),
        title: newMemory.title,
        status: newMemory.status,
        personalNote: newMemory.personalNote,
        addedOn: new Date().toISOString(),
        year: 2024,
        genre: "unknown",
        developer: "Unknown",
        coverUrl: "/placeholder.svg?height=300&width=200",
        x: Math.random() * (canvasWidth - 280 - padding * 2) + padding,
        y: padding + 80 + Math.random() * 100, // Place at top area
        width: 280,
        height: 200,
        zIndex: memories.length + 1,
        windowType: "file",
        memoryClarity: "vivid",
        isVisible: true,
      }

      // Add to beginning of array (newest first)
      setMemories([memory, ...memories])
      setNewMemory({ title: "", status: "unfinished", personalNote: "" })
      setIsAddingMemory(false)
    }
  }

  const handleEditMemory = () => {
    if (editingMemory.id) {
      setMemories(
        memories.map((memory) =>
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
        ),
      )
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

    return {
      position: "absolute" as const,
      left: `${memory.x}px`,
      top: `${memory.y}px`,
      width: `${memory.width}px`,
      height: `${memory.height}px`,
      zIndex: memory.zIndex,
      opacity,
      filter,
      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: memory.isVisible ? "translateZ(0) scale(1)" : "translateZ(0) scale(0.95)",
      pointerEvents: memory.isVisible ? "auto" : "none",
      userSelect: "none",
      WebkitUserSelect: "none",
      MozUserSelect: "none",
      msUserSelect: "none",
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
                  className="px-4 py-2 border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20 transition-all duration-200 hover:scale-105"
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
          <div className="bg-black/95 border-2 border-yellow-500/50 text-yellow-400 font-mono w-[600px] max-w-[90vw] max-h-[90vh] overflow-auto animate-in zoom-in-95 duration-300">
            <div className="border-b border-yellow-500/30 p-3 text-sm flex justify-between items-center">
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
                  className="bg-transparent border border-yellow-500/30 text-yellow-400 font-mono mt-1 transition-all duration-200 focus:border-yellow-400/70"
                />
              </div>
              <div>
                <label className="text-xs opacity-80">STATUS:</label>
                <select
                  value={editingMemory.status || "unfinished"}
                  onChange={(e) => setEditingMemory({ ...editingMemory, status: e.target.value as any })}
                  className="w-full bg-black border border-yellow-500/30 text-yellow-400 font-mono p-2 mt-1 transition-all duration-200 focus:border-yellow-400/70"
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
                  className="bg-transparent border border-yellow-500/30 text-yellow-400 font-mono mt-1 transition-all duration-200 focus:border-yellow-400/70"
                  placeholder="e.g. horror, rpg, platformer"
                />
              </div>
              <div>
                <label className="text-xs opacity-80">DEVELOPER:</label>
                <Input
                  value={editingMemory.developer || ""}
                  onChange={(e) => setEditingMemory({ ...editingMemory, developer: e.target.value })}
                  className="bg-transparent border border-yellow-500/30 text-yellow-400 font-mono mt-1 transition-all duration-200 focus:border-yellow-400/70"
                  placeholder="Game developer"
                />
              </div>
              <div>
                <label className="text-xs opacity-80">YEAR:</label>
                <Input
                  type="number"
                  value={editingMemory.year || ""}
                  onChange={(e) => setEditingMemory({ ...editingMemory, year: Number.parseInt(e.target.value) })}
                  className="bg-transparent border border-yellow-500/30 text-yellow-400 font-mono mt-1 transition-all duration-200 focus:border-yellow-400/70"
                  placeholder="Release year"
                />
              </div>
              <div>
                <label className="text-xs opacity-80">MEMORY_FRAGMENT:</label>
                <Textarea
                  value={editingMemory.personalNote || ""}
                  onChange={(e) => setEditingMemory({ ...editingMemory, personalNote: e.target.value })}
                  className="bg-transparent border border-yellow-500/30 text-yellow-400 font-mono mt-1 resize-none transition-all duration-200 focus:border-yellow-400/70"
                  rows={3}
                  placeholder="// personal memory or note..."
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleEditMemory}
                  className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30 font-mono transition-all duration-200 hover:scale-105"
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
        <DialogContent className="bg-black/95 border-2 border-green-500/50 text-green-400 font-mono animate-in zoom-in-95 duration-300">
          <div className="space-y-4">
            <div className="text-sm border-b border-green-500/30 pb-2">CREATE_NEW_MEMORY_FILE</div>
            <div>
              <label className="text-xs opacity-80">FILENAME:</label>
              <Input
                value={newMemory.title}
                onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                className="bg-transparent border border-green-500/30 text-green-400 font-mono mt-1 transition-all duration-200 focus:border-green-400/70"
                placeholder="game_title.exe"
              />
            </div>
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
                onClick={() => setIsAddingMemory(false)}
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
