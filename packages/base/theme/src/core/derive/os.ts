// OS 状态契约
// 12 type × 主 field × 5 state
// 基色 token.state[state]
// --os-{type}-{field}-{state}          default 500
// --os-{type}-{field}-{state}-{scale}  11 阶全展开

import type { BaseColorType, ThemeColorToken } from '../token/color';
import {
  baseColorTypes,
  colorScaleLevels,
  colorStates,
  mainFieldsByType,
} from '../token/color';
import { expandScale } from './scale';
import { buildOsVar } from './builder';

// OS 派生器
export function generateOsVars(token: ThemeColorToken): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const type of baseColorTypes) {
    const field = mainFieldsByType[type];
    for (const state of colorStates) {
      const baseValue = token.state[state];
      const scales = expandScale(baseValue);

      // default --os-{type}-{field}-{state} 指向 500
      vars[buildOsVar(type, field, state)] = `var(${buildOsVar(type, field, state, '500')})`;

      // 11 阶
      for (const scale of colorScaleLevels) {
        vars[buildOsVar(type, field, state, scale)] = scales[scale];
      }
    }
  }

  return vars;
}