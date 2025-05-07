import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Noteflow - Editor de Notas",
    short_name: "Noteflow",
    description: "Um aplicativo de notas com formatação de texto avançada",
    start_url: "/",
    display: "standalone",
    background_color: "#1a2235",
    theme_color: "#1a2235",
    icons: [
      {
        src: "/pwa-icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/pwa-icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/pwa-icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
