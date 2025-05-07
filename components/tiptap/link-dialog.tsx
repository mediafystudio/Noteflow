"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { Editor } from "@tiptap/react"

interface LinkDialogProps {
  editor: Editor | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LinkDialog({ editor, open, onOpenChange }: LinkDialogProps) {
  const [url, setUrl] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Focar no input quando o diálogo abrir
  useEffect(() => {
    if (open && inputRef.current) {
      // Obter a URL atual se já existir um link
      if (editor?.isActive("link")) {
        const attrs = editor.getAttributes("link")
        setUrl(attrs.href || "")
      } else {
        setUrl("")
      }

      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open, editor])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!editor) return

    if (url === "") {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().setLink({ href: url }).run()
    }

    onOpenChange(false)
  }

  const handleRemove = () => {
    if (!editor) return

    editor.chain().focus().unsetLink().run()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inserir link</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 py-4">
            <Input
              ref={inputRef}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://exemplo.com"
              className="w-full"
            />
          </div>
          <DialogFooter>
            {editor?.isActive("link") && (
              <Button type="button" variant="outline" onClick={handleRemove} className="mr-auto">
                Remover
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
