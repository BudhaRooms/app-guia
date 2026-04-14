import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://budharoomsapp.web.app"),
  title: "Budha Rooms Alicante | Guía de Huéspedes",
  description: "Guía exclusiva para huéspedes de Budha Rooms Alicante. Descubre las mejores recomendaciones de restaurantes, playas, ocio y monumentos.",
  keywords: ["Budha Rooms Alicante", "Guía de Huéspedes", "Alicante Turismo", "Recomendaciones Alicante", "Guest Guide"],
  authors: [{ name: "Budha Rooms" }],
  creator: "Budha Rooms",
  publisher: "Budha Rooms",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/logo_stitch.png",
    apple: "/logo_stitch.png"
  },
  openGraph: {
    title: "Budha Rooms Alicante | Guía de Huéspedes",
    description: "Guía interactiva con las mejores recomendaciones locales para tu estancia en Budha Rooms.",
    url: "https://budharoomsapp.web.app",
    siteName: "Budha Rooms",
    images: [
      {
        url: "/logo_stitch.png",
        width: 1200,
        height: 630,
        alt: "Budha Rooms Logo - Guía",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Budha Rooms | Guía de Huéspedes",
    description: "Descubre Alicante con las recomendaciones de Budha Rooms.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="dark antialiased scroll-smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Cinzel+Decorative:wght@400;700;900&family=Noto+Serif:ital,wght@0,300;0,400;0,700;1,400&family=Marcellus&family=Manrope:wght@300;400;600&family=Pirata+One&display=swap" rel="stylesheet" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body min-h-screen bg-background text-on-background flex flex-col m-0 p-0 overflow-x-hidden relative" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
