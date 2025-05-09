"use client"

import type React from "react"

// Modificar a importação do React para incluir useRef
import { useState, useRef } from "react"
import type { Note } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { htmlToPlainText } from "@/lib/utils"

// Atualizar a interface SidebarProps para incluir a nova prop onDoubleClickNote
interface SidebarProps {
  notes: Note[]
  activeNoteId: string | null
  onSelectNote: (id: string) => void
  onDeleteNote: (id: string) => void
  className?: string
  onDoubleClickNote?: (id: string) => void
}

// Atualizar a desestruturação de props para incluir onDoubleClickNote
export default function Sidebar({
  notes,
  activeNoteId,
  onSelectNote,
  onDeleteNote,
  className,
  onDoubleClickNote,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  // Adicionar um novo estado para rastrear qual nota está sendo tocada
  const [touchedNoteId, setTouchedNoteId] = useState<string | null>(null)

  // Adicionar estas variáveis no início da função Sidebar, logo após a declaração dos estados
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTouchTimeRef = useRef<number>(0)
  const lastTouchIdRef = useRef<string | null>(null)
  const DOUBLE_TAP_DELAY = 300 // milissegundos para considerar um duplo toque

  const filteredNotes = notes.filter((note) => {
    const searchTermLower = searchTerm.toLowerCase()
    const titleMatch = note.title.toLowerCase().includes(searchTermLower)
    const contentMatch = htmlToPlainText(note.content).toLowerCase().includes(searchTermLower)
    return titleMatch || contentMatch
  })

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNoteToDelete(id)
  }

  const confirmDelete = () => {
    if (noteToDelete) {
      onDeleteNote(noteToDelete)
      setNoteToDelete(null)
    }
  }

  return (
    <div className={`w-64 border-r flex flex-col ${className}`}>
      <div className="p-3">
        <input
          type="text"
          placeholder="Pesquisar notas..."
          className="w-full p-2 rounded bg-muted text-foreground border-none focus:outline-none focus:ring-1 focus:ring-ring"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length > 0 ? (
          <ul className="space-y-1 p-2">
            {filteredNotes.map((note) => (
              // Adicionar o manipulador de duplo clique ao elemento li
              // Substituir o elemento li existente com o seguinte:
              <li
                key={note.id}
                className={`rounded p-2 cursor-pointer transition-colors ${
                  activeNoteId === note.id ? "bg-muted active-note-border" : "hover:bg-muted/50"
                } ${touchedNoteId === note.id ? "touch-active" : ""}`}
                onClick={() => onSelectNote(note.id)}
                onTouchStart={(e) => {
                  // Adicionar efeito visual
                  setTouchedNoteId(note.id)

                  const now = Date.now()
                  const timeSinceLastTouch = now - lastTouchTimeRef.current

                  // Se o último toque foi na mesma nota e dentro do intervalo de tempo
                  if (lastTouchIdRef.current === note.id && timeSinceLastTouch < DOUBLE_TAP_DELAY) {
                    // É um duplo toque
                    if (touchTimeoutRef.current) {
                      clearTimeout(touchTimeoutRef.current)
                      touchTimeoutRef.current = null
                    }

                    // Resetar referências
                    lastTouchTimeRef.current = 0
                    lastTouchIdRef.current = null

                    // Executar ação de duplo toque
                    if (onDoubleClickNote) {
                      onDoubleClickNote(note.id)
                    }
                  } else {
                    // É o primeiro toque
                    // Limpar qualquer timeout anterior
                    if (touchTimeoutRef.current) {
                      clearTimeout(touchTimeoutRef.current)
                    }

                    // Configurar um novo timeout para toque simples
                    touchTimeoutRef.current = setTimeout(() => {
                      // Se chegamos aqui, foi apenas um toque simples
                      onSelectNote(note.id)
                      touchTimeoutRef.current = null
                    }, DOUBLE_TAP_DELAY)

                    // Armazenar informações do toque atual
                    lastTouchTimeRef.current = now
                    lastTouchIdRef.current = note.id
                  }
                }}
                onTouchEnd={() => {
                  // Remover efeito visual após um curto período
                  setTimeout(() => {
                    setTouchedNoteId(null)
                  }, 150)
                }}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate">{note.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(note.updatedAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-transparent"
                    onClick={(e) => handleDeleteClick(note.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {htmlToPlainText(note.content).substring(0, 50)}
                </p>
                <p className="text-xs text-muted-foreground mt-1 opacity-60 hidden md:block">
                  Clique duplo para editar
                </p>
                <p className="text-xs text-muted-foreground mt-1 opacity-60 md:hidden">Toque duplo para editar</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground text-sm">Nenhuma nota encontrada</p>
          </div>
        )}
      </div>

      <AlertDialog open={!!noteToDelete} onOpenChange={() => setNoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir nota</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-white dark:text-white !important"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
