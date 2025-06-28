import { type NextRequest, NextResponse } from "next/server"

const RAWG_API_KEY = "a5bf82ab78d246b080a2f5fa47c313c7"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Search query is required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=5`,
      {
        headers: {
          "User-Agent": "Gamelog-Archive/1.0",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`)
    }

    const data = await response.json()

    const games =
      data.results?.map((game: any) => ({
        id: game.id,
        name: game.name,
        released: game.released,
        background_image: game.background_image,
        genres: game.genres?.map((g: any) => g.name) || [],
        developers: game.developers?.map((d: any) => d.name) || [],
        metacritic: game.metacritic,
        description: game.description_raw,
        platforms: game.platforms?.map((p: any) => p.platform.name) || [],
      })) || []

    return NextResponse.json({ results: games })
  } catch (error) {
    console.error("Error fetching from RAWG:", error)
    return NextResponse.json({ error: "Failed to fetch game data" }, { status: 500 })
  }
}
