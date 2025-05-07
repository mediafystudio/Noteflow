import type React from "react"
import "./globals.css"
import "./theme-color-rules.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Noteflow - Editor de Notas",
  description: "Um aplicativo de notas com formatação de texto avançada",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
    shortcut: "/Noteflow-icon.ico",
  },
  manifest: "/manifest.json",
  themeColor: "#1a2235",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Noteflow",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/Noteflow-icon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/pwa-icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registrado com sucesso:', registration.scope);
                    },
                    function(err) {
                      console.log('Falha ao registrar Service Worker:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
