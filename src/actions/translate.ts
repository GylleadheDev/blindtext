"use server"

import { headers } from "next/headers"

import { findLanguage, MAX_CHARS } from "@/lib/languages"
import { complete } from "@/lib/openai"
import { checkRateLimit, clientKeyFrom } from "@/lib/rate-limit"

export type TranslateErrorCode =
  | "EMPTY"
  | "TOO_LONG"
  | "BAD_LANGUAGE"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "UPSTREAM"

export type TranslateResult =
  | { ok: true; text: string; simulated: boolean }
  | { ok: false; code: TranslateErrorCode; message: string; traceId?: string }

export type TranslateInput = {
  text: string
  language: string
}

/**
 * Retorna uma uniao discriminada em vez de dar throw de proposito: throw de Server
 * Action e higienizado em producao ("An error occurred in the Server Components
 * render"), o client perde a causa e o debug fica cego.
 */
export async function translate(input: TranslateInput): Promise<TranslateResult> {
  const traceId = crypto.randomUUID().slice(0, 8)

  try {
    const verdict = checkRateLimit(clientKeyFrom(await headers()))
    if (!verdict.allowed) {
      return {
        ok: false,
        code: "RATE_LIMITED",
        message: `Muitas traduções seguidas. Tente de novo em ${verdict.retryInSeconds}s.`,
      }
    }

    const text = input.text?.trim() ?? ""
    if (!text) {
      return { ok: false, code: "EMPTY", message: "Escreva alguma coisa antes de traduzir." }
    }

    // Limite espelhado do client — o client valida pra dar feedback, o servidor decide.
    if (text.length > MAX_CHARS) {
      return {
        ok: false,
        code: "TOO_LONG",
        message: `Texto acima do limite de ${MAX_CHARS.toLocaleString("pt-BR")} caracteres.`,
      }
    }

    const language = findLanguage(input.language)
    if (!language) {
      return { ok: false, code: "BAD_LANGUAGE", message: "Idioma não suportado." }
    }

    const outcome = await complete(text, language)

    if (outcome.status === "ok") {
      return { ok: true, text: outcome.text, simulated: outcome.simulated }
    }

    if (outcome.status === "timeout") {
      console.error(`[blindtext:${traceId}] upstream timeout`)
      return {
        ok: false,
        code: "TIMEOUT",
        message: "O tradutor demorou demais para responder.",
        traceId,
      }
    }

    console.error(`[blindtext:${traceId}] upstream error: ${outcome.detail}`)
    return {
      ok: false,
      code: "UPSTREAM",
      message: "O tradutor recusou a requisição.",
      traceId,
    }
  } catch (error) {
    // Erro real fica no log do servidor; o client recebe so o traceId pra correlacao.
    console.error(`[blindtext:${traceId}] unexpected`, error)
    return {
      ok: false,
      code: "UPSTREAM",
      message: "Falha inesperada ao processar o texto.",
      traceId,
    }
  }
}
