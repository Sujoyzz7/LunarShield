import type { FilterParams } from '../../shared/types'
import type { Strategy } from '../../shared/types'

export interface StrategyContext {
  document: Document
  params: FilterParams
  /** True-black backgrounds (OLED mode) when the strategy supports it. */
  oled: boolean
  /** Whether to animate transitions. */
  transitions: boolean
}

export interface ThemeStrategy {
  readonly id: Strategy
  apply(ctx: StrategyContext): void
  cleanup(): void
}
