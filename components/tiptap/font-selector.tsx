"use client"

import type { Editor } from "@tiptap/react"
import { Check, ChevronDown, Type } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"

const fonts = [
  { name: "Arial", value: "Arial" },
  { name: "Times New Roman", value: "Times New Roman" },
  { name: "Courier New", value: "Courier New" },
  { name: "Georgia", value: "Georgia" },
  { name: "Verdana", value: "Verdana" },
  { name: "Helvetica", value: "Helvetica" },
]

type Props = {
  editor: Editor
}

export function FontSelector({ editor }: Props) {
  const [activeFont, setActiveFont] = useState<string | null>(null)

  // Atualizar a fonte ativa quando a seleção mudar
  useEffect(() => {
    if (!editor) return

    const updateActiveFont = () => {
      try {
        const attrs = editor.getAttributes("textStyle")
        setActiveFont(attrs.fontFamily || null)
      } catch (error) {
        console.error("Error getting active font:", error)
        setActiveFont(null)
      }
    }

    // Atualizar imediatamente
    updateActiveFont()

    // Adicionar event listeners para atualizar quando a seleção mudar
    editor.on("selectionUpdate", updateActiveFont)
    editor.on("transaction", updateActiveFont)

    return () => {
      editor.off("selectionUpdate", updateActiveFont)
      editor.off("transaction", updateActiveFont)
    }
  }, [editor])

  // Encontrar o item de fonte ativa
  const activeFontItem = fonts.find(({ value }) => value === activeFont)

  // Nova implementação para aplicar fonte preservando formatações
  const applyFont = useCallback(
    (fontFamily: string) => {
      if (!editor || !editor.isEditable) return

      try {
        // Capturar a seleção atual
        const { from, to } = editor.state.selection

        // Verificar se há texto selecionado
        if (from !== to) {
          // Capturar os estados de formatação atuais
          const isBold = editor.isActive("bold")
          const isItalic = editor.isActive("italic")
          const isUnderline = editor.isActive("underline")
          const isStrike = editor.isActive("strike")
          const isCode = editor.isActive("code")

          // Capturar outros atributos de estilo
          const attrs = editor.getAttributes("textStyle")
          const color = attrs.color
          const fontSize = attrs.fontSize

          // Aplicar a fonte primeiro
          editor.chain().focus().setFontFamily(fontFamily).run()

          // Reaplicar as formatações em uma nova transação
          let chain = editor.chain().focus().setTextSelection({ from, to })

          // Reaplicar formatações
          if (isBold) chain = chain.setBold()
          if (isItalic) chain = chain.setItalic()
          if (isUnderline) chain = chain.setUnderline()
          if (isStrike) chain = chain.setStrike()
          if (isCode) chain = chain.setCode()

          // Reaplicar outros estilos
          if (color) chain = chain.setColor(color)
          if (fontSize) chain = chain.setMark("textStyle", { fontSize })

          // Executar a cadeia de comandos
          chain.run()
        } else {
          // Se não houver seleção, apenas aplicar a fonte normalmente
          editor.chain().focus().setFontFamily(fontFamily).run()
        }
      } catch (error) {
        console.error("Error setting font family:", error)
      }
    },
    [editor],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 gap-1 border-none text-foreground hover:bg-accent">
          <Type className="h-4 w-4" />
          <span className="line-clamp-1 max-w-16">{activeFontItem?.name || "Fonte"}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {fonts.map(({ name, value }) => (
          <DropdownMenuItem key={value} className="flex items-center justify-between" onSelect={() => applyFont(value)}>
            <span style={{ fontFamily: value }}>{name}</span>
            {activeFont === value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
