import type { Note } from "@/lib/types"

// Função para exportar nota como TXT
export function exportToTxt(note: Note) {
  // Criar um elemento de texto para extrair apenas o texto do conteúdo HTML
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = note.content
  const textContent = tempDiv.textContent || tempDiv.innerText || note.content

  // Criar o blob e iniciar o download
  const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  // Criar um link temporário e clicar nele para iniciar o download
  const a = document.createElement("a")
  a.href = url
  a.download = `${note.title}.txt`
  document.body.appendChild(a)
  a.click()

  // Limpar
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}

// Função para exportar nota como PDF
export function exportToPdf(note: Note) {
  // Importar jsPDF dinamicamente para evitar problemas de SSR
  import("jspdf")
    .then(({ jsPDF }) => {
      // Criar um elemento de texto para extrair apenas o texto do conteúdo HTML
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = note.content
      const textContent = tempDiv.textContent || tempDiv.innerText || note.content

      // Criar o PDF
      const doc = new jsPDF()

      // Adicionar título
      doc.setFontSize(16)
      doc.text(note.title, 20, 20)

      // Adicionar conteúdo
      doc.setFontSize(12)

      // Quebrar o texto em linhas para caber na página
      const textLines = doc.splitTextToSize(textContent, 170)
      doc.text(textLines, 20, 30)

      // Salvar o PDF
      doc.save(`${note.title}.pdf`)
    })
    .catch((error) => {
      console.error("Erro ao carregar jsPDF:", error)
      throw new Error("Não foi possível carregar a biblioteca para exportar como PDF.")
    })
}

// Função para exportar nota como NOTE (formato personalizado)
export function exportToNote(note: Note) {
  // Criar o blob com os dados da nota em formato JSON
  const noteData = JSON.stringify(note)

  // Usar o tipo MIME específico para arquivos .note
  // Isso ajuda o navegador a associar o ícone correto
  const blob = new Blob([noteData], { type: "application/noteflow" })
  const url = URL.createObjectURL(blob)

  // Criar um link temporário e clicar nele para iniciar o download
  const a = document.createElement("a")
  a.href = url
  a.download = `${note.title}.note`
  document.body.appendChild(a)
  a.click()

  // Limpar
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}

// Função para importar arquivo
export async function importFromFile(
  file: File,
  existingNotes: Note[],
): Promise<{
  success: boolean
  action?: "add" | "update"
  note?: Note
  error?: string
}> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const content = e.target?.result as string

      if (file.name.endsWith(".txt")) {
        // Importar arquivo TXT
        const newNote: Note = {
          id: Date.now().toString(),
          title: file.name.replace(".txt", ""),
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        resolve({
          success: true,
          action: "add",
          note: newNote,
        })
      } else if (file.name.endsWith(".note")) {
        // Importar arquivo NOTE
        try {
          const noteData = JSON.parse(content) as Note

          // Verificar se a nota já existe
          const existingNote = existingNotes.find((note) => note.id === noteData.id)

          if (existingNote) {
            // Atualizar nota existente
            resolve({
              success: true,
              action: "update",
              note: {
                ...noteData,
                updatedAt: new Date().toISOString(),
              },
            })
          } else {
            // Adicionar nova nota
            resolve({
              success: true,
              action: "add",
              note: {
                ...noteData,
                updatedAt: new Date().toISOString(),
              },
            })
          }
        } catch (error) {
          resolve({
            success: false,
            error: "O arquivo .note está corrompido ou inválido.",
          })
        }
      } else {
        resolve({
          success: false,
          error: "Formato de arquivo não suportado. Apenas arquivos .txt e .note são suportados.",
        })
      }
    }

    reader.onerror = () => {
      resolve({
        success: false,
        error: "Erro ao ler o arquivo.",
      })
    }

    reader.readAsText(file)
  })
}
