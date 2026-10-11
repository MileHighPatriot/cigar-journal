import { nowIso } from '../data/repository'
import { type SeedCatalog, seedCatalog } from '../data/seed'
import { getRepo, reloadFromDisk, setMeta, whenSaved } from '../data/store'
import { isIos } from '../pwa/storage'
import { buildBackup } from './exportBackup'
import { applyBackup, type BackupContents, type ImportSummary } from './importBackup'

export async function makeBackup(onProgress?: (done: number, total: number) => void) {
  // Anything still on its way to disk goes in the backup too.
  await whenSaved()
  return buildBackup(getRepo(), onProgress)
}

export function markExported(): Promise<void> {
  return setMeta('lastExportAt', nowIso())
}

export async function importFile(
  file: Blob,
  contents: BackupContents,
  mode: 'merge' | 'replace',
): Promise<ImportSummary> {
  await whenSaved()
  const summary = await applyBackup(getRepo(), file, contents, mode)
  if (mode === 'replace') {
    // An older backup may hold a shorter cigar list. Top it up from the current one.
    await setMeta('seedVersion', 0)
    const { default: catalog } = await import('../seed/catalog.json')
    await seedCatalog(getRepo(), catalog as SeedCatalog)
  }
  await reloadFromDisk()
  return summary
}

export function canShareFile(file: File): boolean {
  return typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })
}

/** True when sharing should be the main way to hand a file over (the installed iPhone app). */
export function prefersShare(file: File): boolean {
  return isIos() && canShareFile(file)
}

/** Saves a small file right away. Must be called straight from a tap. */
export async function saveFileNow(file: File): Promise<boolean> {
  if (prefersShare(file)) {
    try {
      await navigator.share({ files: [file] })
      return true
    } catch {
      return false
    }
  }
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return true
}
