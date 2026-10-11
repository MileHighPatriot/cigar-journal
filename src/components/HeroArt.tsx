/**
 * What sits behind a page header: drifting smoke and a fine gold line drawing, like the
 * engraving on an old cigar box label. The label frame and corner studs are in finish.css.
 */

export type Etch = 'leaf' | 'leaves' | 'box' | 'rosette'

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
      <path d={LEAF.outline} strokeWidth="1.5" />
      <path d="M98.6 8Q101 220 98 470M101.4 8Q104 220 102 470" strokeWidth="1.1" />
      <path d={LEAF.veins} strokeWidth="1" />
      <path d={LEAF.fine} strokeWidth="0.6" opacity="0.6" />
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
  ...[0, 1, 2, 3, 4, 5].map((i) => ring(78, 17, 12, (i * Math.PI) / 3)),
  ...[0, 1, 2, 3].map((i) => ring(42, 13, 8, (i * Math.PI) / 2)),
].join('')

const CIGARS = Array.from({ length: 12 }, (_, i) => 70 + i * 19.4)

function Box() {
  return (
    <g>
      {/* The lid, standing open, with its label. */}
      <path className="etch-fill" d="M100 130L118 30H378L360 130Z" />
      <path
        d="M100 130L118 30H378L360 130ZM118 30l5-6h260l-5 6M383 24L365 124l-5 6"
        strokeWidth="1.4"
      />
      <path d="M116 120L130 42H366L352 120Z" strokeWidth="0.9" />
      <path d="M124 114L136 48H358L346 114Z" strokeWidth="0.5" />
      <ellipse cx="241" cy="81" rx="50" ry="25" strokeWidth="1.1" />
      <ellipse cx="241" cy="81" rx="43" ry="20" strokeWidth="0.6" />
      <path
        d="M241 66c9 8 9 22 0 30c-9-8-9-22 0-30ZM241 66v30M186 81h-36M296 81h36M150 81c6-6 12-6 18 0c-6 6-12 6-18 0ZM314 81c6-6 12-6 18 0c-6 6-12 6-18 0Z"
        strokeWidth="0.8"
      />
      {/* The box, and the row of cigars in it. */}
      <path className="etch-fill" d="M50 170L100 130H360L310 170Z" />
      {CIGARS.map((x) => (
        <path
          key={x}
          d={`M${r(x)} 166l38-31M${r(x + 16)} 166l38-31M${r(x + 14)} 154l16 0M${r(x + 19)} 150l16 0`}
          strokeWidth="0.8"
        />
      ))}
      <path
        d="M50 170L100 130H360L310 170ZM50 170H310V250H50ZM310 170L360 130V210L310 250"
        strokeWidth="1.5"
      />
      <path d="M70 186H290V236H70ZM76 192H284V230H76Z" strokeWidth="0.7" />
      <ellipse cx="180" cy="211" rx="34" ry="13" strokeWidth="0.9" />
      <path d="M96 211h44M220 211h44M172 170v-4h16v4M174 170v12h12v-12" strokeWidth="1" />
      <path
        d="M318 176v66M326 170v66M334 163v66M342 157v66M350 150v66"
        strokeWidth="0.5"
        opacity="0.7"
      />
    </g>
  )
}

function Etching({ art }: { art: Etch }) {
  const box =
    art === 'box' ? '20 10 380 250' : art === 'rosette' ? '-100 -100 200 200' : '0 0 420 300'
  return (
    <svg className="etching" aria-hidden="true" viewBox={box} preserveAspectRatio="xMaxYMid meet">
      {art === 'leaf' && <Leaf turn={38} x={150} y={330} scale={0.74} />}
      {art === 'leaves' && (
        <>
          <Leaf turn={-34} x={250} y={320} scale={0.66} />
          <Leaf turn={30} x={230} y={326} scale={0.72} />
        </>
      )}
      {art === 'box' && <Box />}
      {art === 'rosette' && (
        <g className="turn">
          <path d={ROSETTE} strokeWidth="0.45" />
          <circle r="97" strokeWidth="0.8" />
          <circle r="26" strokeWidth="0.6" />
        </g>
      )}
    </svg>
  )
}

export function HeroArt({ art }: { art?: Etch }) {
  return (
    <span className="hero-fx" aria-hidden="true">
      {art && <Etching art={art} />}
      <span className="smoke smoke-a" />
      <span className="smoke smoke-b" />
    </span>
  )
}
