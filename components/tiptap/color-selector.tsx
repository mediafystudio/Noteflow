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

export function ColorSelector({ editor }: Props) {
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
        const attrs = editor.getAttributes("textStyle")
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

  // Implementação otimizada para aplicar cor preservando outras marcações
  const applyColor = useCallback(
    (color: string) => {
      if (!editor || !editor.isEditable) return

      try {
        // Capturar a seleção atual
        const { from, to } = editor.state.selection

        // Se não houver seleção, apenas aplicar a cor normalmente
        if (from === to) {
          editor.chain().focus().setColor(color).run()
          return
        }

        // Capturar todas as marcações ativas na seleção atual
        const marks = {
          bold: editor.isActive("bold"),
          italic: editor.isActive("italic"),
          underline: editor.isActive("underline"),
          strike: editor.isActive("strike"),
          code: editor.isActive("code"),
          link: editor.isActive("link") ? editor.getAttributes("link") : null,
          fontFamily: editor.getAttributes("textStyle").fontFamily,
          fontSize: editor.getAttributes("textStyle").fontSize,
        }

        // Primeiro, aplicar a cor
        editor.chain().focus().setColor(color).run()

        // Depois, garantir que todas as outras marcações sejam preservadas
        // Importante: Precisamos fazer isso em uma transação separada
        setTimeout(() => {
          try {
            // Reselecionar o texto
            let chain = editor.chain().focus().setTextSelection({ from, to })

            // Reaplicar todas as marcações que estavam ativas
            if (marks.bold) chain = chain.setBold()
            if (marks.italic) chain = chain.setItalic()
            if (marks.underline) chain = chain.setUnderline()
            if (marks.strike) chain = chain.setStrike()
            if (marks.code) chain = chain.setCode()
            if (marks.link && marks.link.href) chain = chain.setLink({ href: marks.link.href })
            if (marks.fontFamily) chain = chain.setFontFamily(marks.fontFamily)
            if (marks.fontSize) chain = chain.setMark("textStyle", { fontSize: marks.fontSize })

            // Executar a cadeia de comandos
            chain.run()
          } catch (error) {
            console.error("Erro ao reaplicar marcações após definir cor:", error)
          }
        }, 10)
      } catch (error) {
        console.error("Erro ao aplicar cor:", error)
      }
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
