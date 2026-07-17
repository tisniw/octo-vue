// OC 基础原色契约
// --oc-{type}                
// --oc-{type}-{field}        
// --oc-{type}-{field}-{scale}  

import type { BaseColorType, ThemeColorToken } from '../token/color';
import {
  baseColorTypes,
  colorScaleLevels,
  mainFieldsByType,
} from '../token/color';
import { expandScale } from './scale';
import { buildOcShortcut, buildOcVar } from './builder';

// 取主字段值
function getMainFieldValue(token: ThemeColorToken, type: BaseColorType): string {
  const group = token[type] as unknown as Record<string, string>;
  return group[mainFieldsByType[type]];
}

// OC 派生器
export function generateOcVars(token: ThemeColorToken): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const type of baseColorTypes) {
    const field = mainFieldsByType[type];
    const baseValue = getMainFieldValue(token, type);
    const scales = expandScale(baseValue);

    // 速查 --oc-{type} 指向主字段 500
    vars[buildOcShortcut(type)] = `var(${buildOcVar(type, field, '500')})`;

    // default --oc-{type}-{field} 指向 500
    vars[buildOcVar(type, field)] = `var(${buildOcVar(type, field, '500')})`;

    // 11 阶
    for (const scale of colorScaleLevels) {
      vars[buildOcVar(type, field, scale)] = scales[scale];
    }
  }

  return vars;
}