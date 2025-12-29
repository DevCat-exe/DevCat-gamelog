"use client"

import { Input } from "@/components/ui/input"
import { useEffect, useRef } from "react"

interface CommandBarProps {
  isVisible: boolean
  commandInput: string
  setCommandInput: (val: string) => void
  onExecute: (cmd: string) => void
}

export function CommandBar({ isVisible, commandInput, setCommandInput, onExecute }: CommandBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-green-500/50 p-4 z-50 animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center gap-2">
        <span className="text-green-500">$</span>
        <Input
          ref={inputRef}
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && commandInput.startsWith("//")) {
              onExecute(commandInput)
            }
          }}
          className="bg-transparent border-none text-green-400 font-mono focus:ring-0 focus:outline-none"
          placeholder="//command..."
          autoFocus
        />
      </div>
      <div className="text-xs opacity-60 mt-2">
        Commands: //add //stats //search [term] //status [finished|unfinished|wishlist]
      </div>
    </div>
  )
}
