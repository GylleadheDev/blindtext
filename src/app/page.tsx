import type { CSSProperties } from "react"

import { BlindComposer } from "@/components/blind-composer"
import { DrawnEye } from "@/components/drawn-eye"

// A contagem alimenta a largura do título; o `steps(9, end)` em globals.css
// corta uma letra por passo. Mudou a palavra, muda o steps junto.
const PALAVRA = "blindtext"

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-10 px-4 py-16">
      <header className="flex flex-col items-center">
        <h1
          className="veu titulo font-mono"
          style={{ "--letras": PALAVRA.length } as CSSProperties}
        >
          <span className="titulo-clip">{PALAVRA}</span>
          <span className="titulo-cursor" aria-hidden="true" />
        </h1>

        <div className="olho mt-8">
          <DrawnEye className="w-32" />
        </div>
      </header>

      <BlindComposer />
    </main>
  )
}
