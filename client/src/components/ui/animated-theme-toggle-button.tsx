"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export type ThemeTransitionType = "horizontal" | "vertical"

type AnimatedThemeToggleButtonProps = {
  type: ThemeTransitionType
  className?: string
}

function useThemeState() {
  const [darkMode, setDarkMode] = useState(
    () =>
      typeof window !== "undefined"
        ? document.documentElement.classList.contains("dark")
        : false
  )

  useEffect(() => {
    const sync = () => setDarkMode(document.documentElement.classList.contains("dark"))
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  return [darkMode, setDarkMode] as const
}

function triggerThemeTransition(type: ThemeTransitionType) {
  if (type === "horizontal") {
    document.documentElement.animate(
      { clipPath: ["inset(50% 0 50% 0)", "inset(0 0 0 0)"] },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    )
  } else if (type === "vertical") {
    document.documentElement.animate(
      { clipPath: ["inset(0 50% 0 50%)", "inset(0 0 0 0)"] },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    )
  }
}

export const AnimatedThemeToggleButton = ({
  type,
  className,
}: AnimatedThemeToggleButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [darkMode, setDarkMode] = useThemeState()

  const handleToggle = useCallback(async () => {
    if (!buttonRef.current) return

    if (!document.startViewTransition) {
      flushSync(() => {
        const toggled = !darkMode
        setDarkMode(toggled)
        document.documentElement.classList.toggle("dark", toggled)
        localStorage.setItem("theme", toggled ? "dark" : "light")
      })
      return
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        const toggled = !darkMode
        setDarkMode(toggled)
        document.documentElement.classList.toggle("dark", toggled)
        localStorage.setItem("theme", toggled ? "dark" : "light")
      })
    }).ready

    triggerThemeTransition(type)
  }, [darkMode, type, setDarkMode])

  return (
    <button
      ref={buttonRef}
      onClick={handleToggle}
      aria-label={darkMode ? "Açık temaya geç" : "Koyu temaya geç"}
      type="button"
      data-testid="button-theme-toggle"
      className={cn(
        "flex items-center justify-center rounded-full border outline-none focus:outline-none focus:ring-0 cursor-pointer transition-colors",
        darkMode ? "bg-zinc-900 border-zinc-700 text-yellow-400" : "bg-white border-gray-200 text-blue-900",
        className
      )}
      style={{ width: 40, height: 40 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {darkMode ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, scale: 0.55, rotate: 25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.33 }}
          >
            <Sun size={18} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, scale: 0.55, rotate: -25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.33 }}
          >
            <Moon size={18} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
