"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Palette,
  Undo,
  Redo,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatCommands } from "@/lib/editor-commands"

interface EditorToolbarProps {
  editorRef: React.RefObject<HTMLDivElement>
  onContentChange: () => void
}

const fontFamilies = ["Arial", "Times New Roman", "Courier New", "Georgia", "Verdana", "Helvetica"]
const fontSizes = ["10px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"]
const colors = [
  "#ffffff", // white
  "#f87171", // red
  "#fb923c", // orange
  "#facc15", // yellow
  "#4ade80", // green
  "#60a5fa", // blue
  "#a78bfa", // purple
  "#f472b6", // pink
]

export default function EditorToolbar({ editorRef, onContentChange }: EditorToolbarProps) {
  const handleCommand = (command: (element: HTMLElement) => boolean) => {
    if (editorRef.current) {
      command(editorRef.current)
      onContentChange()

      // Garantir que o editor mantenha o foco após o comando
      setTimeout(() => {
        editorRef.current?.focus()
      }, 0)
    }
  }

  const handleMouseDown = (e: React.MouseEvent, command: (element: HTMLElement) => boolean) => {
    e.preventDefault() // Prevenir perda de foco
    handleCommand(command)
  }

  const handleFontFamilyChange = (value: string) => {
    if (editorRef.current) {
      formatCommands.fontName(editorRef.current, value)
      onContentChange()

      // Garantir que o editor mantenha o foco após o comando
      setTimeout(() => {
        editorRef.current?.focus()
      }, 0)
    }
  }

  const handleFontSizeChange = (value: string) => {
    if (editorRef.current) {
      // Converter px para o valor esperado pelo execCommand
      const sizeIndex = fontSizes.indexOf(value)
      if (sizeIndex !== -1) {
        formatCommands.fontSize(editorRef.current, (sizeIndex + 1).toString())
        onContentChange()

        // Garantir que o editor mantenha o foco após o comando
        setTimeout(() => {
          editorRef.current?.focus()
        }, 0)
      }
    }
  }

  const handleColorChange = (color: string) => {
    if (editorRef.current) {
      formatCommands.foreColor(editorRef.current, color)
      onContentChange()

      // Garantir que o editor mantenha o foco após o comando
      setTimeout(() => {
        editorRef.current?.focus()
      }, 0)
    }
  }

  return (
    <div className="border-b border-border p-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center mr-2">
          <Button
            variant="ghost"
            size="icon"
            onMouseDown={(e) => handleMouseDown(e, formatCommands.undo)}
            className="text-foreground hover:bg-accent"
            title="Desfazer"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onMouseDown={(e) => handleMouseDown(e, formatCommands.redo)}
            className="text-foreground hover:bg-accent"
            title="Refazer"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <Select onValueChange={handleFontFamilyChange} defaultValue="Arial">
          <SelectTrigger className="w-28 bg-background border-border text-foreground">
            <SelectValue placeholder="Arial" />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={handleFontSizeChange} defaultValue="14px">
          <SelectTrigger className="w-20 bg-background border-border text-foreground">
            <SelectValue placeholder="14px" />
          </SelectTrigger>
          <SelectContent>
            {fontSizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center border-l border-border pl-2">
          <Button
            variant="ghost"
            size="icon"
            onMouseDown={(e) => handleMouseDown(e, formatCommands.bold)}
            className="text-foreground hover:bg-accent"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onMouseDown={(e) => handleMouseDown(e, formatCommands.italic)}
            className="text-foreground hover:bg-accent"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onMouseDown={(e) => handleMouseDown(e, formatCommands.underline)}
            className="text-foreground hover:bg-accent"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center border-l border-border pl-2">
          <Button
            variant="ghost"
            size="icon"
            onMouseDown={(e) => handleMouseDown(e, formatCommands.alignLeft)}
            className="text-foreground hover:bg-accent"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onMouseDown={(e) => handleMouseDown(e, formatCommands.alignCenter)}
            className="text-foreground hover:bg-accent"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onMouseDown={(e) => handleMouseDown(e, formatCommands.alignRight)}
            className="text-foreground hover:bg-accent"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onMouseDown={(e) => handleMouseDown(e, formatCommands.alignJustify)}
            className="text-foreground hover:bg-accent"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center border-l border-border pl-2">
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
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleCommand((el) => formatCommands.heading(el, 1))
                      }}
                    >
                      Título 1
                    </Button>
                    <Button
                      variant="outline"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleCommand((el) => formatCommands.heading(el, 2))
                      }}
                    >
                      Título 2
                    </Button>
                    <Button
                      variant="outline"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleCommand((el) => formatCommands.heading(el, 3))
                      }}
                    >
                      Título 3
                    </Button>
                    <Button
                      variant="outline"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleCommand((el) => formatCommands.paragraph(el))
                      }}
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
                        key={color}
                        variant="outline"
                        className="w-8 h-8 p-0"
                        style={{ backgroundColor: color }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleColorChange(color)
                        }}
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
