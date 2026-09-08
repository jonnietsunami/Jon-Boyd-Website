import type { ReactNode } from 'react'

function PixelArt({ children, viewBox, className }: { children: ReactNode; viewBox: string; className?: string }) {
  return <svg aria-hidden="true" viewBox={viewBox} className={className} shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">{children}</svg>
}

export function JonSprite() {
  return <PixelArt viewBox="0 0 32 56" className="tc-jon-art">
    <path fill="#161419" d="M11 1h12v2h3v5h1v11h-3v3h-2v2h5v3h2v10h-3v3h-2v10h3v5H16v-3h-2v3H3v-5h3V38H3V27h3v-3h5v-3H8v-3H6V8h2V3h3z"/>
    <path fill="#654637" d="M11 3h11v2h3v6H8V7h3z"/>
    <path fill="#99715a" d="M12 3h9v2h-9zM9 6h4v2H9z"/>
    <path fill="#d9a17a" d="M9 9h15v9h-3v4h-8v-3H9z"/>
    <path fill="#f1bd91" d="M12 9h11v7h-4v-2h-3v3h-4z"/>
    <path fill="#b77b59" d="M8 12h2v6H8zM23 12h2v5h-2zM17 14h2v3h-2z"/>
    <path fill="#29252a" d="M9 10h7v1h2v-1h7v5h-7v-3h-2v3H9z"/>
    <path fill="#8caaa7" d="M11 11h3v2h-3zM20 11h3v2h-3z"/>
    <path fill="#563a30" d="M10 16h3v2h8v-2h3v5h-3v2h-8v-2h-3z"/>
    <path fill="#edb68c" d="M15 18h5v1h-5zM14 23h7v2h-7z"/>
    <path fill="#24252b" d="M8 25h6v2h7v-2h4v3h2v6h-4v6H8v-6H5v-6h3z"/>
    <path fill="#35353c" d="M9 27h3v10H9zM14 28h8v1h-8z"/>
    <path fill="#101216" d="M19 31h4v9H10v-2h9z"/>
    {/* Jon faces the audience: his right hand and microphone are on screen-left. */}
    <path fill="#c58c65" d="M5 33h3v5H3v-9h3zM24 34h3v6h-3z"/>
    <path fill="#efb88e" d="M2 27h5v5H2zM25 34h2v4h-2z"/>
    <path fill="#12151c" d="M2 21h3v9H2zM1 17h5v5H1z"/>
    <path fill="#a5b6bc" d="M1 17h4v4H1z"/><path fill="#e4e6d9" d="M2 17h3v1H2z"/>
    <path fill="#9cb9cb" d="M8 40h15v5h-2v6h-5V44h-2v7H7z"/>
    <path fill="#c5d7dd" d="M9 41h4v8H9zM18 41h3v9h-3z"/>
    <path fill="#66859d" d="M14 40h2v4h-2zM7 48h6v3H7zM17 49h4v2h-4z"/>
    <path fill="#eee9dc" d="M6 51h7v3H4v-2h2zM17 51h5v1h4v2h-9z"/>
    <path fill="#9faeb5" d="M4 54h9v1H4zM17 54h9v1h-9z"/>
  </PixelArt>
}

export function TomatoSprite() {
  return <PixelArt viewBox="0 0 16 16"><path fill="#431d29" d="M5 3h7v2h2v2h1v6h-2v2H4v-1H2v-3H1V7h2V5h2z"/><path fill="#ce3f3b" d="M5 5h7v2h2v5h-2v2H5v-1H3V7h2z"/><path fill="#f66e50" d="M5 6h4v2H5zM4 8h2v3H4z"/><path fill="#962b35" d="M11 8h3v4h-2v2H6v-2h5z"/><path fill="#78a45b" d="M7 1h2v3h4v2H9v2H7V6H4V4h3z"/><path fill="#bed37a" d="M7 2h1v3H5V4h2z"/></PixelArt>
}

export function PopcornSprite() {
  return <PixelArt viewBox="0 0 20 24"><path fill="#322333" d="M3 8V4h3V1h5v2h5v3h2v5h1v3h-2v9H4v-9H1V8z"/><path fill="#f1d395" d="M3 8h2V5h3V3h3v3h4v2h2v5H3z"/><path fill="#fff1c7" d="M4 8h3v3H4zM8 4h3v4H8zM11 8h4v4h-4z"/><path fill="#eee4cf" d="M4 12h13l-2 10H6z"/><path fill="#da5551" d="M4 12h3v5h1v5H6zM10 12h2v10h-2zM15 12h2l-2 10h-1z"/><path fill="#fff7de" d="M3 11h15v2H3z"/></PixelArt>
}

export function ClubStage() {
  return <PixelArt viewBox="0 0 480 300" className="tc-stage">
    <defs>
      <pattern id="tc-brick" width="48" height="24" patternUnits="userSpaceOnUse"><rect width="48" height="24" fill="#352329"/><path fill="#663b36" d="M1 1h45v9H1zM1 13h21v9H1zM25 13h23v9H25z"/><path fill="#815044" d="M2 1h43v1H2zM2 13h19v1H2zM26 13h22v1H26z"/><path fill="#492d30" d="M2 9h43v1H2zM2 21h19v1H2zM26 21h22v1H26z"/><path fill="#72433b" d="M7 4h9v1H7zM30 6h11v1H30zM5 18h5v1H5zM35 16h5v1H35z"/></pattern>
      <radialGradient id="tc-warm"><stop stopColor="#ffcc7e" stopOpacity=".32"/><stop offset="1" stopColor="#ffcc7e" stopOpacity="0"/></radialGradient>
      <pattern id="tc-floor" width="80" height="14" patternUnits="userSpaceOnUse"><rect width="80" height="14" fill="#694538"/><path fill="#352a2c" d="M0 13h80v1H0zM0 0h1v13H0z"/><path fill="#906247" d="M2 1h76v1H2zM12 6h28v1H12zM54 9h19v1H54z"/></pattern>
    </defs>
    <rect width="480" height="300" fill="#191820"/><path fill="url(#tc-brick)" d="M20 0h440v217H20z"/>
    <ellipse cx="240" cy="107" rx="205" ry="164" fill="url(#tc-warm)"/>
    <path fill="#f8cc84" opacity=".06" d="M218 0h44l133 221H85z"/>
    <path fill="#30202a" d="M0 0h27v224H0zM453 0h27v224h-27z"/><path fill="#5a2932" d="M3 0h8v222H3zM17 0h5v222h-5zM458 0h6v222h-6zM471 0h6v222h-6z"/><path fill="#874137" d="M5 0h2v219H5zM459 0h2v219h-2z"/>
    <path fill="#221c25" d="M22 212h433v9H22z"/><path fill="#a2764e" d="M23 211h431v2H23z"/>
    <path fill="url(#tc-floor)" d="M0 221h480v46H0z"/><ellipse cx="240" cy="237" rx="142" ry="13" fill="#edb76a" opacity=".12"/>
    <path fill="#2a2028" d="M0 263h480v37H0z"/><path fill="#bb8553" d="M0 262h480v3H0z"/><path fill="#674130" d="M0 268h480v9H0z"/>
    {/* Empty microphone stand, weighted base and cable. */}
    <path fill="#24222b" d="M127 157h3v83h-3zM116 239h25v3h-25zM128 155h16v3h-16z"/><path fill="#8d8d89" d="M127 160h1v77h-1zM130 155h12v1h-12z"/><path fill="#171923" d="M141 152h9v5h-9zM143 157h2v80h17v8h37v2h-39v-8h-17z"/>
    {/* Wooden stool with a glass of water on its seat. */}
    <path fill="#25212a" d="M356 210h4l-4 34h-4zM378 210h4l5 34h-4zM356 232h28v3h-28z"/><path fill="#a76e45" d="M357 212h2l-4 30h-2zM379 212h2l5 30h-2zM357 231h25v2h-25z"/><path fill="#34232a" d="M349 205h39v7h-39z"/><path fill="#bc8252" d="M351 204h35v4h-35z"/><path fill="#e0b37b" d="M354 204h29v1h-29z"/>
    <path fill="#a3c8cc" opacity=".8" d="M365 190h9v14h-9z"/><path fill="#e2e8d9" d="M364 190h11v2h-11zM365 192h2v11h-2zM365 203h9v1h-9z"/><path fill="#71a1b1" d="M367 197h6v5h-6z"/>
    <path fill="#12151d" d="M209 0h62v7h-62zM226 7h28v6h-28z"/><path fill="#e9b873" d="M229 12h22v3h-22z"/>
  </PixelArt>
}

const shirts = ['#425565', '#713e45', '#675545', '#3a5b56', '#68516d', '#384257']
const hair = ['#211d26', '#8e6444', '#bbb0a0', '#3a2828', '#b88a51']
export function Crowd() {
  return <PixelArt viewBox="0 0 480 62" className="tc-crowd">
    {[0, 1].map(row => Array.from({ length: 13 }, (_, i) => {
      const x = i * 40 - 13 + row * 17
      const y = row * 25 + (i * 7 % 9)
      const long = i % 3 === 0
      return <g key={`${row}-${i}`} transform={`translate(${x} ${y})`}>
        <path fill="#161720" d="M10 0h14v3h4v16h-3v3h7v3h5v24H0V26h5v-4h6v-3H7V4h3z"/>
        <path fill={shirts[(i + row * 2) % shirts.length]} d="M7 23h22v3h5v21H3V28h4z"/>
        <path fill="#b98165" d="M13 16h10v9H13z"/>
        <path fill={hair[(i + row) % hair.length]} d={long ? 'M11 2h12v3h3v22H8V5h3z' : 'M11 2h12v3h3v11h-3v4H12v-3H9V5h2z'}/>
        <path fill="#e5ba8a" opacity=".2" d="M12 3h10v2H12zM10 6h2v6h-2z"/>
        <path fill="#ffffff" opacity=".07" d="M8 25h3v17H8zM12 25h13v2H12z"/>
        <path fill="#211d28" d="M4 39h30v4H4zM6 43h3v6H6zM29 43h3v6h-3z"/>
      </g>
    }))}
  </PixelArt>
}
