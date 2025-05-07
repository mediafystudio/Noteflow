"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { List, ListOrdered } from "lucide-react"

interface ListButtonProps {
  editorRef: React.RefObject<HTMLDivElement>
  onContentChange: () => void
  type: "bullet" | "numbered"
}

export default function ListButton({ editorRef, onContentChange, type }: ListButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevenir perda de foco

    if (!editorRef.current) return

    // Garantir que o editor está focado
    editorRef.current.focus()

    // Implementação direta para criar listas
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)

    // Determinar o tipo de lista
    const listTag = type === "bullet" ? "ul" : "ol"

    // Criar os elementos da lista
    const list = document.createElement(listTag)
    const listItem = document.createElement("li")

    // Se não houver texto selecionado, criar um item vazio
    if (range.collapsed) {
      listItem.innerHTML = "<br>"
      list.appendChild(listItem)

      // Limpar o conteúdo atual e inserir a lista
      range.deleteContents()
      range.insertNode(list)
    } else {
      // Se houver texto selecionado, colocá-lo em um item de lista
      listItem.appendChild(range.extractContents())
      list.appendChild(listItem)

      // Inserir a lista no lugar da seleção
      range.insertNode(list)
    }

    // Mover o cursor para dentro do item da lista
    const newRange = document.createRange()
    newRange.selectNodeContents(listItem)
    newRange.collapse(false) // Colocar o cursor no final

    selection.removeAllRanges()
    selection.addRange(newRange)

    // Notificar a mudança
    onContentChange()
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onMouseDown={handleClick}
      className="text-white hover:bg-[#2a3548]"
      title={type === "bullet" ? "Lista com marcadores" : "Lista numerada"}
    >
      {type === "bullet" ? <List className="h-4 w-4" /> : <ListOrdered className="h-4 w-4" />}
    </Button>
  )
}
