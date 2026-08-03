"use client"

import { Check, Copy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Language } from "@/lib/languages"

export type CopyState = "idle" | "copied" | "failed"

type ResultCardProps = {
  text: string
  simulated: boolean
  language: Language
  copyState: CopyState
  onCopy: () => void
}

export function ResultCard({
  text,
  simulated,
  language,
  copyState,
  onCopy,
}: ResultCardProps) {
  return (
    <Card className="aparecer">
      <CardHeader className="border-b pb-4">
        <CardTitle>
          {language.promptName === null ? "Texto revisado" : `Traduzido para ${language.label}`}
        </CardTitle>
        <CardDescription>
          {simulated ? "Nenhuma chamada foi feita à OpenAI." : "Ortografia corrigida antes de traduzir."}
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          {simulated ? <Badge variant="secondary">modo simulação</Badge> : null}
          {copyState === "failed" ? (
            <span className="text-xs text-muted-foreground">não consegui copiar sozinho —</span>
          ) : null}
          <Button
            variant={copyState === "failed" ? "secondary" : "outline"}
            size="sm"
            onClick={onCopy}
            aria-label="Copiar resultado"
          >
            {copyState === "copied" ? <Check aria-hidden /> : <Copy aria-hidden />}
            {copyState === "copied" ? "Copiado" : "Copiar"}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <p
          // `lang` acerta a fonte do japonês/chinês e a pronúncia no leitor de tela;
          // `dir` alinha o árabe à direita.
          lang={language.code}
          dir={language.dir}
          className="text-lg leading-relaxed whitespace-pre-wrap"
        >
          {text}
        </p>
      </CardContent>
    </Card>
  )
}
