/**
 * Auto · DuskDawn 策略组 · 时段主题装配入口（薄入口）
 *
 * 设计定位：
 *   - 4 套时段主题（清晨 / 午后 / 黄昏 / 黑夜）的色 token / meta / PresetTheme 组合
 *     都分散在 dawn/ afternoon/ dusk/ night/ 四个子目录的 theme.ts 中
 *   - 本文件只负责「装配」：导入 4 套主题 + 构造小时映射 + 提供决策函数
 *   - 时段切分（典型配置）：
 *       05:00 - 09:59  →  清晨  dawn
 *       10:00 - 16:59  →  午后  afternoon
 *       17:00 - 19:59  →  黄昏  dusk
 *       20:00 - 04:59  →  黑夜  night
 *
 * 暴露规则：
 *   - default 导出 = AutoStrategyMeta + custom（自定义细节）
 *   - 扫描层 extractCustom 会把 default 中除
 *     { id, name, enName, description, visual } 之外的字段塞进 `custom`
 */
import dawnTheme from './dawn/theme';
import afternoonTheme from './afternoon/theme';
import duskTheme from './dusk/theme';
import nightTheme from './night/theme';
import type { PresetTheme } from '../../../types';

/* ───────────────────────── 时段主题类型 ───────────────────────── */

/** 时段标识 */
export type DuskDawnPhase = 'dawn' | 'afternoon' | 'dusk' | 'night';

/** 单个时段主题（含完整颜色 token + 元信息 + 小时覆盖范围） */
export interface DuskDawnPhaseTheme {
  /** 唯一标识（命名规则：dusk-dawn-{phase}） */
  id: string;
  /** 时段中文名 */
  name: string;
  /** 该时段覆盖的小时数（0-23） */
  hours: number[];
  /** 主题元信息（sn / name / description） */
  meta: PresetTheme['meta'];
  /** 完整 ThemeColorToken（13 类全覆盖） */
  color: PresetTheme['color'];
}

/** DuskDawn 策略组的 custom 配置 */
export interface DuskDawnStrategyConfig {
  /** 4 套时段主题字典（key = dusk-dawn-{phase}） */
  phasePresets: Record<string, DuskDawnPhaseTheme>;
  /** 小时 → 时段主题 id 映射表（0-23 全覆盖） */
  hourToPhase: Record<number, string>;
  /** 决策函数：给定小时返回当前时段主题；缺省取当前时间 */
  resolvePhaseTheme: (date?: Date) => DuskDawnPhaseTheme;
}

/* ───────────────────────── 4 套时段装配 ───────────────────────── */

const phasePresets: Record<string, DuskDawnPhaseTheme> = {
  'dusk-dawn-dawn': {
    id: 'dusk-dawn-dawn',
    name: '清晨',
    hours: [5, 6, 7, 8, 9],
    meta: dawnTheme.meta,
    color: dawnTheme.color,
  },
  'dusk-dawn-afternoon': {
    id: 'dusk-dawn-afternoon',
    name: '午后',
    hours: [10, 11, 12, 13, 14, 15, 16],
    meta: afternoonTheme.meta,
    color: afternoonTheme.color,
  },
  'dusk-dawn-dusk': {
    id: 'dusk-dawn-dusk',
    name: '黄昏',
    hours: [17, 18, 19],
    meta: duskTheme.meta,
    color: duskTheme.color,
  },
  'dusk-dawn-night': {
    id: 'dusk-dawn-night',
    name: '黑夜',
    hours: [20, 21, 22, 23, 0, 1, 2, 3, 4],
    meta: nightTheme.meta,
    color: nightTheme.color,
  },
};

/* ───────────────────────── 小时映射 + 决策函数 ───────────────────────── */

/**
 * 小时 → 时段主题 id 映射（24h 全覆盖）
 *
 * 05-09  →  dusk-dawn-dawn      清晨
 * 10-16  →  dusk-dawn-afternoon 午后
 * 17-19  →  dusk-dawn-dusk      黄昏
 * 20-04  →  dusk-dawn-night     黑夜（跨午夜）
 */
const hourToPhase: Record<number, string> = {
  0: 'dusk-dawn-night',
  1: 'dusk-dawn-night',
  2: 'dusk-dawn-night',
  3: 'dusk-dawn-night',
  4: 'dusk-dawn-night',
  5: 'dusk-dawn-dawn',
  6: 'dusk-dawn-dawn',
  7: 'dusk-dawn-dawn',
  8: 'dusk-dawn-dawn',
  9: 'dusk-dawn-dawn',
  10: 'dusk-dawn-afternoon',
  11: 'dusk-dawn-afternoon',
  12: 'dusk-dawn-afternoon',
  13: 'dusk-dawn-afternoon',
  14: 'dusk-dawn-afternoon',
  15: 'dusk-dawn-afternoon',
  16: 'dusk-dawn-afternoon',
  17: 'dusk-dawn-dusk',
  18: 'dusk-dawn-dusk',
  19: 'dusk-dawn-dusk',
  20: 'dusk-dawn-night',
  21: 'dusk-dawn-night',
  22: 'dusk-dawn-night',
  23: 'dusk-dawn-night',
};

/**
 * 决策函数：根据给定日期解析出当前时段主题
 *
 * @param date 目标日期；缺省为 `new Date()`
 * @returns 对应时段的 DuskDawnPhaseTheme
 *
 * 行为约定：
 *   - 使用本地时区（getHours 默认是本地时区）
 *   - 小时 0-23，掉出范围时回退到 night
 *   - 该函数是同步无副作用的，方便集成到任意响应式系统
 */
function resolvePhaseTheme(date: Date = new Date()): DuskDawnPhaseTheme {
  const hour = date.getHours();
  const id = hourToPhase[hour] ?? 'dusk-dawn-night';
  return phasePresets[id];
}

/* ───────────────────────── default 导出（策略组入口）───────────────────────── */

export default {
  // ── AutoStrategyMeta 部分（被扫描器识别，作为组骨架）──
  id: 'auto-dusk-dawn',
  enName: 'dusk-dawn',
  visual: 'auto' as const,
  name: '暮晨切换',
  description: '根据本地时间在清晨/午后/黄昏/黑夜四套主题间自动切换',

  // ── custom 部分（被扫描器剥离，存进 custom 字段）──
  phasePresets,
  hourToPhase,
  resolvePhaseTheme,
};