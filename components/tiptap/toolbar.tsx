"use client"

import type { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Quote,
  Link,
  Unlink,
  ArrowDownAZ,
  ArrowDownZA,
  Search,
} from "lucide-react"

import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { SearchDialog } from "./search-dialog"
import { LinkDialog } from "./link-dialog"
import { createIntentionalToggleCommand } from "./extensions/custom-color"

type Props = {
  editor: Editor | null
}

export function Toolbar({ editor }: Props) {
  const { toast } = useToast()
  const [isSorting, setIsSorting] = useState(false)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)

  // Função segura para executar comandos do editor
  const safeExecuteCommand = useCallback(
    (callback: () => void) => {
      if (!editor || !editor.isEditable) return

      try {
        // Verificar se o editor está em um estado válido
        if (editor.view && editor.view.docView && editor.state) {
          // Envolver em um try-catch para lidar com erros durante a execução do comando
          try {
            callback()
          } catch (error) {
            console.error("Erro ao executar comando do editor:", error)
          }
        }
      } catch (error) {
        console.error("Editor está em um estado inválido:", error)
      }
    },
    [editor],
  )

  // Função para aplicar formatação
  const applyFormatting = useCallback(
    (format: "bold" | "italic" | "underline" | "strike" | "code" | "blockquote") => {
      if (!editor || !editor.isEditable) return

      try {
        // Usar o comando intencional para aplicar/remover formatação
        const toggleCommand = createIntentionalToggleCommand(editor, format)
        toggleCommand()
      } catch (error) {
        console.error(`Erro ao aplicar formatação ${format}:`, error)
      }
    },
    [editor],
  )

  // Nova implementação de ordenação diretamente no componente
  const sortParagraphs = useCallback(
    (direction: "asc" | "desc") => {
      if (!editor || isSorting) return
      setIsSorting(true)

      try {
        // 1. Obter o conteúdo como HTML
        const content = editor.getHTML()

        // 2. Dividir o conteúdo em parágrafos
        const paragraphRegex = /<p(?:\s+[^>]*)?>([\s\S]*?)<\/p>/g
        const paragraphs: string[] = []
        let match

        while ((match = paragraphRegex.exec(content)) !== null) {
          paragraphs.push(match[0])
        }

        // Se não houver parágrafos suficientes, retornar
        if (paragraphs.length <= 1) {
          toast({
            title: "Não foi possível ordenar",
            description: "É necessário ter pelo menos dois parágrafos para ordenar.",
          })
          setIsSorting(false)
          return
        }

        // 3. Extrair o texto puro de cada parágrafo para ordenação
        const paragraphsWithText = paragraphs.map((p) => {
          // Remover as tags HTML para obter apenas o texto para ordenação
          const textOnly = p.replace(/<[^>]*>/g, "")
          return { html: p, text: textOnly }
        })

        // 4. Ordenar os parágrafos pelo texto
        if (direction === "asc") {
          paragraphsWithText.sort((a, b) => a.text.localeCompare(b.text))
        } else {
          paragraphsWithText.sort((a, b) => b.text.localeCompare(a.text))
        }

        // 5. Reconstruir o HTML com os parágrafos ordenados
        const sortedHTML = paragraphsWithText.map((p) => p.html).join("")

        // 6. Substituir apenas os parágrafos no conteúdo original
        // Encontrar onde começam e terminam os parágrafos no conteúdo original
        const firstParagraphIndex = content.indexOf(paragraphs[0])
        const lastParagraphIndex =
          content.indexOf(paragraphs[paragraphs.length - 1]) + paragraphs[paragraphs.length - 1].length

        // Manter o conteúdo antes e depois dos parágrafos
        const beforeParagraphs = content.substring(0, firstParagraphIndex)
        const afterParagraphs = content.substring(lastParagraphIndex)

        // Montar o novo conteúdo
        const newContent = beforeParagraphs + sortedHTML + afterParagraphs

        // 7. Definir o novo conteúdo
        editor.commands.setContent(newContent)

        // 8. Mostrar notificação de sucesso
        toast({
          title: "Parágrafos ordenados",
          description: direction === "asc" ? "Ordenados de A a Z com sucesso." : "Ordenados de Z a A com sucesso.",
        })
      } catch (error) {
        console.error("Erro ao ordenar parágrafos:", error)
        // Não mostrar toast de erro para evitar confusão
      } finally {
        setIsSorting(false)
      }
    },
    [editor, isSorting, toast],
  )

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="p-1 flex flex-wrap gap-1">
        <div className="flex items-center">
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => applyFormatting("bold")}
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive("bold") && "bg-accent/50",
            )}
            aria-label="Bold"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => applyFormatting("italic")}
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive("italic") && "bg-accent/50",
            )}
            aria-label="Italic"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("underline")}
            onPressedChange={() => applyFormatting("underline")}
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive("underline") && "bg-accent/50",
            )}
            aria-label="Underline"
          >
            <Underline className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("strike")}
            onPressedChange={() => applyFormatting("strike")}
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive("strike") && "bg-accent/50",
            )}
            aria-label="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("code")}
            onPressedChange={() => applyFormatting("code")}
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive("code") && "bg-accent/50",
            )}
            aria-label="Code"
          >
            <Code className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-8 bg-border" />

        <div className="flex items-center">
          <Toggle
            size="sm"
            pressed={editor.isActive("blockquote")}
            onPressedChange={() => applyFormatting("blockquote")}
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive("blockquote") && "bg-accent/50",
            )}
            aria-label="Quote"
          >
            <Quote className="h-4 w-4" />
          </Toggle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => sortParagraphs("asc")}
            className="text-foreground hover:bg-accent"
            title="Ordenar A-Z"
            disabled={isSorting}
          >
            <ArrowDownAZ className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => sortParagraphs("desc")}
            className="text-foreground hover:bg-accent"
            title="Ordenar Z-A"
            disabled={isSorting}
          >
            <ArrowDownZA className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSearchDialogOpen(true)}
            className="text-foreground hover:bg-accent"
            title="Pesquisar no documento"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8 bg-border" />

        <div className="flex items-center">
          <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() => safeExecuteCommand(() => editor.chain().focus().toggleBulletList().run())}
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive("bulletList") && "bg-accent/50",
            )}
            aria-label="Bullet List"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() => safeExecuteCommand(() => editor.chain().focus().toggleOrderedList().run())}
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive("orderedList") && "bg-accent/50",
            )}
            aria-label="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-8 bg-border" />

        <div className="flex items-center">
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "left" })}
            onPressedChange={() => safeExecuteCommand(() => editor.chain().focus().setTextAlign("left").run())}
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive({ textAlign: "left" }) && "bg-accent/50",
            )}
            aria-label="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "center" })}
            onPressedChange={() => safeExecuteCommand(() => editor.chain().focus().setTextAlign("center").run())}
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive({ textAlign: "center" }) && "bg-accent/50",
            )}
            aria-label="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "right" })}
            onPressedChange={() => safeExecuteCommand(() => editor.chain().focus().setTextAlign("right").run())}
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive({ textAlign: "right" }) && "bg-accent/50",
            )}
            aria-label="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "justify" })}
            onPressedChange={() => safeExecuteCommand(() => editor.chain().focus().setTextAlign("justify").run())}
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive({ textAlign: "justify" }) && "bg-accent/50",
            )}
            aria-label="Align Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-8 bg-border" />

        <div className="flex items-center">
          <Toggle
            size="sm"
            pressed={editor.isActive("link")}
            onPressedChange={() => setLinkDialogOpen(true)}
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive("link") && "bg-accent/50",
            )}
            aria-label="Link"
          >
            {editor.isActive("link") ? <Unlink className="h-4 w-4" /> : <Link className="h-4 w-4" />}
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-8 bg-border" />

        <div className="flex items-center">
          <Toggle
            size="sm"
            onPressedChange={() => safeExecuteCommand(() => editor.chain().focus().undo().run())}
            disabled={!editor.can().undo()}
            className="text-foreground hover:bg-accent data-[state=on]:bg-accent/50"
            aria-label="Undo"
          >
            <Undo className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            onPressedChange={() => safeExecuteCommand(() => editor.chain().focus().redo().run())}
            disabled={!editor.can().redo()}
            className="text-foreground hover:bg-accent data-[state=on]:bg-accent/50"
            aria-label="Redo"
          >
            <Redo className="h-4 w-4" />
          </Toggle>
        </div>
      </div>

      <SearchDialog editor={editor} open={searchDialogOpen} onOpenChange={setSearchDialogOpen} />

      <LinkDialog editor={editor} open={linkDialogOpen} onOpenChange={setLinkDialogOpen} />
    </>
  )
}
