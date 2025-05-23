"use client"

import type React from "react"

import { Settings, Moon, Sun, Menu, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRef, useEffect, useState } from "react"
import { useMobile } from "@/hooks/use-mobile"
import { InstallPWAButton } from "./install-pwa-button"

interface HeaderProps {
  onCreateNote: () => void
  onExportTxt: () => void
  onExportPdf: () => void
  onExportNote: () => void
  onImportFile: (event: React.ChangeEvent<HTMLInputElement>) => void
  onToggleSidebar: () => void
  sidebarOpen?: boolean
}

export default function Header({
  onCreateNote,
  onExportTxt,
  onExportPdf,
  onExportNote,
  onImportFile,
  onToggleSidebar,
  sidebarOpen = false,
}: HeaderProps) {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)
  const [buttonVisible, setButtonVisible] = useState(false)
  const isMobile = useMobile()

  // Após a montagem do componente, podemos acessar o tema
  useEffect(() => {
    setMounted(true)

    // Adicionar um pequeno atraso antes de mostrar o botão para garantir que a animação seja visível
    const timer = setTimeout(() => {
      setButtonVisible(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Determinar qual ícone mostrar com base no tema atual
  const currentTheme = mounted ? resolvedTheme : "dark"
  const isDark = currentTheme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className={`mr-2 ${isMobile && sidebarOpen ? "bg-accent" : ""}`}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center py-1.5">
          <svg
            width="160"
            height="36"
            viewBox="0 0 455.254 112.075"
            className="my-0.5"
            style={{
              maxHeight: "32px",
              width: "auto",
            }}
          >
            <defs>
              <linearGradient id="a" x1="-0.041" y1="0.292" x2="1.041" y2="0.708" gradientUnits="objectBoundingBox">
                <stop offset="0" stopColor="#ffcbff" />
                <stop offset="1" stopColor="#aa2fef" />
              </linearGradient>
            </defs>
            <rect width="112.075" height="112.075" rx="31.031" fill="url(#a)" />
            <g transform="translate(-108 -518)">
              <path
                d="M288.344,547.966H296.2v50.017a2.442,2.442,0,0,1-1.248,2.13,5.576,5.576,0,0,1-3.085,.808,6.06,6.06,0,0,1-5.362-2.57L260.434,561.48v38.927h-7.859V551.124a2.947,2.947,0,0,1,1.249-2.57,5.612,5.612,0,0,1,3.3-.882,6.475,6.475,0,0,1,3.562,.771,11.635,11.635,0,0,1,2.607,2.828l25.046,34.887Z"
                className="fill-foreground transition-colors duration-300"
              />
              <path
                d="M322.938,601.362q-8.227,0-13.147-5.288t-4.848-14.029q.072-8.812,4.958-14.065t13.037-5.251q8.3,0,13.183,5.251t4.885,14.065q0,8.742-4.885,14.029T322.938,601.362Zm0-6.758Q333,594.6,333,582.045t-10.062-12.559q-4.923,0-7.492,3.2t-2.57,9.364Q312.876,594.606,322.938,594.6Z"
                className="fill-foreground transition-colors duration-300"
              />
              <path
                d="M370.31,591.814l2.791,5.949a17.858,17.858,0,0,1-10.724,3.452q-5.8,0-8.814-3.488t-3.01-9.585V569.56H344.6v-5.876h5.949V552.3h7.931v11.384h12.487v5.876H358.484v18.361q0,3.159,1.654,4.591a5.7,5.7,0,0,0,3.855,1.432A11.237,11.237,0,0,0,370.31,591.814Z"
                className="fill-foreground transition-colors duration-300"
              />
              <path
                d="M394.106,594.531a17.716,17.716,0,0,0,11.312-4.26l3.672,5.362a23,23,0,0,1-15.424,5.582q-7.932,0-12.89-5.031t-4.958-13.624a20.606,20.606,0,0,1,5.032-14.1q5.029-5.729,13.918-5.729a16.889,16.889,0,0,1,10.5,3.341,11.082,11.082,0,0,1,4.407,9.366,9.638,9.638,0,0,1-2.718,7.124q-2.719,2.718-7.933,2.717h-15.5Q385,594.53,394.106,594.531Zm.442-25.633a10.481,10.481,0,0,0-7.455,2.865,12.657,12.657,0,0,0-3.709,7.858h14.175a4.837,4.837,0,0,0,3.452-1.175,4.414,4.414,0,0,0,1.249-3.378,5.56,5.56,0,0,0-2.094-4.37A8.329,8.329,0,0,0,394.548,568.9Z"
                className="fill-foreground transition-colors duration-300"
              />
              <path
                d="M435.017,553.988a7.689,7.689,0,0,0-5.326,1.873q-2.093,1.873-2.092,5.913v1.91h13.219v5.876H427.6v30.847h-7.86V569.56h-5.8v-5.876h5.8v-2.277A16.718,16.718,0,0,1,420.8,555.2a11.513,11.513,0,0,1,2.607-4.149,13.291,13.291,0,0,1,3.6-2.424,15.5,15.5,0,0,1,3.672-1.248,17.714,17.714,0,0,1,3.158-.294,16.405,16.405,0,0,1,10.576,3.525l-3.084,5.508A11.485,11.485,0,0,0,435.017,553.988Z"
                className="fill-foreground transition-colors duration-300"
              />
              <path
                d="M447.428,600.407V547.966h8.006v52.441Z"
                className="fill-foreground transition-colors duration-300"
              />
              <path
                d="M481.212,601.362q-8.226,0-13.147-5.288t-4.847-14.029q.074-8.812,4.958-14.065t13.036-5.251q8.3,0,13.184,5.251t4.884,14.065q0,8.742-4.884,14.029T481.212,601.362Zm0-6.758q10.062,0,10.062-12.559t-10.062-12.559q-4.92,0-7.491,3.2t-2.571,9.364Q471.15,594.606,481.212,594.6Z"
                className="fill-foreground transition-colors duration-300"
              />
              <path
                d="M542.238,601.447q-7.746,0-11.225-14.7-3.264,14.706-11.01,14.7a9.27,9.27,0,0,1-6.706-2.815,20.582,20.582,0,0,1-4.7-8.177,69.818,69.818,0,0,1-2.851-12.229,154.752,154.752,0,0,1-1.417-15.8h9.109a108.715,108.715,0,0,0,1.9,22.557q1.937,9.037,4.591,9.037,2.546,0,4.608-7.692t2.421-20.675h8.893a90.707,90.707,0,0,0,1.9,20.227q1.9,8.142,4.555,8.14,1.184,0,2.851-1.9a29.734,29.734,0,0,0,3.389-4.949q-6.814-7.6-6.814-14.883a11.483,11.483,0,0,1,2.618-7.926,9.419,9.419,0,0,1,7.423-2.941q4.592,0,7.012,2.8a11.116,11.116,0,0,1,2.42,7.531q0,5.594-3.693,13.735a51.658,51.658,0,0,0,5.738,3.981l-3.982,6.885q-4.159-3.047-5.343-4.087a29.039,29.039,0,0,1-5.72,6.67A9.436,9.436,0,0,1,542.238,601.447Zm7.281-28.941a12.756,12.756,0,0,0,2.331,7.351,23.365,23.365,0,0,0,1.577-7.566q0-3.336-1.864-3.336a1.674,1.674,0,0,0-1.489,.951A5.151,5.151,0,0,0,549.519,572.506Z"
                className="fill-foreground transition-colors duration-300"
              />
            </g>
            <circle cx="37.452" cy="37.452" r="37.452" transform="translate(18 19)" fill="#fff" opacity="0.78" />
          </svg>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Botão de instalação do PWA */}
        <InstallPWAButton />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportTxt}>Exportar como TXT</DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPdf}>Exportar como PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={onExportNote}>Exportar como NOTE</DropdownMenuItem>
            <DropdownMenuItem onClick={handleImportClick}>Importar arquivo</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {isMobile ? (
          <div className={buttonVisible ? "opacity-100" : "opacity-0"}>
            <Button
              onClick={onCreateNote}
              className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-medium transition-opacity duration-300 hover:opacity-90 shadow-md ${buttonVisible ? "new-note-button-animation" : ""}`}
              style={{
                background: "linear-gradient(to right, #ba9af2, #aa2fef)",
                border: "none",
                outline: "none",
              }}
              title="Nova Nota"
              aria-label="Criar nova nota"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        ) : (
          <button
            onClick={onCreateNote}
            className={`flex items-center px-4 py-2 rounded-md text-white font-medium transition-opacity duration-300 hover:opacity-90 ${buttonVisible ? "new-note-button-animation" : ""}`}
            style={{
              background: "linear-gradient(to right, #ba9af2, #aa2fef)",
              border: "none",
              outline: "none",
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Nota
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onImportFile}
        accept=".txt,.note"
        className="hidden"
        onClick={(e) => {
          // Garantir que o evento de clique seja propagado corretamente
          e.stopPropagation()
        }}
      />
    </header>
  )
}
