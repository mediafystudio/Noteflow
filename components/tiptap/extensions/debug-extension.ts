import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

export const DebugExtension = Extension.create({
  name: "debugExtension",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("debugExtension"),
        appendTransaction: (transactions, oldState, newState) => {
          // Se não houver transações, não fazer nada
          if (!transactions.some((tr) => tr.docChanged)) return null

          // Registrar informações sobre as marcações antes e depois da transação
          console.group("Transação Tiptap")

          // Verificar se há alterações em marcas
          let hasMarksChanges = false

          newState.doc.descendants((node, pos) => {
            if (node.isText && node.marks.length > 0) {
              const oldNode = oldState.doc.nodeAt(pos)

              if (oldNode && JSON.stringify(oldNode.marks) !== JSON.stringify(node.marks)) {
                hasMarksChanges = true

                console.log("Posição:", pos)
                console.log("Texto:", node.text)
                console.log(
                  "Marcas antigas:",
                  oldNode.marks.map((m) => ({ type: m.type.name, attrs: m.attrs })),
                )
                console.log(
                  "Marcas novas:",
                  node.marks.map((m) => ({ type: m.type.name, attrs: m.attrs })),
                )
              }
            }
            return true
          })

          if (!hasMarksChanges) {
            console.log("Nenhuma alteração em marcas detectada")
          }

          console.groupEnd()

          return null
        },
      }),
    ]
  },
})
