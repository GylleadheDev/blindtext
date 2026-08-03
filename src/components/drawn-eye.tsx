/**
 * Olho traçado à mão — o ícone de "espiar" do rodapé do campo, em escala de marca.
 * Decorativo: não carrega informação que o resto da página já não diga, por isso
 * fica fora da árvore de acessibilidade.
 *
 * A piscada é toda em CSS (`.olho:hover`, em globals.css). Traços com pesos
 * diferentes e curvas assimétricas de propósito: simetria perfeita mata o
 * desenho à mão.
 */
export function DrawnEye({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* pálpebra fechada: só aparece no instante da piscada */}
      <g className="olho-tampa">
        <path className="olho-traco" strokeWidth={4} d="M11 45C34 57 84 57 109 43" />
        <path className="olho-traco" strokeWidth={3} d="M40 54L37 63" />
        <path className="olho-traco" strokeWidth={3} d="M76 53L80 62" />
      </g>

      <g className="olho-globo">
        <path className="olho-traco" strokeWidth={4} d="M11 45C22 23 40 14 58 15C78 16 99 28 109 43" />
        <path className="olho-traco" strokeWidth={4} d="M11 45C21 61 39 69 58 68C79 67 100 57 109 43" />

        {/* cílios: comprimentos e ângulos irregulares */}
        <path className="olho-traco" strokeWidth={3} d="M27 26L20 17" />
        <path className="olho-traco" strokeWidth={3} d="M48 16L45 6" />
        <path className="olho-traco" strokeWidth={3} d="M73 17L79 8" />

        <ellipse className="olho-traco" strokeWidth={3.5} cx={58} cy={43} rx={16} ry={16.5} />
        <circle cx={57} cy={43} r={6.5} fill="currentColor" />
        <circle cx={63} cy={37} r={2.6} className="fill-background" />
      </g>
    </svg>
  )
}
