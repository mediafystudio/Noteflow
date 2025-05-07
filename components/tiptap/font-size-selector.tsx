"use client"

import type { Editor } from "@tiptap/react"
import { Check, ChevronDown } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"

const fontSizes = [
  { name: "Pequeno", value: "12px" },
  { name: "Normal", value: "16px" },
  { name: "Médio", value: "20px" },
  { name: "Grande", value: "24px" },
  { name: "Muito Grande", value: "32px" },
]

type Props = {
  editor: Editor
}

export function FontSizeSelector({ editor }: Props) {
  const [activeFontSize, setActiveFontSize] = useState<string | null>(null)

  // Atualizar o tamanho de fonte ativo quando a seleção mudar
  useEffect(() => {
    if (!editor) return

    const updateActiveFontSize = () => {
      try {
        const attrs = editor.getAttributes("textStyle")
        setActiveFontSize(attrs.fontSize || null)
      } catch (error) {
        console.error("Error getting active font size:", error)
        setActiveFontSize(null)
      }
    }

    // Atualizar imediatamente
    updateActiveFontSize()

    // Adicionar event listeners para atualizar quando a seleção mudar
    editor.on("selectionUpdate", updateActiveFontSize)
    editor.on("transaction", updateActiveFontSize)

    return () => {
      editor.off("selectionUpdate", updateActiveFontSize)
      editor.off("transaction", updateActiveFontSize)
    }
  }, [editor])

  // Encontrar o item de tamanho de fonte ativo
  const activeFontSizeItem = fontSizes.find(({ value }) => value === activeFontSize)

  // Nova implementação para aplicar tamanho de fonte preservando formatações
  const applyFontSize = useCallback(
    (fontSize: string) => {
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
          const fontFamily = attrs.fontFamily

          // Aplicar o tamanho de fonte primeiro
          editor.chain().focus().setMark("textStyle", { fontSize }).run()

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
          if (fontFamily) chain = chain.setFontFamily(fontFamily)

          // Executar a cadeia de comandos
          chain.run()
        } else {
          // Se não houver seleção, apenas aplicar o tamanho de fonte normalmente
          editor.chain().focus().setMark("textStyle", { fontSize }).run()
        }
      } catch (error) {
        console.error("Error setting font size:", error)
      }
    },
    [editor],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 gap-1 border-none text-foreground hover:bg-accent">
          <span className="text-xs">{activeFontSizeItem?.name || "Tamanho"}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {fontSizes.map(({ name, value }) => (
          <DropdownMenuItem
            key={value}
            className="flex items-center justify-between"
            onSelect={() => applyFontSize(value)}
          >
            <span>{name}</span>
            {activeFontSize === value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
