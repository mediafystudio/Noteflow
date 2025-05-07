"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, ArrowUp, ArrowDown, X, Replace, RotateCw } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import type { Editor } from "@tiptap/react"

interface SearchDialogProps {
  editor: Editor | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ editor, open, onOpenChange }: SearchDialogProps) {
  const [activeTab, setActiveTab] = useState<"search" | "replace">("search")
  const [searchText, setSearchText] = useState("")
  const [replaceText, setReplaceText] = useState("")
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [totalMatches, setTotalMatches] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Focar no input quando o diálogo abrir ou a aba mudar
  useEffect(() => {
    if (!open) return

    setTimeout(() => {
      if (activeTab === "search" && searchInputRef.current) {
        searchInputRef.current.focus()
      } else if (activeTab === "replace" && replaceInputRef.current) {
        replaceInputRef.current.focus()
      }
    }, 100)
  }, [open, activeTab])

  // Atualizar a pesquisa quando o texto ou as opções mudarem
  useEffect(() => {
    if (!editor || !open) return

    // Atualizar as opções de pesquisa usando os novos comandos
    editor.commands.setSearchTerm(searchText)
    editor.commands.toggleCaseSensitive(caseSensitive)

    // Contar o número de resultados
    setTimeout(() => {
      const results = document.querySelectorAll(".search-result")
      setTotalMatches(results.length)

      // Resetar o índice atual se não houver resultados
      if (results.length === 0) {
        setCurrentIndex(0)
      } else if (currentIndex >= results.length) {
        setCurrentIndex(results.length - 1)
      }

      // Atualizar o índice atual na extensão
      editor.commands.setCurrentSearchResult(currentIndex)
    }, 10)
  }, [searchText, caseSensitive, editor, open, currentIndex])

  // Navegar para o próximo resultado
  const nextMatch = () => {
    if (totalMatches === 0) return

    const newIndex = (currentIndex + 1) % totalMatches
    setCurrentIndex(newIndex)
  }

  // Navegar para o resultado anterior
  const prevMatch = () => {
    if (totalMatches === 0) return

    const newIndex = (currentIndex - 1 + totalMatches) % totalMatches
    setCurrentIndex(newIndex)
  }

  // Limpar a pesquisa
  const clearSearch = () => {
    setSearchText("")
    if (editor) {
      editor.commands.setSearchTerm("")
    }
  }

  // Substituir a ocorrência atual
  const replaceMatch = () => {
    if (!editor || totalMatches === 0 || !searchText) return

    setIsProcessing(true)

    try {
      // Obter todos os resultados de pesquisa
      const matches = findAllMatches(editor.state.doc, searchText, caseSensitive)

      if (matches.length === 0 || currentIndex >= matches.length) {
        setIsProcessing(false)
        return
      }

      // Obter a correspondência atual
      const match = matches[currentIndex]

      // Criar uma transação para substituir o texto
      const { from, to } = match
      const tr = editor.state.tr.insertText(replaceText, from, to)

      // Aplicar a transação
      editor.view.dispatch(tr)

      // Atualizar a pesquisa após a substituição
      setTimeout(() => {
        // Reativar a pesquisa para atualizar as decorações
        editor.commands.setSearchTerm("")
        editor.commands.setSearchTerm(searchText)

        // Atualizar contagem
        const newMatches = findAllMatches(editor.state.doc, searchText, caseSensitive)
        setTotalMatches(newMatches.length)

        // Ajustar o índice atual
        if (newMatches.length === 0) {
          setCurrentIndex(0)
        } else if (currentIndex >= newMatches.length) {
          setCurrentIndex(newMatches.length - 1)
        }

        setIsProcessing(false)
      }, 50)
    } catch (error) {
      console.error("Erro ao substituir:", error)
      setIsProcessing(false)
    }
  }

  // Substituir todas as ocorrências
  const replaceAllMatches = () => {
    if (!editor || !searchText || totalMatches === 0) return

    setIsProcessing(true)
    const initialCount = totalMatches

    try {
      // Abordagem alternativa: usar o HTML e substituir diretamente
      const content = editor.getHTML()
      const flags = caseSensitive ? "g" : "gi"
      const regex = new RegExp(escapeRegExp(searchText), flags)
      const newContent = content.replace(regex, replaceText)

      // Definir o novo conteúdo
      editor.commands.setContent(newContent)

      // Notificar o usuário
      toast({
        title: "Substituição concluída",
        description: `${initialCount} ocorrências substituídas.`,
      })

      // Limpar a pesquisa
      setSearchText("")
      editor.commands.setSearchTerm("")
      setTotalMatches(0)
      setCurrentIndex(0)
      setIsProcessing(false)
    } catch (error) {
      console.error("Erro ao substituir todas as ocorrências:", error)
      setIsProcessing(false)
    }
  }

  // Função auxiliar para escapar caracteres especiais em expressões regulares
  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }

  // Função para encontrar todas as correspondências no documento
  function findAllMatches(doc: any, searchTerm: string, caseSensitive: boolean) {
    const matches: { from: number; to: number; text: string }[] = []

    if (!searchTerm) {
      return matches
    }

    try {
      const regex = caseSensitive
        ? new RegExp(escapeRegExp(searchTerm), "g")
        : new RegExp(escapeRegExp(searchTerm), "gi")

      doc.descendants((node: any, pos: number) => {
        if (!node.isText) {
          return
        }

        const { text } = node
        let match
        regex.lastIndex = 0 // Resetar o índice da regex para evitar problemas

        while ((match = regex.exec(text))) {
          const from = pos + match.index
          const to = from + match[0].length

          matches.push({
            from,
            to,
            text: match[0],
          })
        }
      })
    } catch (error) {
      console.error("Erro ao encontrar correspondências:", error)
    }

    return matches
  }

  // Limpar a pesquisa ao fechar o diálogo
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && editor) {
      editor.commands.setSearchTerm("")
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pesquisar e Substituir</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "search" | "replace")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Pesquisar</TabsTrigger>
            <TabsTrigger value="replace">Substituir</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Pesquisar..."
                  className="pl-8 pr-8"
                />
                {searchText && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-2 py-0"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Toggle
                pressed={caseSensitive}
                onPressedChange={setCaseSensitive}
                aria-label="Diferenciar maiúsculas e minúsculas"
                className="shrink-0"
              >
                Aa
              </Toggle>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {totalMatches > 0 ? `${currentIndex + 1} de ${totalMatches} resultados` : "Nenhum resultado"}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={prevMatch} disabled={totalMatches === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMatch} disabled={totalMatches === 0}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="replace" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Pesquisar..."
                  className="pl-8 pr-8"
                />
                {searchText && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-2 py-0"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Toggle
                pressed={caseSensitive}
                onPressedChange={setCaseSensitive}
                aria-label="Diferenciar maiúsculas e minúsculas"
                className="shrink-0"
              >
                Aa
              </Toggle>
            </div>

            <div className="relative flex-1">
              <Replace className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={replaceInputRef}
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Substituir por..."
                className="pl-8"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {totalMatches > 0 ? `${currentIndex + 1} de ${totalMatches} resultados` : "Nenhum resultado"}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={prevMatch} disabled={totalMatches === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMatch} disabled={totalMatches === 0}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={replaceMatch}
                disabled={totalMatches === 0 || isProcessing}
                className="gap-1"
              >
                <Replace className="h-4 w-4" />
                <span>Substituir</span>
              </Button>
              <Button onClick={replaceAllMatches} disabled={totalMatches === 0 || isProcessing} className="gap-1">
                <RotateCw className="h-4 w-4" />
                <span>Substituir Todos</span>
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
