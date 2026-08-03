"use client"

import * as React from "react"
import { AlertTriangle, Loader2, Sparkles } from "lucide-react"

import { translate } from "@/actions/translate"
import { BlurredInput } from "@/components/blurred-input"
import { ResultCard, type CopyState } from "@/components/result-card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DEFAULT_LANGUAGE,
  findLanguage,
  LANGUAGE_ITEMS,
  LANGUAGES,
  MAX_CHARS,
  type Language,
  type LanguageCode,
} from "@/lib/languages"
import { withTimeout } from "@/lib/with-timeout"

/** Teto do client. Maior que os 25s do servidor, pra o erro dele chegar primeiro. */
const CLIENT_TIMEOUT_MS = 30_000

type Result = {
  runId: number
  text: string
  simulated: boolean
  language: Language
}

type Failure = { message: string; traceId?: string }

export function BlindComposer() {
  const [text, setText] = React.useState("")
  const [languageCode, setLanguageCode] = React.useState<LanguageCode>(DEFAULT_LANGUAGE)
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<Result | null>(null)
  const [failure, setFailure] = React.useState<Failure | null>(null)
  const [copyState, setCopyState] = React.useState<CopyState>("idle")
  const runIdRef = React.useRef(0)
  const copyTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // Cada limpeza total invalida traduções em voo: uma resposta que chega depois
  // do Ctrl+Backspace não pode repovoar a tela que acabou de esvaziar.
  const clearGenerationRef = React.useRef(0)

  React.useEffect(() => () => clearTimeout(copyTimerRef.current), [])

  // Ctrl+Backspace limpa campo E resultado de uma vez. Fora do textarea também:
  // é um atalho global do app, não um gesto de edição do campo.
  React.useEffect(() => {
    const limpar = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Backspace") {
        event.preventDefault()
        clearGenerationRef.current += 1
        setText("")
        setResult(null)
        setFailure(null)
        setCopyState("idle")
        clearTimeout(copyTimerRef.current)
      }
    }
    window.addEventListener("keydown", limpar)
    return () => window.removeEventListener("keydown", limpar)
  }, [])

  const trimmed = text.trim()
  const blocked = loading || trimmed.length === 0 || text.length > MAX_CHARS

  const copy = React.useCallback(async (value: string) => {
    try {
      // Falha em origem não-segura, com permissão negada, e quando a ativação
      // transitória do gesto expirou (o Chrome dá ~5s a partir do Ctrl+Enter).
      await navigator.clipboard.writeText(value)
      setCopyState("copied")
      clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopyState("idle"), 2000)
    } catch (error) {
      // Não dizer "copiado" sem ter copiado: a pessoa só descobriria ao colar.
      console.error("[blindtext] clipboard", error)
      setCopyState("failed")
    }
  }, [])

  async function handleSubmit(autoCopy = false) {
    if (blocked) return

    const language = findLanguage(languageCode)
    if (!language) return

    setLoading(true)
    setFailure(null)
    setResult(null)
    setCopyState("idle")

    // Linha de chegada da geração: se o Ctrl+Backspace rodar enquanto a
    // tradução está no ar, essa resposta é lixo e é descartada abaixo.
    const generation = clearGenerationRef.current

    try {
      const response = await withTimeout(
        translate({ text, language: languageCode }),
        CLIENT_TIMEOUT_MS,
        "translate"
      )

      if (generation !== clearGenerationRef.current) return

      if (response.ok) {
        runIdRef.current += 1
        setResult({
          runId: runIdRef.current,
          text: response.text,
          simulated: response.simulated,
          language,
        })
        // Sem await: o clipboard não pode segurar o desligamento do loading.
        if (autoCopy) void copy(response.text)
      } else {
        setFailure({ message: response.message, traceId: response.traceId })
      }
    } catch (error) {
      // Depois de limpar tudo, nem o caminho de erro repovoa a tela.
      if (generation !== clearGenerationRef.current) return
      console.error("[blindtext] translate", error)
      setFailure({
        message:
          error instanceof Error && error.name === "TimeoutError"
            ? "A tradução passou de 30s sem resposta. Seu texto continua aqui — tente de novo."
            : "Não foi possível concluir. Seu texto continua aqui — tente de novo.",
      })
    } finally {
      // Limpa no caminho feliz, no throw e no timeout. Nunca fica spinner preso.
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <BlurredInput
        value={text}
        onChange={setText}
        // só o atalho copia sozinho; o clique no botão continua sem mexer na
        // área de transferência
        onSubmit={() => handleSubmit(true)}
        disabled={loading}
        actions={
          <Select
            items={LANGUAGE_ITEMS}
            value={languageCode}
            onValueChange={(value) => {
              if (typeof value === "string") setLanguageCode(value as LanguageCode)
            }}
            disabled={loading}
          >
            <SelectTrigger size="sm" aria-label="Idioma de destino" className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <Button
        size="lg"
        className="h-11 w-full text-base"
        // arrow: onClick={handleSubmit} passaria o MouseEvent como `autoCopy`
        onClick={() => handleSubmit()}
        disabled={blocked}
        aria-busy={loading}
      >
        {loading ? <Loader2 className="animate-spin" aria-hidden /> : <Sparkles aria-hidden />}
        {loading ? "Traduzindo…" : "Traduzir e Revelar"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Ctrl + Enter envia e já copia o resultado
      </p>

      {failure ? (
        <div
          role="alert"
          className="aparecer flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          <span className="flex-1">{failure.message}</span>
          {failure.traceId ? (
            <code className="text-xs opacity-70">trace {failure.traceId}</code>
          ) : null}
          <Button variant="outline" size="sm" onClick={() => handleSubmit()} disabled={blocked}>
            Tentar de novo
          </Button>
        </div>
      ) : null}

      {/* Região viva sempre montada: leitor de tela costuma perder o anúncio quando o
          próprio aria-live entra no DOM junto com o conteúdo. */}
      <div aria-live="polite">
        {result ? (
          <ResultCard
            key={result.runId}
            text={result.text}
            simulated={result.simulated}
            language={result.language}
            copyState={copyState}
            onCopy={() => void copy(result.text)}
          />
        ) : null}
      </div>
    </div>
  )
}
