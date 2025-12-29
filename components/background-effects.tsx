"use client"

import { useEffect, useState } from "react"

export function BackgroundEffects() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Base Grid */}
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

      {/* Floating Characters "Matrix-lite" feel */}
      <div className="absolute inset-0">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={`char-${i}`}
            className="absolute text-green-500/20 text-xs font-mono animate-pulse select-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              transform: `scale(${Math.random() * 0.5 + 0.5})`,
            }}
          >
            {String.fromCharCode(33 + Math.floor(Math.random() * 94))}
          </div>
        ))}
      </div>

      {/* Glowing Orbs/Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 25 }).map((_, i) => (
            <div
            key={`particle-${i}`}
            className="absolute bg-green-500/10 rounded-full blur-sm animate-pulse"
            style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${4 + Math.random() * 5}s`,
                opacity: Math.random() * 0.5,
            }}
            />
        ))}
      </div>

      {/* Occasional Scanning Line - Subtle */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent h-[100px] w-full pointer-events-none"
        style={{
            animation: "scanline 8s linear infinite"
        }}
      />
      <style jsx>{`
        @keyframes scanline {
            0% { transform: translateY(-100%); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
