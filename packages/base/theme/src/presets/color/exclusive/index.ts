import type { ThemeConfig } from '../../../theme/types.ts'
import { pineMistTheme } from './ancient/pine-mist/theme.ts'
import { ancientSharedStyleMeta } from './ancient/shared-style.ts'
import { songRhymeTheme } from './ancient/song-rhyme/theme.ts'
import { cyberSharedStyleMeta } from './cyber/shared-style.ts'
import { neonMagentaTheme } from './cyber/neon-magenta/theme.ts'
import { phantomTheme } from './cyber/phantom/theme.ts'
import { darkSharedStyleMeta } from './dark/shared-style.ts'
import { inkTheme } from './dark/ink/theme.ts'
import { midnightTheme } from './dark/midnight/theme.ts'
import { auroraTheme } from './future/aurora/theme.ts'
import { dawnTheme } from './future/dawn/theme.ts'
import { futureSharedStyleMeta } from './future/shared-style.ts'
import { hologramTheme } from './future/hologram/theme.ts'
import { starfieldTheme } from './future/starfield/theme.ts'
import { cleanTheme } from './light/clean/theme.ts'
import { lightSharedStyleMeta } from './light/shared-style.ts'
import { porcelainTheme } from './light/porcelain/theme.ts'
import { dataGridTheme } from './tech/data-grid/theme.ts'
import { techSharedStyleMeta } from './tech/shared-style.ts'
import { techGeekTheme } from './tech/tech-geek/theme.ts'

export {
  ancientSharedStyleMeta,
  auroraTheme,
  cleanTheme,
  cyberSharedStyleMeta,
  darkSharedStyleMeta,
  dawnTheme,
  dataGridTheme,
  futureSharedStyleMeta,
  hologramTheme,
  inkTheme,
  lightSharedStyleMeta,
  midnightTheme,
  neonMagentaTheme,
  phantomTheme,
  pineMistTheme,
  porcelainTheme,
  songRhymeTheme,
  starfieldTheme,
  techGeekTheme,
  techSharedStyleMeta,
}

export const exclusiveList: ThemeConfig[] = [
  cleanTheme,
  porcelainTheme,
  inkTheme,
  midnightTheme,
  pineMistTheme,
  songRhymeTheme,
  techGeekTheme,
  dataGridTheme,
  neonMagentaTheme,
  phantomTheme,
  auroraTheme,
  dawnTheme,
  hologramTheme,
  starfieldTheme,
]

export const sharedStyleMetaList = [
  lightSharedStyleMeta,
  darkSharedStyleMeta,
  ancientSharedStyleMeta,
  techSharedStyleMeta,
  cyberSharedStyleMeta,
  futureSharedStyleMeta,
] as const