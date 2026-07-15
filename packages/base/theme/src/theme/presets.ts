import { cleanTheme } from '../presets/color/exclusive/light/clean/theme.js'
import { porcelainTheme } from '../presets/color/exclusive/light/porcelain/theme.js'
import { midnightTheme } from '../presets/color/exclusive/dark/midnight/theme.js'
import { inkTheme } from '../presets/color/exclusive/dark/ink/theme.js'
import { pineMistTheme } from '../presets/color/exclusive/ancient/pine-mist/theme.js'
import { songRhymeTheme } from '../presets/color/exclusive/ancient/song-rhyme/theme.js'
import { techGeekTheme } from '../presets/color/exclusive/tech/tech-geek/theme.js'
import { dataGridTheme } from '../presets/color/exclusive/tech/data-grid/theme.js'
import { neonMagentaTheme } from '../presets/color/exclusive/cyber/neon-magenta/theme.js'
import { phantomTheme } from '../presets/color/exclusive/cyber/phantom/theme.js'
import { auroraTheme } from '../presets/color/exclusive/future/aurora/theme.js'
import { hologramTheme } from '../presets/color/exclusive/future/hologram/theme.js'
import { starfieldTheme } from '../presets/color/exclusive/future/starfield/theme.js'
import { dawnTheme } from '../presets/color/exclusive/future/dawn/theme.js'
import { morningMistTheme } from '../presets/color/shared/morning-mist/theme.js'
import { mintTheme } from '../presets/color/shared/mint/theme.js'
import { islandTheme } from '../presets/color/shared/island/theme.js'
import { skyTheme } from '../presets/color/shared/sky/theme.js'
import { softTheme } from '../presets/color/shared/soft/theme.js'
import { pinkTheme } from '../presets/color/shared/pink/theme.js'
import { orangeTheme } from '../presets/color/shared/orange/theme.js'
import { blueTheme } from '../presets/color/shared/blue/theme.js'
import { purpleTheme } from '../presets/color/shared/purple/theme.js'
import { greenTheme } from '../presets/color/shared/green/theme.js'
// auto 视觉：季节（4）
import { springTheme } from '../presets/color/auto/season/spring/theme.js'
import { summerTheme } from '../presets/color/auto/season/summer/theme.js'
import { autumnTheme } from '../presets/color/auto/season/autumn/theme.js'
import { winterTheme } from '../presets/color/auto/season/winter/theme.js'
// auto 视觉：昼夜（2）（避免与 future/dawn 同名冲突，前缀 auto-）
import { dawnTheme as autoDawnTheme } from '../presets/color/auto/day-night/dawn/theme.js'
import { duskTheme as autoDuskTheme } from '../presets/color/auto/day-night/dusk/theme.js'
// auto 视觉：季节 × 昼夜组合（10）
import { springDawnTheme } from '../presets/color/auto/combined/spring-dawn/theme.js'
import { springDuskTheme } from '../presets/color/auto/combined/spring-dusk/theme.js'
import { summerDawnTheme } from '../presets/color/auto/combined/summer-dawn/theme.js'
import { summerDuskTheme } from '../presets/color/auto/combined/summer-dusk/theme.js'
import { autumnDawnTheme } from '../presets/color/auto/combined/autumn-dawn/theme.js'
import { autumnDuskTheme } from '../presets/color/auto/combined/autumn-dusk/theme.js'
import { winterDawnTheme } from '../presets/color/auto/combined/winter-dawn/theme.js'
import { winterDuskTheme } from '../presets/color/auto/combined/winter-dusk/theme.js'
import type { ThemeConfig, BackgroundPresetInfo } from './types.js'

/** 基线亮色内置变体 (light/clean) */
export const lightPreset: ThemeConfig = cleanTheme
/** light 视觉风格双专属之一:瓷白(暖白底色) */
export const porcelainPreset: ThemeConfig = porcelainTheme
/** 基线深色内置变体(dark/midnight) */
export const darkPreset: ThemeConfig = midnightTheme
/** dark/midnight 别名 */
export const midnightPreset: ThemeConfig = midnightTheme
/** dark 视觉风格双专属之二:暗黑 */
export const inkPreset: ThemeConfig = inkTheme

/** 跨视觉通用 10 变体(独立配色,可被 6 套 VisualStyle 引用) */
export const morningMistPreset: ThemeConfig = morningMistTheme
export const mintPreset: ThemeConfig = mintTheme
export const islandPreset: ThemeConfig = islandTheme
/** ancient 视觉风格双专属之二:宋韵 */
export const songRhymePreset: ThemeConfig = songRhymeTheme
/** tech 视觉风格双专属之一:极客 */
export const techGeekPreset: ThemeConfig = techGeekTheme
/** tech 视觉风格双专属之二:数据 */
export const dataGridPreset: ThemeConfig = dataGridTheme
/** cyber 视觉风格双专属之二:幻影 */
export const phantomPreset: ThemeConfig = phantomTheme
/** future 视觉风格专属之二:全息 */
export const hologramPreset: ThemeConfig = hologramTheme
/** future 视觉风格专属之三:星海 */
export const starfieldPreset: ThemeConfig = starfieldTheme
/** future 视觉风格专属之四:晨曦 */
export const dawnPreset: ThemeConfig = dawnTheme
export const skyPreset: ThemeConfig = skyTheme
export const softPreset: ThemeConfig = softTheme
export const pinkPreset: ThemeConfig = pinkTheme
export const orangePreset: ThemeConfig = orangeTheme
export const bluePreset: ThemeConfig = blueTheme
export const purplePreset: ThemeConfig = purpleTheme
export const greenPreset: ThemeConfig = greenTheme

/** 所有内置变体默认主题配置 (供 ThemeManager presets 用) */
export const allBuiltinThemePresets: ThemeConfig[] = [
  cleanTheme,
  porcelainTheme,
  midnightTheme,
  inkTheme,
  pineMistTheme,
  songRhymeTheme,
  techGeekTheme,
  dataGridTheme,
  neonMagentaTheme,
  phantomTheme,
  auroraTheme,
  hologramTheme,
  starfieldTheme,
  dawnTheme,
  morningMistTheme,
  mintTheme,
  islandTheme,
  skyTheme,
  softTheme,
  pinkTheme,
  orangeTheme,
  blueTheme,
  purpleTheme,
  greenTheme,
  // auto 视觉：季节
  springTheme,
  summerTheme,
  autumnTheme,
  winterTheme,
  // auto 视觉：昼夜
  autoDawnTheme,
  autoDuskTheme,
  // auto 视觉：季节×昼夜组合
  springDawnTheme,
  springDuskTheme,
  summerDawnTheme,
  summerDuskTheme,
  autumnDawnTheme,
  autumnDuskTheme,
  winterDawnTheme,
  winterDuskTheme,
]

/** 背景色卡预览信息 (用于 UI 主题选择器) */
export const backgroundPresetsInfo: Record<string, BackgroundPresetInfo> = {
  light: presetInfo(cleanTheme),
  porcelain: presetInfo(porcelainTheme),
  // dark 视觉风格双专属
  midnight: presetInfo(midnightTheme),
  ink: presetInfo(inkTheme),
  'pine-mist': presetInfo(pineMistTheme),
  'song-rhyme': presetInfo(songRhymeTheme),
  'tech-geek': presetInfo(techGeekTheme),
  'data-grid': presetInfo(dataGridTheme),
  'neon-magenta': presetInfo(neonMagentaTheme),
  phantom: presetInfo(phantomTheme),
  aurora: presetInfo(auroraTheme),
  hologram: presetInfo(hologramTheme),
  starfield: presetInfo(starfieldTheme),
  dawn: presetInfo(dawnTheme),
  'morning-mist': presetInfo(morningMistTheme),
  mint: presetInfo(mintTheme),
  island: presetInfo(islandTheme),
  sky: presetInfo(skyTheme),
  soft: presetInfo(softTheme),
  pink: presetInfo(pinkTheme),
  orange: presetInfo(orangeTheme),
  blue: presetInfo(blueTheme),
  purple: presetInfo(purpleTheme),
  green: presetInfo(greenTheme),
  // auto 视觉：季节
  spring: presetInfo(springTheme),
  summer: presetInfo(summerTheme),
  autumn: presetInfo(autumnTheme),
  winter: presetInfo(winterTheme),
  // auto 视觉：昼夜
  'auto-dawn': presetInfo(autoDawnTheme),
  'auto-dusk': presetInfo(autoDuskTheme),
  // auto 视觉：季节×昼夜组合
  'spring-dawn': presetInfo(springDawnTheme),
  'spring-dusk': presetInfo(springDuskTheme),
  'summer-dawn': presetInfo(summerDawnTheme),
  'summer-dusk': presetInfo(summerDuskTheme),
  'autumn-dawn': presetInfo(autumnDawnTheme),
  'autumn-dusk': presetInfo(autumnDuskTheme),
  'winter-dawn': presetInfo(winterDawnTheme),
  'winter-dusk': presetInfo(winterDuskTheme),
}

function presetInfo(t: ThemeConfig): BackgroundPresetInfo {
  return {
    name: t.name,
    label: t.label,
    mode: t.mode,
    source: t.source ?? 'custom',
    preview: t.bgTokens.primary,
    palette: [
      t.bgTokens.primary,
      t.bgTokens.secondary,
      t.bgTokens.tertiary,
      t.bgTokens.quaternary,
      t.bgTokens.quinary,
    ],
  }
}