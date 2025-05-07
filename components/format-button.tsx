"use client"

import type React from "react"

import { useCallback } from "react"
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"
import type { Editor } from "@tiptap/react"
import { createIntentionalToggleCommand } from "./tiptap/extensions/custom-color"

interface FormatButtonProps {
  editor: Editor
  format: "bold" | "italic" | "underline" | "strike"
  icon: React.ReactNode
  className?: string
  title?: string
}

export function FormatButton({ editor, format, icon, className, title }: FormatButtonProps) {
  const isActive = editor.isActive(format)

  const handleFormatting = useCallback(() => {
    if (!editor || !editor.isEditable) return

    try {
      // Usar o comando intencional para aplicar/remover formatação
      const toggleCommand = createIntentionalToggleCommand(editor, format)
      toggleCommand()
    } catch (error) {
      console.error(`Erro ao aplicar formatação ${format}:`, error)
    }
  }, [editor, format])

  return (
    <Toggle
      size="sm"
      pressed={isActive}
      onPressedChange={handleFormatting}
      className={cn(
        "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
        isActive && "bg-accent/50",
        className,
      )}
      aria-label={title || format}
      title={title || format}
    >
      {icon}
    </Toggle>
  )
}
