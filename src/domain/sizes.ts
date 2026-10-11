import type { Cigar, Smoke } from '../data/types'
import { formatSize } from './format'

export interface StandardSize {
  name: string
  /** Typical dimensions. Real cigars vary, so both can be edited after picking. */
  lengthIn: number
  ringGauge: number
}

export const STANDARD_SIZES: StandardSize[] = [
  { name: 'Robusto', lengthIn: 5, ringGauge: 50 },
  { name: 'Toro', lengthIn: 6, ringGauge: 52 },
  { name: 'Churchill', lengthIn: 7, ringGauge: 48 },
  { name: 'Corona', lengthIn: 5.5, ringGauge: 42 },
  { name: 'Gordo', lengthIn: 6, ringGauge: 60 },
  { name: 'Torpedo', lengthIn: 6.125, ringGauge: 52 },
  { name: 'Belicoso', lengthIn: 5.5, ringGauge: 52 },
  { name: 'Petit Corona', lengthIn: 4.5, ringGauge: 42 },
  { name: 'Corona Gorda', lengthIn: 5.625, ringGauge: 46 },
  { name: 'Lonsdale', lengthIn: 6.5, ringGauge: 42 },
  { name: 'Double Corona', lengthIn: 7.5, ringGauge: 50 },
  { name: 'Lancero', lengthIn: 7.5, ringGauge: 38 },
  { name: 'Perfecto', lengthIn: 5, ringGauge: 52 },
]

type SizeFields = Pick<Smoke, 'vitola' | 'lengthIn' | 'ringGauge'>

/** The size noted on the smoke, or the cigar's own size when the smoke has none. */
export function smokeSize(smoke: SizeFields, cigar: Cigar | undefined): string {
  const source: SizeFields | undefined =
    smoke.vitola || smoke.lengthIn || smoke.ringGauge ? smoke : cigar
  if (!source) return ''
  return [source.vitola, formatSize(source)].filter(Boolean).join(' · ')
}
