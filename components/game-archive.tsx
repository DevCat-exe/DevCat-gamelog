"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Calendar, GamepadIcon, Heart, Plus, Search, Star, Tag, Archive, Gamepad2, Clock, Filter } from "lucide-react"

interface Game {
  id: string
  title: string
  year: number
  coverUrl?: string
  personalNote: string
  genre: string
  platform: string
  developer: string
  addedOn: string
  tags: string[]
  status: "finished" | "unfinished" | "favorite"
}

const sampleGames: Game[] = [
  {
    id: "1",
    title: "Detention",
    year: 2017,
    coverUrl: "/placeholder.svg?height=300&width=200",
    personalNote:
      "Haunting atmosphere that stayed with me for weeks. The way it blended horror with historical trauma was unforgettable.",
    genre: "Horror",
    platform: "PC",
    developer: "Red Candle Games",
    addedOn: "2024-01-15",
    tags: ["atmospheric", "indie", "psychological"],
    status: "favorite",
  },
  {
    id: "2",
    title: "Omori",
    year: 2020,
    coverUrl: "/placeholder.svg?height=300&width=200",
    personalNote:
      "Emotional journey through depression and friendship. The art style perfectly captured the melancholy.",
    genre: "RPG",
    platform: "PC",
    developer: "OMOCAT",
    addedOn: "2024-02-03",
    tags: ["emotional", "indie", "surreal"],
    status: "finished",
  },
  {
    id: "3",
    title: "Hollow Knight",
    year: 2017,
    coverUrl: "/placeholder.svg?height=300&width=200",
    personalNote: "Got lost in Hallownest for hours. Every corner held secrets and the soundtrack was pure magic.",
    genre: "Metroidvania",
    platform: "PC",
    developer: "Team Cherry",
    addedOn: "2023-12-20",
    tags: ["metroidvania", "indie", "challenging"],
    status: "unfinished",
  },
  {
    id: "4",
    title: "A Short Hike",
    year: 2019,
    coverUrl: "/placeholder.svg?height=300&width=200",
    personalNote: "Perfect for a quiet evening. Sometimes the simplest journeys are the most meaningful.",
    genre: "Adventure",
    platform: "PC",
    developer: "adamgryu",
    addedOn: "2024-01-28",
    tags: ["cozy", "indie", "short"],
    status: "favorite",
  },
]

const sidebarItems = [
  { title: "All Games", icon: Archive, filter: "all" },
  { title: "By Year", icon: Calendar, filter: "year" },
  { title: "Favorites", icon: Heart, filter: "favorites" },
  { title: "Tags", icon: Tag, filter: "tags" },
  { title: "Indie/Obscure", icon: Gamepad2, filter: "indie" },
  { title: "Wishlist", icon: Star, filter: "wishlist" },
]

export function GameArchive() {
  const [games, setGames] = useState<Game[]>(sampleGames)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [isAddGameOpen, setIsAddGameOpen] = useState(false)
  const [newGame, setNewGame] = useState<Partial<Game>>({
    title: "",
    year: new Date().getFullYear(),
    personalNote: "",
    genre: "",
    platform: "",
    developer: "",
    tags: [],
    status: "unfinished",
  })

  const filteredAndSortedGames = useMemo(() => {
    const filtered = games.filter((game) => {
      const matchesSearch =
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.personalNote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      switch (activeFilter) {
        case "favorites":
          return matchesSearch && game.status === "favorite"
        case "indie":
          return matchesSearch && (game.tags.includes("indie") || game.developer.toLowerCase().includes("indie"))
        default:
          return matchesSearch
      }
    })

    return filtered.sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.addedOn).getTime() - new Date(a.addedOn).getTime()
      } else {
        return a.title.localeCompare(b.title)
      }
    })
  }, [games, searchQuery, activeFilter, sortBy])

  const handleAddGame = () => {
    if (newGame.title) {
      const game: Game = {
        id: Date.now().toString(),
        title: newGame.title,
        year: newGame.year || new Date().getFullYear(),
        personalNote: newGame.personalNote || "",
        genre: newGame.genre || "",
        platform: newGame.platform || "",
        developer: newGame.developer || "",
        addedOn: new Date().toISOString().split("T")[0],
        tags: newGame.tags || [],
        status: (newGame.status as "finished" | "unfinished" | "favorite") || "unfinished",
        coverUrl: "/placeholder.svg?height=300&width=200",
      }
      setGames([...games, game])
      setNewGame({
        title: "",
        year: new Date().getFullYear(),
        personalNote: "",
        genre: "",
        platform: "",
        developer: "",
        tags: [],
        status: "unfinished",
      })
      setIsAddGameOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <SidebarProvider>
        <div className="flex w-full">
          <Sidebar className="border-r border-red-900/20 bg-black/20 backdrop-blur-xl">
            <SidebarHeader className="p-6 border-b border-red-900/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                  <GamepadIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">Game Archive</h1>
                  <p className="text-xs text-slate-400">Digital Game Vault</p>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel className="text-slate-400 text-xs uppercase tracking-wider">
                  Collection
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {sidebarItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          onClick={() => setActiveFilter(item.filter)}
                          isActive={activeFilter === item.filter}
                          className="text-slate-300 hover:text-white hover:bg-red-900/20 data-[active=true]:bg-red-900/30 data-[active=true]:text-white transition-all duration-200"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="text-slate-400 hover:text-white" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {activeFilter === "all" && "All Games"}
                      {activeFilter === "favorites" && "Favorites"}
                      {activeFilter === "indie" && "Indie & Obscure"}
                      {activeFilter === "tags" && "Tagged Games"}
                      {activeFilter === "year" && "By Year"}
                      {activeFilter === "wishlist" && "Wishlist"}
                    </h2>
                    <p className="text-slate-400 text-sm">{filteredAndSortedGames.length} games in your archive</p>
                  </div>
                </div>

                <Dialog open={isAddGameOpen} onOpenChange={setIsAddGameOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700 text-white border-0">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Game
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900/95 backdrop-blur-xl border border-red-900/20 text-white">
                    <DialogHeader>
                      <DialogTitle>Add New Game</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Game Title</Label>
                        <Input
                          id="title"
                          value={newGame.title}
                          onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white"
                          placeholder="Enter game title..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="year">Year</Label>
                          <Input
                            id="year"
                            type="number"
                            value={newGame.year}
                            onChange={(e) => setNewGame({ ...newGame, year: Number.parseInt(e.target.value) })}
                            className="bg-slate-800/50 border-slate-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={newGame.status}
                            onValueChange={(value) => setNewGame({ ...newGame, status: value as any })}
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="unfinished">Unfinished</SelectItem>
                              <SelectItem value="finished">Finished</SelectItem>
                              <SelectItem value="favorite">Favorite</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="genre">Genre</Label>
                          <Input
                            id="genre"
                            value={newGame.genre}
                            onChange={(e) => setNewGame({ ...newGame, genre: e.target.value })}
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="e.g. Horror, RPG..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="platform">Platform</Label>
                          <Input
                            id="platform"
                            value={newGame.platform}
                            onChange={(e) => setNewGame({ ...newGame, platform: e.target.value })}
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="e.g. PC, PS5..."
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="developer">Developer</Label>
                        <Input
                          id="developer"
                          value={newGame.developer}
                          onChange={(e) => setNewGame({ ...newGame, developer: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white"
                          placeholder="Game developer..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="note">Personal Memory</Label>
                        <Textarea
                          id="note"
                          value={newGame.personalNote}
                          onChange={(e) => setNewGame({ ...newGame, personalNote: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white resize-none"
                          placeholder="What made this game special to you?"
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleAddGame} className="w-full bg-red-600 hover:bg-red-700">
                        Add to Archive
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search games, memories, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-800/30 backdrop-blur-sm border-slate-700/50 text-white placeholder:text-slate-400 focus:border-red-500/50"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-slate-800/30 backdrop-blur-sm border-slate-700/50 text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="recent">Recently Added</SelectItem>
                    <SelectItem value="alphabetical">A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Games Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedGames.map((game, index) => (
                  <Card
                    key={game.id}
                    className="group bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 hover:border-red-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
                        <img
                          src={game.coverUrl || "/placeholder.svg"}
                          alt={game.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-3 right-3">
                          {game.status === "favorite" && (
                            <div className="w-8 h-8 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center">
                              <Heart className="w-4 h-4 text-white fill-current" />
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2">{game.title}</h3>
                          <div className="flex items-center gap-2 text-slate-300 text-sm">
                            <Calendar className="w-3 h-3" />
                            <span>{game.year}</span>
                            <span className="text-slate-500">•</span>
                            <span className="capitalize">{game.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <p className="text-slate-300 text-sm line-clamp-3 leading-relaxed">{game.personalNote}</p>
                        <div className="flex flex-wrap gap-1">
                          {game.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs bg-red-900/20 text-red-300 border-red-800/30 hover:bg-red-900/30"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {game.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-slate-700/30 text-slate-400">
                              +{game.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/30">
                          <span>{game.platform}</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Added {new Date(game.addedOn).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredAndSortedGames.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-slate-800/30 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                    <GamepadIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No games found</h3>
                  <p className="text-slate-400 mb-6">
                    {searchQuery ? "Try adjusting your search terms" : "Start building your digital game vault"}
                  </p>
                  <Button onClick={() => setIsAddGameOpen(true)} className="bg-red-600 hover:bg-red-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Game
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}
