// Função auxiliar para verificar se o navegador suporta o comando
export function isCommandSupported(command: string): boolean {
  return document.queryCommandSupported(command)
}

// Função para executar comandos de edição com tratamento de erros aprimorado
export function executeCommand(element: HTMLElement | null, command: string, value = ""): boolean {
  if (!element) {
    console.error("Elemento de editor não encontrado")
    return false
  }

  if (!isCommandSupported(command)) {
    console.warn(`Comando '${command}' não é suportado neste navegador`)
    return false
  }

  try {
    // Garantir que o elemento está focado
    element.focus()

    // Executar o comando
    const result = document.execCommand(command, false, value)

    if (!result) {
      console.warn(`Comando '${command}' falhou ao executar`)
    }

    return result
  } catch (error) {
    console.error(`Erro ao executar comando '${command}':`, error)
    return false
  }
}

// Funções específicas para cada tipo de formatação
export const formatCommands = {
  // Histórico
  undo: (element: HTMLElement) => executeCommand(element, "undo"),
  redo: (element: HTMLElement) => executeCommand(element, "redo"),

  // Formatação básica
  bold: (element: HTMLElement) => executeCommand(element, "bold"),
  italic: (element: HTMLElement) => executeCommand(element, "italic"),
  underline: (element: HTMLElement) => executeCommand(element, "underline"),

  // Alinhamento
  alignLeft: (element: HTMLElement) => executeCommand(element, "justifyLeft"),
  alignCenter: (element: HTMLElement) => executeCommand(element, "justifyCenter"),
  alignRight: (element: HTMLElement) => executeCommand(element, "justifyRight"),
  alignJustify: (element: HTMLElement) => executeCommand(element, "justifyFull"),

  // Formatação de texto
  heading: (element: HTMLElement, level: 1 | 2 | 3 | 4 | 5 | 6) =>
    executeCommand(element, "formatBlock", `<h${level}>`),
  paragraph: (element: HTMLElement) => executeCommand(element, "formatBlock", "<p>"),

  // Cores e fontes
  fontName: (element: HTMLElement, fontName: string) => executeCommand(element, "fontName", fontName),
  fontSize: (element: HTMLElement, size: string) => executeCommand(element, "fontSize", size),
  foreColor: (element: HTMLElement, color: string) => executeCommand(element, "foreColor", color),

  // Inserção manual de HTML
  insertHTML: (element: HTMLElement, html: string) => executeCommand(element, "insertHTML", html),
}
