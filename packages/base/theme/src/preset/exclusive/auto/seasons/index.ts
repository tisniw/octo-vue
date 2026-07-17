/**
 * Auto · Seasons 策略组 · 季节主题装配入口（薄入口）
 *
 * 设计定位：
 *   - 4 套季节主题的色 token / meta / PresetTheme 组合
 *     都分散在 spring/ summer/ autumn/ winter/ 四个子目录的 theme.ts 中
 *   - 本文件只负责「装配」：导入 4 套主题 + 构造月份映射 + 提供决策函数，
 *     并以 default 形式暴露给扫描层（exclusive/index.ts 的 import.meta.glob）
 *   - 4 套季节主题不进入 themePresets 字典（季节是动态决策、非用户手动选择）
 *
 * 暴露规则：
 *   - default 导出 = AutoStrategyMeta + custom（自定义细节）
 *   - 扫描层 extractCustom 会把 default 中除
 *     { id, name, enName, description, visual } 之外的字段塞进 `custom`
 *   - 上层可通过 getAutoStrategyDetail('auto-seasons').custom 读取全部配置
 */
import springTheme from './spring/theme';
import summerTheme from './summer/theme';
import autumnTheme from './autumn/theme';
import winterTheme from './winter/theme';
import type { PresetTheme } from '../../../types';

/* ───────────────────────── 季节主题类型 ───────────────────────── */

/** 单个季节主题（含完整颜色 token + 元信息 + 月份覆盖范围） */
export interface SeasonTheme {
  /** 唯一标识（命名规则：season-{spring|summer|autumn|winter}） */
  id: string;
  /** 季节中文名（春 / 夏 / 秋 / 冬） */
  name: string;
  /** 该季节覆盖的公历月份（1-12） */
  months: number[];
  /** 主题元信息（sn / name / description） */
  meta: PresetTheme['meta'];
  /** 完整 ThemeColorToken（13 类全覆盖） */
  color: PresetTheme['color'];
}

/** Seasons 策略组的 custom 配置（供上层读取） */
export interface SeasonsStrategyConfig {
  /** 4 套季节主题字典（key = season-{季节}） */
  seasonPresets: Record<string, SeasonTheme>;
  /** 月份 → 季节主题 id 的映射表（1-12 全覆盖） */
  monthToSeason: Record<number, string>;
  /** 决策函数：给定日期返回当前季节主题；缺省取当前时间 */
  resolveSeasonTheme: (date?: Date) => SeasonTheme;
}

/* ───────────────────────── 4 套季节装配 ───────────────────────── */

const seasonPresets: Record<string, SeasonTheme> = {
  'season-spring': {
    id: 'season-spring',
    name: '春',
    months: [3, 4, 5],
    meta: springTheme.meta,
    color: springTheme.color,
  },
  'season-summer': {
    id: 'season-summer',
    name: '夏',
    months: [6, 7, 8],
    meta: summerTheme.meta,
    color: summerTheme.color,
  },
  'season-autumn': {
    id: 'season-autumn',
    name: '秋',
    months: [9, 10, 11],
    meta: autumnTheme.meta,
    color: autumnTheme.color,
  },
  'season-winter': {
    id: 'season-winter',
    name: '冬',
    months: [12, 1, 2],
    meta: winterTheme.meta,
    color: winterTheme.color,
  },
};

/* ───────────────────────── 月份映射 + 决策函数 ───────────────────────── */

/**
 * 月份 → 季节主题 id 映射（公历，北半球默认）
 *
 * 春季: 3 / 4 / 5
 * 夏季: 6 / 7 / 8
 * 秋季: 9 / 10 / 11
 * 冬季: 12 / 1 / 2   (跨年)
 */
const monthToSeason: Record<number, string> = {
  1: 'season-winter',
  2: 'season-winter',
  3: 'season-spring',
  4: 'season-spring',
  5: 'season-spring',
  6: 'season-summer',
  7: 'season-summer',
  8: 'season-summer',
  9: 'season-autumn',
  10: 'season-autumn',
  11: 'season-autumn',
  12: 'season-winter',
};

/**
 * 决策函数：根据给定日期解析出当前季节主题
 *
 * @param date 目标日期；缺省为 `new Date()`
 * @returns 对应季节的 SeasonTheme
 *
 * 行为约定：
 *   - 使用本地时区（getMonth 默认是本地时区）
 *   - 月份 1-12，掉出范围时回退到 season-winter
 *   - 该函数是同步无副作用的，方便集成到任意响应式系统
 */
function resolveSeasonTheme(date: Date = new Date()): SeasonTheme {
  const month = date.getMonth() + 1;
  const id = monthToSeason[month] ?? 'season-winter';
  return seasonPresets[id];
}

/* ───────────────────────── default 导出（策略组入口）───────────────────────── */

/**
 * Seasons 策略组的 default 导出
 *
 * 扫描层 extractCustom() 会把 default 中除
 *   { id, name, enName, description, visual }
 * 之外的字段塞进 `custom` 字段。
 *
 * 上层调用方式：
 *   const strategy = getAutoStrategyDetail('auto-seasons');
 *   const { seasonPresets, monthToSeason, resolveSeasonTheme } = strategy.custom;
 */
export default {
  // ── AutoStrategyMeta 部分（被扫描器识别，作为组骨架）──
  id: 'auto-seasons',
  enName: 'seasons',
  visual: 'auto' as const,
  name: '四季切换',
  description: '按公历月份映射到春夏秋冬四套主题',

  // ── custom 部分（被扫描器剥离，存进 custom 字段）──
  seasonPresets,
  monthToSeason,
  resolveSeasonTheme,
};