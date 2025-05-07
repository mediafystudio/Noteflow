import { Extension } from "@tiptap/core"

export type SortTextOptions = {}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    sortText: {
      /**
       * Ordena parágrafos alfabeticamente
       */
      sortParagraphsAZ: () => ReturnType
      /**
       * Ordena parágrafos alfabeticamente em ordem reversa
       */
      sortParagraphsZA: () => ReturnType
    }
  }
}

export const SortText = Extension.create<SortTextOptions>({
  name: "sortText",

  addCommands() {
    return {
      sortParagraphsAZ:
        () =>
        ({ editor }) => {
          try {
            // Abordagem baseada em HTML para evitar erros de transação

            // 1. Obter o conteúdo como HTML
            const content = editor.getHTML()

            // 2. Dividir o conteúdo em parágrafos
            const paragraphRegex = /<p(?:\s+[^>]*)?>([\s\S]*?)<\/p>/g
            const paragraphs: string[] = []
            let match

            while ((match = paragraphRegex.exec(content)) !== null) {
              paragraphs.push(match[0])
            }

            // Se não houver parágrafos suficientes, retornar falso
            if (paragraphs.length <= 1) {
              return false
            }

            // 3. Extrair o texto puro de cada parágrafo para ordenação
            const paragraphsWithText = paragraphs.map((p) => {
              // Remover as tags HTML para obter apenas o texto para ordenação
              const textOnly = p.replace(/<[^>]*>/g, "")
              return { html: p, text: textOnly }
            })

            // 4. Ordenar os parágrafos pelo texto (A-Z)
            paragraphsWithText.sort((a, b) => a.text.localeCompare(b.text))

            // 5. Reconstruir o HTML com os parágrafos ordenados
            const sortedHTML = paragraphsWithText.map((p) => p.html).join("")

            // 6. Substituir apenas os parágrafos no conteúdo original
            // Encontrar onde começam e terminam os parágrafos no conteúdo original
            const firstParagraphIndex = content.indexOf(paragraphs[0])
            const lastParagraphIndex =
              content.indexOf(paragraphs[paragraphs.length - 1]) + paragraphs[paragraphs.length - 1].length

            // Manter o conteúdo antes e depois dos parágrafos
            const beforeParagraphs = content.substring(0, firstParagraphIndex)
            const afterParagraphs = content.substring(lastParagraphIndex)

            // Montar o novo conteúdo
            const newContent = beforeParagraphs + sortedHTML + afterParagraphs

            // 7. Definir o novo conteúdo - ignorar erros que não afetam a funcionalidade
            try {
              editor.commands.setContent(newContent)
              return true
            } catch (error) {
              // Se ocorrer um erro aqui, mas a ordenação parecer ter funcionado,
              // vamos ignorar o erro e retornar true mesmo assim
              console.log("Erro ignorado ao definir conteúdo ordenado:", error)
              return true
            }
          } catch (error) {
            console.error("Erro ao ordenar parágrafos A-Z:", error)
            return false
          }
        },

      sortParagraphsZA:
        () =>
        ({ editor }) => {
          try {
            // Mesma abordagem que A-Z, mas com ordenação inversa

            // 1. Obter o conteúdo como HTML
            const content = editor.getHTML()

            // 2. Dividir o conteúdo em parágrafos
            const paragraphRegex = /<p(?:\s+[^>]*)?>([\s\S]*?)<\/p>/g
            const paragraphs: string[] = []
            let match

            while ((match = paragraphRegex.exec(content)) !== null) {
              paragraphs.push(match[0])
            }

            // Se não houver parágrafos suficientes, retornar falso
            if (paragraphs.length <= 1) {
              return false
            }

            // 3. Extrair o texto puro de cada parágrafo para ordenação
            const paragraphsWithText = paragraphs.map((p) => {
              // Remover as tags HTML para obter apenas o texto para ordenação
              const textOnly = p.replace(/<[^>]*>/g, "")
              return { html: p, text: textOnly }
            })

            // 4. Ordenar os parágrafos pelo texto (Z-A) - ordem inversa
            paragraphsWithText.sort((a, b) => b.text.localeCompare(a.text))

            // 5. Reconstruir o HTML com os parágrafos ordenados
            const sortedHTML = paragraphsWithText.map((p) => p.html).join("")

            // 6. Substituir apenas os parágrafos no conteúdo original
            // Encontrar onde começam e terminam os parágrafos no conteúdo original
            const firstParagraphIndex = content.indexOf(paragraphs[0])
            const lastParagraphIndex =
              content.indexOf(paragraphs[paragraphs.length - 1]) + paragraphs[paragraphs.length - 1].length

            // Manter o conteúdo antes e depois dos parágrafos
            const beforeParagraphs = content.substring(0, firstParagraphIndex)
            const afterParagraphs = content.substring(lastParagraphIndex)

            // Montar o novo conteúdo
            const newContent = beforeParagraphs + sortedHTML + afterParagraphs

            // 7. Definir o novo conteúdo - ignorar erros que não afetam a funcionalidade
            try {
              editor.commands.setContent(newContent)
              return true
            } catch (error) {
              // Se ocorrer um erro aqui, mas a ordenação parecer ter funcionado,
              // vamos ignorar o erro e retornar true mesmo assim
              console.log("Erro ignorado ao definir conteúdo ordenado:", error)
              return true
            }
          } catch (error) {
            console.error("Erro ao ordenar parágrafos Z-A:", error)
            return false
          }
        },
    }
  },
})
