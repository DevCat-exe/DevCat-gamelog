"use client"

import { useState, useEffect, useRef } from "react"

interface BootScreenProps {
  onBootComplete: () => void
  gameCount: number
}

export function BootScreen({ onBootComplete, gameCount }: BootScreenProps) {
  const [bootText, setBootText] = useState("")
  
  // Refs to decouple effect from prop updates
  const countRef = useRef(gameCount)
  const completeRef = useRef(onBootComplete)
  const hasStartedRef = useRef(false)

  // Always keep refs up to date
  useEffect(() => {
    countRef.current = gameCount
    completeRef.current = onBootComplete
  }, [gameCount, onBootComplete])

  useEffect(() => {
    // Prevent double-start in Strict Mode or re-runs
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    const bootSequence = [
      "Devcat/Gamelog.exe",
      "",
      "DIGITAL_GAME_VAULT v3.0.0",
      "Initializing neural pathways...",
      "Loading game memories...",
      "Mounting nostalgia drive...",
      "Connecting to Supabase database...",
      "Database connection established ✓",
      "Scanning memory fragments...",
      "DYNAMIC_COUNT_LINE",
      "Cloud sync enabled ✓",
      "Optimizing random layout...",
      "Boot complete. Welcome to your vault.",
      "",
      "CTRL+K for commands | //add to start",
    ]

    let currentIndex = 0
    let currentText = ""
    let timeoutId: NodeJS.Timeout
    let intervalId: NodeJS.Timeout

    intervalId = setInterval(() => {
      if (currentIndex < bootSequence.length) {
        let line = bootSequence[currentIndex]
        
        if (line === "DYNAMIC_COUNT_LINE") {
             const count = countRef.current
             line = count > 0 ? `Found ${count} game files` : "Archive initialized - ready for new memories"
        }

        currentText += line + "\n"
        setBootText(currentText)
        currentIndex++
      } else {
        clearInterval(intervalId)
        timeoutId = setTimeout(() => {
            // Call the latest callback version
            if (completeRef.current) completeRef.current()
        }, 800)
      }
    }, 120)

    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, []) // Empty dependency array = run ONCE on mount

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8 overflow-hidden select-none">
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {bootText}
        <span className="animate-pulse">█</span>
      </div>
    </div>
  )
}
