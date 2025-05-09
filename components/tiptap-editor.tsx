"use client"

import type React from "react"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import TextStyle from "@tiptap/extension-text-style"
import FontFamily from "@tiptap/extension-font-family"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import { Extension } from "@tiptap/core"
import { useEffect, useState, useCallback, useRef } from "react"
import { useTheme } from "next-themes"
import { useMobile } from "@/hooks/use-mobile"
import type { Note } from "@/lib/types"
import { Toolbar } from "./tiptap/toolbar"
import { TiptapBubbleMenu } from "./tiptap/bubble-menu"
import { FontSelector } from "./tiptap/font-selector"
import { FontSizeSelector } from "./tiptap/font-size-selector"
import { CustomColorSelector } from "./tiptap/custom-color-selector"
import { Separator } from "@/components/ui/separator"
import { SearchPlugin } from "./tiptap/extensions/search"
import { EditorFooter } from "./tiptap/editor-footer"
import { CustomColor } from "./tiptap/extensions/custom-color"

// Extensão personalizada para tamanho de fonte
const FontSize = Extension.create({
  name: "fontSize",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run()
        },
    }
  },
})

interface TiptapEditorProps {
  note: Note
  onChange: (note: Note) => void
}

export default function TiptapEditor({ note, onChange }: TiptapEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [isMounted, setIsMounted] = useState(false)
  const { resolvedTheme } = useTheme()
  const previousThemeRef = useRef(resolvedTheme)
  const processingThemeChangeRef = useRef(false)
  const isMobile = useMobile()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Comece a escrever...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      // Usar TextStyle para outras propriedades de estilo
      TextStyle,
      // Usar nossa extensão personalizada para cor
      CustomColor,
      FontFamily,
      Underline,
      FontSize,
      SearchPlugin.configure({
        searchResultClass: "search-result",
        currentSearchResultClass: "current-search-result",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
    ],
    content: note.content || "",
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none p-4 min-h-[200px]",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange({ ...note, content: html })
    },
  })

  // Atualizar o conteúdo do editor quando a nota mudar
  useEffect(() => {
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content || "")
    }
  }, [editor, note.id])

  // Atualizar o título quando a nota mudar
  useEffect(() => {
    setTitle(note.title)
  }, [note.title])

  // Garantir que o componente só seja renderizado no cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Função para processar o conteúdo HTML e substituir cores
  const processHtmlContent = useCallback((html: string, isDark: boolean): string => {
    if (!html) return html

    const whiteColor = "#ffffff"
    const blackColor = "#000000"

    let processedHtml = html

    if (isDark) {
      // No tema escuro, substituir preto por branco
      processedHtml = processedHtml.replace(/color: ?#000000/gi, "color: #ffffff")
      processedHtml = processedHtml.replace(/color: ?rgb$$0, ?0, ?0$$/gi, "color: #ffffff")
      processedHtml = processedHtml.replace(/color: ?black/gi, "color: #ffffff")
    } else {
      // No tema claro, substituir branco por preto
      processedHtml = processedHtml.replace(/color: ?#ffffff/gi, "color: #000000")
      processedHtml = processedHtml.replace(/color: ?rgb$$255, ?255, ?255$$/gi, "color: #000000")
      processedHtml = processedHtml.replace(/color: ?white/gi, "color: #000000")
    }

    return processedHtml
  }, [])

  // Efeito para processar o conteúdo quando o tema muda
  useEffect(() => {
    if (!isMounted || !editor || processingThemeChangeRef.current) return

    // Verificar se o tema realmente mudou
    if (previousThemeRef.current !== resolvedTheme) {
      processingThemeChangeRef.current = true

      try {
        // Obter o conteúdo atual
        const currentContent = editor.getHTML()

        // Processar o conteúdo para o novo tema
        const isDark = resolvedTheme === "dark"
        const processedContent = processHtmlContent(currentContent, isDark)

        // Se o conteúdo foi modificado, atualizar o editor
        if (processedContent !== currentContent) {
          // Atualizar o conteúdo sem tentar restaurar a seleção
          editor.commands.setContent(processedContent)

          // Focar no editor novamente, mas não tentar restaurar a seleção exata
          setTimeout(() => {
            try {
              // Apenas focar no editor e mover o cursor para o início
              editor.commands.focus("start")
            } catch (error) {
              console.error("Erro ao focar no editor após mudança de tema:", error)
            }
          }, 10)
        }
      } catch (error) {
        console.error("Erro ao processar conteúdo para o novo tema:", error)
      } finally {
        // Atualizar a referência do tema anterior
        previousThemeRef.current = resolvedTheme
        processingThemeChangeRef.current = false
      }
    }
  }, [resolvedTheme, editor, isMounted, processHtmlContent])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    onChange({ ...note, title: newTitle })
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex flex-col h-full w-full">
      {!isMobile && (
        <div className="border-b border-gray-200 dark:border-[#2a3548] p-1 flex items-center gap-2">
          {editor && (
            <>
              <FontSelector editor={editor} />
              <FontSizeSelector editor={editor} />
              <CustomColorSelector editor={editor} />
              <Separator orientation="vertical" className="h-8" />
            </>
          )}
          <Toolbar editor={editor} />
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-4">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="text-2xl font-bold bg-transparent border-none outline-none w-full"
            placeholder="Título da nota"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {editor && <TiptapBubbleMenu editor={editor} />}
          <EditorContent editor={editor} className="h-full" />
        </div>

        {editor && <EditorFooter editor={editor} />}
      </div>
    </div>
  )
}
