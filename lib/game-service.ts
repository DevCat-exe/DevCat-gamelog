import { supabase, isSupabaseConfigured } from "./supabase"
import type { Database } from "./supabase"

type Game = Database["public"]["Tables"]["games"]["Row"]
type GameInsert = Database["public"]["Tables"]["games"]["Insert"]
type GameUpdate = Database["public"]["Tables"]["games"]["Update"]

export interface GameMemory {
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

// Convert database row to GameMemory format
function dbToGameMemory(game: Game): GameMemory {
  return {
    id: game.id,
    title: game.title,
    status: game.status,
    personalNote: game.personal_note || undefined,
    addedOn: game.added_on,
    year: game.year || undefined,
    genre: game.genre || undefined,
    developer: game.developer || undefined,
    coverUrl: game.cover_url || undefined,
    x: game.x,
    y: game.y,
    width: game.width,
    height: game.height,
    zIndex: game.z_index,
    windowType: game.window_type,
    memoryClarity: game.memory_clarity,
    isVisible: game.is_visible || true,
    metacritic: game.metacritic || undefined,
    platforms: game.platforms || undefined,
  }
}

// Convert GameMemory to database insert format
function gameMemoryToDbInsert(game: Omit<GameMemory, "id">): GameInsert {
  return {
    title: game.title,
    status: game.status,
    personal_note: game.personalNote || null,
    added_on: game.addedOn,
    year: game.year || null,
    genre: game.genre || null,
    developer: game.developer || null,
    cover_url: game.coverUrl || null,
    x: game.x,
    y: game.y,
    width: game.width,
    height: game.height,
    z_index: game.zIndex,
    window_type: game.windowType,
    memory_clarity: game.memoryClarity,
    is_visible: game.isVisible,
    metacritic: game.metacritic || null,
    platforms: game.platforms || null,
  }
}

// Convert GameMemory to database update format
function gameMemoryToDbUpdate(game: Partial<GameMemory>): GameUpdate {
  const update: GameUpdate = {}

  if (game.title !== undefined) update.title = game.title
  if (game.status !== undefined) update.status = game.status
  if (game.personalNote !== undefined) update.personal_note = game.personalNote || null
  if (game.year !== undefined) update.year = game.year || null
  if (game.genre !== undefined) update.genre = game.genre || null
  if (game.developer !== undefined) update.developer = game.developer || null
  if (game.coverUrl !== undefined) update.cover_url = game.coverUrl || null
  if (game.x !== undefined) update.x = game.x
  if (game.y !== undefined) update.y = game.y
  if (game.width !== undefined) update.width = game.width
  if (game.height !== undefined) update.height = game.height
  if (game.zIndex !== undefined) update.z_index = game.zIndex
  if (game.windowType !== undefined) update.window_type = game.windowType
  if (game.memoryClarity !== undefined) update.memory_clarity = game.memoryClarity
  if (game.isVisible !== undefined) update.is_visible = game.isVisible
  if (game.metacritic !== undefined) update.metacritic = game.metacritic || null
  if (game.platforms !== undefined) update.platforms = game.platforms || null

  return update
}

// Load games from localStorage
function loadFromLocalStorage(): GameMemory[] {
  if (typeof window === "undefined") return []
  try {
    const saved = localStorage.getItem("gamelog-memories")
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error("Error loading from localStorage:", error)
    return []
  }
}

// Save games to localStorage
function saveToLocalStorage(games: GameMemory[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("gamelog-memories", JSON.stringify(games))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

// Check if Supabase is properly configured and accessible
async function checkSupabaseConnection(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false
  }

  try {
    const { data, error } = await supabase.from("games").select("count", { count: "exact", head: true })
    return !error
  } catch (error) {
    console.error("Supabase connection check failed:", error)
    return false
  }
}

export const gameService = {
  // Check if database is available
  async isDatabaseAvailable(): Promise<boolean> {
    return await checkSupabaseConnection()
  },

  // Get all games with fallback to localStorage
  async getAllGames(): Promise<GameMemory[]> {
    try {
      // If Supabase is not configured, use localStorage only
      if (!isSupabaseConfigured || !supabase) {
        console.warn("Supabase not configured, using localStorage only")
        return loadFromLocalStorage()
      }

      const isConnected = await checkSupabaseConnection()

      if (!isConnected) {
        console.warn("Database not available, falling back to localStorage")
        return loadFromLocalStorage()
      }

      const { data, error } = await supabase.from("games").select("*").order("added_on", { ascending: false })

      if (error) {
        console.error("Error fetching games from database:", error)
        return loadFromLocalStorage()
      }

      const games = data.map(dbToGameMemory)

      // Also save to localStorage as backup
      saveToLocalStorage(games)

      return games
    } catch (error) {
      console.error("Error in getAllGames:", error)
      return loadFromLocalStorage()
    }
  },

  // Add a new game with fallback
  async addGame(game: Omit<GameMemory, "id">): Promise<GameMemory> {
    try {
      // If Supabase is not configured, use localStorage only
      if (!isSupabaseConfigured || !supabase) {
        console.warn("Supabase not configured, saving to localStorage only")
        const gameWithId = { ...game, id: Date.now().toString() }
        const existing = loadFromLocalStorage()
        const updated = [gameWithId, ...existing]
        saveToLocalStorage(updated)
        return gameWithId
      }

      const isConnected = await checkSupabaseConnection()

      if (!isConnected) {
        console.warn("Database not available, saving to localStorage only")
        const gameWithId = { ...game, id: Date.now().toString() }
        const existing = loadFromLocalStorage()
        const updated = [gameWithId, ...existing]
        saveToLocalStorage(updated)
        return gameWithId
      }

      const gameInsert = gameMemoryToDbInsert(game)
      const { data, error } = await supabase.from("games").insert(gameInsert).select().single()

      if (error) {
        console.error("Error adding game to database:", error)
        // Fallback to localStorage
        const gameWithId = { ...game, id: Date.now().toString() }
        const existing = loadFromLocalStorage()
        const updated = [gameWithId, ...existing]
        saveToLocalStorage(updated)
        return gameWithId
      }

      const savedGame = dbToGameMemory(data)

      // Also update localStorage
      const existing = loadFromLocalStorage()
      const updated = [savedGame, ...existing.filter((g: GameMemory) => g.id !== savedGame.id)]
      saveToLocalStorage(updated)

      return savedGame
    } catch (error) {
      console.error("Error in addGame:", error)
      // Fallback to localStorage
      const gameWithId = { ...game, id: Date.now().toString() }
      const existing = loadFromLocalStorage()
      const updated = [gameWithId, ...existing]
      saveToLocalStorage(updated)
      return gameWithId
    }
  },

  // Update a game with fallback
  async updateGame(id: string, updates: Partial<GameMemory>): Promise<GameMemory> {
    try {
      // If Supabase is not configured, use localStorage only
      if (!isSupabaseConfigured || !supabase) {
        console.warn("Supabase not configured, updating localStorage only")
        const existing = loadFromLocalStorage()
        const updated = existing.map((game) => (game.id === id ? { ...game, ...updates } : game))
        saveToLocalStorage(updated)
        const updatedGame = updated.find((g) => g.id === id)
        if (!updatedGame) throw new Error("Game not found")
        return updatedGame
      }

      const isConnected = await checkSupabaseConnection()

      if (!isConnected) {
        console.warn("Database not available, updating localStorage only")
        const existing = loadFromLocalStorage()
        const updated = existing.map((game) => (game.id === id ? { ...game, ...updates } : game))
        saveToLocalStorage(updated)
        const updatedGame = updated.find((g) => g.id === id)
        if (!updatedGame) throw new Error("Game not found")
        return updatedGame
      }

      const gameUpdate = gameMemoryToDbUpdate(updates)
      const { data, error } = await supabase.from("games").update(gameUpdate).eq("id", id).select().single()

      if (error) {
        console.error("Error updating game in database:", error)
        // Fallback to localStorage
        const existing = loadFromLocalStorage()
        const updated = existing.map((game) => (game.id === id ? { ...game, ...updates } : game))
        saveToLocalStorage(updated)
        const updatedGame = updated.find((g) => g.id === id)
        if (!updatedGame) throw new Error("Game not found")
        return updatedGame
      }

      const updatedGame = dbToGameMemory(data)

      // Also update localStorage
      const existing = loadFromLocalStorage()
      const updated = existing.map((game) => (game.id === id ? updatedGame : game))
      saveToLocalStorage(updated)

      return updatedGame
    } catch (error) {
      console.error("Error in updateGame:", error)
      throw error
    }
  },

  // Delete a game with fallback
  async deleteGame(id: string): Promise<void> {
    try {
      // If Supabase is not configured, use localStorage only
      if (!isSupabaseConfigured || !supabase) {
        console.warn("Supabase not configured, deleting from localStorage only")
        const existing = loadFromLocalStorage()
        const updated = existing.filter((game) => game.id !== id)
        saveToLocalStorage(updated)
        return
      }

      const isConnected = await checkSupabaseConnection()

      if (!isConnected) {
        console.warn("Database not available, deleting from localStorage only")
        const existing = loadFromLocalStorage()
        const updated = existing.filter((game) => game.id !== id)
        saveToLocalStorage(updated)
        return
      }

      const { error } = await supabase.from("games").delete().eq("id", id)

      if (error) {
        console.error("Error deleting game from database:", error)
        // Still try to delete from localStorage
        const existing = loadFromLocalStorage()
        const updated = existing.filter((game) => game.id !== id)
        saveToLocalStorage(updated)
        throw error
      }

      // Also delete from localStorage
      const existing = loadFromLocalStorage()
      const updated = existing.filter((game) => game.id !== id)
      saveToLocalStorage(updated)
    } catch (error) {
      console.error("Error in deleteGame:", error)
      throw error
    }
  },

  // Search games with fallback
  async searchGames(query: string): Promise<GameMemory[]> {
    try {
      // If Supabase is not configured, use localStorage only
      if (!isSupabaseConfigured || !supabase) {
        console.warn("Supabase not configured, searching localStorage only")
        const existing = loadFromLocalStorage()
        return existing.filter(
          (game) =>
            game.title.toLowerCase().includes(query.toLowerCase()) ||
            (game.personalNote && game.personalNote.toLowerCase().includes(query.toLowerCase())) ||
            (game.genre && game.genre.toLowerCase().includes(query.toLowerCase())) ||
            (game.developer && game.developer.toLowerCase().includes(query.toLowerCase())),
        )
      }

      const isConnected = await checkSupabaseConnection()

      if (!isConnected) {
        console.warn("Database not available, searching localStorage only")
        const existing = loadFromLocalStorage()
        return existing.filter(
          (game) =>
            game.title.toLowerCase().includes(query.toLowerCase()) ||
            (game.personalNote && game.personalNote.toLowerCase().includes(query.toLowerCase())) ||
            (game.genre && game.genre.toLowerCase().includes(query.toLowerCase())) ||
            (game.developer && game.developer.toLowerCase().includes(query.toLowerCase())),
        )
      }

      const { data, error } = await supabase
        .from("games")
        .select("*")
        .or(`title.ilike.%${query}%,personal_note.ilike.%${query}%,genre.ilike.%${query}%,developer.ilike.%${query}%`)
        .order("added_on", { ascending: false })

      if (error) {
        console.error("Error searching games in database:", error)
        // Fallback to localStorage search
        const existing = loadFromLocalStorage()
        return existing.filter(
          (game) =>
            game.title.toLowerCase().includes(query.toLowerCase()) ||
            (game.personalNote && game.personalNote.toLowerCase().includes(query.toLowerCase())) ||
            (game.genre && game.genre.toLowerCase().includes(query.toLowerCase())) ||
            (game.developer && game.developer.toLowerCase().includes(query.toLowerCase())),
        )
      }

      return data.map(dbToGameMemory)
    } catch (error) {
      console.error("Error in searchGames:", error)
      // Fallback to localStorage search
      const existing = loadFromLocalStorage()
      return existing.filter(
        (game) =>
          game.title.toLowerCase().includes(query.toLowerCase()) ||
          (game.personalNote && game.personalNote.toLowerCase().includes(query.toLowerCase())) ||
          (game.genre && game.genre.toLowerCase().includes(query.toLowerCase())) ||
          (game.developer && game.developer.toLowerCase().includes(query.toLowerCase())),
      )
    }
  },

  // Get games by status with fallback
  async getGamesByStatus(status: "finished" | "unfinished" | "wishlist"): Promise<GameMemory[]> {
    try {
      // If Supabase is not configured, use localStorage only
      if (!isSupabaseConfigured || !supabase) {
        console.warn("Supabase not configured, filtering localStorage only")
        const existing = loadFromLocalStorage()
        return existing.filter((game) => game.status === status)
      }

      const isConnected = await checkSupabaseConnection()

      if (!isConnected) {
        console.warn("Database not available, filtering localStorage only")
        const existing = loadFromLocalStorage()
        return existing.filter((game) => game.status === status)
      }

      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("status", status)
        .order("added_on", { ascending: false })

      if (error) {
        console.error("Error fetching games by status from database:", error)
        // Fallback to localStorage
        const existing = loadFromLocalStorage()
        return existing.filter((game) => game.status === status)
      }

      return data.map(dbToGameMemory)
    } catch (error) {
      console.error("Error in getGamesByStatus:", error)
      // Fallback to localStorage
      const existing = loadFromLocalStorage()
      return existing.filter((game) => game.status === status)
    }
  },
}
