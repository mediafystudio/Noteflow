import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

export interface SearchOptions {
  searchResultClass: string
  currentSearchResultClass: string
}

// Criamos uma chave específica para o plugin
const searchPluginKey = new PluginKey("search")

export const SearchPlugin = Extension.create<SearchOptions>({
  name: "search",

  addOptions() {
    return {
      searchResultClass: "search-result",
      currentSearchResultClass: "current-search-result",
    }
  },

  addStorage() {
    return {
      searchTerm: "",
      caseSensitive: false,
      currentIndex: 0,
    }
  },

  addCommands() {
    return {
      setSearchTerm:
        (searchTerm: string) =>
        ({ editor }) => {
          this.storage.searchTerm = searchTerm
          editor.view.dispatch(editor.state.tr)
          return true
        },
      toggleCaseSensitive:
        (caseSensitive: boolean) =>
        ({ editor }) => {
          this.storage.caseSensitive = caseSensitive
          editor.view.dispatch(editor.state.tr)
          return true
        },
      setCurrentSearchResult:
        (index: number) =>
        ({ editor }) => {
          this.storage.currentIndex = index
          editor.view.dispatch(editor.state.tr)
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    const { searchResultClass, currentSearchResultClass } = this.options
    const extensionThis = this

    return [
      new Plugin({
        key: searchPluginKey,
        state: {
          init() {
            return DecorationSet.empty
          },
          apply(tr, oldState) {
            // Sempre recalcular as decorações quando o documento muda
            const searchTerm = extensionThis.storage.searchTerm
            const caseSensitive = extensionThis.storage.caseSensitive
            const currentIndex = extensionThis.storage.currentIndex

            if (
              tr.docChanged ||
              searchTerm !== oldState.searchTerm ||
              caseSensitive !== oldState.caseSensitive ||
              currentIndex !== oldState.currentIndex
            ) {
              return findSearchTermInDoc(
                tr.doc,
                searchTerm,
                caseSensitive,
                currentIndex,
                searchResultClass,
                currentSearchResultClass,
              )
            }

            // Mapear as decorações para a nova posição do documento
            return oldState.map(tr.mapping, tr.doc)
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})

// Função auxiliar para escapar caracteres especiais em expressões regulares
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Interface para representar uma correspondência
interface Match {
  from: number
  to: number
  text: string
}

// Função para encontrar todas as correspondências no documento
function findAllMatches(doc: any, searchTerm: string, caseSensitive: boolean): Match[] {
  const matches: Match[] = []

  if (!searchTerm) {
    return matches
  }

  try {
    const regex = caseSensitive ? new RegExp(escapeRegExp(searchTerm), "g") : new RegExp(escapeRegExp(searchTerm), "gi")

    doc.descendants((node: any, pos: number) => {
      if (!node.isText) {
        return
      }

      const { text } = node
      let match
      regex.lastIndex = 0 // Resetar o índice da regex para evitar problemas com múltiplas execuções

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

// Função para encontrar o termo de pesquisa no documento
function findSearchTermInDoc(
  doc: any,
  searchTerm: string,
  caseSensitive: boolean,
  currentIndex: number,
  searchResultClass: string,
  currentSearchResultClass: string,
): DecorationSet {
  const decorations: any[] = []

  if (!searchTerm) {
    return DecorationSet.create(doc, decorations)
  }

  try {
    const matches = findAllMatches(doc, searchTerm, caseSensitive)

    matches.forEach((match, index) => {
      decorations.push(
        Decoration.inline(match.from, match.to, {
          class: index === currentIndex ? `${searchResultClass} ${currentSearchResultClass}` : searchResultClass,
        }),
      )
    })
  } catch (error) {
    console.error("Erro ao criar decorações:", error)
  }

  return DecorationSet.create(doc, decorations)
}
