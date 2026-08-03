"use client"

import * as React from "react"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { MAX_CHARS } from "@/lib/languages"

type BlurredInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  /** Controles da barra inferior à direita (idioma + ação). */
  actions: React.ReactNode
}

export function BlurredInput({
  value,
  onChange,
  onSubmit,
  disabled,
  actions,
}: BlurredInputProps) {
  const [peeking, setPeeking] = React.useState(false)
  const overLimit = value.length > MAX_CHARS

  // Revelar enquanto Ctrl + Shift estiver segurado. Sem preventDefault: só
  // observamos os modificadores, nenhum atalho do navegador é bloqueado.
  React.useEffect(() => {
    const segurou = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey) setPeeking(true)
    }
    // no keyup do próprio modificador ele já sai como false
    const soltou = (event: KeyboardEvent) => {
      if (!(event.ctrlKey && event.shiftKey)) setPeeking(false)
    }
    // Ctrl+Shift+I, alt+tab: a janela perde o foco e o keyup nunca chega.
    // Sem isto o campo ficaria revelado sem ninguém segurando nada.
    const largou = () => setPeeking(false)

    window.addEventListener("keydown", segurou)
    window.addEventListener("keyup", soltou)
    window.addEventListener("blur", largou)
    document.addEventListener("visibilitychange", largou)

    return () => {
      window.removeEventListener("keydown", segurou)
      window.removeEventListener("keyup", soltou)
      window.removeEventListener("blur", largou)
      document.removeEventListener("visibilitychange", largou)
    }
  }, [])

  return (
    <div data-espiando={peeking} className="space-y-2">
      <Label htmlFor="texto" className="text-sm font-medium">
        Seu texto
      </Label>

      <div
        className={cn(
          "rounded-xl border border-input bg-card transition-colors",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          overLimit && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20"
        )}
      >
        <Textarea
          id="texto"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault()
              onSubmit()
            }
          }}
          disabled={disabled}
          placeholder="Comece a digitar. O que você escrever fica desfocado até você traduzir."
          // O corretor do teclado consertaria os erros ANTES da IA e mataria a graça.
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          rows={6}
          className="veu min-h-48 max-h-96 resize-none border-0 bg-transparent p-4 text-lg leading-relaxed focus-visible:border-transparent focus-visible:ring-0 md:text-lg"
        />

        {/* justify-end e não justify-between: sem a dica à esquerda, o between
            jogaria contador e idioma pro canto oposto. */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-input px-3 py-2">

          <div className="flex items-center gap-3">
            {/* sem aria-live: anunciaria a contagem a cada tecla digitada */}
            <span
              className={cn(
                "text-xs tabular-nums",
                overLimit ? "font-medium text-destructive" : "text-muted-foreground"
              )}
            >
              {value.length.toLocaleString("pt-BR")}/{MAX_CHARS.toLocaleString("pt-BR")}
            </span>
            {actions}
          </div>
        </div>
      </div>
    </div>
  )
}
