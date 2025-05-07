"use client"

import type { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo,
  Redo,
  Type,
  Palette,
} from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TiptapToolbarProps {
  editor: Editor | null
}

const fontFamilies = [
  { label: "Arial", value: "Arial" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Courier New", value: "Courier New" },
  { label: "Georgia", value: "Georgia" },
  { label: "Verdana", value: "Verdana" },
  { label: "Helvetica", value: "Helvetica" },
]

const fontSizes = [
  { label: "Pequeno", value: "12px" },
  { label: "Normal", value: "16px" },
  { label: "Médio", value: "20px" },
  { label: "Grande", value: "24px" },
  { label: "Muito Grande", value: "32px" },
]

const colors = [
  { label: "Branco", value: "#ffffff" },
  { label: "Vermelho", value: "#f87171" },
  { label: "Laranja", value: "#fb923c" },
  { label: "Amarelo", value: "#facc15" },
  { label: "Verde", value: "#4ade80" },
  { label: "Azul", value: "#60a5fa" },
  { label: "Roxo", value: "#a78bfa" },
  { label: "Rosa", value: "#f472b6" },
]

export default function TiptapToolbar({ editor }: TiptapToolbarProps) {
  if (!editor) {
    return null
  }

  return (
    <div className="border-b border-border p-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center mr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="text-foreground hover:bg-accent"
            title="Desfazer"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="text-foreground hover:bg-accent"
            title="Refazer"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <Select onValueChange={(value) => editor.chain().focus().setFontFamily(value).run()} defaultValue="Arial">
          <SelectTrigger className="w-28 bg-[#2a3548] border-[#3a4559] text-foreground">
            <SelectValue placeholder="Fonte" />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => {
            editor.chain().focus().setFontSize(value).run()
          }}
          defaultValue="16px"
        >
          <SelectTrigger className="w-28 bg-[#2a3548] border-[#3a4559] text-foreground">
            <SelectValue placeholder="Tamanho" />
          </SelectTrigger>
          <SelectContent>
            {fontSizes.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center border-l border-[#3a4559] pl-2">
          <Toggle
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            variant="ghost"
            size="sm"
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive("bold") && "bg-accent/50",
            )}
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            variant="ghost"
            size="sm"
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive("italic") && "bg-accent/50",
            )}
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={editor.isActive("underline")}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            variant="ghost"
            size="sm"
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive("underline") && "bg-accent/50",
            )}
          >
            <Underline className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="flex items-center border-l border-[#3a4559] pl-2">
          <Toggle
            pressed={editor.isActive("bulletList")}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            variant="ghost"
            size="sm"
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive("bulletList") && "bg-accent/50",
            )}
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={editor.isActive("orderedList")}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            variant="ghost"
            size="sm"
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive("orderedList") && "bg-accent/50",
            )}
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="flex items-center border-l border-[#3a4559] pl-2">
          <Toggle
            pressed={editor.isActive({ textAlign: "left" })}
            onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
            variant="ghost"
            size="sm"
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive({ textAlign: "left" }) && "bg-accent/50",
            )}
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={editor.isActive({ textAlign: "center" })}
            onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
            variant="ghost"
            size="sm"
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive({ textAlign: "center" }) && "bg-accent/50",
            )}
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={editor.isActive({ textAlign: "right" })}
            onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
            variant="ghost"
            size="sm"
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive({ textAlign: "right" }) && "bg-accent/50",
            )}
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={editor.isActive({ textAlign: "justify" })}
            onPressedChange={() => editor.chain().focus().setTextAlign("justify").run()}
            variant="ghost"
            size="sm"
            className={cn(
              "text-foreground hover:bg-accent data-[state=on]:bg-accent/50",
              editor.isActive({ textAlign: "justify" }) && "bg-accent/50",
            )}
          >
            <AlignJustify className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="flex items-center border-l border-[#3a4559] pl-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent">
                <Type className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Estilos de Texto</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className={cn(editor.isActive("heading", { level: 1 }) && "bg-muted")}
                      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    >
                      Título 1
                    </Button>
                    <Button
                      variant="outline"
                      className={cn(editor.isActive("heading", { level: 2 }) && "bg-muted")}
                      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    >
                      Título 2
                    </Button>
                    <Button
                      variant="outline"
                      className={cn(editor.isActive("heading", { level: 3 }) && "bg-muted")}
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    >
                      Título 3
                    </Button>
                    <Button
                      variant="outline"
                      className={cn(editor.isActive("paragraph") && "bg-muted")}
                      onClick={() => editor.chain().focus().setParagraph().run()}
                    >
                      Parágrafo
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Cores</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <Button
                        key={color.value}
                        variant="outline"
                        className="w-8 h-8 p-0"
                        style={{ backgroundColor: color.value }}
                        onClick={() => editor.chain().focus().setColor(color.value).run()}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
