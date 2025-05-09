"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useMobile } from "@/hooks/use-mobile"

interface WelcomePageProps {
  onComplete: () => void
}

export function WelcomePage({ onComplete }: WelcomePageProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage("noteflow-welcome-seen", false)
  const isMobile = useMobile()

  // Se o usuário já viu a página de boas-vindas, pular
  useEffect(() => {
    if (hasSeenWelcome) {
      onComplete()
    }
  }, [hasSeenWelcome, onComplete])

  const steps = [
    {
      title: "Bem-vindo ao Noteflow",
      description: "Um editor de notas moderno e poderoso para suas ideias.",
      image: "/welcome/welcome-main.png",
    },
    {
      title: "Editor Rico",
      description: "Formate seu texto com negrito, itálico, listas, cores e muito mais.",
      image: "/welcome/editor-features.png",
    },
    {
      title: "Organize suas Notas",
      description: "Crie, edite e gerencie suas notas com facilidade.",
      image: "/welcome/organize-notes.png",
    },
    {
      title: "Funciona Offline",
      description: "Acesse e edite suas notas mesmo sem conexão com a internet.",
      image: "/welcome/offline-mode.png",
    },
    {
      title: "Instale como Aplicativo",
      description: "Adicione o Noteflow à sua tela inicial para acesso rápido.",
      image: "/welcome/install-app.png",
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeWelcome()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeWelcome = () => {
    setHasSeenWelcome(true)
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Botão para fechar/pular */}
      <button
        onClick={completeWelcome}
        className="absolute top-4 right-4 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
        aria-label="Pular introdução"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center">
        {/* Indicadores de passo */}
        <div className="flex space-x-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep ? "w-8 bg-primary" : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Conteúdo do passo atual */}
        <div className="text-center mb-8 transition-opacity duration-300">
          <div className="mb-6 h-48 flex items-center justify-center">
            <div className="relative w-full max-w-xs">
              {/* Logo do Noteflow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 112.075 112.075">
                    <defs>
                      <linearGradient
                        id="noteflow-gradient"
                        x1="-0.041"
                        y1="0.292"
                        x2="1.041"
                        y2="0.708"
                        gradientUnits="objectBoundingBox"
                      >
                        <stop offset="0" stopColor="#ffcbff" />
                        <stop offset="1" stopColor="#aa2fef" />
                      </linearGradient>
                    </defs>
                    <rect width="112.075" height="112.075" rx="31.031" fill="url(#noteflow-gradient)" />
                    <circle
                      cx="37.452"
                      cy="37.452"
                      r="37.452"
                      transform="translate(18 19)"
                      fill="#fff"
                      opacity="0.78"
                    />
                  </svg>
                </div>
              </div>

              {/* Elementos ilustrativos específicos para cada passo */}
              <div className="absolute inset-0 flex items-center justify-center">
                {currentStep === 0 && (
                  <div className="absolute w-full h-full flex items-center justify-center">
                    <div
                      className="absolute w-32 h-32 bg-gradient-to-r from-purple-200 to-purple-400 rounded-full opacity-20 animate-pulse"
                      style={{ top: "10%", left: "15%" }}
                    ></div>
                    <div
                      className="absolute w-24 h-24 bg-gradient-to-r from-pink-200 to-pink-400 rounded-full opacity-20 animate-pulse"
                      style={{ bottom: "10%", right: "15%" }}
                    ></div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="absolute w-full h-full flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-around">
                      <div className="w-8 h-8 rounded-md border-2 border-purple-400 flex items-center justify-center text-xs font-bold text-purple-500">
                        B
                      </div>
                      <div className="w-8 h-8 rounded-md border-2 border-pink-400 flex items-center justify-center text-xs italic font-bold text-pink-500">
                        I
                      </div>
                      <div className="w-8 h-8 rounded-md border-2 border-blue-400 flex items-center justify-center text-xs font-bold text-blue-500 underline">
                        U
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="absolute w-full h-full flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-around pt-20">
                      <div className="w-32 h-6 bg-gradient-to-r from-purple-100 to-purple-200 rounded-md mb-2"></div>
                      <div className="w-32 h-6 bg-gradient-to-r from-purple-100 to-purple-200 rounded-md mb-2"></div>
                      <div className="w-32 h-6 bg-gradient-to-r from-purple-100 to-purple-200 rounded-md"></div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="absolute w-full h-full flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pt-20">
                      <div className="w-12 h-12 rounded-full border-4 border-purple-400 border-t-transparent animate-spin"></div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="absolute w-full h-full flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pt-20">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-purple-400 rounded-lg flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                          <path d="M2 17L12 22L22 17" fill="white" />
                          <path d="M2 12L12 17L22 12" fill="white" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
          <p className="text-muted-foreground">{steps[currentStep].description}</p>
        </div>

        {/* Botões de navegação */}
        <div className="flex w-full justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={currentStep === 0 ? "invisible" : ""}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            className={`${
              currentStep === steps.length - 1
                ? "bg-gradient-to-r from-[#ba9af2] to-[#aa2fef] hover:opacity-90 text-white"
                : ""
            }`}
          >
            {currentStep === steps.length - 1 ? "Começar" : "Próximo"}
            {currentStep !== steps.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>

        {/* Link para pular */}
        {currentStep !== steps.length - 1 && (
          <button
            onClick={completeWelcome}
            className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pular introdução
          </button>
        )}
      </div>
    </div>
  )
}
