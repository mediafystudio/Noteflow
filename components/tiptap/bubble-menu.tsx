"use client"

import { BubbleMenu, type BubbleMenuProps, type Editor } from "@tiptap/react"
import { Bold, Italic, Underline, Strikethrough, Code, Quote, Link, Unlink } from "lucide-react"
import { useCallback, useState } from "react"

import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { CustomColorSelector } from "./custom-color-selector"
import { LinkDialog } from "./link-dialog"
import { createIntentionalToggleCommand } from "./extensions/custom-color"

type Props = BubbleMenuProps & {
  editor: Editor
}

export function TiptapBubbleMenu({ editor, ...props }: Props) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)

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

  return (
    <>
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100 }}
        className="flex overflow-hidden rounded border border-border bg-background shadow-md"
        {...props}
      >
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
        </div>

        <Separator orientation="vertical" className="h-8 bg-border" />

        <div className="flex items-center">
          <CustomColorSelector editor={editor} />
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
      </BubbleMenu>

      <LinkDialog editor={editor} open={linkDialogOpen} onOpenChange={setLinkDialogOpen} />
    </>
  )
}
