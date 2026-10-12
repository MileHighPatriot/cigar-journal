/**
 * The line drawings and the smoke. The drawings are fine gold engravings, the kind printed
 * on an old cigar box label: one sits beside each page title and a larger one fills each
 * empty screen. Line weights are set in finish.css and stay the same at any size.
 */
import { useId } from 'react'

export type Etch = 'leaf' | 'leaves' | 'box' | 'emptybox' | 'rosette' | 'ashtray' | 'pair'

const r = (value: number) => value.toFixed(1)

/** Half the width of a tobacco leaf at height y, in a 200 by 440 box with the tip at the top. */
function half(y: number): number {
  const t = Math.min(1, Math.max(0, (y - 12) / 400))
  return 84 * Math.sin(Math.PI * t ** 0.78) + 2 * Math.sin(y / 8)
}

function leafOutline(): string {
  let left = ''
  let right = ''
  for (let y = 12; y <= 412; y += 8) {
    left += `${y === 12 ? 'M' : 'L'}${r(100 - half(y))} ${y}`
    right = `L${r(100 + half(y))} ${y}${right}`
  }
  return `${left}${right}Z`
}

function leafVeins(step: number, from: number, reach: number): string {
  let d = ''
  for (let y = from; y <= 392; y += step) {
    const tip = y - 40 - y * 0.04
    for (const side of [-1, 1]) {
      const end = half(tip) * reach * side
      d += `M100 ${y}C${r(100 + end * 0.3)} ${r(y - 5)} ${r(100 + end * 0.74)} ${r(tip + 14)} ${r(100 + end)} ${r(tip)}`
    }
  }
  return d
}

const LEAF = {
  outline: leafOutline(),
  veins: leafVeins(30, 62, 0.97),
  fine: leafVeins(30, 77, 0.6),
}

function Leaf({ turn, x, y, scale }: { turn: number; x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn}) scale(${scale}) translate(-100 -440)`}>
      <path className="etch-fill" d={LEAF.outline} />
      <path className="l1" d={LEAF.outline} />
      <path className="l2" d="M98.6 8Q101 220 98 470M101.4 8Q104 220 102 470" />
      <path className="l2" d={LEAF.veins} />
      <path className="l3" d={LEAF.fine} />
    </g>
  )
}

/** Woven rings, the kind printed behind the crest on a box label. */
function ring(radius: number, depth: number, lobes: number, phase: number): string {
  let d = ''
  for (let step = 0; step <= 240; step++) {
    const angle = (step / 240) * Math.PI * 2
    const reach = radius + depth * Math.cos(lobes * angle + phase)
    d += `${step === 0 ? 'M' : 'L'}${r(reach * Math.cos(angle))} ${r(reach * Math.sin(angle))}`
  }
  return `${d}Z`
}

const ROSETTE = [
  ...[0, 1, 2, 3, 4, 5].map((i) => ring(74, 17, 12, (i * Math.PI) / 3)),
  ...[0, 1, 2, 3].map((i) => ring(38, 12, 8, (i * Math.PI) / 2)),
].join('')

function Rosette() {
  return (
    <g className="turn">
      <path className="l3" d={ROSETTE} />
      <circle className="l1" r="97" />
      <circle className="l3" r="93" />
      <circle className="l2" r="22" />
      <path className="etch-solid" d="M0-9L2.6-2.6L9 0L2.6 2.6L0 9L-2.6 2.6L-9 0L-2.6-2.6Z" />
    </g>
  )
}

/** One cigar from its foot (the lit end) to its head, as an outline and its inner lines. */
function cigar(fx: number, fy: number, hx: number, hy: number, radius: number) {
  const length = Math.hypot(hx - fx, hy - fy)
  const dx = (hx - fx) / length
  const dy = (hy - fy) / length
  const nx = -dy * radius
  const ny = dx * radius
  const at = (along: number, side: number) =>
    `${r(fx + dx * along + nx * side)} ${r(fy + dy * along + ny * side)}`
  const cross = (along: number) => `M${at(along, 1)}L${at(along, -1)}`
  const body = length - radius
  const outline = `M${at(0, 1)}L${at(body, 1)}A${radius} ${radius} 0 0 0 ${at(body, -1)}L${at(0, -1)}Z`
  const band = cross(length * 0.66) + cross(length * 0.66 + radius * 1.5)
  const crest = `M${at(length * 0.66 + radius * 0.75, 0.45)}L${at(length * 0.66 + radius * 0.75, -0.45)}`
  const ash = cross(radius * 1.1)
  let seams = ''
  for (let along = radius * 3; along < length * 0.6; along += radius * 2.6) {
    seams += `M${at(along, 1)}L${at(along + radius * 1.5, -1)}`
  }
  const flecks = `M${at(radius * 0.3, 0.4)}L${at(radius * 0.7, 0.55)}M${at(radius * 0.35, -0.3)}L${at(radius * 0.8, -0.5)}M${at(radius * 0.5, 0)}L${at(radius * 0.85, 0.1)}`
  return { outline, band, crest, ash, seams, flecks }
}

function Cigar({ shape }: { shape: ReturnType<typeof cigar> }) {
  return (
    <>
      <path className="etch-fill" d={shape.outline} />
      <path className="l1" d={shape.outline} />
      <path className="l1" d={shape.band} />
      <path className="l2" d={shape.crest + shape.ash} />
      <path className="l3" d={shape.seams + shape.flecks} />
    </>
  )
}

const BOX_ROW = Array.from({ length: 9 }, (_, i) => 62 + i * 26.4)

function Box({ full }: { full: boolean }) {
  return (
    <g>
      {/* The lid, standing open, with its label. */}
      <path className="etch-fill" d="M100 130L118 30H378L360 130Z" />
      <path
        className="l1"
        d="M100 130L118 30H378L360 130ZM118 30l5-6h260l-5 6M383 24L365 124l-5 6"
      />
      <path className="l2" d="M116 120L130 42H366L352 120Z" />
      <path className="l3" d="M124 114L136 48H358L346 114Z" />
      <ellipse className="l2" cx="241" cy="81" rx="50" ry="25" />
      <ellipse className="l3" cx="241" cy="81" rx="43" ry="20" />
      <path
        className="l3"
        d="M241 66c9 8 9 22 0 30c-9-8-9-22 0-30ZM241 66v30M186 81h-36M296 81h36M150 81c6-6 12-6 18 0c-6 6-12 6-18 0ZM314 81c6-6 12-6 18 0c-6 6-12 6-18 0Z"
      />
      {/* The box, and the row of cigars in it. */}
      <path className="etch-fill" d="M50 170L100 130H360L310 170Z" />
      {full ? (
        <path
          className="l2"
          d={BOX_ROW.map(
            (x) =>
              `M${r(x)} 166l38-31${x < 270 ? `M${r(x + 17.2)} 152h26.4M${r(x + 22.1)} 148h26.4` : ''}`,
          ).join('')}
        />
      ) : (
        <path className="l3" d="M66 166L108 135H348L302 166ZM108 135v10M348 135v8" />
      )}
      <path
        className="l1"
        d="M50 170L100 130H360L310 170ZM50 170H310V250H50ZM310 170L360 130V210L310 250"
      />
      <path className="l3" d="M70 186H290V236H70ZM76 192H284V230H76Z" />
      <ellipse className="l2" cx="180" cy="211" rx="34" ry="13" />
      <path className="l2" d="M96 211h44M220 211h44M172 170v-4h16v4M174 170v12h12v-12" />
      <path className="l3" d="M318 176v66M326 170v66M334 163v66M342 157v66M350 150v66" />
    </g>
  )
}

const RESTING = cigar(128, 166, 318, 132, 11)

/** An ashtray with a cigar resting on its rim and smoke rising off the foot. */
function Ashtray({ id }: { id: string }) {
  return (
    <g>
      <mask id={id}>
        <rect x="0" y="0" width="340" height="250" fill="#fff" />
        <path d={RESTING.outline} fill="#000" />
      </mask>
      <g mask={`url(#${id})`}>
        <path className="etch-fill" d="M30 168C34 214 76 232 150 232C224 232 266 214 270 168Z" />
        <ellipse className="l1" cx="150" cy="168" rx="120" ry="30" />
        <ellipse className="l2" cx="150" cy="170" rx="98" ry="21" />
        <path className="l1" d="M30 168C34 214 76 232 150 232C224 232 266 214 270 168" />
        <path className="l3" d="M52 196C80 214 220 214 248 196M70 210C100 224 200 224 230 210" />
        <path className="l2" d="M96 232h108" />
      </g>
      <Cigar shape={RESTING} />
      <path className="l2 wisp" d="M124 160C96 132 150 112 122 84C100 62 140 44 120 14" />
      <path className="l3 wisp" d="M132 158C116 136 162 120 140 92C124 72 158 54 146 30" />
    </g>
  )
}

const PAIR_A = cigar(46, 196, 286, 44, 13)
const PAIR_B = cigar(274, 196, 34, 44, 13)

function Pair({ id }: { id: string }) {
  return (
    <g>
      <mask id={id}>
        <rect x="0" y="0" width="320" height="240" fill="#fff" />
        <path d={PAIR_A.outline} fill="#000" />
      </mask>
      <g mask={`url(#${id})`}>
        <Cigar shape={PAIR_B} />
      </g>
      <Cigar shape={PAIR_A} />
    </g>
  )
}

const VIEW: Record<Etch, string> = {
  leaf: '118 96 344 268',
  leaves: '40 40 400 312',
  box: '44 18 346 238',
  emptybox: '44 18 346 238',
  rosette: '-100 -100 200 200',
  ashtray: '20 4 318 236',
  pair: '14 22 292 196',
}

/** One drawing. It scales to fit whatever box it is given and keeps to the right of it. */
export function Etching({ art, className }: { art: Etch; className?: string }) {
  const id = useId()
  return (
    <svg
      className={className ? `etch ${className}` : 'etch'}
      aria-hidden="true"
      viewBox={VIEW[art]}
      preserveAspectRatio={className === 'empty-art' ? 'xMidYMid meet' : 'xMaxYMid meet'}
    >
      {art === 'leaf' && <Leaf turn={60} x={150} y={330} scale={0.74} />}
      {art === 'leaves' && (
        <>
          <Leaf turn={-34} x={250} y={320} scale={0.66} />
          <Leaf turn={30} x={230} y={326} scale={0.72} />
        </>
      )}
      {art === 'box' && <Box full />}
      {art === 'emptybox' && <Box full={false} />}
      {art === 'rosette' && <Rosette />}
      {art === 'ashtray' && <Ashtray id={id} />}
      {art === 'pair' && <Pair id={id} />}
    </svg>
  )
}

/** What sits behind a page header: the label frame (finish.css) and two layers of smoke. */
export function HeroArt() {
  return (
    <span className="hero-fx" aria-hidden="true">
      <span className="smoke smoke-a" />
      <span className="smoke smoke-b" />
    </span>
  )
}
