"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function InstallPWAButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    // Detectar iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Capturar o evento beforeinstallprompt para Android/desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Verificar se o app já está instalado
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstallable(false)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true)
      return
    }

    if (!installPrompt) return

    try {
      await installPrompt.prompt()
      const choiceResult = await installPrompt.userChoice

      if (choiceResult.outcome === "accepted") {
        console.log("Usuário aceitou a instalação")
        setIsInstallable(false)
      } else {
        console.log("Usuário recusou a instalação")
      }
    } catch (error) {
      console.error("Erro ao instalar o PWA:", error)
    }
  }

  if (!isInstallable && !isIOS) return null

  return (
    <div className="relative">
      <Button onClick={handleInstallClick} variant="outline" className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        <span>Instalar App</span>
      </Button>

      {showIOSInstructions && isIOS && (
        <div className="absolute top-full mt-2 p-4 bg-background border rounded-md shadow-lg z-50 w-64">
          <p className="text-sm mb-2">Para instalar no iOS:</p>
          <ol className="text-xs space-y-1 list-decimal pl-4">
            <li>Toque no ícone de compartilhamento</li>
            <li>Role para baixo e toque em "Adicionar à Tela de Início"</li>
            <li>Toque em "Adicionar"</li>
          </ol>
          <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => setShowIOSInstructions(false)}>
            Fechar
          </Button>
        </div>
      )}
    </div>
  )
}
