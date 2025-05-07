"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { Note } from "@/lib/types"
import EditorToolbar from "@/components/editor-toolbar"

interface NoteEditorProps {
  note: Note
  onChange: (note: Note) => void
}

export default function NoteEditor({ note, onChange }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const editorRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)
  const skipNextUpdate = useRef(false)

  // Inicializar o editor apenas uma vez quando o componente montar
  useEffect(() => {
    if (editorRef.current && isInitialMount.current) {
      editorRef.current.innerHTML = note.content || ""
      isInitialMount.current = false

      // Habilitar edição para o elemento
      if (editorRef.current) {
        editorRef.current.contentEditable = "true"
      }
    }
  }, [note.content])

  // Atualizar o título quando a nota mudar
  useEffect(() => {
    setTitle(note.title)
  }, [note.title])

  // Atualizar o conteúdo do editor apenas quando a nota mudar e não for devido a uma edição local
  useEffect(() => {
    if (!isInitialMount.current && !skipNextUpdate.current && editorRef.current) {
      // Salvar a seleção atual
      const selection = window.getSelection()
      let range = null
      let selectionStart = 0
      let selectionEnd = 0

      if (selection && selection.rangeCount > 0) {
        range = selection.getRangeAt(0)
        selectionStart = range.startOffset
        selectionEnd = range.endOffset
      }

      // Atualizar o conteúdo apenas se for diferente
      if (editorRef.current.innerHTML !== note.content) {
        editorRef.current.innerHTML = note.content || ""
      }

      // Restaurar a seleção se possível
      if (range && selection) {
        try {
          selection.removeAllRanges()
          selection.addRange(range)
        } catch (e) {
          console.warn("Não foi possível restaurar a seleção:", e)
        }
      }
    }

    skipNextUpdate.current = false
  }, [note.content])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    onChange({ ...note, title: newTitle })
  }

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML

      // Evitar atualizações circulares
      if (newContent !== note.content) {
        skipNextUpdate.current = true
        onChange({ ...note, content: newContent })
      }
    }
  }

  // Função para garantir que o editor mantenha o foco após clicar em um botão
  const ensureEditorFocus = () => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1a2235]">
      <EditorToolbar editorRef={editorRef} onContentChange={handleContentChange} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-4">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="text-2xl font-bold bg-transparent border-none outline-none text-white w-full"
            placeholder="Título da nota"
          />
        </div>

        <div
          ref={editorRef}
          className="flex-1 p-4 overflow-y-auto text-white focus:outline-none"
          onInput={handleContentChange}
          onBlur={handleContentChange}
          onFocus={ensureEditorFocus}
          suppressContentEditableWarning={true}
          dir="ltr" // Forçar direção da esquerda para a direita
          spellCheck="false" // Desativar verificação ortográfica para evitar problemas
        />
      </div>
    </div>
  )
}
