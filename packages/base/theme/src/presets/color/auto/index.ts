import type { ThemeConfig } from '../../../theme/types.ts'
import {
  autumnDawnTheme,
  autumnDuskTheme,
  springDawnTheme,
  springDuskTheme,
  summerDawnTheme,
  summerDuskTheme,
  winterDawnTheme,
  winterDuskTheme,
} from './combined/index.ts'
import { dawnTheme, duskTheme } from './day-night/index.ts'
import { autumnTheme, springTheme, summerTheme, winterTheme } from './season/index.ts'

export {
  autumnDawnTheme,
  autumnDuskTheme,
  autumnTheme,
  dawnTheme,
  duskTheme,
  springDawnTheme,
  springDuskTheme,
  springTheme,
  summerDawnTheme,
  summerDuskTheme,
  summerTheme,
  winterDawnTheme,
  winterDuskTheme,
  winterTheme,
}

export const autoList: ThemeConfig[] = [
  springDawnTheme,
  springDuskTheme,
  summerDawnTheme,
  summerDuskTheme,
  autumnDawnTheme,
  autumnDuskTheme,
  winterDawnTheme,
  winterDuskTheme,
  dawnTheme,
  duskTheme,
  springTheme,
  summerTheme,
  autumnTheme,
  winterTheme,
]
