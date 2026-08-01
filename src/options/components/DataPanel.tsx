import { useRef, useState } from 'react'
import type { ImportResult } from '../../shared/types'
import { Field, Notice, PrimaryButton, SecondaryButton, Section } from './ui'
import type { OptionsStore } from '../store'

interface DataPanelProps {
  exportToFile: OptionsStore['exportToFile']
  copyExport: OptionsStore['copyExport']
  importFromText: OptionsStore['importFromText']
}

export function DataPanel({ exportToFile, copyExport, importFromText }: DataPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [busy, setBusy] = useState(false)

  async function onFile(file: File) {
    setBusy(true)
    try {
      const text = await file.text()
      await importFromText(text, file.name)
      // Re-read the actual outcome via a fresh import for feedback.
      const outcome = await (async () => {
        try {
          const { parseImport } = await import('../../shared/import-export')
          return parseImport(text)
        } catch {
          return null
        }
      })()
      setResult(outcome)
    } catch (err) {
      setResult({ ok: false, errors: [String(err)] })
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Section
        title="Backup & restore"
        description="Exports are plain JSON containing only your settings and per-site rules — nothing else."
      >
        <div className="flex flex-wrap gap-2">
          <PrimaryButton onClick={() => void exportToFile()}>Download export</PrimaryButton>
          <SecondaryButton onClick={() => void copyExport()}>Copy to clipboard</SecondaryButton>
          <SecondaryButton onClick={() => fileRef.current?.click()}>{busy ? 'Importing…' : 'Import from file'}</SecondaryButton>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label="Import JSON file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void onFile(file)
            }}
          />
        </div>
      </Section>

      {result && (
        <Section title="Import result">
          {result.ok ? (
            <div className="flex flex-col gap-2">
              <Notice>
                Imported {result.settings.enabled ? 'enabled' : 'disabled'} theme, {result.rules.length} rule(s).
              </Notice>
              {result.warnings.length > 0 && (
                <ul className="list-inside list-disc text-xs text-amber-300">
                  {result.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
              <p className="font-semibold">Import failed</p>
              <ul className="mt-1 list-inside list-disc">
                {result.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      )}

      <Section title="Privacy note">
        <p className="text-xs leading-relaxed text-slate-500">
          Settings sync to your Google account via <code>chrome.storage.sync</code> when you're signed in — this is browser
          sync, not our servers. Per-site rules stay in <code>chrome.storage.local</code> on this device. The site
          analyzer never sends page data anywhere: everything runs on your machine.
        </p>
      </Section>

      <Field label="" htmlFor="">
        <></>
      </Field>
    </div>
  )
}
