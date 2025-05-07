"use client"

import type { Editor } from "@tiptap/react"
import { Check, ChevronDown, Palette } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"

type Props = {
  editor: Editor
}

export function CustomColorSelector({ editor }: Props) {
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  // Definir as cores com base no tema atual
  const colors = [
    { name: isDark ? "Branco" : "Preto", value: isDark ? "#ffffff" : "#000000" },
    { name: "Cinza", value: "#9ca3af" },
    { name: "Vermelho", value: "#f87171" },
    { name: "Laranja", value: "#fb923c" },
    { name: "Amarelo", value: "#facc15" },
    { name: "Verde", value: "#4ade80" },
    { name: "Azul", value: "#60a5fa" },
    { name: "Roxo", value: "#a78bfa" },
    { name: "Rosa", value: "#f472b6" },
  ]

  // Atualizar a cor ativa quando a seleção mudar
  useEffect(() => {
    if (!editor) return

    const updateActiveColor = () => {
      try {
        const attrs = editor.getAttributes("customColor")
        setActiveColor(attrs.color || null)
      } catch (error) {
        console.error("Error getting active color:", error)
        setActiveColor(null)
      }
    }

    // Atualizar imediatamente
    updateActiveColor()

    // Adicionar event listeners para atualizar quando a seleção mudar
    editor.on("selectionUpdate", updateActiveColor)
    editor.on("transaction", updateActiveColor)

    return () => {
      editor.off("selectionUpdate", updateActiveColor)
      editor.off("transaction", updateActiveColor)
    }
  }, [editor])

  // Encontrar o item de cor ativa
  const activeColorItem = colors.find(({ value }) => activeColor && value.toLowerCase() === activeColor.toLowerCase())

  // Implementação simplificada para aplicar cor
  const applyColor = useCallback(
    (color: string) => {
      if (!editor || !editor.isEditable) return

      // Usar o comando personalizado para aplicar cor
      editor.chain().focus().setCustomColor(color).run()
    },
    [editor],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 gap-1 border-none text-foreground hover:bg-accent">
          <Palette className="h-4 w-4" />
          <div
            className="h-4 w-4 rounded-sm border border-border"
            style={{ backgroundColor: activeColorItem?.value || "transparent" }}
          />
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-0">
        {colors.map(({ name, value }) => (
          <DropdownMenuItem key={value} className="flex items-center gap-2" onSelect={() => applyColor(value)}>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-sm border border-border" style={{ backgroundColor: value }} />
              <span>{name}</span>
            </div>
            {activeColor && activeColor.toLowerCase() === value.toLowerCase() && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
