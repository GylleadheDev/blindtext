"use client"

import * as React from "react"

/** O que cai na área de transferência quando alguém tenta copiar/recortar. */
const PRANK = "ta copiando o que otário ??"

/**
 * Armadilha de vazamento. Qualquer cópia manual (Ctrl+C, menu de contexto,
 * menu Editar), recorte (Ctrl+X) ou arraste de seleção pra fora da página
 * nunca leva o texto real embora.
 *
 * Copiar e recortar grava a frase de zoação em vez do texto selecionado;
 * arrastar é cancelado antes de começar (o navegador monta o "fantasma" de
 * arraste com o conteúdo do dataTransfer, então matar o `dragstart` evita o
 * vazamento por drag-and-drop).
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

    // Arrastar seleção pra fora (outro app, barra de endereço) não passa pelo
    // clipboard — o `dragstart` é o único ponto de corte. O texto segue
    // selecionável, só o arraste que não sai.
    const bloquearArraste = (event: DragEvent) => event.preventDefault()
    document.addEventListener("dragstart", bloquearArraste, true)

    return () => {
      document.removeEventListener("copy", trap, true)
      document.removeEventListener("cut", trap, true)
      document.removeEventListener("dragstart", bloquearArraste, true)
    }
  }, [])

  return null
}
