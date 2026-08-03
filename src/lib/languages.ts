export const LANGUAGES = [
  { code: "en", label: "Inglês", promptName: "English", dir: "ltr" },
  { code: "es", label: "Espanhol", promptName: "Spanish", dir: "ltr" },
  { code: "fr", label: "Francês", promptName: "French", dir: "ltr" },
  { code: "ja", label: "Japonês", promptName: "Japanese", dir: "ltr" },
  { code: "de", label: "Alemão", promptName: "German", dir: "ltr" },
  { code: "it", label: "Italiano", promptName: "Italian", dir: "ltr" },
  { code: "zh", label: "Chinês", promptName: "Simplified Chinese", dir: "ltr" },
  { code: "ko", label: "Coreano", promptName: "Korean", dir: "ltr" },
  { code: "ar", label: "Árabe", promptName: "Arabic", dir: "rtl" },
  // promptName null = so revisa a ortografia, nao traduz
  { code: "pt-BR", label: "Português (só revisar)", promptName: null, dir: "ltr" },
] as const satisfies ReadonlyArray<{
  code: string
  label: string
  promptName: string | null
  dir: "ltr" | "rtl"
}>

export type Language = (typeof LANGUAGES)[number]
export type LanguageCode = Language["code"]

export const DEFAULT_LANGUAGE: LanguageCode = "en"

export const MAX_CHARS = 5000

/** Referencia estavel — o Select do Base UI usa isto pra rotular o valor no trigger. */
export const LANGUAGE_ITEMS = LANGUAGES.map(({ code, label }) => ({
  value: code,
  label,
}))

/**
 * Allowlist. O prompt so interpola `promptName`, que sai daqui — nunca a string
 * que chegou do client. E isto que fecha injecao de prompt pelo campo de idioma.
 */
export function findLanguage(code: string): Language | undefined {
  return LANGUAGES.find((language) => language.code === code)
}
