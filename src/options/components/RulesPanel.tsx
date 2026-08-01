import { useState } from 'react'
import { isPatternValid, matchesPattern } from '../../shared/url'
import type { RuleAction, SiteRule, Strategy, Mode } from '../../shared/types'
import { emptyDraft, type OptionsStore, type RuleDraft } from '../store'
import { Field, inputClass, PrimaryButton, SecondaryButton, Section, ToggleSwitch } from './ui'

interface RulesPanelProps {
  rules: SiteRule[]
  addRule: OptionsStore['addRule']
  updateRule: OptionsStore['updateRule']
  deleteRule: OptionsStore['deleteRule']
}

const selectClass = inputClass + ' w-auto min-w-24'

export function RulesPanel({ rules, addRule, updateRule, deleteRule }: RulesPanelProps) {
  const [draft, setDraft] = useState<RuleDraft>(emptyDraft())
  const [testHost, setTestHost] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const patternValid = isPatternValid(draft.pattern)
  const previewMatches = patternValid && testHost.trim() !== '' && matchesPattern(draft.pattern, testHost.trim())

  async function submit() {
    if (!patternValid) return
    const ok = await addRule({
      pattern: draft.pattern,
      enabled: draft.enabled,
      action: draft.action,
      strategy: draft.strategy === '' ? undefined : (draft.strategy as Strategy),
      mode: draft.mode === '' ? undefined : (draft.mode as Mode),
    })
    if (ok) setDraft(emptyDraft())
  }

  return (
    <div className="flex flex-col gap-4">
      <Section title="Add a rule" description="Patterns match hostnames: example.com (apex + subdomains), *.example.com (subdomains only).">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Hostname pattern" htmlFor="rule-pattern">
            <input
              id="rule-pattern"
              className={inputClass}
              placeholder="example.com"
              value={draft.pattern}
              onChange={(e) => setDraft({ ...draft, pattern: e.target.value })}
              aria-invalid={draft.pattern !== '' && !patternValid}
            />
            {draft.pattern !== '' && !patternValid && (
              <p className="mt-1 text-[11px] text-rose-400">Enter a valid hostname pattern.</p>
            )}
          </Field>
          <Field label="Action" htmlFor="rule-action">
            <select
              id="rule-action"
              className={selectClass}
              value={draft.action}
              onChange={(e) => setDraft({ ...draft, action: e.target.value as RuleAction })}
            >
              <option value="disable">Disable theme here</option>
              <option value="enable">Force theme here</option>
            </select>
          </Field>
          <Field label="Strategy override (optional)" htmlFor="rule-strategy">
            <select
              id="rule-strategy"
              className={selectClass}
              value={draft.strategy}
              onChange={(e) => setDraft({ ...draft, strategy: e.target.value as Strategy | '' })}
            >
              <option value="">Inherit</option>
              <option value="filter">CSS filter</option>
              <option value="css">CSS variables</option>
            </select>
          </Field>
          <Field label="Mode override (optional)" htmlFor="rule-mode">
            <select
              id="rule-mode"
              className={selectClass}
              value={draft.mode}
              onChange={(e) => setDraft({ ...draft, mode: e.target.value as Mode | '' })}
            >
              <option value="">Inherit</option>
              <option value="dark">Dark</option>
              <option value="night">Night</option>
              <option value="oled">OLED</option>
            </select>
          </Field>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} className="accent-indigo-500" />
            Rule enabled
          </label>
          <PrimaryButton onClick={() => void submit()} disabled={!patternValid}>
            Add rule
          </PrimaryButton>
          <SecondaryButton onClick={() => setShowPreview((v) => !v)}>Preview match</SecondaryButton>
        </div>

        {showPreview && (
          <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <Field label="Test hostname" htmlFor="rule-test">
              <input
                id="rule-test"
                className={inputClass}
                placeholder="sub.example.com"
                value={testHost}
                onChange={(e) => setTestHost(e.target.value)}
              />
            </Field>
            <p className="mt-2 text-xs">
              {testHost.trim() === ''
                ? 'Type a hostname to test the pattern above.'
                : previewMatches
                  ? '✓ This hostname matches the pattern.'
                  : '✗ No match.'}
            </p>
          </div>
        )}
      </Section>

      <Section title={`Rules (${rules.length})`}>
        {rules.length === 0 ? (
          <p className="text-xs text-slate-500">No per-site rules yet. Rules override the global theme for specific sites.</p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {rules.map((rule) => (
              <li key={rule.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <ToggleSwitch
                  checked={rule.enabled}
                  label={`Rule for ${rule.pattern}`}
                  onChange={(v) => void updateRule(rule.id, { enabled: v })}
                />
                <code className="rounded bg-slate-800 px-2 py-0.5 text-xs text-indigo-300">{rule.pattern}</code>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${rule.action === 'disable' ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                  {rule.action}
                </span>
                {rule.strategy && <span className="text-[11px] text-slate-500">{rule.strategy} strategy</span>}
                {rule.mode && <span className="text-[11px] text-slate-500">{rule.mode} mode</span>}
                <button
                  type="button"
                  onClick={() => void deleteRule(rule.id)}
                  aria-label={`Delete rule for ${rule.pattern}`}
                  className="ml-auto rounded-md px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300 focus-visible:outline-2 focus-visible:outline-rose-400"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}
