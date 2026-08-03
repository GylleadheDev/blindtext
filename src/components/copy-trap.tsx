"use client"

import * as React from "react"

/** O que cai na área de transferência quando alguém tenta copiar/recortar. */
const PRANK = "ta copiando o que otário ??"

/**
 * Armadilha de clipboard. Qualquer cópia manual (Ctrl+C, menu de contexto,
 * menu Editar) ou recorte (Ctrl+X) grava a frase de zoação em vez do texto
 * selecionado.
 *
 * O atalho Ctrl+Enter e o botão "Copiar" do resultado usam
 * `navigator.clipboard.writeText`, que NÃO dispara os eventos `copy`/`cut` —
 * então o caminho legítimo continua copiando o texto real, imune à armadilha.
 *
 * `copy`, `cut` e `paste` não borbulham: sem o `capture: true` o listener no
 * document perderia cópias feitas dentro do `<textarea>` com foco, que é
 * justamente a brecha que queremos fechar.
 */
export function CopyTrap() {
  React.useEffect(() => {
    const trap = (event: ClipboardEvent) => {
      event.preventDefault()
      event.clipboardData?.setData("text/plain", PRANK)
    }

    document.addEventListener("copy", trap, true)
    // Cut também joga o texto pro clipboard — e ainda apagaria o campo. O
    // preventDefault segura o texto no lugar e troca o que vai pro clipboard.
    document.addEventListener("cut", trap, true)

    return () => {
      document.removeEventListener("copy", trap, true)
      document.removeEventListener("cut", trap, true)
    }
  }, [])

  return null
}
