"use client"

import type React from "react"

import { useState } from "react"
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

interface SidebarProps {
  notes: Note[]
  activeNoteId: string | null
  onSelectNote: (id: string) => void
  onDeleteNote: (id: string) => void
}

export default function Sidebar({ notes, activeNoteId, onSelectNote, onDeleteNote }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)

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
    <div className="w-64 border-r flex flex-col">
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
              <li
                key={note.id}
                className={`rounded p-2 cursor-pointer transition-colors ${
                  activeNoteId === note.id ? "bg-muted active-note-border" : "hover:bg-muted/50"
                }`}
                onClick={() => onSelectNote(note.id)}
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
