// OR 语义契约
// 12 type × 主 field × 5 role
// 基色 semantic[role][semanticBaseState] 默认 focus
// --or-{type}-{field}-{role}          default 500
// --or-{type}-{field}-{role}-{scale}  11 阶全展开

import type { BaseColorType, ColorState, SemanticColor } from '../token/color';
import {
  baseColorTypes,
  colorScaleLevels,
  mainFieldsByType,
  semanticBaseState,
} from '../token/color';
import { expandScale } from './scale';
import { buildOrVar } from './builder';

type SemanticRole = keyof SemanticColor;

// OR 派生器
export function generateOrVars(semantic: SemanticColor): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const type of baseColorTypes) {
    const field = mainFieldsByType[type];
    for (const role of Object.keys(semantic) as SemanticRole[]) {
      const roleData = semantic[role] as unknown as Record<ColorState, string>;
      const baseValue = roleData[semanticBaseState];
      const scales = expandScale(baseValue);

      // default --or-{type}-{field}-{role} 指向 500
      vars[buildOrVar(type, field, role)] = `var(${buildOrVar(type, field, role, '500')})`;

      // 11 阶
      for (const scale of colorScaleLevels) {
        vars[buildOrVar(type, field, role, scale)] = scales[scale];
      }
    }
  }

  return vars;
}