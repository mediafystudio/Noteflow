import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte HTML em texto simples
 * @param html String HTML para converter
 * @returns Texto extraído do HTML
 */
export function htmlToPlainText(html: string): string {
  // Criar um elemento temporário para extrair o texto
  if (typeof document !== "undefined") {
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText || ""
  }

  // Fallback simples para SSR (não será perfeito, mas remove tags básicas)
  return html
    .replace(/<[^>]*>/g, "") // Remove tags HTML
    .replace(/&nbsp;/g, " ") // Substitui &nbsp; por espaço
    .replace(/&amp;/g, "&") // Substitui &amp; por &
    .replace(/&lt;/g, "<") // Substitui &lt; por <
    .replace(/&gt;/g, ">") // Substitui &gt; por >
    .replace(/&quot;/g, '"') // Substitui &quot; por "
    .replace(/&#39;/g, "'") // Substitui &#39; por '
}
