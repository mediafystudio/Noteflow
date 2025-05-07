import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

export const MarkCompatibilityExtension = Extension.create({
  name: "markCompatibility",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("markCompatibility"),
        appendTransaction: (transactions, oldState, newState) => {
          // Se não houver transações, não fazer nada
          if (!transactions.some((tr) => tr.docChanged)) return null

          const tr = newState.tr
          let modified = false

          // Verificar se há nós com marcas de formatação
          newState.doc.descendants((node, pos) => {
            if (node.isText && node.marks.length > 0) {
              // Verificar se há marca de textStyle
              const textStyleMark = node.marks.find((mark) => mark.type.name === "textStyle")

              // Verificar se há marcas de formatação
              const formatMarks = node.marks.filter((mark) =>
                ["bold", "italic", "underline", "strike", "code"].includes(mark.type.name),
              )

              // Se temos ambos textStyle e marcas de formatação, precisamos garantir compatibilidade
              if (textStyleMark && formatMarks.length > 0) {
                // Verificar se o nó no estado anterior tinha as mesmas marcas
                const oldNode = oldState.doc.nodeAt(pos)

                if (oldNode) {
                  const oldTextStyleMark = oldNode.marks.find((mark) => mark.type.name === "textStyle")

                  // Se o textStyle mudou, precisamos garantir que as marcas de formatação sejam preservadas
                  if (
                    oldTextStyleMark &&
                    JSON.stringify(oldTextStyleMark.attrs) !== JSON.stringify(textStyleMark.attrs)
                  ) {
                    // Remover todas as marcas
                    tr.removeMark(pos, pos + node.nodeSize)

                    // Adicionar textStyle primeiro
                    tr.addMark(pos, pos + node.nodeSize, textStyleMark)

                    // Adicionar todas as marcas de formatação
                    formatMarks.forEach((mark) => {
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
