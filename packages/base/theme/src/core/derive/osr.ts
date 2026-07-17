// OSR 状态+语义契约
// 12 type × 主 field × 5 role × 4 state (omit disabled)
// 基色 semantic[role][state]
// --osr-{type}-{field}-{role}-{state}          default 500
// --osr-{type}-{field}-{role}-{state}-{scale}  11 阶全展开

import type { BaseColorType, ColorState, SemanticColor } from '../token/color';
import {
  baseColorTypes,
  colorScaleLevels,
  colorStates,
  mainFieldsByType,
} from '../token/color';
import { expandScale } from './scale';
import { buildOsrVar } from './builder';

type SemanticRole = keyof SemanticColor;
type SemanticState = Exclude<ColorState, 'disabled'>;

// 语义可用状态 排除 disabled
const semanticStates: readonly SemanticState[] = colorStates.filter(
  (s): s is SemanticState => s !== 'disabled',
);

// OSR 派生器
export function generateOsrVars(semantic: SemanticColor): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const type of baseColorTypes) {
    const field = mainFieldsByType[type];
    for (const role of Object.keys(semantic) as SemanticRole[]) {
      const roleData = semantic[role] as unknown as Record<ColorState, string>;
      for (const state of semanticStates) {
        const baseValue = roleData[state];
        const scales = expandScale(baseValue);

        // default --osr-{type}-{field}-{role}-{state} 指向 500
        vars[buildOsrVar(type, field, role, state)] = `var(${buildOsrVar(type, field, role, state, '500')})`;

        // 11 阶
        for (const scale of colorScaleLevels) {
          vars[buildOsrVar(type, field, role, state, scale)] = scales[scale];
        }
      }
    }
  }

  return vars;
}