import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

export const FormatPreservationExtension = Extension.create({
  name: "formatPreservation",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("formatPreservation"),
        appendTransaction: (transactions, oldState, newState) => {
          // Se não houver transações, não fazer nada
          if (!transactions.some((tr) => tr.docChanged)) return null

          // Verificar se há alterações em marcas de formatação
          const tr = newState.tr

          // Verificar se há nós com marcas de formatação (bold, italic, etc.)
          // que também tinham marcas de estilo (color, fontSize, etc.) no estado anterior
          newState.doc.descendants((node, pos) => {
            if (node.isText && node.marks.length > 0) {
              // Verificar se há marcas de formatação (bold, italic, etc.)
              const formatMarks = node.marks.filter((mark) =>
                ["bold", "italic", "underline", "strike"].includes(mark.type.name),
              )

              if (formatMarks.length > 0) {
                // Verificar se havia marcas de estilo no estado anterior
                const oldNode = oldState.doc.nodeAt(pos)
                if (oldNode && oldNode.marks.length > 0) {
                  const styleMarks = oldNode.marks.filter(
                    (mark) =>
                      mark.type.name === "textStyle" &&
                      (mark.attrs.color || mark.attrs.fontSize || mark.attrs.fontFamily),
                  )

                  if (styleMarks.length > 0) {
                    // Reaplicar as marcas de estilo
                    styleMarks.forEach((styleMark) => {
                      tr.addMark(pos, pos + node.nodeSize, styleMark)
                    })
                  }
                }
              }

              // Verificar o caso inverso: se há marcas de estilo que tinham marcas de formatação
              const styleMarks = node.marks.filter(
                (mark) =>
                  mark.type.name === "textStyle" && (mark.attrs.color || mark.attrs.fontSize || mark.attrs.fontFamily),
              )

              if (styleMarks.length > 0) {
                // Verificar se havia marcas de formatação no estado anterior
                const oldNode = oldState.doc.nodeAt(pos)
                if (oldNode && oldNode.marks.length > 0) {
                  const formatMarks = oldNode.marks.filter((mark) =>
                    ["bold", "italic", "underline", "strike"].includes(mark.type.name),
                  )

                  if (formatMarks.length > 0) {
                    // Reaplicar as marcas de formatação
                    formatMarks.forEach((formatMark) => {
                      tr.addMark(pos, pos + node.nodeSize, formatMark)
                    })
                  }
                }
              }
            }
            return true
          })

          return tr.steps.length ? tr : null
        },
      }),
    ]
  },
})
