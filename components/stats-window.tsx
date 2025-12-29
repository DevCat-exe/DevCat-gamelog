"use client"

import type { GameMemory } from "@/lib/game-service"

interface StatsWindowProps {
  memories: GameMemory[]
  onClose: () => void
}

export function StatsWindow({ memories, onClose }: StatsWindowProps) {
  const totalGames = memories.length
  
  const statusCounts = {
    finished: memories.filter(m => m.status === "finished").length,
    unfinished: memories.filter(m => m.status === "unfinished").length,
    wishlist: memories.filter(m => m.status === "wishlist").length,
  }

  const genreCounts: Record<string, number> = {}
  memories.forEach(m => {
    if (m.genre) {
       const genre = m.genre.toLowerCase()
       genreCounts[genre] = (genreCounts[genre] || 0) + 1
    }
  })
  
  const topGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const maxGenreCount = Math.max(...Object.values(genreCounts), 1)

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-black/95 border-2 border-green-500/50 text-green-400 font-mono w-[500px] max-w-[90vw] animate-in zoom-in-95 duration-300">
        <div className="border-b border-green-500/30 p-3 text-sm flex justify-between items-center">
            <span>ARCHIVE_STATISTICS</span>
            <button onClick={onClose} className="hover:bg-green-500/20 px-2 py-1">[X]</button>
        </div>

        <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="border border-green-500/30 p-4 text-center">
                    <div className="text-3xl font-bold">{totalGames}</div>
                    <div className="text-xs opacity-70">TOTAL FILES</div>
                </div>
                <div className="border border-green-500/30 p-4 text-center">
                    <div className="text-3xl font-bold">{statusCounts.finished}</div>
                    <div className="text-xs opacity-70">COMPLETED</div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="text-xs opacity-70 mb-2">STATUS DISTRIBUTION</div>
                <div className="h-4 flex w-full border border-green-500/30">
                    <div 
                        className="bg-green-500/70 h-full" 
                        style={{ width: `${(statusCounts.finished / totalGames) * 100}%` }} 
                        title="Finished"
                    />
                    <div 
                        className="bg-yellow-500/70 h-full" 
                        style={{ width: `${(statusCounts.unfinished / totalGames) * 100}%` }} 
                        title="Unfinished"
                    />
                    <div 
                        className="bg-blue-500/70 h-full" 
                        style={{ width: `${(statusCounts.wishlist / totalGames) * 100}%` }} 
                        title="Wishlist"
                    />
                </div>
                <div className="flex justify-between text-xs opacity-60">
                    <span>FIN: {statusCounts.finished}</span>
                    <span>UNF: {statusCounts.unfinished}</span>
                    <span>WIS: {statusCounts.wishlist}</span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="text-xs opacity-70 mb-2">TOP GENRES</div>
                {topGenres.map(([genre, count]) => (
                    <div key={genre} className="flex items-center gap-2 text-xs">
                        <div className="w-20 truncate text-right opacity-80">{genre}</div>
                        <div className="flex-1 h-2 bg-green-900/30">
                            <div 
                                className="h-full bg-green-500/50" 
                                style={{ width: `${(count / maxGenreCount) * 100}%` }}
                            />
                        </div>
                        <div className="w-6 text-right opacity-60">{count}</div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}
