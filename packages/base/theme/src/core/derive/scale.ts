// 色阶展开工具
// 基色值 → 11 阶色阶
// 复用给所有派生器
// 500 为基色原值 其他阶通过 color-mix 与 white/black 派生

import type { ColorScaleLevel } from '../token/color';
import {
  colorScaleLevels,
  getScaleMixTarget,
  scaleMixRatios,
} from '../token/color';

// 色阶展开
// 输入 基色值
// 输出 11 阶色阶 color-mix 派生值或原值
export function expandScale(baseValue: string): Record<ColorScaleLevel, string> {
  const out: Record<string, string> = {};
  for (const scale of colorScaleLevels) {
    if (scale === '500') {
      out[scale] = baseValue;
      continue;
    }
    const target = getScaleMixTarget(scale);
    const percent = scaleMixRatios[scale];
    out[scale] = `color-mix(in srgb, ${baseValue} ${percent}%, ${target})`;
  }
  return out as Record<ColorScaleLevel, string>;
}