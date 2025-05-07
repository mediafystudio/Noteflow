"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Estado para armazenar o valor
  // Passa a função de inicialização para useState para que a lógica seja executada apenas uma vez
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      // Obter do localStorage pelo key
      const item = window.localStorage.getItem(key)
      // Analisar o item armazenado ou retornar initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // Se ocorrer um erro, retornar initialValue
      console.log(error)
      return initialValue
    }
  })

  // Retornar uma versão encapsulada da função setter do useState que ...
  // ... persiste o novo valor no localStorage.
  const setValue = (value: T) => {
    try {
      // Permitir que value seja uma função para que tenhamos a mesma API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      // Salvar state
      setStoredValue(valueToStore)
      // Salvar no localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // Uma implementação mais avançada lidaria com o caso de erro
      console.log(error)
    }
  }

  // Sincronizar com localStorage quando a janela estiver disponível
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === key && event.newValue) {
          try {
            setStoredValue(JSON.parse(event.newValue))
          } catch (e) {
            console.error("Error parsing localStorage change:", e)
          }
        }
      }

      window.addEventListener("storage", handleStorageChange)
      return () => window.removeEventListener("storage", handleStorageChange)
    }
  }, [key])

  return [storedValue, setValue]
}
