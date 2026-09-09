export type ImpactEvent = { id: number; x: number; y: number; kind: 'hit' | 'miss' | 'pickup'; created: number }
export function Impact({ effect }: { effect: ImpactEvent }) {
  return <div aria-hidden="true" className={`tc-impact tc-impact-${effect.kind}`} style={{left: `${effect.x}%`, top: `${effect.y}%`}}>
    {effect.kind === 'pickup' ? <strong>+150</strong> : <>
      <svg viewBox="0 0 64 48" shapeRendering="crispEdges">
        <path fill="#7c2032" d="M25 8h12v6h8v7h8v10H42v8H23v-5H12v-9h7v-9h6zM5 8h7v6H5zM48 3h7v8h-7zM55 36h6v6h-6zM3 34h8v5H3z"/>
        <path fill="#e64738" d="M25 12h11v7h9v6h6v5H39v7H26v-6H15v-5h9zM8 5h5v5H8zM47 10h6v5h-6zM8 36h6v4H8zM53 34h5v5h-5z"/>
        <path fill="#ff8c5c" d="M26 17h8v4h-8zM19 26h7v3h-7zM38 24h6v3h-6zM32 30h4v3h-4z"/>
        <path fill="#ffe2a0" d="M29 20h3v2h-3zM38 28h3v2h-3z"/>
      </svg>
      {effect.kind === 'hit' && <strong>SPLAT!</strong>}
    </>}
  </div>
}
