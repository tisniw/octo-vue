import { cleanTheme } from '../../presets/color/exclusive/light/clean/theme.js'
import { porcelainTheme } from '../../presets/color/exclusive/light/porcelain/theme.js'
import { midnightTheme } from '../../presets/color/exclusive/dark/midnight/theme.js'
import { inkTheme } from '../../presets/color/exclusive/dark/ink/theme.js'
import { pineMistTheme } from '../../presets/color/exclusive/ancient/pine-mist/theme.js'
import { songRhymeTheme } from '../../presets/color/exclusive/ancient/song-rhyme/theme.js'
import { techGeekTheme } from '../../presets/color/exclusive/tech/tech-geek/theme.js'
import { dataGridTheme } from '../../presets/color/exclusive/tech/data-grid/theme.js'
import { neonMagentaTheme } from '../../presets/color/exclusive/cyber/neon-magenta/theme.js'
import { phantomTheme } from '../../presets/color/exclusive/cyber/phantom/theme.js'
import { auroraTheme } from '../../presets/color/exclusive/future/aurora/theme.js'
import { hologramTheme } from '../../presets/color/exclusive/future/hologram/theme.js'
import { starfieldTheme } from '../../presets/color/exclusive/future/starfield/theme.js'
import { dawnTheme } from '../../presets/color/exclusive/future/dawn/theme.js'
import { morningMistTheme } from '../../presets/color/shared/morning-mist/theme.js'
import { mintTheme } from '../../presets/color/shared/mint/theme.js'
import { islandTheme } from '../../presets/color/shared/island/theme.js'
import { skyTheme } from '../../presets/color/shared/sky/theme.js'
import { softTheme } from '../../presets/color/shared/soft/theme.js'
import { pinkTheme } from '../../presets/color/shared/pink/theme.js'
import { orangeTheme } from '../../presets/color/shared/orange/theme.js'
import { blueTheme } from '../../presets/color/shared/blue/theme.js'
import { purpleTheme } from '../../presets/color/shared/purple/theme.js'
import { greenTheme } from '../../presets/color/shared/green/theme.js'
import { ALL_AUTO_VARIANTS } from './auto.js'
import type { SharedStyleTokens, VisualStyleConfig, ThemeVariant } from '../types.js'
import { registerVisualStyle } from './register.js'

const defaultMotion: SharedStyleTokens['motion'] = {
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  duration: { fast: '100ms', base: '200ms', slow: '300ms' },
}

function makeMotion(fast: string, base: string, slow: string, easing = 'cubic-bezier(0.4, 0, 0.2, 1)'): SharedStyleTokens['motion'] {
  return { easing, duration: { fast, base, slow } }
}

function variant(id: string, label: string, themeConfig: ThemeVariant['themeConfig'], preferredMode?: ThemeVariant['preferredMode']): ThemeVariant {
  return preferredMode ? { id, label, themeConfig, preferredMode } : { id, label, themeConfig }
}

/**
 * 通用变体：10 个跨视觉共享主题，作为 universalVariants 注入到每个 VisualStyle
 */
const universalVariants: ThemeVariant[] = [
  variant('morning-mist', '晨雾', morningMistTheme),
  variant('mint', '薄荷', mintTheme),
  variant('island', '海岛', islandTheme),
  variant('sky', '天空', skyTheme),
  variant('soft', '柔和', softTheme),
  variant('pink', '蜜桃', pinkTheme),
  variant('orange', '暖橙', orangeTheme),
  variant('blue', '海蓝', blueTheme),
  variant('purple', '紫罗兰', purpleTheme),
  variant('green', '森林', greenTheme),
]

const lightStyle: VisualStyleConfig = {
  id: 'light',
  name: '明亮',
  sharedStyles: { border: 'solid', radius: 'subtle', fontFamily: 'sans', motion: defaultMotion, shadow: 'soft', decoration: 'minimal' },
  exclusiveVariants: [
    variant('clean', '纯净白', cleanTheme),
    variant('porcelain', '瓷白', porcelainTheme),
  ],
  universalVariants,
  autoVariants: ALL_AUTO_VARIANTS,
  defaultVariantScope: 'exclusive',
}

const darkStyle: VisualStyleConfig = {
  id: 'dark',
  name: '暗黑',
  sharedStyles: { border: 'solid', radius: 'subtle', fontFamily: 'sans', motion: defaultMotion, shadow: 'ink', decoration: 'minimal' },
  exclusiveVariants: [
    variant('midnight', '深夜', midnightTheme),
    variant('ink', '暗黑', inkTheme),
  ],
  universalVariants,
  autoVariants: ALL_AUTO_VARIANTS,
  defaultVariantScope: 'exclusive',
}

const ancientStyle: VisualStyleConfig = {
  id: 'ancient',
  name: '古风',
  sharedStyles: { border: 'calligraphic', radius: 'calligraphic', fontFamily: 'kai', motion: makeMotion('160ms', '260ms', '420ms', 'cubic-bezier(0.25, 1, 0.5, 1)'), shadow: 'ink', decoration: 'seal' },
  exclusiveVariants: [
    variant('pine-mist', '松间雾色', pineMistTheme, 'pine-mist'),
    variant('song-rhyme', '宋韵', songRhymeTheme),
  ],
  universalVariants,
  autoVariants: ALL_AUTO_VARIANTS,
  defaultVariantScope: 'exclusive',
}

const techStyle: VisualStyleConfig = {
  id: 'tech',
  name: '科技',
  sharedStyles: { border: 'double', radius: 'subtle', fontFamily: 'sans', motion: makeMotion('80ms', '160ms', '260ms'), shadow: 'flat', decoration: 'border' },
  exclusiveVariants: [
    variant('tech-geek', '极客', techGeekTheme),
    variant('data-grid', '数据', dataGridTheme),
  ],
  universalVariants,
  autoVariants: ALL_AUTO_VARIANTS,
  defaultVariantScope: 'exclusive',
}

const cyberStyle: VisualStyleConfig = {
  id: 'cyber',
  name: '赛博',
  sharedStyles: { border: 'dashed', radius: 'round', fontFamily: 'mono', motion: makeMotion('60ms', '120ms', '200ms', 'cubic-bezier(0.7, 0, 0.3, 1)'), shadow: 'glow', decoration: 'border' },
  exclusiveVariants: [
    variant('neon-magenta', '霓虹', neonMagentaTheme),
    variant('phantom', '幻影', phantomTheme),
  ],
  universalVariants,
  autoVariants: ALL_AUTO_VARIANTS,
  defaultVariantScope: 'exclusive',
}

const futureStyle: VisualStyleConfig = {
  id: 'future',
  name: '未来',
  sharedStyles: { border: 'dashed', radius: 'round', fontFamily: 'sans', motion: makeMotion('120ms', '220ms', '360ms', 'cubic-bezier(0.16, 1, 0.3, 1)'), shadow: 'soft', decoration: 'minimal' },
  exclusiveVariants: [
    variant('aurora', '极光', auroraTheme),
    variant('hologram', '全息', hologramTheme),
    variant('starfield', '星海', starfieldTheme),
    variant('dawn', '晨曦', dawnTheme),
  ],
  universalVariants,
  autoVariants: ALL_AUTO_VARIANTS,
  defaultVariantScope: 'exclusive',
}

/** 启动时注册 6 套内置视觉风格 */
export function registerBuiltinVisualStyles(): void {
  registerVisualStyle(lightStyle)
  registerVisualStyle(darkStyle)
  registerVisualStyle(ancientStyle)
  registerVisualStyle(techStyle)
  registerVisualStyle(cyberStyle)
  registerVisualStyle(futureStyle)
}