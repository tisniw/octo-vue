import type { ThemeConfig } from '../../../theme/types.js'

/**
 * light 专属主题 - 纯净白
 *
 * 以纯白底色构建极致干净的视觉基础，主色选用靛蓝形成清新对比，
 * 适用于追求简洁高效的企业级产品以及需要突出内容本身的展示型页面。
 */
export const cleanTheme: ThemeConfig = {
  name: 'clean',
  label: '纯净白',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#4F46E5',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    emphasis: '#8B5CF6',
    default: '#6B7280',
  },
  bgTokens: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F3F4F6',
    quaternary: '#E5E7EB',
    quinary: '#D1D5DB',
  },
}
