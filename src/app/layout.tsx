import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { CopyTrap } from "@/components/copy-trap";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "blindtext — escreva às cegas, revele traduzido",
  description:
    "Digite com o texto desfocado, escolha o idioma e receba de volta a versão corrigida e traduzida.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang="pt-BR" também suprime a oferta nativa de tradução do navegador sobre a UI
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CopyTrap />
        {children}
      </body>
    </html>
  );
}
