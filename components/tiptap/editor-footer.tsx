"use client"

import { useEffect, useState } from "react"
import type { Editor } from "@tiptap/react"
import { FileText, Hash } from "lucide-react"
import { Space } from "./icons/space-icon"

interface EditorFooterProps {
  editor: Editor | null
}

export function EditorFooter({ editor }: EditorFooterProps) {
  const [stats, setStats] = useState({ characters: 0, words: 0, spaces: 0 })

  useEffect(() => {
    if (!editor) return

    const updateStats = () => {
      if (!editor) return

      try {
        // Get plain text from editor
        const text = editor.getText()

        // Count spaces
        const spaces = (text.match(/\s/g) || []).length

        // Count characters (excluding spaces)
        const characters = text.replace(/\s/g, "").length

        // Count words (split by whitespace and filter empty strings)
        const words = text
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length

        setStats({ characters, words, spaces })
      } catch (error) {
        console.error("Error calculating editor stats:", error)
      }
    }

    // Update stats initially
    updateStats()

    // Update stats when content changes
    editor.on("update", updateStats)

    return () => {
      editor.off("update", updateStats)
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className="flex items-center justify-end gap-4 px-4 py-2 text-xs text-muted-foreground border-t border-border bg-muted/30">
      <div className="flex items-center gap-1">
        <Hash className="h-3.5 w-3.5" />
        <span>{stats.characters} caracteres</span>
      </div>
      <div className="flex items-center gap-1">
        <Space className="h-3.5 w-3.5" />
        <span>{stats.spaces} espaços</span>
      </div>
      <div className="flex items-center gap-1">
        <FileText className="h-3.5 w-3.5" />
        <span>{stats.words} palavras</span>
      </div>
    </div>
  )
}
