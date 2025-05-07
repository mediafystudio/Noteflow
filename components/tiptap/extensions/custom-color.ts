import { Mark, mergeAttributes } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

// Chave para metadados de remoção intencional
export const INTENTIONAL_REMOVAL_META = "intentionalRemoval"

// Esta é uma extensão personalizada que substitui a extensão Color padrão do Tiptap
export const CustomColor = Mark.create({
  name: "customColor",

  addOptions() {
    return {
      types: ["textStyle"],
    }
  },

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.color || element.getAttribute("color"),
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {}
          }

          return {
            style: `color: ${attributes.color}`,
          }
        },
      },
      // Adicionamos um atributo para armazenar a cor original
      originalColor: {
        default: null,
        parseHTML: (element) => element.dataset.originalColor,
        renderHTML: (attributes) => {
          if (!attributes.originalColor) {
            return {}
          }
          return {
            "data-original-color": attributes.originalColor,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        style: "color",
      },
      {
        tag: "span[style*=color]",
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setCustomColor:
        (color) =>
        ({ chain }) => {
          // Armazenar a cor original junto com a cor aplicada
          return chain().setMark("customColor", { color, originalColor: color }).run()
        },
      unsetCustomColor:
        () =>
        ({ chain }) => {
          return chain().unsetMark("customColor").run()
        },
    }
  },

  // Garantir que esta marca seja compatível com outras marcas
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("customColorPlugin"),
        appendTransaction: (transactions, oldState, newState) => {
          // Se não houver transações, não fazer nada
          if (!transactions.some((tr) => tr.docChanged)) return null

          // Verificar se alguma das transações foi uma remoção intencional
          const intentionalRemovals = transactions.some((tr) => {
            return tr.getMeta(INTENTIONAL_REMOVAL_META) === true
          })

          // Se foi uma remoção intencional, não interferir
          if (intentionalRemovals) {
            console.log("Remoção intencional detectada, não interferindo")
            return null
          }

          const tr = newState.tr
          let modified = false

          // Verificar todos os nós de texto
          newState.doc.descendants((node, pos) => {
            if (node.isText) {
              // Verificar se há marcas de formatação
              const formatMarks = node.marks.filter((mark) =>
                ["bold", "italic", "underline", "strike"].includes(mark.type.name),
              )

              // Verificar se há marca de cor
              const colorMark = node.marks.find((mark) => mark.type.name === "customColor")

              // Se temos ambos, não precisamos fazer nada
              if (formatMarks.length > 0 && colorMark) {
                // Tudo bem, as marcas já estão aplicadas corretamente
              }

              // Se temos apenas marcas de formatação, verificar se havia cor no estado anterior
              else if (formatMarks.length > 0 && !colorMark) {
                const oldNode = oldState.doc.nodeAt(pos)
                if (oldNode) {
                  const oldColorMark = oldNode.marks.find((mark) => mark.type.name === "customColor")
                  if (oldColorMark) {
                    // Reaplicar a marca de cor
                    tr.addMark(pos, pos + node.nodeSize, oldColorMark)
                    modified = true
                  }
                }
              }

              // Se temos apenas cor, verificar se havia marcas de formatação no estado anterior
              else if (!formatMarks.length && colorMark) {
                const oldNode = oldState.doc.nodeAt(pos)
                if (oldNode) {
                  const oldFormatMarks = oldNode.marks.filter((mark) =>
                    ["bold", "italic", "underline", "strike"].includes(mark.type.name),
                  )

                  if (oldFormatMarks.length > 0) {
                    // Reaplicar as marcas de formatação
                    oldFormatMarks.forEach((mark) => {
                      tr.addMark(pos, pos + node.nodeSize, mark)
                    })
                    modified = true
                  }
                }
              }
            }
            return true
          })

          return modified ? tr : null
        },
      }),
    ]
  },
})

// Função auxiliar para marcar uma transação como remoção intencional
export function markAsIntentionalRemoval(editor) {
  if (!editor) return

  // Criar uma transação vazia apenas para definir o metadado
  const tr = editor.state.tr
  tr.setMeta(INTENTIONAL_REMOVAL_META, true)
  editor.view.dispatch(tr)
}

// Função auxiliar para criar comandos com remoção intencional
export function createIntentionalToggleCommand(editor, commandName) {
  if (!editor) return () => false

  return () => {
    // Criar uma cadeia de comandos que inclui a marcação de intencionalidade
    return (
      editor
        .chain()
        .focus()
        // Marcar a transação como intencional
        .command(({ tr }) => {
          tr.setMeta(INTENTIONAL_REMOVAL_META, true)
          return true
        })
        // Executar o comando desejado na mesma transação
        .command(({ commands }) => {
          switch (commandName) {
            case "bold":
              return commands.toggleBold()
            case "italic":
              return commands.toggleItalic()
            case "underline":
              return commands.toggleUnderline()
            case "strike":
              return commands.toggleStrike()
            case "code":
              return commands.toggleCode()
            case "blockquote":
              return commands.toggleBlockquote()
            default:
              return false
          }
        })
        .run()
    )
  }
}
