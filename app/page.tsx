"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import TiptapEditor from "@/components/tiptap-editor"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { WelcomePage } from "@/components/welcome-page"
import type { Note } from "@/lib/types"
import { exportToPdf, exportToTxt, exportToNote, importFromFile } from "@/lib/file-operations"
import { useMobile } from "@/hooks/use-mobile"

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Nota 01",
      content: "Exemplo de texto nota 01",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ])

  const [activeNoteId, setActiveNoteId] = useState<string | null>("1")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showWelcome, setShowWelcome] = useState(true)
  const { toast } = useToast()

  const isMobile = useMobile()

  // Carregar notas do localStorage ao iniciar
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem("noteflow-notes")
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes))
      }
    } catch (error) {
      console.error("Erro ao carregar notas:", error)
    }
  }, [])

  // Salvar notas no localStorage quando mudam
  useEffect(() => {
    try {
      localStorage.setItem("noteflow-notes", JSON.stringify(notes))
    } catch (error) {
      console.error("Erro ao salvar notas:", error)
    }
  }, [notes])

  const activeNote = notes.find((note) => note.id === activeNoteId) || notes[0]

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: `Nova Nota ${notes.length + 1}`,
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setNotes([...notes, newNote])
    setActiveNoteId(newNote.id)

    toast({
      title: "Nota criada",
      description: "Uma nova nota foi criada com sucesso.",
    })
  }

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(
      notes.map((note) =>
        note.id === updatedNote.id ? { ...updatedNote, updatedAt: new Date().toISOString() } : note,
      ),
    )
  }

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))

    if (activeNoteId === id) {
      setActiveNoteId(notes.length > 1 ? notes.filter((note) => note.id !== id)[0]?.id : null)
    }

    toast({
      title: "Nota excluída",
      description: "A nota foi excluída com sucesso.",
    })
  }

  const handleExportTxt = () => {
    if (!activeNote) return

    try {
      exportToTxt(activeNote)
      toast({
        title: "Nota exportada",
        description: "A nota foi exportada como arquivo .txt com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao exportar como TXT:", error)
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar a nota como TXT.",
        variant: "destructive",
      })
    }
  }

  const handleExportPdf = () => {
    if (!activeNote) return

    try {
      exportToPdf(activeNote)
      toast({
        title: "Nota exportada",
        description: "A nota foi exportada como arquivo .pdf com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao exportar como PDF:", error)
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar a nota como PDF.",
        variant: "destructive",
      })
    }
  }

  const handleExportNote = () => {
    if (!activeNote) return

    try {
      exportToNote(activeNote)
      toast({
        title: "Nota salva",
        description: "A nota foi salva como arquivo .note com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao exportar como NOTE:", error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a nota como NOTE.",
        variant: "destructive",
      })
    }
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const result = await importFromFile(file, notes)

      if (result.success) {
        if (result.action === "add") {
          setNotes([...notes, result.note])
          setActiveNoteId(result.note.id)
        } else if (result.action === "update") {
          setNotes(notes.map((note) => (note.id === result.note.id ? result.note : note)))
          setActiveNoteId(result.note.id)
        }

        toast({
          title: "Arquivo importado",
          description: `O arquivo ${file.name} foi importado com sucesso.`,
        })
      } else {
        toast({
          title: "Erro ao importar",
          description: result.error || "Erro desconhecido ao importar o arquivo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao importar arquivo:", error)
      toast({
        title: "Erro ao importar",
        description: "Ocorreu um erro ao tentar importar o arquivo.",
        variant: "destructive",
      })
    }

    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    event.target.value = ""
  }

  // Adicionar uma nova função para lidar com o duplo clique em uma nota
  const handleDoubleClickNote = (id: string) => {
    // Selecionar a nota
    setActiveNoteId(id)
    // Fechar a sidebar se estiver em um dispositivo móvel
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  // Se a página de boas-vindas estiver ativa, mostrar apenas ela
  if (showWelcome) {
    return <WelcomePage onComplete={() => setShowWelcome(false)} />
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        onCreateNote={handleCreateNote}
        onExportTxt={handleExportTxt}
        onExportPdf={handleExportPdf}
        onExportNote={handleExportNote}
        onImportFile={handleImportFile}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <Sidebar
            notes={notes}
            activeNoteId={activeNoteId}
            onSelectNote={setActiveNoteId}
            onDeleteNote={handleDeleteNote}
            className={isMobile ? "w-full absolute z-10 h-full bg-background" : "w-64"}
            onDoubleClickNote={handleDoubleClickNote}
          />
        )}

        <main className="flex-1 overflow-hidden">
          {activeNote ? (
            <TiptapEditor note={activeNote} onChange={handleUpdateNote} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Nenhuma nota selecionada</h2>
                <Button onClick={handleCreateNote}>Criar Nova Nota</Button>
              </div>
            </div>
          )}
        </main>
      </div>
      <Toaster position="bottom" />
    </div>
  )
}
