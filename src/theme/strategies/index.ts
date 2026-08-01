import type { Strategy } from '../../shared/types'
import { cssVarsStrategy } from './css-vars'
import { filterStrategy } from './filter'
import type { ThemeStrategy } from './types'

export type { ThemeStrategy } from './types'

export const STRATEGIES: Record<Strategy, ThemeStrategy> = {
  filter: filterStrategy,
  css: cssVarsStrategy,
}

export function getStrategy(strategy: Strategy): ThemeStrategy {
  return STRATEGIES[strategy]
}
